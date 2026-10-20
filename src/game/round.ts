/** One assessment: load the nine tiles, take a timed selection, then reveal the answer in place. */

import type { TrialAssignment } from '../app/session';
import type { Collector, TrialRecord } from '../analytics/collector';
import { button, ICON_CHECKBOX, ICON_TICK, progress, stamp } from '../components/chrome';
import { h, svg } from '../components/dom';
import { FAMILY_LABELS, STAMPS, SUSPICIOUSLY_FAST, SUSPICIOUSLY_FAST_MS, TIMEOUT_LINES } from '../content/copy';
import type { Stimulus, StimulusTile } from '../stimuli/types';
import { assetUrl } from '../stimuli/catalogue';
import type { Rng } from './rng';
import { pick } from './rng';
import { evaluate, type Evaluation } from './scoring';
import { createRoundTimer, type RoundTimer } from './timer';

export interface RoundResult {
  trial: TrialRecord;
  evaluation: Evaluation;
  line: string;
}

export interface RoundOptions {
  stimulus: Stimulus;
  assignment: TrialAssignment;
  total: number;
  caseNumber: string;
  timeLimitMs: number | null;
  collector: Collector;
  rng: Rng;
  reducedMotion: boolean;
  /** Called once the answer is revealed; the round view keeps the screen until onNext. */
  onComplete(result: RoundResult): void;
  onNext(): void;
  nextLabel: string;
}

const TILE_SIZES = '(max-width: 30rem) 31vw, 13rem';

export function feedbackLine(stimulus: Stimulus, evaluation: Evaluation, responseMs: number | null, rng: Rng): string {
  if (evaluation.outcome === 'timeout') return pick(TIMEOUT_LINES, rng);
  if (evaluation.outcome === 'correct' && responseMs !== null && responseMs < SUSPICIOUSLY_FAST_MS) return SUSPICIOUSLY_FAST;
  if (evaluation.outcome === 'partial') return pick(stimulus.feedback.partial ?? stimulus.feedback.incorrect, rng);
  return pick(stimulus.feedback[evaluation.outcome === 'correct' ? 'correct' : 'incorrect'], rng);
}

function tileImage(tile: StimulusTile): HTMLImageElement {
  return h('img', {
    src: assetUrl(tile.src),
    srcset: `${assetUrl(tile.src_small)} ${tile.width / 2}w, ${assetUrl(tile.src)} ${tile.width}w`,
    sizes: TILE_SIZES,
    width: tile.width,
    height: tile.height,
    alt: tile.alt,
    draggable: 'false',
  });
}

/** Warms the browser cache for a later round while the player reads feedback. */
export function prefetch(stimulus: Stimulus): void {
  for (const tile of stimulus.tiles) {
    const img = new Image();
    img.sizes = TILE_SIZES;
    img.srcset = `${assetUrl(tile.src_small)} ${tile.width / 2}w, ${assetUrl(tile.src)} ${tile.width}w`;
    img.src = assetUrl(tile.src);
  }
}

export function renderRound(options: RoundOptions): HTMLElement {
  const { stimulus, assignment, collector } = options;
  const labels = FAMILY_LABELS[stimulus.family];
  const tiles = assignment.layout.map((id) => stimulus.tiles.find((t) => t.tile_id === id)!);
  const selected = new Set<string>();
  const selectionOrder: TrialRecord['selection_order'] = [];
  const instructionId = `instruction-${assignment.trial_index}`;
  const hintId = `hint-${assignment.trial_index}`;
  let phase: 'loading' | 'active' | 'revealed' = 'loading';
  let focusIndex = 0;
  let onsetMs = 0;
  let interrupted = false;
  let timer: RoundTimer | null = null;
  let frame = 0;
  let interval = 0;
  let announcedLow = false;

  const status = h('p', { class: 'status', role: 'status' }, 'Retrieving case materials…');
  const timerFill = h('div', { class: 'timer-fill' });
  // Filled from the start, so the first tick cannot shift the grid after onset.
  const timerText = h('span', { class: 'timer-text' }, options.timeLimitMs === null ? '' : `${options.timeLimitMs / 1000} s remaining`);
  const timerLive = h('span', { class: 'visually-hidden', 'aria-live': 'polite' });
  const timerBox = options.timeLimitMs === null
    ? h('div', { class: 'timer' }, h('span', {}, 'No time limit'))
    : h('div', { class: 'timer', 'aria-hidden': 'false' }, h('div', { class: 'timer-track', 'aria-hidden': 'true' }, timerFill), timerText, timerLive);
  const grid = h('div', {
    class: 'grid loading',
    role: 'group',
    'aria-labelledby': instructionId,
    'aria-describedby': hintId,
  });
  const error = h('p', { class: 'form-error', role: 'alert' });
  const submit = button('Submit selection', () => finish(false), { wide: true, icon: ICON_CHECKBOX });
  // Disabled until the images are on screen, so an early press cannot vanish silently.
  submit.disabled = true;
  const submitRow = h('div', { class: 'submit-row' }, submit, error);
  const feedbackSlot = h('div', { 'aria-live': 'polite' });

  const buttons = tiles.map((tile, position) => {
    const el = h(
      'button',
      {
        type: 'button',
        class: 'tile',
        'aria-pressed': 'false',
        tabindex: position === 0 ? 0 : -1,
        'data-position': position,
      },
      h('span', { class: 'visually-hidden' }, `Image ${position + 1}: `),
      tileImage(tile),
      h('span', { class: 'tick', 'aria-hidden': 'true' }, svg(ICON_TICK)),
      h('span', { class: 'tile-number', 'aria-hidden': 'true' }, position + 1),
    );
    el.addEventListener('click', () => toggle(position));
    el.addEventListener('focus', () => {
      focusIndex = position;
    });
    return el;
  });
  grid.append(...buttons);
  grid.addEventListener('keydown', onKey);

  const panel = h(
    'section',
    { class: 'panel', 'aria-labelledby': instructionId },
    h(
      'div',
      { class: 'round-head' },
      progress(assignment.trial_index, options.total),
      h('p', { class: 'case-ref' }, `Case no. ${options.caseNumber}`, h('br'), `Subject: ${labels.subject}`),
    ),
    h('p', { class: 'label' }, labels.category),
    h('h1', { class: 'instruction', id: instructionId, tabindex: -1 }, stimulus.instruction),
    timerBox,
    status,
    grid,
    submitRow,
    feedbackSlot,
    h('p', { class: 'hint', id: hintId }, h('span', { class: 'hint-icon', 'aria-hidden': 'true' }, 'i'), h('span', {}, stimulus.hint)),
  );

  void load();
  return panel;

  async function load(): Promise<void> {
    phase = 'loading';
    status.hidden = false;
    status.textContent = 'Retrieving case materials…';
    try {
      await Promise.all(Array.from(grid.querySelectorAll('img'), (img) => img.decode()));
    } catch {
      status.textContent = 'The case materials could not be retrieved. Please check your connection.';
      const retry = button('Try again', () => {
        retry.remove();
        for (const img of grid.querySelectorAll('img')) img.src = img.src;
        void load();
      }, { secondary: true });
      status.append(h('br'), retry);
      return;
    }
    status.hidden = true;
    grid.classList.remove('loading');
    await new Promise(requestAnimationFrame);
    begin();
  }

  function begin(): void {
    phase = 'active';
    submit.disabled = false;
    onsetMs = collector.now();
    collector.log({ type: 'trial_start', t_ms: onsetMs, trial_index: assignment.trial_index, stimulus_id: stimulus.stimulus_id });
    timer = createRoundTimer(options.timeLimitMs, () => performance.now(), () => finish(true));
    timer.start();
    document.addEventListener('visibilitychange', onVisibility);
    if (options.timeLimitMs !== null) {
      if (options.reducedMotion) interval = window.setInterval(tick, 250);
      else frame = requestAnimationFrame(loop);
      tick();
    }
  }

  function loop(): void {
    tick();
    if (phase === 'active') frame = requestAnimationFrame(loop);
  }

  function tick(): void {
    if (!timer || options.timeLimitMs === null) return;
    const remaining = timer.tick();
    if (remaining === null || phase !== 'active') return;
    timerFill.style.transform = `scaleX(${remaining / options.timeLimitMs})`;
    const seconds = Math.ceil(remaining / 1000);
    timerText.textContent = `${seconds} s remaining`;
    timerBox.classList.toggle('low', remaining <= 5000);
    if (!announcedLow && remaining <= 5000) {
      announcedLow = true;
      timerLive.textContent = 'Five seconds remain.';
    }
  }

  function onVisibility(): void {
    if (phase !== 'active' || !timer) return;
    const visible = document.visibilityState === 'visible';
    collector.log({ type: 'visibility', trial_index: assignment.trial_index, visible });
    if (visible) timer.resume();
    else {
      interrupted = true;
      timer.pause();
    }
  }

  function toggle(position: number): void {
    if (phase !== 'active') return;
    const tile = tiles[position];
    const now = !selected.has(tile.tile_id);
    if (stimulus.mode === 'single' && now) {
      for (const other of [...selected]) setSelected(tiles.findIndex((t) => t.tile_id === other), false);
    }
    setSelected(position, now);
    error.textContent = '';
  }

  function setSelected(position: number, value: boolean): void {
    const tile = tiles[position];
    if (value) selected.add(tile.tile_id);
    else selected.delete(tile.tile_id);
    buttons[position].setAttribute('aria-pressed', String(value));
    const event = collector.log({ type: 'selection', trial_index: assignment.trial_index, tile_id: tile.tile_id, position, selected: value });
    selectionOrder.push({ tile_id: tile.tile_id, selected: value, t_ms: event.t_ms });
  }

  function onKey(event: KeyboardEvent): void {
    const moves: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 3, ArrowUp: -3 };
    let next: number | null = null;
    if (event.key in moves) next = focusIndex + moves[event.key];
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tiles.length - 1;
    else if (/^[1-9]$/.test(event.key) && phase === 'active') {
      event.preventDefault();
      next = Number(event.key) - 1;
      toggle(next);
    }
    if (next === null || next < 0 || next >= tiles.length) return;
    event.preventDefault();
    buttons[focusIndex].tabIndex = -1;
    buttons[next].tabIndex = 0;
    buttons[next].focus();
    focusIndex = next;
  }

  function finish(timedOut: boolean): void {
    if (phase !== 'active' || !timer) return;
    if (!timedOut && selected.size === 0) {
      error.textContent = stimulus.mode === 'single'
        ? 'Selection required. Please select one image before submitting.'
        : 'Selection required. Please select at least one image before submitting.';
      return;
    }
    phase = 'revealed';
    timer.stop();
    cancelAnimationFrame(frame);
    clearInterval(interval);
    document.removeEventListener('visibilitychange', onVisibility);
    const endMs = collector.now();
    const responseMs = timedOut ? null : Math.round(timer.elapsedMs());
    collector.log({ type: timedOut ? 'timeout' : 'submit', t_ms: endMs, trial_index: assignment.trial_index });
    const evaluation = evaluate([...selected], stimulus.answer_key, assignment.layout, timedOut);
    collector.log({ type: 'trial_end', t_ms: endMs, trial_index: assignment.trial_index, correct: evaluation.correct });
    const trial: TrialRecord = {
      trial_id: `${assignment.session_id}-${assignment.trial_index}`,
      session_id: assignment.session_id,
      trial_index: assignment.trial_index,
      stimulus_id: stimulus.stimulus_id,
      stimulus_version: stimulus.version,
      onset_ms: onsetMs,
      end_ms: endMs,
      selected_tile_ids: assignment.layout.filter((id) => selected.has(id)),
      selection_order: selectionOrder,
      correct: evaluation.correct,
      outcome: evaluation.outcome,
      hits: evaluation.hits,
      misses: evaluation.misses,
      false_alarms: evaluation.false_alarms,
      response_time_ms: responseMs,
      timeout: timedOut,
      interrupted,
    };
    const line = feedbackLine(stimulus, evaluation, responseMs, options.rng);
    reveal(evaluation, line);
    options.onComplete({ trial, evaluation, line });
  }

  function reveal(evaluation: Evaluation, line: string): void {
    grid.classList.add('revealed');
    timerBox.classList.remove('low');
    if (options.timeLimitMs !== null) timerText.textContent = evaluation.outcome === 'timeout' ? 'Time expired' : 'Submitted';
    const key = new Set(stimulus.answer_key);
    buttons.forEach((el, position) => {
      const id = tiles[position].tile_id;
      el.setAttribute('aria-disabled', 'true');
      const isTarget = key.has(id);
      const isSelected = selected.has(id);
      let badge: [string, string] | null = null;
      if (isTarget && isSelected) badge = ['hit', 'Correct'];
      else if (isTarget) badge = ['miss', 'Missed'];
      else if (isSelected) badge = ['false-alarm', 'Not a match'];
      if (badge) {
        el.classList.add(badge[0]);
        el.append(h('span', { class: `verdict-badge ${badge[0]}` }, badge[1]));
      } else el.classList.add('dimmed');
    });
    submitRow.remove();
    const next = button(options.nextLabel, () => options.onNext(), { wide: true });
    feedbackSlot.append(
      h(
        'div',
        { class: 'feedback' },
        stamp(STAMPS[evaluation.outcome], evaluation.outcome, !options.reducedMotion),
        h('div', {}, h('p', { class: 'feedback-text' }, line), h('p', { class: 'feedback-explanation' }, stimulus.explanation)),
      ),
      h('div', { class: 'submit-row' }, next),
    );
    next.focus({ preventScroll: true });
    next.scrollIntoView({ block: 'nearest', behavior: options.reducedMotion ? 'auto' : 'smooth' });
  }
}
