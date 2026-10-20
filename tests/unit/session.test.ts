import { describe, expect, it } from 'vitest';
import { caseNumber, createSession, FAMILY_ORDER, newSessionId, TIME_LIMITS, type Settings } from '../../src/app/session';
import { buildExport, createCollector } from '../../src/analytics/collector';
import data from '../../src/stimuli/catalogue.json';
import type { Catalogue, Family, Stimulus } from '../../src/stimuli/types';

const catalogue = data as Catalogue;
const settings: Settings = { time_option: 'standard', time_limit_ms: TIME_LIMITS.standard };
const make = (seed: number, avoid: string[] = [], from: Catalogue = catalogue) =>
  createSession({ catalogue: from, seed, sessionId: 'test-session', settings, avoid, now: new Date('2026-10-20T12:00:00Z') });

/** A catalogue of placeholder grids, to test the selection rules independently of the real pool. */
function fakeCatalogue(grids: [string, Family][]): Catalogue {
  const base = catalogue.stimuli[0];
  const stimuli: Stimulus[] = grids.map(([id, family]) => ({
    ...base,
    stimulus_id: id,
    family,
    tiles: base.tiles.map((t, i) => ({ ...t, tile_id: `${id}-T${i + 1}` })),
    answer_key: [`${id}-T1`],
  }));
  return { ...catalogue, stimuli };
}

describe('session assignment', () => {
  it('is reproducible from its seed', () => {
    expect(make(123)).toEqual(make(123));
  });

  it('follows the fixed family order when every family has a grid', () => {
    const full = fakeCatalogue(FAMILY_ORDER.map((f, i) => [`F${i}`, f]));
    const session = make(5, [], full);
    expect(session.assignments.map((a) => a.family)).toEqual(FAMILY_ORDER);
    expect(session.assignments.map((a) => a.trial_index)).toEqual([0, 1, 2, 3, 4]);
  });

  it('repeats a single grid in all five rounds, each time in a new layout', () => {
    const one = fakeCatalogue([['ONLY', 'recognition']]);
    const session = make(8, [], one);
    expect(session.assignments.map((a) => a.stimulus_id)).toEqual(['ONLY', 'ONLY', 'ONLY', 'ONLY', 'ONLY']);
    expect(new Set(session.assignments.map((a) => a.layout.join())).size).toBe(5);
  });

  it('fills a family without a grid with an unused grid from another family', () => {
    const partial = fakeCatalogue([['R1', 'recognition'], ['R2', 'recognition'], ['S1', 'semantic']]);
    const ids = make(3, [], partial).assignments.map((a) => a.stimulus_id);
    expect(ids[1]).toBe('S1');
    expect(new Set(ids.slice(0, 3)).size).toBe(3);
  });

  it('lays out exactly the nine tiles of each grid and records the answer key', () => {
    for (const a of make(77).assignments) {
      const stimulus = catalogue.stimuli.find((s) => s.stimulus_id === a.stimulus_id)!;
      expect(a.layout).toHaveLength(9);
      expect(a.layout.slice().sort()).toEqual(stimulus.tiles.map((t) => t.tile_id).sort());
      expect(a.instructed_targets).toEqual(stimulus.answer_key);
      expect(a.stimulus_hash).toBe(stimulus.hash);
      expect(a.stimulus_version).toBe(stimulus.version);
    }
  });

  it('varies layouts between seeds, and grids too where a family has more than one', () => {
    const layouts = new Set<string>();
    const grids = new Set<string>();
    for (let seed = 0; seed < 50; seed++) {
      const session = make(seed);
      layouts.add(session.assignments[0].layout.join());
      grids.add(session.assignments.map((a) => a.stimulus_id).join());
    }
    expect(layouts.size).toBeGreaterThan(40);
    const choice = FAMILY_ORDER.some((f) => catalogue.stimuli.filter((s) => s.family === f).length > 1);
    expect(grids.size > 1).toBe(choice);
  });

  it('avoids the previous session’s grids where the pool allows', () => {
    const two = fakeCatalogue(FAMILY_ORDER.flatMap((f, i): [string, Family][] => [[`A${i}`, f], [`B${i}`, f]]));
    for (let seed = 0; seed < 20; seed++) {
      const first = make(seed, [], two).assignments.map((a) => a.stimulus_id);
      const second = make(seed + 100, first, two).assignments.map((a) => a.stimulus_id);
      second.forEach((id) => expect(first).not.toContain(id));
    }
  });

  it('makes distinct version 4 session identifiers', () => {
    const ids = new Set(Array.from({ length: 1000 }, newSessionId));
    expect(ids.size).toBe(1000);
    for (const id of ids) expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('formats a fictional case number from the seed and year', () => {
    expect(caseNumber(0, 2026)).toBe('DHV-1000-2026');
    expect(caseNumber(8999, 2026)).toBe('DHV-9999-2026');
    expect(make(1).case_number).toMatch(/^DHV-\d{4}-2026$/);
  });
});

describe('local event collector', () => {
  it('timestamps events relative to its origin and exports a labelled developer log', () => {
    let t = 500;
    const collector = createCollector(() => t);
    collector.log({ type: 'session_start' });
    t = 1750.25;
    collector.log({ type: 'trial_start', trial_index: 0 });
    expect(collector.events().map((e) => e.t_ms)).toEqual([0, 1250.3]);
    const session = make(3);
    const out = buildExport(session, collector, { viewport_width: 390, viewport_height: 844, device_pixel_ratio: 3, reduced_motion: false }, '1.0.0', new Date('2026-10-20T12:00:00Z'));
    expect(out.export_kind).toBe('developer_only_local_export');
    expect(out.trial_assignments).toHaveLength(5);
    expect(out.events).toHaveLength(2);
    expect(JSON.stringify(out)).not.toMatch(/userAgent|navigator/);
  });
});
