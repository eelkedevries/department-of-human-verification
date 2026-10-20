/** The notice, briefing and report screens. */

import type { SessionSummary, VerdictCode } from '../game/scoring';
import type { RoundResult } from '../game/round';
import { button, ICON_CHECKBOX, stamp } from '../components/chrome';
import { h } from '../components/dom';
import { FAMILY_LABELS, FICTION_NOTICE, STAMPS, VERDICTS } from '../content/copy';
import type { Stimulus } from '../stimuli/types';
import { TIME_LIMITS, type TimeOption } from './session';

/** Builds made with VITE_EYE_TRACKING=1 offer the optional eye-tracking preview, and say so. */
const EYE_TRACKING_BUILD = import.meta.env.VITE_EYE_TRACKING === '1';

export function noticeScreen(caseNumber: string, onBegin: () => void): HTMLElement {
  return h(
    'section',
    { class: 'panel', 'aria-labelledby': 'notice-title' },
    h('div', { class: 'reference' }, h('p', { class: 'label' }, 'Form HV-1'), h('p', { class: 'label' }, `Ref. ${caseNumber}`)),
    h('h1', { class: 'notice-title', id: 'notice-title', tabindex: -1 }, 'Notice of mandatory human verification'),
    h(
      'div',
      { class: 'prose' },
      h('p', { class: 'notice-lede' }, 'You have been provisionally classified as human.'),
      h('p', { class: 'notice-stamp', 'aria-hidden': 'true' }, stamp('Provisional', 'incorrect', false)),
      h('p', {}, 'Recent developments in artificial intelligence have raised some concerns.'),
      h('p', {}, 'To maintain your human status, you must complete five routine visual assessments.'),
    ),
    h('div', { class: 'actions' }, button('Begin assessment', onBegin, { wide: true })),
  );
}

export function briefingScreen(current: TimeOption, onProceed: (option: TimeOption) => void): HTMLElement {
  const describe = (option: TimeOption) => {
    const ms = TIME_LIMITS[option];
    return ms === null ? 'take as long as you need' : `${ms / 1000} seconds per assessment`;
  };
  const options: [TimeOption, string][] = [
    ['standard', 'Standard'],
    ['extended', 'Extended'],
    ['none', 'No time limit'],
  ];
  const fieldset = h(
    'fieldset',
    { class: 'options' },
    h('legend', { class: 'label' }, 'Time limit'),
    ...options.map(([value, label]) =>
      h(
        'label',
        { class: 'option' },
        h('input', { type: 'radio', name: 'time', value, checked: value === current }),
        h('span', {}, label, ' ', h('span', { class: 'option-detail' }, `(${describe(value)})`)),
      ),
    ),
  );
  const chosen = (): TimeOption => (fieldset.querySelector<HTMLInputElement>('input:checked')?.value as TimeOption) ?? 'standard';
  return h(
    'section',
    { class: 'panel', 'aria-labelledby': 'briefing-title' },
    h('p', { class: 'label' }, 'Briefing note'),
    h('h1', { class: 'notice-title', id: 'briefing-title', tabindex: -1 }, 'How the assessments work'),
    h(
      'div',
      { class: 'prose' },
      h('p', {}, 'Each assessment shows nine images and one written instruction.'),
      h(
        'ol',
        {},
        h('li', {}, 'Read the instruction.'),
        h('li', {}, 'Select every image that satisfies it. Select an image again to withdraw it.'),
        h('li', {}, 'Press ', h('strong', {}, 'Submit selection'), ' before the time limit expires.'),
      ),
      h('p', {}, 'The Department appreciates promptness but does not insist on it. Choose a longer limit if you prefer.'),
      h('p', { class: 'fine-print' }, 'Keyboard: arrow keys move between images, Space selects, and the keys 1 to 9 select an image directly.'),
    ),
    fieldset,
    h('hr', { class: 'rule' }),
    h(
      'p',
      { class: 'fine-print' },
      EYE_TRACKING_BUILD
        ? 'This is a game. The Department is fictional, as are its verdicts. Nothing you do here is sent anywhere.'
        : 'This is a game. The Department is fictional, as are its verdicts. No camera is used, and nothing you do here is sent anywhere.',
    ),
    h('div', { class: 'actions' }, button('Proceed to assessment 1', () => onProceed(chosen()), { wide: true, icon: ICON_CHECKBOX })),
  );
}

export interface ReportInput {
  caseNumber: string;
  issued: Date;
  summary: SessionSummary;
  verdict: VerdictCode;
  rounds: { stimulus: Stimulus; result: RoundResult }[];
  reducedMotion: boolean;
  onReplay: () => void;
  devExport?: () => void;
}

function seconds(ms: number | null): string {
  return ms === null ? 'None' : `${(ms / 1000).toFixed(1)} s`;
}

export function reportScreen(input: ReportInput): HTMLElement {
  const { summary } = input;
  const verdict = VERDICTS[input.verdict];
  const verdictKind = input.verdict === 'human' || input.verdict === 'suspiciously_competent' ? 'correct' : input.verdict === 'reservations' || input.verdict === 'review' ? 'partial' : 'incorrect';
  const dateText = input.issued.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const decisions = h('ol', { class: 'decisions' });
  for (const [index, { stimulus, result }] of input.rounds.entries()) {
    const outcome = result.evaluation.outcome;
    decisions.append(
      h(
        'li',
        { class: 'decision' },
        h(
          'div',
          {},
          h('p', { class: 'decision-title' }, `${index + 1}. ${FAMILY_LABELS[stimulus.family].category}`),
          h('p', { class: 'decision-meta' }, stimulus.instruction, ' · ', outcome === 'timeout' ? 'no response in time' : seconds(result.trial.response_time_ms)),
        ),
        stamp(STAMPS[outcome], outcome, false),
        h('p', { class: 'decision-explanation' }, stimulus.explanation),
      ),
    );
  }

  const fact = (term: string, value: string) => h('div', { class: 'fact' }, h('dt', {}, term), h('dd', {}, value));

  return h(
    'section',
    { class: 'panel', 'aria-labelledby': 'report-title' },
    h(
      'div',
      { class: 'report-head' },
      h('div', {}, h('p', { class: 'label' }, 'Form HV-9'), h('h1', { class: 'notice-title', id: 'report-title', tabindex: -1 }, 'Human Verification Report')),
      h('p', { class: 'case-ref' }, `Case no. ${input.caseNumber}`, h('br'), `Issued ${dateText}`),
    ),
    h(
      'dl',
      { class: 'facts' },
      fact('Assessments passed', `${summary.passed} of ${summary.rounds}`),
      fact('Images classified correctly', `${summary.tiles_correct} of ${summary.tiles_total}`),
      fact('Average response', seconds(summary.mean_response_time_ms)),
      fact('Timeouts', String(summary.timeouts)),
    ),
    h(
      'div',
      { class: 'verdict' },
      h('p', { class: 'label' }, 'Departmental verdict'),
      h('p', {}, stamp(verdict.title, verdictKind, !input.reducedMotion)),
      h('p', { class: 'verdict-body' }, verdict.body),
      h('p', { class: 'fine-print' }, FICTION_NOTICE),
    ),
    h('h2', { class: 'label' }, 'Decisions on file'),
    decisions,
    h('div', { class: 'actions' }, button('Request re-assessment', input.onReplay, { wide: true })),
    input.devExport
      ? h(
          'div',
          { class: 'dev-tools' },
          h('h3', {}, 'Developer tools'),
          h('p', {}, 'For testing only. Downloads this session’s behavioural log as JSON. The file is created in your browser and nothing is sent anywhere.'),
          button('Export session log (JSON)', input.devExport, { secondary: true }),
        )
      : null,
  );
}

export function aboutDialog(): HTMLDialogElement {
  const close = h('button', { type: 'button', class: 'button secondary', onclick: () => dialog.close() }, 'Close');
  const dialog = h(
    'dialog',
    { class: 'about', 'aria-labelledby': 'about-title' },
    h(
      'div',
      { class: 'about-body' },
      h('h2', { id: 'about-title' }, 'About this game'),
      h(
        'p',
        {},
        'The Department of Human Verification is a fictional game inspired by research on visual search and attention. It borrows the form of an image CAPTCHA and takes it far too seriously. It is not a real verification service, its verdicts are jokes, and it is not affiliated with any government or company.',
      ),
      h('h3', {}, 'What this version does not do'),
      h(
        'ul',
        {},
        EYE_TRACKING_BUILD
          ? h('li', {}, 'It never turns on your camera unless you choose eye-tracking and agree to it. The camera picture is processed in your browser and never saved or sent.')
          : h('li', {}, 'It contains no eye-tracking and never asks for your camera.'),
        h('li', {}, 'It sends nothing to a server and stores nothing on your device. Your answers exist only in this tab and disappear when you close it.'),
        h('li', {}, 'It uses no cookies, analytics or third-party services.'),
      ),
      EYE_TRACKING_BUILD
        ? h('p', {}, 'Eye-tracking is a research preview using WebGazer (Brown University, GPL-3.0). It is optional; the game is the same without it.')
        : h('p', {}, 'A later version may offer optional, clearly explained eye-tracking for research. It will ask first, and the game will always remain playable without it.'),
      h('h3', {}, 'The images'),
      h(
        'p',
        {},
        'Every image was generated for this game with FLUX.2 [klein] 4B, an openly licensed model (Apache 2.0), from a written description and a fixed seed. The answer keys were set when the descriptions were written and checked by eye afterwards. The prompts, seeds and licences are listed in the project’s stimulus catalogue.',
      ),
      h('h3', {}, 'Source'),
      h(
        'p',
        {},
        'Made by ',
        h('a', { href: 'https://eelkedevries.com/' }, 'Eelke de Vries'),
        '. The source code is on ',
        h('a', { href: 'https://github.com/eelkedevries/department-of-human-verification' }, 'GitHub'),
        '. Version 1: the game, without eye-tracking.',
      ),
      h('div', { class: 'actions' }, close),
    ),
  );
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  return dialog;
}
