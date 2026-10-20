/** Per-trial gaze records and the rule for when a personal record may be shown. */

import { tileAttention, type TileAttention } from '../research/attention';
import type { CoordinateFrame, GazeSample } from '../research/types';

export interface TrialGaze {
  trial_index: number;
  trial_id: string;
  onset_ms: number;
  duration_ms: number;
  frame: CoordinateFrame;
  samples: GazeSample[];
  /** Reasons the trial's estimates cannot be trusted; empty when none. */
  flags: string[];
  attention?: TileAttention;
}

/** Fewer in-grid estimates than this per second of viewing is too thin to show. */
export const MIN_USABLE_RATE_HZ = 5;

export function attentionFor(trial: TrialGaze): TileAttention {
  return tileAttention(trial.samples, trial.frame, 12);
}

/** Whether a trial's record may be shown to the participant, and if not, why not. */
export function displayable(trial: TrialGaze, calibrationPassed: boolean): { ok: boolean; reason: string | null } {
  if (!calibrationPassed) return { ok: false, reason: 'The calibration check did not pass.' };
  if (trial.flags.length) return { ok: false, reason: `Not reliable: ${trial.flags.join('; ')}.` };
  const attention = trial.attention ?? attentionFor(trial);
  const inGrid = attention.valid_samples - attention.outside;
  const seconds = trial.duration_ms / 1000;
  if (seconds <= 0 || inGrid / seconds < MIN_USABLE_RATE_HZ) return { ok: false, reason: 'Too few estimates landed on the grid.' };
  return { ok: true, reason: null };
}
