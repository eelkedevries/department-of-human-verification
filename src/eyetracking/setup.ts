/**
 * The opt-in path (version 2): choice, research information and consent, camera
 * and face positioning, calibration and held-out validation. Every screen offers a
 * way back to the ordinary game, and nothing touches the camera before consent.
 */

import { button, ICON_CHECKBOX } from '../components/chrome';
import { h } from '../components/dom';
import { CALIBRATION_FRACTIONS, placePoints, type Rect, VALIDATION_FRACTIONS } from '../research/geometry';
import type { CalibrationQuality, ConsentRecord } from '../research/types';
import { assessQuality, DEVELOPMENT_THRESHOLDS, summariseValidation, type PointRecording, type QualityDecision, type ValidationSummary } from '../research/validation';
import type { Tracker } from './tracker';

export const CONSENT_VERSION = 'v2-preview-0.1';
export const MAX_ATTEMPTS = 3;
const CLICKS_PER_POINT = 3;
const VALIDATION_POINT_MS = 1500;

/** Eye-tracking needs a mouse or trackpad, a webcam and room for the grid on one screen. */
export function trackingUnavailableReason(): string | null {
  if (matchMedia('(pointer: coarse)').matches && !matchMedia('(pointer: fine)').matches) return 'Eye-tracking needs a desktop or laptop computer; it is not available on phones or tablets.';
  if (innerWidth < 900 || innerHeight < 640) return 'Eye-tracking needs a larger browser window (at least 900 × 640 pixels).';
  if (!navigator.mediaDevices?.getUserMedia) return 'This browser cannot provide a camera stream.';
  return null;
}

export function choiceScreen(onNormal: () => void, onTracking: () => void): HTMLElement {
  const unavailable = trackingUnavailableReason();
  const tracking = button('Play with eye-tracking', onTracking, { secondary: true, wide: true });
  if (unavailable) tracking.disabled = true;
  return h(
    'section',
    { class: 'panel', 'aria-labelledby': 'choice-title' },
    h('p', { class: 'label' }, 'Outside the story'),
    h('h1', { class: 'notice-title', id: 'choice-title', tabindex: -1 }, 'How would you like to play?'),
    h(
      'div',
      { class: 'choices' },
      h(
        'div',
        { class: 'choice' },
        h('h2', {}, 'Play normally'),
        h('p', {}, 'The game as it is. No camera, and nothing leaves your device.'),
        button('Play normally', onNormal, { wide: true }),
      ),
      h(
        'div',
        { class: 'choice' },
        h('h2', {}, 'Play with eye-tracking'),
        h('p', {}, 'A research preview. Your webcam estimates where on the screen you look while you play. At the end you see those estimates next to your own account of what caught your eye.'),
        h('p', { class: 'fine-print' }, unavailable ?? 'About five extra minutes. Desktop or laptop with a webcam. The camera picture never leaves your device.'),
        tracking,
      ),
    ),
  );
}

export function consentScreen(onAccept: (record: ConsentRecord) => void, onBack: () => void, sessionId: () => string): HTMLElement {
  const adult = h('input', { type: 'checkbox', id: 'consent-adult' });
  const camera = h('input', { type: 'checkbox', id: 'consent-camera' });
  const start = button('Start the camera', () => {
    onAccept({
      session_id: sessionId(),
      consent_version: CONSENT_VERSION,
      camera_opt_in: true,
      research_storage_opt_in: false,
      recorded_at: new Date().toISOString(),
    });
  }, { wide: true });
  const update = () => (start.disabled = !(adult.checked && camera.checked));
  adult.addEventListener('change', update);
  camera.addEventListener('change', update);
  update();
  return h(
    'section',
    { class: 'panel', 'aria-labelledby': 'consent-title' },
    h('p', { class: 'label' }, 'Outside the story · Research preview information'),
    h('h1', { class: 'notice-title', id: 'consent-title', tabindex: -1 }, 'Eye-tracking: what happens'),
    h(
      'div',
      { class: 'prose' },
      h('p', {}, 'This part is not a joke. If you agree, your browser turns on your webcam and runs WebGazer, open-source software that finds your face and eyes and estimates where you are looking on the screen. Everything runs on your own device.'),
      h('h2', { class: 'label' }, 'What is kept'),
      h('p', {}, 'Only the estimates: screen positions with times, for this session, in this browser tab. No video, photographs or sound are saved or sent anywhere. Research data collection is not open: nothing you do is uploaded, and everything is gone when you close the tab.'),
      h('h2', { class: 'label' }, 'How good the estimates are'),
      h('p', {}, 'Webcam eye-tracking is approximate; the estimates are often several centimetres off. You first look at a few dots so the software can learn your eyes, and then at a few more so the game can check how far off it is. Your personal results are shown only if that check passes.'),
      h('h2', { class: 'label' }, 'Stopping'),
      h('p', {}, 'You can stop at any moment with the Stop button. The camera turns off and the game continues as normal.'),
    ),
    h(
      'div',
      { class: 'consent-boxes' },
      h('label', { class: 'option', for: 'consent-adult' }, adult, h('span', {}, 'I am 18 or older.')),
      h('label', { class: 'option', for: 'consent-camera' }, camera, h('span', {}, 'I agree to the use of my webcam to estimate where I look, as described above.')),
    ),
    h('div', { class: 'actions' }, start, button('Play without eye-tracking', onBack, { secondary: true, wide: true })),
  );
}

export interface CameraStep {
  view: HTMLElement;
  /** Resolves true when the camera runs and a face is in view; false when the participant chooses to play normally. */
  done: Promise<boolean>;
}

export function cameraScreen(tracker: Tracker): CameraStep {
  let resolve!: (ok: boolean) => void;
  const done = new Promise<boolean>((r) => (resolve = r));
  const preview = h('div', { class: 'camera-preview', 'aria-hidden': 'true' });
  const status = h('p', { class: 'camera-status', role: 'status' }, 'Asking your browser for the camera…');
  const proceed = button('Continue to calibration', () => finish(true), { wide: true });
  proceed.disabled = true;
  const leave = button('Play without eye-tracking', () => finish(false), { secondary: true, wide: true });
  let poll = 0;
  const finish = (ok: boolean) => {
    clearInterval(poll);
    resolve(ok);
  };
  const view = h(
    'section',
    { class: 'panel', 'aria-labelledby': 'camera-title' },
    h('p', { class: 'label' }, 'Outside the story · Step 1 of 3'),
    h('h1', { class: 'notice-title', id: 'camera-title', tabindex: -1 }, 'Position your face'),
    preview,
    status,
    h(
      'ul',
      { class: 'prose tips' },
      h('li', {}, 'Sit at arm’s length, facing the screen, with your face in the middle of the picture.'),
      h('li', {}, 'Light your face from the front; avoid a bright window behind you.'),
      h('li', {}, 'Keep your head still from now on, and keep this browser window the same size.'),
    ),
    h('div', { class: 'actions' }, proceed, leave),
  );
  tracker
    .start(preview)
    .then(() => {
      status.textContent = 'Looking for your face…';
      poll = window.setInterval(() => {
        const found = tracker.faceDetected();
        proceed.disabled = !found;
        status.textContent = found ? 'Face found. Hold still and keep this distance.' : 'Looking for your face… Move into the picture and check the lighting.';
      }, 250);
    })
    .catch((error: unknown) => {
      tracker.stop();
      const denied = error instanceof DOMException && (error.name === 'NotAllowedError' || error.name === 'SecurityError');
      status.textContent = denied
        ? 'The camera was not allowed, so eye-tracking is off. You can play normally.'
        : 'The camera could not be started, so eye-tracking is off. You can play normally.';
      proceed.remove();
      leave.textContent = 'Play normally';
      leave.focus();
    });
  return { view, done };
}

/** The round's layout without content, so calibration happens exactly where the images will be. */
export function stimulusSkeleton(title: string, note: string): { view: HTMLElement; grid: HTMLElement; overlay: HTMLElement } {
  const grid = h('div', { class: 'grid skeleton', 'aria-hidden': 'true' });
  for (let i = 0; i < 9; i++) grid.append(h('div', { class: 'tile placeholder' }));
  const overlay = h('div', { class: 'dot-layer' });
  const view = h(
    'section',
    { class: 'panel', 'aria-labelledby': 'skeleton-title' },
    h('div', { class: 'round-head' }, h('div', { class: 'progress' }, h('span', {}, note)), h('p', { class: 'case-ref' }, 'Outside the story', h('br'), 'Eye-tracking setup')),
    h('p', { class: 'label' }, 'Calibration'),
    h('h1', { class: 'instruction', id: 'skeleton-title', tabindex: -1 }, title),
    h('div', { class: 'timer' }, h('span', {}, ' ')),
    grid,
    h('div', { class: 'submit-row' }, h('div', { class: 'button wide skeleton-button', 'aria-hidden': 'true' }, ' ')),
    h('p', { class: 'hint' }, h('span', { class: 'hint-icon', 'aria-hidden': 'true' }, 'i'), h('span', {}, 'Keep your head still. The dots appear where the images will be.')),
    overlay,
  );
  return { view, grid, overlay };
}

function rectOf(el: Element): Rect {
  const r = el.getBoundingClientRect();
  return { x: r.x, y: r.y, width: r.width, height: r.height };
}

function shuffled<T>(items: T[]): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Nine points, clicked three times each while looking at them. Training only. */
export async function calibrate(tracker: Tracker, grid: HTMLElement, overlay: HTMLElement, status: (text: string) => void): Promise<{ x: number; y: number }[]> {
  const area = rectOf(grid);
  const points = shuffled(placePoints(area, CALIBRATION_FRACTIONS));
  for (const [index, point] of points.entries()) {
    status(`Point ${index + 1} of ${points.length}: look at the dot and click it ${CLICKS_PER_POINT} times.`);
    await new Promise<void>((resolve) => {
      let clicks = 0;
      const dot = h('button', { type: 'button', class: 'calibration-dot', 'aria-label': `Calibration point ${index + 1} of ${points.length}` });
      dot.style.left = `${point.x}px`;
      dot.style.top = `${point.y}px`;
      dot.addEventListener('click', () => {
        tracker.train(point.x, point.y);
        clicks++;
        dot.style.setProperty('--progress', String(clicks / CLICKS_PER_POINT));
        if (clicks >= CLICKS_PER_POINT) {
          dot.remove();
          resolve();
        }
      });
      overlay.append(dot);
      dot.focus({ preventScroll: true });
    });
  }
  return points;
}

/** Held-out points: the participant only looks, and the estimates are compared with the targets. */
export async function validate(tracker: Tracker, grid: HTMLElement, overlay: HTMLElement, status: (text: string) => void): Promise<PointRecording[]> {
  const points = shuffled(placePoints(rectOf(grid), VALIDATION_FRACTIONS));
  const recordings: PointRecording[] = [];
  for (const [index, point] of points.entries()) {
    status(`Checking ${index + 1} of ${points.length}: look at the dot. There is nothing to click.`);
    const dot = h('div', { class: 'validation-dot', 'aria-hidden': 'true', 'data-index': index });
    dot.style.left = `${point.x}px`;
    dot.style.top = `${point.y}px`;
    overlay.append(dot);
    const shownAt = performance.now();
    const estimates: PointRecording['estimates'] = [];
    const unsubscribe = tracker.onEstimate((e) => estimates.push({ t_ms: e.t - shownAt, x: e.x, y: e.y }));
    await new Promise((r) => setTimeout(r, VALIDATION_POINT_MS));
    unsubscribe();
    dot.remove();
    recordings.push({ target: point, estimates, duration_ms: VALIDATION_POINT_MS });
  }
  return recordings;
}

export function qualityRecord(
  sessionId: string,
  tracker: Tracker,
  training: { x: number; y: number }[],
  summary: ValidationSummary,
  decision: QualityDecision,
  attempt: number,
): CalibrationQuality {
  return {
    session_id: sessionId,
    method: `${tracker.name} ridge regression, click calibration (${CLICKS_PER_POINT} clicks at 9 points), ${VALIDATION_FRACTIONS.length} held-out validation points of ${VALIDATION_POINT_MS} ms`,
    method_version: tracker.version,
    training_targets: training,
    validation_points: summary.points.map((p) => ({ x: p.x, y: p.y, mean_error_px: p.mean_error_px ?? NaN, samples: p.samples, valid_samples: p.valid_samples })),
    valid_sample_proportion: summary.valid_sample_proportion,
    delivered_rate_hz: summary.delivered_rate_hz,
    usable_rate_hz: summary.usable_rate_hz,
    retry_count: attempt - 1,
    passed: decision.passed,
  };
}

export function assess(recordings: PointRecording[], tileWidthPx: number): { summary: ValidationSummary; decision: QualityDecision } {
  const summary = summariseValidation(recordings);
  return { summary, decision: assessQuality(summary, tileWidthPx, DEVELOPMENT_THRESHOLDS) };
}

export function qualityScreen(
  summary: ValidationSummary,
  decision: QualityDecision,
  tileWidthPx: number,
  attempt: number,
  actions: { recalibrate: () => void; withTracking: () => void; withoutTracking: () => void },
): HTMLElement {
  const error = summary.mean_error_px;
  const share = error === null ? null : error / tileWidthPx;
  const describe = share === null ? 'no estimate' : share < 0.35 ? 'about a third of an image or less' : share < 0.75 ? 'about half an image' : share < 1.25 ? 'about one image' : 'more than one image';
  const facts = h(
    'dl',
    { class: 'facts' },
    h('div', { class: 'fact' }, h('dt', {}, 'Average distance'), h('dd', {}, error === null ? 'None' : `${Math.round(error)} px`)),
    h('div', { class: 'fact' }, h('dt', {}, 'Estimates per second'), h('dd', {}, summary.usable_rate_hz.toFixed(0))),
    h('div', { class: 'fact' }, h('dt', {}, 'Moments without an estimate'), h('dd', {}, `${Math.round((1 - summary.valid_sample_proportion) * 100)} %`)),
  );
  const buttons: HTMLElement[] = [];
  if (decision.passed) buttons.push(button('Continue with eye-tracking', actions.withTracking, { wide: true, icon: ICON_CHECKBOX }));
  if (attempt < MAX_ATTEMPTS) buttons.push(button('Calibrate again', actions.recalibrate, { wide: true, secondary: decision.passed }));
  buttons.push(button('Continue without eye-tracking', actions.withoutTracking, { wide: true, secondary: true }));
  return h(
    'section',
    { class: 'panel', 'aria-labelledby': 'quality-title' },
    h('p', { class: 'label' }, `Outside the story · Step 3 of 3 · Attempt ${attempt} of ${MAX_ATTEMPTS}`),
    h('h1', { class: 'notice-title', id: 'quality-title', tabindex: -1 }, decision.passed ? 'The check passed' : 'The check did not pass'),
    h(
      'p',
      { class: 'prose' },
      decision.passed
        ? `At the checking points, the estimates were on average ${describe} away from where you were looking. That is good enough to tell the images apart, roughly.`
        : `At the checking points, the estimates were on average ${describe} away from where you were looking. That is not good enough to say which image you were looking at.`,
    ),
    facts,
    decision.reasons.length ? h('ul', { class: 'prose' }, ...decision.reasons.map((r) => h('li', {}, r))) : null,
    h('p', { class: 'fine-print' }, `These limits are provisional (${decision.basis}) until a pilot study sets them.`),
    h('div', { class: 'actions' }, ...buttons),
  );
}
