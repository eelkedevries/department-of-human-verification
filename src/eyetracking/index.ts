/**
 * Entry point of the optional eye-tracking mode (version 2). Loaded only in builds
 * made with VITE_EYE_TRACKING=1, and only after the participant chooses it.
 */

import './eyetracking.css';
import { button } from '../components/chrome';
import { h } from '../components/dom';
import type { CalibrationQuality, ConsentRecord } from '../research/types';
import { createRecorder, type Recorder } from './recorder';
import { assess, calibrate, cameraScreen, consentScreen, MAX_ATTEMPTS, qualityRecord, qualityScreen, stimulusSkeleton, validate } from './setup';
import { createSyntheticTracker, createWebGazerTracker, type Tracker } from './tracker';

export { choiceScreen, trackingUnavailableReason } from './setup';
export { revealSection, testimonyResponses, testimonyScreen, type Testimony } from './reveal';

export interface EyeTrackingContext {
  tracker: Tracker;
  recorder: Recorder;
  consent: ConsentRecord;
  calibrations: CalibrationQuality[];
  calibrationPassed: boolean;
  withdrawn: boolean;
  badge: HTMLElement;
  /** Stops recording and releases the camera: on the participant's Stop, or after the last round. Safe to call more than once. */
  end(reason: 'withdrawn' | 'finished'): void;
}

type Show = (view: HTMLElement) => void;

async function makeTracker(): Promise<Tracker> {
  if (import.meta.env.VITE_EYE_TRACKING_TEST === '1' && new URLSearchParams(location.search).get('tracker') === 'synthetic') {
    return createSyntheticTracker();
  }
  return createWebGazerTracker(import.meta.env.BASE_URL);
}

/** Consent → camera → calibration → validation. Resolves null when the participant continues without eye-tracking. */
export async function setUpEyeTracking(show: Show, sessionId: string): Promise<EyeTrackingContext | null> {
  const consent = await new Promise<ConsentRecord | null>((resolve) => show(consentScreen(resolve, () => resolve(null), () => sessionId)));
  if (!consent) return null;

  const tracker = await makeTracker();
  const camera = cameraScreen(tracker);
  show(camera.view);
  if (!(await camera.done)) {
    tracker.stop();
    return null;
  }

  const calibrations: CalibrationQuality[] = [];
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    tracker.resetTraining();
    tracker.showPreview(false);
    document.body.classList.add('eyetracking');
    const status = h('p', { class: 'calibration-status', role: 'status' });
    const skeleton = stimulusSkeleton('Look at each dot and click it three times.', `Step 2 of 3 · Attempt ${attempt}`);
    skeleton.view.querySelector('.hint')!.before(status);
    show(skeleton.view);
    document.body.classList.add('calibrating');
    const training = await calibrate(tracker, skeleton.grid, skeleton.overlay, (text) => (status.textContent = text));
    (skeleton.view.querySelector('h1') as HTMLElement).textContent = 'Now only look at each dot.';
    await new Promise((r) => setTimeout(r, 800));
    const recordings = await validate(tracker, skeleton.grid, skeleton.overlay, (text) => (status.textContent = text));
    document.body.classList.remove('calibrating');
    const tileWidth = skeleton.grid.querySelector('.tile')!.getBoundingClientRect().width;
    const { summary, decision } = assess(recordings, tileWidth);
    calibrations.push(qualityRecord(sessionId, tracker, training, summary, decision, attempt));

    const choice = await new Promise<'again' | 'with' | 'without'>((resolve) =>
      show(
        qualityScreen(summary, decision, tileWidth, attempt, {
          recalibrate: () => resolve('again'),
          withTracking: () => resolve('with'),
          withoutTracking: () => resolve('without'),
        }),
      ),
    );
    if (choice === 'again') continue;
    if (choice === 'without') {
      tracker.stop();
      document.body.classList.remove('eyetracking');
      return null;
    }
    return startContext(tracker, consent, calibrations, sessionId);
  }
  tracker.stop();
  return null;
}

function startContext(tracker: Tracker, consent: ConsentRecord, calibrations: CalibrationQuality[], sessionId: string): EyeTrackingContext {
  const recorder = createRecorder(tracker, sessionId);
  const status = h('span', {}, 'Camera on · eye-tracking');
  const stop = button('Stop', () => context.end('withdrawn'), { secondary: true });
  const badge = h('div', { class: 'camera-badge', role: 'status' }, h('span', { class: 'camera-light', 'aria-hidden': 'true' }), status, stop);
  let ended = false;
  const context: EyeTrackingContext = {
    tracker,
    recorder,
    consent,
    calibrations,
    calibrationPassed: calibrations.at(-1)?.passed ?? false,
    withdrawn: false,
    badge,
    end(reason) {
      if (ended) return;
      ended = true;
      context.withdrawn = reason === 'withdrawn';
      recorder.stop();
      tracker.stop();
      status.textContent = 'Camera off';
      stop.remove();
      badge.classList.add('off');
    },
  };
  return context;
}
