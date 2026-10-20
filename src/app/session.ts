/** Builds a session: which grid each round uses and how its tiles are laid out. */

import { createRng, deriveSeed, pick, shuffle } from '../game/rng';
import type { Catalogue, Family, SelectionMode, Stimulus } from '../stimuli/types';

export type TimeOption = 'standard' | 'extended' | 'none';

export const TIME_LIMITS: Record<TimeOption, number | null> = {
  standard: 15_000,
  extended: 30_000,
  none: null,
};

export interface Settings {
  time_option: TimeOption;
  time_limit_ms: number | null;
}

export interface TrialAssignment {
  session_id: string;
  trial_index: number;
  /** V1 has a single condition; V2 adds instruction-phrasing conditions. */
  condition: 'v1_standard';
  stimulus_id: string;
  stimulus_version: number;
  stimulus_hash: string;
  family: Family;
  mode: SelectionMode;
  instruction: string;
  /** Tile IDs in display order: index 0 is the top-left cell, reading row by row. */
  layout: string[];
  instructed_targets: string[];
}

export interface Session {
  session_id: string;
  seed: number;
  case_number: string;
  created_at: string;
  settings: Settings;
  assignments: TrialAssignment[];
}

export const FAMILY_ORDER: Family[] = ['recognition', 'semantic', 'odd_one_out', 'functional', 'absurd'];

export interface SessionOptions {
  catalogue: Catalogue;
  seed: number;
  sessionId: string;
  settings: Settings;
  /** Stimuli shown in the previous session; avoided where the pool allows. */
  avoid?: readonly string[];
  now?: Date;
}

/**
 * A random version 4 UUID. crypto.randomUUID would be shorter, but it exists only
 * on secure (HTTPS or localhost) pages and in recent browsers; without it the game
 * could not start a session.
 */
export function newSessionId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function caseNumber(seed: number, year: number): string {
  return `DHV-${String(1000 + (seed % 9000)).padStart(4, '0')}-${year}`;
}

/**
 * Round i uses a grid of the i-th family. A family without a grid of its own
 * borrows from the whole pool, so the game stays playable while the pool is
 * small (at launch, one grid shown in all five rounds). Grids already used in
 * this session, then those of the previous session, are avoided where the pool allows.
 */
export function createSession({ catalogue, seed, sessionId, settings, avoid = [], now = new Date() }: SessionOptions): Session {
  if (catalogue.stimuli.length === 0) throw new Error('The catalogue has no grids.');
  const choose = createRng(deriveSeed(seed, 'grids'));
  const used: string[] = [];
  const assignments = FAMILY_ORDER.map((family, index): TrialAssignment => {
    const own = catalogue.stimuli.filter((s) => s.family === family);
    const pool = own.length ? own : catalogue.stimuli;
    const preferred = [
      pool.filter((s) => !used.includes(s.stimulus_id) && !avoid.includes(s.stimulus_id)),
      pool.filter((s) => !used.includes(s.stimulus_id)),
      pool,
    ].find((candidates) => candidates.length > 0)!;
    const stimulus: Stimulus = pick(preferred, choose);
    used.push(stimulus.stimulus_id);
    // The round index is part of the seed, so a grid shown twice is laid out differently each time.
    const layout = shuffle(
      stimulus.tiles.map((t) => t.tile_id),
      createRng(deriveSeed(seed, `layout:${index}:${stimulus.stimulus_id}`)),
    );
    return {
      session_id: sessionId,
      trial_index: index,
      condition: 'v1_standard',
      stimulus_id: stimulus.stimulus_id,
      stimulus_version: stimulus.version,
      stimulus_hash: stimulus.hash,
      family: stimulus.family,
      mode: stimulus.mode,
      instruction: stimulus.instruction,
      layout,
      instructed_targets: stimulus.answer_key.slice(),
    };
  });
  return {
    session_id: sessionId,
    seed,
    case_number: caseNumber(seed, now.getFullYear()),
    created_at: now.toISOString(),
    settings,
    assignments,
  };
}
