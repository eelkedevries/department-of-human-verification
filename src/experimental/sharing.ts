/** Shared cases live in the URL fragment. Copying is explicit; nothing is submitted. */

import type { Session, TimeOption } from '../app/session';
import type { Catalogue } from '../stimuli/types';
import type { CompletedRound } from './model';

export interface SharedCase {
  v: 1;
  mode: 'experimental';
  seed: number;
  time: TimeOption;
  grids: { id: string; version: number; hash: string }[];
  /** Present only when the sender explicitly chooses a comparison link. */
  answers?: string[][];
}

export type CaseRead = { kind: 'none' } | { kind: 'valid'; value: SharedCase } | { kind: 'invalid'; message: string };

export function makeSharedCase(session: Session, rounds?: readonly CompletedRound[]): SharedCase {
  if (session.mode !== 'experimental') throw new Error('Only Experimental cases can be shared.');
  if (rounds && rounds.length !== session.assignments.length) throw new Error('Complete the assessments before sharing a comparison.');
  return {
    v: 1,
    mode: 'experimental',
    seed: session.seed,
    time: session.settings.time_option,
    grids: session.assignments.map((a) => ({ id: a.stimulus_id, version: a.stimulus_version, hash: a.stimulus_hash })),
    ...(rounds ? { answers: rounds.map(({ result }) => result.trial.selected_tile_ids.slice()) } : {}),
  };
}

export function caseLink(shared: SharedCase, base: string): string {
  const url = new URL(base);
  url.search = '';
  const encoded = btoa(JSON.stringify(shared)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  url.hash = `case=${encoded}`;
  return url.href;
}

export function readCase(hash: string, catalogue: Catalogue): CaseRead {
  if (!hash || !new URLSearchParams(hash.replace(/^#/, '')).has('case')) return { kind: 'none' };
  const invalid = (message = 'This shared case could not be read. You can start a new case instead.'): CaseRead => ({ kind: 'invalid', message });
  if (hash.length > 12_000) return invalid();
  const encoded = new URLSearchParams(hash.replace(/^#/, '')).get('case')!;
  if (!/^[A-Za-z0-9_-]+$/.test(encoded)) return invalid();
  let value: unknown;
  try {
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    value = JSON.parse(atob(base64 + '='.repeat((4 - base64.length % 4) % 4)));
  } catch { return invalid(); }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return invalid();
  const input = value as Record<string, unknown>;
  if (input.v !== 1 || input.mode !== 'experimental' || !Number.isInteger(input.seed) || (input.seed as number) < 0 || (input.seed as number) > 0xffffffff) return invalid();
  if (input.time !== 'standard' && input.time !== 'extended' && input.time !== 'none') return invalid();
  if (!Array.isArray(input.grids) || input.grids.length !== 5) return invalid();
  const grids: SharedCase['grids'] = [];
  for (const item of input.grids) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return invalid();
    const g = item as Record<string, unknown>;
    if (typeof g.id !== 'string' || !Number.isInteger(g.version) || typeof g.hash !== 'string' || grids.some((old) => old.id === g.id)) return invalid();
    const actual = catalogue.stimuli.find((s) => s.stimulus_id === g.id);
    if (!actual || actual.version !== g.version || actual.hash !== g.hash) return invalid('This case uses images from a different game version and cannot be reproduced here. You can start a new case instead.');
    grids.push({ id: actual.stimulus_id, version: actual.version, hash: actual.hash });
  }
  // This mode ends with a reviewed residence case, which its definition review cites.
  if (grids[4].id !== 'C05') return invalid();
  let answers: string[][] | undefined;
  if (input.answers !== undefined) {
    if (!Array.isArray(input.answers) || input.answers.length !== grids.length) return invalid();
    answers = [];
    for (let i = 0; i < grids.length; i++) {
      const selected: unknown = input.answers[i];
      const stimulus = catalogue.stimuli.find((s) => s.stimulus_id === grids[i].id)!;
      if (!Array.isArray(selected) || selected.length > 9 || selected.some((id) => typeof id !== 'string' || !stimulus.tiles.some((t) => t.tile_id === id)) || new Set(selected).size !== selected.length) return invalid();
      answers.push((selected as string[]).slice());
    }
  }
  // Reconstruct only known fields; never retain arbitrary link content.
  return { kind: 'valid', value: { v: 1, mode: 'experimental', seed: input.seed as number, time: input.time, grids, ...(answers ? { answers } : {}) } };
}
