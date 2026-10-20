/**
 * Gaze trackers (version 2). The game talks to a tracker only through this
 * interface, so WebGazer can be replaced, and so automated tests can drive the
 * flow with a synthetic source. A synthetic source tests code; it says nothing
 * about how well any camera measures gaze.
 */

import type { WebGazer } from './webgazer';

export interface GazeEstimate {
  /** performance.now() at the moment the estimate was delivered. */
  t: number;
  /** Viewport CSS pixels; null when no face or eyes were found. */
  x: number | null;
  y: number | null;
}

export interface Tracker {
  readonly name: string;
  readonly version: string;
  /** Asks for the camera and starts estimating. Rejects if the camera is refused or unavailable. */
  start(previewHost: HTMLElement): Promise<void>;
  /** Whether a face has been found in the last half second. */
  faceDetected(): boolean;
  onEstimate(listener: (estimate: GazeEstimate) => void): () => void;
  /** Adds one training sample: the participant is looking at (x, y) now. */
  train(x: number, y: number): void;
  /** Forgets all training samples, for recalibration. */
  resetTraining(): void;
  showPreview(show: boolean): void;
  /** Stops estimating and releases the camera. Safe to call more than once. */
  stop(): void;
  /** The camera tracks this tracker holds, for verifying release. */
  cameraLive(): boolean;
}

/**
 * WebGazer is GPL-3.0-or-later (LGPL-3.0 for small companies). It is loaded as its
 * own, unmodified file rather than bundled into the game's code, so it remains a
 * separate, replaceable component; see docs-dev/planning/v2_notes.md.
 */
function loadWebGazer(assetBase: string): Promise<WebGazer> {
  if (window.webgazer) return Promise.resolve(window.webgazer);
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `${assetBase}eyetracking/webgazer/webgazer.js`;
    script.onload = () => (window.webgazer ? resolve(window.webgazer) : reject(new Error('WebGazer did not load.')));
    script.onerror = () => reject(new Error('WebGazer could not be loaded.'));
    document.head.append(script);
  });
}

export async function createWebGazerTracker(assetBase: string): Promise<Tracker> {
  const webgazer = await loadWebGazer(assetBase);
  const listeners = new Set<(e: GazeEstimate) => void>();
  let lastPositions: unknown = null;
  let lastFaceAt = -Infinity;
  let poll = 0;
  let stream: MediaStream | null = null;
  let running = false;
  let container: HTMLElement | null = null;

  webgazer.params.faceMeshSolutionPath = `${assetBase}eyetracking/webgazer/face_mesh`;
  // Nothing may persist beyond the page: WebGazer otherwise stores its training data.
  webgazer.saveDataAcrossSessions(false);
  webgazer.showPredictionPoints(false);
  webgazer.applyKalmanFilter(true);
  webgazer.setRegression('ridge');
  webgazer.setGazeListener((data) => {
    const estimate: GazeEstimate = { t: performance.now(), x: data ? data.x : null, y: data ? data.y : null };
    for (const listener of listeners) listener(estimate);
  });

  return {
    name: 'WebGazer',
    version: '3.5.3',
    async start(previewHost) {
      if (!webgazer.detectCompatibility()) throw new Error('This browser cannot provide a camera stream.');
      await webgazer.begin();
      running = true;
      // WebGazer trains on every click and mouse movement by default. Training here
      // happens only at calibration points, never on answers.
      webgazer.removeMouseEventListeners();
      container = document.getElementById('webgazerVideoContainer');
      const video = document.getElementById('webgazerVideoFeed') as HTMLVideoElement | null;
      stream = (video?.srcObject as MediaStream | null) ?? null;
      if (container) {
        container.classList.add('camera-preview-feed');
        previewHost.append(container);
      }
      poll = window.setInterval(() => {
        const positions = webgazer.getTracker().getPositions();
        // WebGazer keeps the last landmarks when a face is lost, so a face counts as
        // present only while the landmarks keep changing.
        if (positions && positions !== lastPositions) lastFaceAt = performance.now();
        lastPositions = positions;
      }, 150);
    },
    faceDetected: () => performance.now() - lastFaceAt < 500,
    onEstimate(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    train(x, y) {
      webgazer.recordScreenPosition(x, y, 'click');
    },
    resetTraining() {
      // A fresh ridge regression discards every recorded sample.
      webgazer.setRegression('ridge');
    },
    showPreview(show) {
      webgazer.showVideoPreview(show);
      // A video element removed from the page stops playing, and estimates would
      // freeze, so a hidden preview is parked off-screen rather than detached.
      if (container && !show) {
        container.classList.add('parked');
        document.body.append(container);
      }
    },
    stop() {
      clearInterval(poll);
      listeners.clear();
      if (running) {
        running = false;
        try {
          webgazer.clearGazeListener();
          webgazer.end();
        } catch {
          // end() can throw if WebGazer's elements were already removed; the stream is stopped below regardless.
        }
      }
      for (const track of stream?.getTracks() ?? []) track.stop();
      document.getElementById('webgazerVideoContainer')?.remove();
      document.getElementById('webgazerGazeDot')?.remove();
    },
    cameraLive: () => (stream?.getTracks() ?? []).some((t) => t.readyState === 'live'),
  };
}

/**
 * For automated tests of the version 2 flow only, and only in builds made with
 * VITE_EYE_TRACKING_TEST=1. It still opens the camera (so permission handling and
 * release are exercised), but reports the pointer position plus noise as "gaze".
 */
export function createSyntheticTracker(noisePx = 20): Tracker {
  const listeners = new Set<(e: GazeEstimate) => void>();
  let pointer = { x: innerWidth / 2, y: innerHeight / 2 };
  let timer = 0;
  let stream: MediaStream | null = null;
  const onMove = (event: PointerEvent) => (pointer = { x: event.clientX, y: event.clientY });
  const noise = () => (Math.random() - 0.5) * 2 * noisePx;
  return {
    name: 'synthetic',
    version: 'test',
    async start() {
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      addEventListener('pointermove', onMove);
      timer = window.setInterval(() => {
        const estimate = { t: performance.now(), x: pointer.x + noise(), y: pointer.y + noise() };
        for (const listener of listeners) listener(estimate);
      }, 33);
    },
    faceDetected: () => stream !== null,
    onEstimate(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    train() {},
    resetTraining() {},
    showPreview() {},
    stop() {
      clearInterval(timer);
      removeEventListener('pointermove', onMove);
      listeners.clear();
      for (const track of stream?.getTracks() ?? []) track.stop();
    },
    cameraLive: () => (stream?.getTracks() ?? []).some((t) => t.readyState === 'live'),
  };
}
