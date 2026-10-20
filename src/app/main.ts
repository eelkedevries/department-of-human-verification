/**
 * The game controller: notice → briefing → five rounds (each revealing its own
 * feedback) → report, and replay into a fresh session. Builds made with
 * VITE_EYE_TRACKING=1 add the optional eye-tracking path (version 2); in all
 * other builds that code is not even included.
 */

import '../styles/main.css';
import { buildExport, createCollector, type Collector } from '../analytics/collector';
import { footer, letterhead } from '../components/chrome';
import { h, prefersReducedMotion } from '../components/dom';
import { prefetch, renderRound, type RoundResult } from '../game/round';
import { createRng, deriveSeed, randomSeed, type Rng } from '../game/rng';
import { summarise, verdictFor } from '../game/scoring';
import { catalogue, stimulusById } from '../stimuli/catalogue';
import type { Stimulus } from '../stimuli/types';
import { aboutDialog, briefingScreen, noticeScreen, reportScreen } from './screens';
import { caseNumber, createSession, TIME_LIMITS, type Session, type TimeOption } from './session';
import type { EyeTrackingContext, Testimony } from '../eyetracking';

/** Null unless built with VITE_EYE_TRACKING=1, in which case the eye-tracking code is left out entirely. */
const loadEyeTracking = import.meta.env.VITE_EYE_TRACKING === '1' ? () => import('../eyetracking') : null;

const APP_VERSION = '1.0.0';

const params = new URLSearchParams(location.search);
const devMode = params.has('dev');
const fixedSeed = params.get('seed');
const presetTime = params.get('time');

interface State {
  timeOption: TimeOption;
  session: Session | null;
  collector: Collector | null;
  results: { stimulus: Stimulus; result: RoundResult }[];
  rng: Rng;
  previous: string[];
  eye: EyeTrackingContext | null;
  testimony: Testimony | null;
}

const state: State = {
  timeOption: presetTime === 'extended' || presetTime === 'none' ? presetTime : 'standard',
  session: null,
  collector: null,
  results: [],
  rng: createRng(0),
  previous: [],
  eye: null,
  testimony: null,
};

const app = document.getElementById('app')!;
const main = h('main', { id: 'main', tabindex: -1 });
const about = aboutDialog();
app.append(h('div', { class: 'page' }, letterhead(), main, footer(() => about.showModal())), about);

/** Replaces the screen. Later screens move focus to their heading so screen readers announce them; the first leaves focus alone. */
function show(view: HTMLElement, moveFocus = true): void {
  main.replaceChildren(view);
  window.scrollTo(0, 0);
  if (moveFocus) view.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true });
}

/** Drawn ahead of time so the notice and the first session share a case number. */
let upcomingSeed = fixedSeed !== null ? Number(fixedSeed) >>> 0 : randomSeed();

function startSession(sessionId: string = crypto.randomUUID()): void {
  const seed = upcomingSeed;
  upcomingSeed = randomSeed();
  state.session = createSession({
    catalogue,
    seed,
    sessionId,
    settings: { time_option: state.timeOption, time_limit_ms: TIME_LIMITS[state.timeOption] },
    avoid: state.previous,
  });
  state.collector = createCollector(() => performance.now());
  state.collector.log({ type: 'session_start' });
  state.results = [];
  state.rng = createRng(deriveSeed(seed, 'feedback'));
  state.previous = state.session.assignments.map((a) => a.stimulus_id);
  state.testimony = null;
  document.body.classList.toggle('eyetracking', state.eye !== null);
  if (state.eye) app.append(state.eye.badge);
  playRound(0);
}

function replay(): void {
  state.eye?.badge.remove();
  state.eye = null;
  startSession();
}

function playRound(index: number): void {
  const session = state.session!;
  const assignment = session.assignments[index];
  const stimulus = stimulusById(assignment.stimulus_id);
  const last = index === session.assignments.length - 1;
  show(
    renderRound({
      stimulus,
      assignment,
      total: session.assignments.length,
      caseNumber: session.case_number,
      timeLimitMs: session.settings.time_limit_ms,
      collector: state.collector!,
      rng: state.rng,
      reducedMotion: prefersReducedMotion(),
      nextLabel: last ? 'View report' : `Continue to assessment ${index + 2}`,
      onComplete: (result) => {
        state.collector!.addTrial(result.trial);
        state.results.push({ stimulus, result });
        if (!last) prefetch(stimulusById(session.assignments[index + 1].stimulus_id));
      },
      onNext: () => (last ? void showReport() : playRound(index + 1)),
      instrumentation: state.eye?.recorder,
    }),
  );
  if (index === 0) prefetch(stimulusById(session.assignments[1].stimulus_id));
}

async function showReport(): Promise<void> {
  const session = state.session!;
  state.collector!.log({ type: 'session_end' });
  if (state.eye) {
    state.eye.end('finished');
    const eyetracking = await loadEyeTracking!();
    // The testimony is taken before anything about gaze is shown.
    const asked = session.assignments[1];
    state.testimony = await new Promise<Testimony>((resolve) => show(eyetracking.testimonyScreen(stimulusById(asked.stimulus_id), asked, resolve)));
  }
  const summary = summarise(state.results.map(({ result }) => ({ evaluation: result.evaluation, response_time_ms: result.trial.response_time_ms })));
  const report = reportScreen({
    caseNumber: session.case_number,
    issued: new Date(),
    summary,
    verdict: verdictFor(summary),
    rounds: state.results,
    reducedMotion: prefersReducedMotion(),
    onReplay: replay,
    devExport: devMode ? exportSession : undefined,
  });
  if (state.eye) {
    const eye = state.eye;
    const { revealSection } = await loadEyeTracking!();
    const reveal = revealSection({
      rounds: session.assignments.map((assignment) => ({
        stimulus: stimulusById(assignment.stimulus_id),
        assignment,
        gaze: eye.recorder.trials().find((t) => t.trial_index === assignment.trial_index) ?? null,
      })),
      calibrationPassed: eye.calibrationPassed,
      testimony: state.testimony,
      withdrawn: eye.withdrawn,
    });
    report.querySelector('.decisions')!.after(reveal);
  }
  show(report);
}

async function exportSession(): Promise<void> {
  const base = buildExport(
    state.session!,
    state.collector!,
    {
      viewport_width: innerWidth,
      viewport_height: innerHeight,
      device_pixel_ratio: devicePixelRatio,
      reduced_motion: prefersReducedMotion(),
    },
    APP_VERSION,
  );
  let data: object = base;
  if (state.eye) {
    const { testimonyResponses } = await loadEyeTracking!();
    const eye = state.eye;
    data = {
      ...base,
      eye_tracking: {
        notice: 'Estimates from a webcam; approximate. Never uploaded.',
        consent: eye.consent,
        calibration_quality: eye.calibrations,
        withdrawn: eye.withdrawn,
        trials: eye.recorder.trials(),
        qualitative_responses: state.testimony ? testimonyResponses(state.session!.session_id, state.testimony, `${state.session!.session_id}-${state.testimony.trial_index}`) : [],
      },
    };
  }
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const link = h('a', { href: url, download: `dhv-${state.session!.case_number}-developer-export.json` });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function showBriefing(withTracking: boolean): void {
  show(
    briefingScreen(state.timeOption, async (option) => {
      state.timeOption = option;
      if (!withTracking || !loadEyeTracking) return startSession();
      const eyetracking = await loadEyeTracking();
      const sessionId = crypto.randomUUID();
      state.eye = await eyetracking.setUpEyeTracking(show, sessionId);
      startSession(sessionId);
    }),
  );
}

async function begin(): Promise<void> {
  if (!loadEyeTracking) return showBriefing(false);
  const { choiceScreen } = await loadEyeTracking();
  show(choiceScreen(() => showBriefing(false), () => showBriefing(true)));
}

show(noticeScreen(caseNumber(upcomingSeed, new Date().getFullYear()), () => void begin()), false);
