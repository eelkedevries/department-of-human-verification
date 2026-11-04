import { button } from '../components/chrome';
import { h } from '../components/dom';
import { assetUrl } from '../stimuli/catalogue';
import type { Session } from '../app/session';
import {
  APPEAL_REASONS, DEFINITIONS, appealReply, decisionLabel, personalDecisions,
  type Appeal, type AppealPosition, type AppealReason, type CompletedRound,
  type Decision, type DefinitionId, type ExperimentalRecord, type Interpretation, type ReviewChoice,
} from './model';
import { caseLink, makeSharedCase } from './sharing';

function figure(decision: Decision): HTMLElement {
  return h('figure', { class: 'case-figure' },
    h('img', { src: assetUrl(decision.tile.src), width: 256, height: 256, alt: decision.tile.alt, loading: 'lazy' }),
    h('figcaption', {}, decision.tile.alt),
  );
}

function original(decision: Decision): HTMLElement {
  return h('div', { class: 'original-decision' },
    h('p', { class: 'label' }, `Precedent · assessment ${decision.round + 1}`),
    h('p', {}, decision.stimulus.instruction),
    h('p', {}, 'Your original decision: ', h('strong', {}, decisionLabel(decision))),
  );
}

function interpretationText(record: Interpretation): string {
  const title = DEFINITIONS.find((d) => d.id === record.definition)!.title;
  const choice = record.choice === 'unresolved' ? 'left the case unresolved' : `chose to ${record.choice} it`;
  const relation = record.original_timed_out
    ? 'The original assessment expired. This later judgement is recorded separately.'
    : record.choice === 'unresolved'
      ? 'Your earlier judgement remains on file; this interpretation is unresolved.'
      : (record.choice === 'include') === record.original_selected
        ? 'You upheld your earlier classification under this working definition.'
        : 'You distinguished this case under a different definition. Your earlier judgement remains on file.';
  return `Using “${title}”, you ${choice}. ${relation}`;
}

/** The original house decision becomes a precedent under an explicitly different definition. */
export function definitionScreen(
  decisions: readonly Decision[],
  clock: () => number,
  onFile: (record: Interpretation) => void,
  onSkip: () => void,
): HTMLElement {
  const decision = decisions.find((d) => d.stimulus.stimulus_id === 'C05');
  if (!decision) return h('section', { class: 'panel' },
    h('h1', { class: 'notice-title', tabindex: -1 }, 'Supplementary review'),
    h('p', {}, 'No residence case is available for this review.'),
    h('div', { class: 'actions' }, button('Continue to appeal', onSkip, { wide: true })),
  );
  const subject = decision.tile.tile_id === 'C05-T5' ? 'the caravan on the tortoise' : 'the object in this picture';
  const question = h('p', { class: 'review-question', 'aria-live': 'polite' });
  const definitions = h('fieldset', { class: 'options review-options' },
    h('legend', { class: 'label' }, '1. Choose what “house” means'),
    ...DEFINITIONS.map((definition, index) => h('label', { class: 'option definition-option' },
      h('input', { type: 'radio', name: 'definition', value: definition.id, checked: index === 0, 'aria-label': definition.title }),
      h('span', {}, h('strong', {}, definition.title), h('span', { class: 'mode-description' }, definition.detail)),
    )),
  );
  const updateQuestion = () => {
    const chosen = DEFINITIONS.find((d) => d.id === definitions.querySelector<HTMLInputElement>('input:checked')!.value)!;
    question.textContent = `Using “${chosen.title}”, does ${subject} count as a house?`;
  };
  definitions.addEventListener('change', updateQuestion);
  updateQuestion();
  const file = (choice: ReviewChoice) => onFile({
    stimulus_id: decision.stimulus.stimulus_id,
    stimulus_version: decision.stimulus.version,
    tile_id: decision.tile.tile_id,
    original_selected: decision.selected,
    original_timed_out: decision.timedOut,
    definition: definitions.querySelector<HTMLInputElement>('input:checked')!.value as DefinitionId,
    choice,
    t_ms: clock(),
  });
  return h('section', { class: 'panel', 'aria-labelledby': 'definition-title' },
    h('p', { class: 'label' }, 'Experimental · Form HV-7'),
    h('h1', { id: 'definition-title', class: 'notice-title', tabindex: -1 }, 'Does this count as a house?'),
    h('p', { class: 'prose' }, `Choose a definition of “house” below. Then decide whether ${subject} counts as a house under that definition.`),
    h('div', { class: 'review-case' }, figure(decision), h('div', { class: 'original-decision' },
      h('p', { class: 'label' }, `Your earlier answer · assessment ${decision.round + 1}`),
      h('p', {}, decision.timedOut
        ? `When time ran out, this picture was ${decision.selected ? 'selected' : 'not selected'}.`
        : `You previously answered “${decision.selected ? 'yes' : 'no'}”: this picture ${decision.selected ? 'counted' : 'did not count'} as containing a house.`),
    )),
    definitions,
    h('h2', { class: 'section-title' }, '2. Answer using your chosen definition'),
    question,
    h('p', { class: 'fine-print' }, 'Your answer will be added to your report. Your original answer and score stay unchanged.'),
    h('div', { class: 'actions review-actions' },
      button('Yes, it counts', () => file('include')),
      button('No, it does not', () => file('exclude')),
      button('I cannot decide', () => file('unresolved'), { secondary: true }),
    ),
    h('div', { class: 'actions' }, button('Skip definition review', onSkip, { wide: true, secondary: true })),
  );
}

export function appealScreen(
  decisions: readonly Decision[],
  interpretation: Interpretation | null,
  clock: () => number,
  onFile: (record: Appeal) => void,
  onSkip: () => void,
): HTMLElement {
  const initial = Math.max(0, decisions.findIndex((d) => d.tile.tile_id === interpretation?.tile_id && d.stimulus.stimulus_id === interpretation.stimulus_id));
  let chosen = initial;
  const preview = h('div', { class: 'review-case' });
  const position = h('span', { class: 'page-counter', 'aria-live': 'polite' });
  const previousImage = button('Previous image', () => { chosen--; renderCase(); }, { secondary: true });
  const nextImage = button('Next image', () => { chosen++; renderCase(); }, { secondary: true });
  const picker = h('div', { class: 'case-picker-controls', role: 'group', 'aria-label': 'Disputed images' }, previousImage, position, nextImage);
  const positions = h('fieldset', { class: 'options review-options' },
    h('legend', { class: 'label' }, 'Your requested judgement'),
    ...([
      ['keep', 'Keep my original judgement'], ['include', 'Include it'], ['exclude', 'Exclude it'],
    ] as const).map(([value, label], index) => h('label', { class: 'option' },
      h('input', { type: 'radio', name: 'appeal-position', value, checked: index === 0 }), h('span', {}, label),
    )),
  );
  const reasons = h('fieldset', { class: 'options review-options' },
    h('legend', { class: 'label' }, 'Your reason'),
    ...APPEAL_REASONS.map((reason) => h('label', { class: 'option' },
      h('input', { type: 'radio', name: 'appeal-reason', value: reason.id }), h('span', {}, reason.title),
    )),
  );
  const error = h('p', { class: 'form-error', role: 'alert' });
  const renderCase = () => {
    const d = decisions[chosen];
    preview.replaceChildren(figure(d), original(d));
    position.textContent = `Image ${chosen + 1} of ${decisions.length}`;
    previousImage.disabled = chosen === 0;
    nextImage.disabled = chosen === decisions.length - 1;
  };
  if (decisions.length) renderCase();
  const submit = button('File appeal', () => {
    const d = decisions[chosen];
    const reason = reasons.querySelector<HTMLInputElement>('input:checked');
    if (!reason) { error.textContent = 'Choose a reason for your appeal.'; reasons.querySelector<HTMLInputElement>('input')?.focus(); return; }
    onFile({
      stimulus_id: d.stimulus.stimulus_id,
      stimulus_version: d.stimulus.version,
      tile_id: d.tile.tile_id,
      original_selected: d.selected,
      original_timed_out: d.timedOut,
      position: positions.querySelector<HTMLInputElement>('input:checked')!.value as AppealPosition,
      reason: reason.value as AppealReason,
      t_ms: clock(),
    });
  }, { wide: true });
  return h('section', { class: 'panel', 'aria-labelledby': 'appeal-title' },
    h('p', { class: 'label' }, 'Experimental · Form HV-8'),
    h('h1', { class: 'notice-title', id: 'appeal-title', tabindex: -1 }, 'Optional appeal'),
    interpretation ? h('div', { class: 'case-notice' }, h('p', { class: 'label' }, 'Precedent reviewed'), h('p', {}, interpretationText(interpretation))) : null,
    h('p', {}, 'You may defend or reconsider one disputed classification. The Department will attach your reason to the final record.'),
    decisions.length ? h('div', {},
      h('h2', { class: 'section-title' }, 'Choose a disputed image'),
      h('p', { class: 'fine-print' }, 'Use Previous image and Next image to choose the classification you want to appeal.'), picker, preview, positions, reasons, error,
      h('div', { class: 'actions' }, submit),
    ) : h('p', {}, 'There are no disputed classifications to appeal.'),
    h('div', { class: 'actions' }, button('Continue without appeal', onSkip, { wide: true, secondary: true })),
  );
}

function shareSection(session: Session, rounds: readonly CompletedRound[]): HTMLElement {
  const output = h('textarea', { class: 'share-output', readonly: true, rows: 3, 'aria-label': 'Link to copy', hidden: true });
  const status = h('p', { class: 'fine-print', role: 'status' });
  const copy = async (comparison: boolean) => {
    const link = caseLink(makeSharedCase(session, comparison ? rounds : undefined), location.href);
    output.value = link;
    output.hidden = false;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Copy manually');
      await navigator.clipboard.writeText(link);
      status.textContent = comparison ? 'Comparison link copied. It contains your original assessment selections.' : 'Case link copied. It contains no answers.';
    } catch {
      status.textContent = 'Your link is ready below. Select and copy it to share.';
      output.focus();
      output.select();
    }
  };
  return h('section', { class: 'report-section', 'aria-labelledby': 'share-title' },
    h('h2', { id: 'share-title', class: 'section-title' }, 'Give this case to a friend'),
    h('p', {}, 'A case link opens the same five assessments and tile layouts. A comparison link also reveals your selections after the other player completes the assessments.'),
    h('div', { class: 'actions' },
      button('Copy case link', () => void copy(false), { secondary: true }),
      button('Copy comparison link', () => void copy(true), { secondary: true }),
    ),
    h('p', { class: 'fine-print' }, 'Comparison links contain your original tile selections. Anyone with the link can read them. Copying a link does not send it to anyone.'),
    output, status,
  );
}

function comparisonSection(rounds: readonly CompletedRound[], answers: readonly string[][]): HTMLElement {
  let same = 0;
  let total = 0;
  const differences: { decision: Decision; other: boolean }[] = [];
  for (const [round, { stimulus, result }] of rounds.entries()) {
    const ours = new Set(result.trial.selected_tile_ids);
    const theirs = new Set(answers[round]);
    for (const tile of stimulus.tiles) {
      total++;
      if (ours.has(tile.tile_id) === theirs.has(tile.tile_id)) same++;
      else differences.push({ decision: { round, stimulus, tile, selected: ours.has(tile.tile_id), timedOut: result.trial.timeout }, other: theirs.has(tile.tile_id) });
    }
  }
  const selected = differences.slice().sort((a, b) => Number((b.decision.stimulus.borderline_tile_ids ?? []).includes(b.decision.tile.tile_id)) - Number((a.decision.stimulus.borderline_tile_ids ?? []).includes(a.decision.tile.tile_id))).slice(0, 4);
  return h('section', { class: 'report-section comparison', 'aria-labelledby': 'comparison-title' },
    h('h2', { id: 'comparison-title', class: 'section-title' }, 'Independent selection comparison'),
    h('p', {}, `Your original selections agreed on ${same} of ${total} images. There were ${total - same} differences.`),
    h('p', { class: 'fine-print' }, 'Agreement is not an answer key. Later reviews and appeals are not included in this comparison.'),
    selected.length ? h('div', { class: 'decision-cards' }, ...selected.map(({ decision, other }) => h('article', { class: 'decision-card' },
      figure(decision), h('p', {}, `You: ${decisionLabel(decision)}. Shared selection: ${other ? 'included' : 'unselected'}.`),
    ))) : h('p', {}, 'No differences to refer to the Department. This is unusually efficient.'),
    differences.length > 4 ? h('p', { class: 'fine-print' }, 'Four differences are shown, with disputed cases first.') : null,
  );
}

export function experimentalReport(
  session: Session,
  rounds: readonly CompletedRound[],
  decisions: readonly Decision[],
  record: ExperimentalRecord,
  reference: readonly string[][] | null,
): HTMLElement {
  const findDecision = (stimulusId: string, tileId: string) => decisions.find((d) => d.stimulus.stimulus_id === stimulusId && d.tile.tile_id === tileId);
  const interpretation = record.interpretation;
  const appeal = record.appeal;
  const supplement = h('div', { class: 'experimental-report' },
    h('section', { class: 'report-section', 'aria-labelledby': 'personal-title' },
      h('h2', { id: 'personal-title', class: 'section-title' }, 'Your decisions on file'),
      h('p', {}, 'These are your judgements about disputed images. They are separate from the clear-cut accuracy count.'),
      h('div', { class: 'decision-cards' }, ...personalDecisions(decisions).map((d) => h('article', { class: 'decision-card' },
        h('p', { class: 'label' }, `Assessment ${d.round + 1} · ${decisionLabel(d)}`), figure(d), h('p', {}, d.stimulus.instruction),
      ))),
    ),
    h('section', { class: 'report-section', 'aria-labelledby': 'interpretation-title' },
      h('h2', { id: 'interpretation-title', class: 'section-title' }, 'Definition review and precedent'),
      interpretation ? h('div', {},
        h('p', {}, findDecision(interpretation.stimulus_id, interpretation.tile_id)?.tile.alt ?? 'Residence case'),
        h('p', {}, interpretationText(interpretation)),
      ) : h('p', {}, 'No supplementary definition review was filed.'),
    ),
    h('section', { class: 'report-section appeal-record', 'aria-labelledby': 'appeal-record-title' },
      h('h2', { id: 'appeal-record-title', class: 'section-title' }, 'Appeal record'),
      appeal ? h('div', {},
        h('p', {}, findDecision(appeal.stimulus_id, appeal.tile_id)?.tile.alt ?? 'Disputed classification'),
        h('p', {}, `Original decision: ${appeal.original_timed_out ? (appeal.original_selected ? 'selected at expiry' : 'unselected at expiry') : appeal.original_selected ? 'included' : 'excluded'}. Requested judgement: ${appeal.position === 'keep' ? 'keep the original judgement' : appeal.position}.`),
        h('p', {}, `Reason: ${APPEAL_REASONS.find((r) => r.id === appeal.reason)!.title}.`),
        h('p', { class: 'department-reply' }, appealReply(appeal)),
      ) : h('p', {}, 'No appeal was filed. Your original judgements remain on file.'),
    ),
    reference ? comparisonSection(rounds, reference) : null,
    shareSection(session, rounds),
  );
  return supplement;
}
