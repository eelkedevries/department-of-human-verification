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
import { disposePages, pagedView } from '../components/viewport';
import { prefetch, renderRound, type RoundResult } from '../game/round';
import { createRng, deriveSeed, randomSeed, type Rng } from '../game/rng';
import { summarise, verdictFor } from '../game/scoring';
import { catalogue, stimulusById } from '../stimuli/catalogue';
import type { Stimulus } from '../stimuli/types';
import { aboutDialog, briefingScreen, noticeScreen, reportScreen } from './screens';
import { caseNumber, createSession, newSessionId, TIME_LIMITS, type Session, type TimeOption } from './session';
import type { EyeTrackingContext, Testimony } from '../eyetracking';
import { STAGES, borderlineDecisions, callbackNote, type ExperimentalRecord } from '../experimental/model';
import { appealScreen, definitionScreen, experimentalReport } from '../experimental/screens';
import { readCase, type SharedCase } from '../experimental/sharing';
import type { GameMode } from './session';

/** Eye-tracking code is left out entirely unless built with VITE_EYE_TRACKING=1. */
const loadEyeTracking = import.meta.env.VITE_EYE_TRACKING === '1' ? () => import('../eyetracking') : null;

const APP_VERSION = '1.2.0';

const params = new URLSearchParams(location.search);
const devMode = params.has('dev');
const fixedSeed = params.get('seed');
const presetTime = params.get('time');
const importedCase = readCase(location.hash, catalogue);
const initialSharedCase = importedCase.kind === 'valid' ? importedCase.value : null;

interface State {
  mode: GameMode;
  pendingShared: SharedCase | null;
  reference: string[][] | null;
  experimental: ExperimentalRecord;
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
  mode: initialSharedCase || params.get('mode') === 'experimental' ? 'experimental' : 'standard',
  pendingShared: initialSharedCase,
  reference: null,
  experimental: { interpretation: null, appeal: null },
  timeOption: initialSharedCase?.time ?? (presetTime === 'extended' || presetTime === 'none' ? presetTime : 'standard'),
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
  disposePages(main);
  main.replaceChildren(view.classList.contains('round-panel') ? view : pagedView(view));
  if (moveFocus) view.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true });
}

/** Drawn ahead of time so the notice and the first session share a case number. */
let upcomingSeed = initialSharedCase?.seed ?? (fixedSeed !== null ? Number(fixedSeed) >>> 0 : randomSeed());

function startSession(sessionId: string = newSessionId()): void {
  const shared = state.mode === 'experimental' ? state.pendingShared : null;
  state.pendingShared = null;
  state.reference = shared?.answers ?? null;
  state.experimental = { interpretation: null, appeal: null };
  const seed = shared?.seed ?? upcomingSeed;
  upcomingSeed = randomSeed();
  state.session = createSession({
    catalogue,
    seed,
    sessionId,
    settings: { time_option: state.timeOption, time_limit_ms: TIME_LIMITS[state.timeOption] },
    avoid: state.previous,
    mode: state.mode,
    gridOrder: shared?.grids.map((g) => g.id),
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
      stage: state.mode === 'experimental' ? STAGES[index].title : undefined,
      caseNote: state.mode === 'experimental' && index === 3 ? callbackNote(state.results) : undefined,
      nextLabel: last ? (state.mode === 'experimental' ? 'Continue to case review' : 'View report') : `Continue to assessment ${index + 2}`,
      onComplete: (result) => {
        state.collector!.addTrial(result.trial);
        state.results.push({ stimulus, result });
        if (!last) prefetch(stimulusById(session.assignments[index + 1].stimulus_id));
      },
      onNext: () => (last ? void finishAssessments() : playRound(index + 1)),
      instrumentation: state.eye?.recorder,
    }),
  );
  if (index === 0) prefetch(stimulusById(session.assignments[1].stimulus_id));
}

async function finishAssessments(): Promise<void> {
  const session = state.session!;
  if (state.eye) {
    state.eye.end('finished');
    const eyetracking = await loadEyeTracking!();
    // The testimony is taken before anything about gaze is shown.
    const asked = session.assignments[1];
    state.testimony = await new Promise<Testimony>((resolve) => show(eyetracking.testimonyScreen(stimulusById(asked.stimulus_id), asked, resolve)));
  }
  if (state.mode === 'experimental') {
    const decisions = borderlineDecisions(state.results);
    show(definitionScreen(decisions, () => state.collector!.now(), (record) => {
      state.experimental.interpretation = record;
      state.collector!.log({ type: 'definition_review', stimulus_id: record.stimulus_id, tile_id: record.tile_id });
      showAppeal();
    }, showAppeal));
    return;
  }
  await showReport();
}

function showAppeal(): void {
  show(appealScreen(borderlineDecisions(state.results), state.experimental.interpretation, () => state.collector!.now(), (record) => {
    state.experimental.appeal = record;
    state.collector!.log({ type: 'appeal_filed', stimulus_id: record.stimulus_id, tile_id: record.tile_id });
    void showReport();
  }, () => void showReport()));
}

async function showReport(): Promise<void> {
  const session = state.session!;
  state.collector!.log({ type: 'session_end' });
  const summary = summarise(state.results.map(({ result }) => ({ evaluation: result.evaluation, response_time_ms: result.trial.response_time_ms })));
  const report = reportScreen({
    caseNumber: session.case_number,
    issued: new Date(),
    summary,
    verdict: verdictFor(summary),
    rounds: state.results,
    reducedMotion: prefersReducedMotion(),
    onReplay: replay,
    mode: state.mode,
    onChangeMode: () => showNotice(),
    supplement: state.mode === 'experimental' ? experimentalReport(session, state.results, borderlineDecisions(state.results), state.experimental, state.reference) : undefined,
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
  if (state.mode === 'experimental') data = { ...base, experimental: state.experimental };
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
      const sessionId = newSessionId();
      state.eye = await eyetracking.setUpEyeTracking(show, sessionId);
      startSession(sessionId);
    }, state.mode),
  );
}

async function begin(): Promise<void> {
  if (!loadEyeTracking || state.mode === 'experimental') return showBriefing(false);
  const { choiceScreen } = await loadEyeTracking();
  show(choiceScreen(() => showBriefing(false), () => showBriefing(true)));
}

function showNotice(first = false): void {
  state.eye?.badge.remove();
  state.eye = null;
  document.body.classList.remove('eyetracking');
  const notice = state.pendingShared
    ? (state.pendingShared.answers ? 'A shared Experimental comparison case is ready. The other selections stay hidden until your report. The timing setting is preselected; you may change it in the briefing.' : 'A shared Experimental case is ready. It contains no answers. The timing setting is preselected; you may change it in the briefing.')
    : first && importedCase.kind === 'invalid' ? importedCase.message : undefined;
  show(noticeScreen(caseNumber(upcomingSeed, new Date().getFullYear()), (mode) => {
    if (mode === 'standard' && state.pendingShared) { state.pendingShared = null; upcomingSeed = randomSeed(); }
    state.mode = mode;
    // Consuming a shared case never leaves the previous sender's answers in a replay URL.
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    void begin();
  }, state.mode, notice), !first);
}

showNotice(true);
