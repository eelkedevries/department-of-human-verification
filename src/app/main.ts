/**
 * The game controller: notice → briefing → five rounds (each revealing its own
 * feedback) → report, and replay into a fresh session.
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
}

const state: State = {
  timeOption: presetTime === 'extended' || presetTime === 'none' ? presetTime : 'standard',
  session: null,
  collector: null,
  results: [],
  rng: createRng(0),
  previous: [],
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

function startSession(): void {
  const seed = upcomingSeed;
  upcomingSeed = randomSeed();
  state.session = createSession({
    catalogue,
    seed,
    sessionId: crypto.randomUUID(),
    settings: { time_option: state.timeOption, time_limit_ms: TIME_LIMITS[state.timeOption] },
    avoid: state.previous,
  });
  state.collector = createCollector(() => performance.now());
  state.collector.log({ type: 'session_start' });
  state.results = [];
  state.rng = createRng(deriveSeed(seed, 'feedback'));
  state.previous = state.session.assignments.map((a) => a.stimulus_id);
  playRound(0);
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
      onNext: () => (last ? showReport() : playRound(index + 1)),
    }),
  );
  if (index === 0) prefetch(stimulusById(session.assignments[1].stimulus_id));
}

function showReport(): void {
  const session = state.session!;
  state.collector!.log({ type: 'session_end' });
  const summary = summarise(state.results.map(({ result }) => ({ evaluation: result.evaluation, response_time_ms: result.trial.response_time_ms })));
  show(
    reportScreen({
      caseNumber: session.case_number,
      issued: new Date(),
      summary,
      verdict: verdictFor(summary),
      rounds: state.results,
      reducedMotion: prefersReducedMotion(),
      onReplay: startSession,
      devExport: devMode ? exportSession : undefined,
    }),
  );
}

function exportSession(): void {
  const data = buildExport(
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
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const link = h('a', { href: url, download: `dhv-${state.session!.case_number}-developer-export.json` });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

show(
  noticeScreen(caseNumber(upcomingSeed, new Date().getFullYear()), () =>
    show(
      briefingScreen(state.timeOption, (option) => {
        state.timeOption = option;
        startSession();
      }),
    ),
  ),
  false,
);
