/**
 * The end of an eye-tracking session (version 2): one self-report question asked
 * before anything is revealed, then three separately labelled accounts per
 * assessment — what the participant said, what the webcam estimated, and what a
 * model predicts. A prediction is never presented as a recording.
 */

import type { TrialAssignment } from '../app/session';
import { button } from '../components/chrome';
import { h } from '../components/dom';
import { FAMILY_LABELS } from '../content/copy';
import type { QualitativeResponse } from '../research/types';
import { assetUrl } from '../stimuli/catalogue';
import type { Stimulus } from '../stimuli/types';
import { displayable, type TrialGaze } from './reveal-data';

export interface Testimony {
  trial_index: number;
  /** Display position the participant chose, or null for "I do not remember" or no answer. */
  first_position: number | null;
  strategy: string | null;
}

export function testimonyResponses(sessionId: string, testimony: Testimony, trialId: string): QualitativeResponse[] {
  return [
    { session_id: sessionId, question_id: 'first_attention', text: null, category: testimony.first_position === null ? 'not_remembered' : `position_${testimony.first_position}`, trial_id: trialId },
    { session_id: sessionId, question_id: 'decision_strategy', text: testimony.strategy, category: null, trial_id: trialId },
  ];
}

/** Asked before the report, so that the answer cannot be shaped by the gaze record. */
export function testimonyScreen(stimulus: Stimulus, assignment: TrialAssignment, onDone: (t: Testimony) => void): HTMLElement {
  let chosen: number | null = null;
  const tiles = assignment.layout.map((id) => stimulus.tiles.find((t) => t.tile_id === id)!);
  const buttons = tiles.map((tile, position) => {
    const el = h(
      'button',
      { type: 'button', class: 'tile small', 'aria-pressed': 'false' },
      h('img', { src: assetUrl(tile.src_small), alt: tile.alt, width: 256, height: 256 }),
    );
    el.addEventListener('click', () => {
      chosen = chosen === position ? null : position;
      buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === chosen)));
    });
    return el;
  });
  const strategy = h('textarea', { id: 'strategy', rows: 3, maxlength: 500, class: 'textarea' });
  const submit = (remember: boolean) =>
    onDone({ trial_index: assignment.trial_index, first_position: remember ? chosen : null, strategy: strategy.value.trim() || null });
  return h(
    'section',
    { class: 'panel', 'aria-labelledby': 'testimony-title' },
    h('p', { class: 'label' }, 'Before the report · Optional'),
    h('h1', { class: 'notice-title', id: 'testimony-title', tabindex: -1 }, 'Your testimony'),
    h('p', { class: 'prose' }, `In assessment ${assignment.trial_index + 1} (“${stimulus.instruction}”), which image caught your attention first?`),
    h('div', { class: 'grid testimony-grid', role: 'group', 'aria-label': 'The images from that assessment, in the order you saw them' }, ...buttons),
    h('label', { class: 'label', for: 'strategy' }, 'What helped you decide? (optional)'),
    strategy,
    h('div', { class: 'actions' }, button('Submit testimony', () => submit(true), { wide: true }), button('I do not remember', () => submit(false), { secondary: true, wide: true })),
  );
}

export interface RevealInput {
  rounds: { stimulus: Stimulus; assignment: TrialAssignment; gaze: TrialGaze | null }[];
  calibrationPassed: boolean;
  testimony: Testimony | null;
  withdrawn: boolean;
}

function attentionGrid(stimulus: Stimulus, assignment: TrialAssignment, proportions: number[] | null, marked: number | null): HTMLElement {
  const grid = h('div', { class: 'mini-grid', 'aria-hidden': 'true' });
  assignment.layout.forEach((id, position) => {
    const tile = stimulus.tiles.find((t) => t.tile_id === id)!;
    const share = proportions ? proportions[position] : 0;
    const cell = h(
      'div',
      { class: `mini-tile${marked === position ? ' marked' : ''}` },
      h('img', { src: assetUrl(tile.src_small), alt: '', width: 256, height: 256 }),
    );
    if (proportions) {
      cell.style.setProperty('--share', String(share));
      cell.append(h('span', { class: 'share' }, `${Math.round(share * 100)} %`));
    }
    grid.append(cell);
  });
  return grid;
}

function describeShares(stimulus: Stimulus, assignment: TrialAssignment, proportions: number[]): string {
  const ranked = proportions.map((share, position) => ({ share, position })).sort((a, b) => b.share - a.share).slice(0, 3);
  return ranked
    .map(({ share, position }) => `${stimulus.tiles.find((t) => t.tile_id === assignment.layout[position])!.alt.toLowerCase()} ${Math.round(share * 100)} %`)
    .join('; ');
}

export function revealSection(input: RevealInput): HTMLElement {
  const section = h('section', { class: 'reveal', 'aria-labelledby': 'reveal-title' }, h('h2', { class: 'label', id: 'reveal-title' }, 'Your file: three accounts'));
  section.append(
    h(
      'p',
      { class: 'fine-print' },
      'Outside the story. ',
      input.withdrawn
        ? 'You stopped eye-tracking during the game, so the record ends where you stopped. '
        : '',
      'The camera is off. Surveillance records are estimates from your webcam, shown only where the quality checks passed; they are approximate and cover whole images, not points. No model predictions have been computed for these grids yet.',
    ),
  );
  for (const { stimulus, assignment, gaze } of input.rounds) {
    const check = gaze ? displayable(gaze, input.calibrationPassed) : { ok: false, reason: input.withdrawn ? 'Eye-tracking was stopped.' : 'No estimates were recorded.' };
    const testimony = input.testimony && input.testimony.trial_index === assignment.trial_index ? input.testimony : null;
    const proportions = check.ok && gaze?.attention ? gaze.attention.proportions : null;
    const block = h(
      'article',
      { class: 'reveal-round' },
      h('h3', { class: 'decision-title' }, `${assignment.trial_index + 1}. ${FAMILY_LABELS[stimulus.family].category}`),
      h('p', { class: 'decision-meta' }, stimulus.instruction),
      h(
        'div',
        { class: 'accounts' },
        h(
          'div',
          { class: 'account' },
          h('h4', {}, 'Your testimony'),
          testimony
            ? h(
                'p',
                {},
                testimony.first_position === null
                  ? 'You did not remember which image caught your attention first.'
                  : `You said the first image to catch your attention was: ${stimulus.tiles.find((t) => t.tile_id === assignment.layout[testimony.first_position!])!.alt.toLowerCase()}.`,
                testimony.strategy ? h('span', { class: 'quote' }, ` “${testimony.strategy}”`) : null,
              )
            : h('p', { class: 'muted' }, 'Not asked for this assessment.'),
        ),
        h(
          'div',
          { class: 'account' },
          h('h4', {}, 'Surveillance record (estimated)'),
          attentionGrid(stimulus, assignment, proportions, testimony?.first_position ?? null),
          proportions
            ? h('p', {}, `Share of estimates per image. Most: ${describeShares(stimulus, assignment, proportions)}.`)
            : h('p', { class: 'muted' }, `No record shown. ${check.reason}`),
        ),
        h(
          'div',
          { class: 'account' },
          h('h4', {}, 'Automated assessment (predicted)'),
          h('p', { class: 'muted' }, 'Not yet available. When it is, it will be a model’s prediction for this exact grid, computed in advance, and labelled as such.'),
        ),
      ),
    );
    section.append(block);
  }
  return section;
}
