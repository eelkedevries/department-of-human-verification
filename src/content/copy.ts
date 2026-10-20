/** Player-facing text. The Department's voice: formal, deadpan, never unkind to the player. */

import type { Family } from '../stimuli/types';
import type { Outcome, VerdictCode } from '../game/scoring';

export const DEPARTMENT = 'The Department of Human Verification';
export const TAGLINE = 'Humanity cannot be self-certified.';

export const FAMILY_LABELS: Record<Family, { category: string; subject: string }> = {
  recognition: { category: 'Visual recognition', subject: 'Visual assessment' },
  semantic: { category: 'Conceptual understanding', subject: 'Semantic interpretation' },
  odd_one_out: { category: 'Contextual judgement', subject: 'Context analysis' },
  functional: { category: 'Functional reasoning', subject: 'Category judgement' },
  absurd: { category: 'Advanced suspicion', subject: 'Threat assessment' },
};

export const STAMPS: Record<Outcome, string> = {
  correct: 'Verified',
  partial: 'Noted',
  incorrect: 'Rejected',
  timeout: 'Expired',
};

export const TIMEOUT_LINES = [
  'Time expired. Hesitation has been recorded as hesitation.',
  'The form has timed out. This is not a judgement. The judgement comes later.',
  'No answer was received in the time allowed. The Department has filed your silence.',
];

/** Used when a correct answer arrives implausibly quickly. */
export const SUSPICIOUSLY_FAST = 'Correct. An unusually confident response. Suspicious.';
export const SUSPICIOUSLY_FAST_MS = 1500;

export const VERDICTS: Record<VerdictCode, { title: string; body: string }> = {
  suspiciously_competent: {
    title: 'Suspiciously competent',
    body: 'Every assessment was passed, and quickly. Humans are rarely this efficient. Your file has been marked for admiration and mild concern.',
  },
  human: {
    title: 'Provisionally human',
    body: 'Every assessment was passed. Your human status is extended until further notice.',
  },
  reservations: {
    title: 'Provisionally human, with reservations',
    body: 'One assessment was not passed. The Department is prepared to overlook it, though not to forget it.',
  },
  review: {
    title: 'Humanity pending review',
    body: 'Your results are broadly human, in the way that a sketch of a horse is broadly a horse. A second opinion has been requested.',
  },
  insufficient: {
    title: 'Insufficiently verified',
    body: 'The evidence for your humanity is currently circumstantial. You are welcome to submit further evidence.',
  },
  ducks: {
    title: 'Referred to the Department of Ducks',
    body: 'Your case falls outside this Department’s competence and has been forwarded to colleagues better qualified in matters of ducks.',
  },
  absent: {
    title: 'No response received',
    body: 'The applicant did not answer any assessment. The Department respects your silence and has interpreted it freely.',
  },
};

export const FICTION_NOTICE =
  'This verdict is fiction. The Department of Human Verification does not exist, and this result says nothing about you.';

export const GAME_NOTICE =
  'A fictional game. Not affiliated with any government, authority or verification service.';
