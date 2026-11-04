/** Experimental decisions remain separate from the five scored assessments. */

import type { RoundResult } from '../game/round';
import { createRng, deriveSeed, pick } from '../game/rng';
import type { Catalogue, Stimulus, StimulusTile } from '../stimuli/types';

export const STAGES = [
  { title: 'First impressions', pool: ['C07', 'C13', 'C08'] },
  { title: 'Unreasonable objects', pool: ['C01', 'C02', 'C09'] },
  { title: 'Appearances on file', pool: ['C03', 'C10'] },
  { title: 'Function and form', pool: ['C04', 'C11', 'C12'] },
  { title: 'A matter of residence', pool: ['C05'] },
] as const;

export function experimentalOrder(catalogue: Catalogue, seed: number, avoid: readonly string[] = []): Stimulus[] {
  const rng = createRng(deriveSeed(seed, 'experimental-stages'));
  const used: string[] = [];
  return STAGES.map((stage) => {
    const own = catalogue.stimuli.filter((s) => stage.pool.some((id) => id === s.stimulus_id));
    const pool = own.length ? own : catalogue.stimuli;
    const candidates = [
      pool.filter((s) => !used.includes(s.stimulus_id) && !avoid.includes(s.stimulus_id)),
      pool.filter((s) => !used.includes(s.stimulus_id)),
      catalogue.stimuli.filter((s) => !used.includes(s.stimulus_id)),
      pool,
    ].find((items) => items.length)!;
    const chosen = pick(candidates, rng);
    used.push(chosen.stimulus_id);
    return chosen;
  });
}

export type CompletedRound = { stimulus: Stimulus; result: RoundResult };

export interface Decision {
  round: number;
  stimulus: Stimulus;
  tile: StimulusTile;
  selected: boolean;
  timedOut: boolean;
}

export function borderlineDecisions(rounds: readonly CompletedRound[]): Decision[] {
  return rounds.flatMap(({ stimulus, result }, round) => (stimulus.borderline_tile_ids ?? []).flatMap((id) => {
    const tile = stimulus.tiles.find((t) => t.tile_id === id);
    return tile ? [{ round, stimulus, tile, selected: result.trial.selected_tile_ids.includes(id), timedOut: result.trial.timeout }] : [];
  }));
}

export function decisionLabel(decision: Decision): string {
  if (decision.timedOut) return decision.selected ? 'Selected at expiry' : 'Unselected at expiry';
  return decision.selected ? 'Included' : 'Excluded';
}

export function personalDecisions(decisions: readonly Decision[]): Decision[] {
  const house = decisions.find((d) => d.stimulus.stimulus_id === 'C05');
  const other = decisions.filter((d) => d.stimulus.stimulus_id !== 'C05');
  const chosen: Decision[] = house ? [house] : [];
  for (const d of other) {
    if (chosen.length >= 3) break;
    if (!chosen.some((item) => item.round === d.round)) chosen.push(d);
  }
  return chosen.sort((a, b) => a.round - b.round);
}

export function callbackNote(rounds: readonly CompletedRound[]): string | undefined {
  const earlier = borderlineDecisions(rounds).find((d) => !d.timedOut);
  if (!earlier) return undefined;
  return `Earlier, you ${earlier.selected ? 'included' : 'excluded'} this image: ${earlier.tile.alt}. The Department has kept that judgement on file.`;
}

export const DEFINITIONS = [
  { id: 'human-dwelling', title: 'A human dwelling', detail: 'A structure used as a place for people to live.' },
  { id: 'home', title: 'A home for any inhabitant', detail: 'A place used as a home by a person or an animal.' },
  { id: 'form', title: 'The form of a house', detail: 'An object with the recognisable built form of a house, regardless of its use or size.' },
] as const;
export type DefinitionId = typeof DEFINITIONS[number]['id'];
export type ReviewChoice = 'include' | 'exclude' | 'unresolved';

export interface Interpretation {
  stimulus_id: string;
  stimulus_version: number;
  tile_id: string;
  original_selected: boolean;
  original_timed_out: boolean;
  definition: DefinitionId;
  choice: ReviewChoice;
  t_ms: number;
}

export const APPEAL_REASONS = [
  { id: 'appearance', title: 'Its appearance', response: 'Your argument about appearance has been attached to the image.' },
  { id: 'function', title: 'What it is used for', response: 'Your argument about use has been referred to the Function desk.' },
  { id: 'representation', title: 'It represents the object', response: 'The distinction between an object and its representation has been entered into the record.' },
  { id: 'boundary', title: 'The category boundary is unclear', response: 'The disputed boundary remains open. No universal definition has been issued.' },
] as const;
export type AppealReason = typeof APPEAL_REASONS[number]['id'];
export type AppealPosition = 'keep' | 'include' | 'exclude';

export interface Appeal {
  stimulus_id: string;
  stimulus_version: number;
  tile_id: string;
  original_selected: boolean;
  original_timed_out: boolean;
  position: AppealPosition;
  reason: AppealReason;
  t_ms: number;
}

export interface ExperimentalRecord {
  interpretation: Interpretation | null;
  appeal: Appeal | null;
}

export function appealReply(appeal: Appeal): string {
  const reason = APPEAL_REASONS.find((r) => r.id === appeal.reason)!;
  const decision = appeal.position === 'keep'
    ? 'Your original judgement is upheld in this appeal.'
    : `Your requested ${appeal.position === 'include' ? 'inclusion' : 'exclusion'} is recorded as a later judgement.`;
  return `${reason.response} ${decision} The original assessment and its score remain on file.`;
}
