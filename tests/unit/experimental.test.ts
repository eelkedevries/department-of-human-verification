import { describe, expect, it } from 'vitest';
import { createSession, TIME_LIMITS } from '../../src/app/session';
import { appealReply, borderlineDecisions, decisionLabel, personalDecisions, type Appeal, type CompletedRound } from '../../src/experimental/model';
import { caseLink, makeSharedCase, readCase, type SharedCase } from '../../src/experimental/sharing';
import type { Catalogue } from '../../src/stimuli/types';
import data from '../../src/stimuli/catalogue.json';

const catalogue = data as Catalogue;
const options = { catalogue, seed: 12345, sessionId: 'test', settings: { time_option: 'none' as const, time_limit_ms: TIME_LIMITS.none }, now: new Date('2026-11-04T12:00:00Z') };
const make = () => createSession({ ...options, mode: 'experimental' });

function completed(): CompletedRound[] {
  return make().assignments.map((a) => {
    const stimulus = catalogue.stimuli.find((s) => s.stimulus_id === a.stimulus_id)!;
    return { stimulus, result: { line: 'Test', evaluation: { correct: true, outcome: 'correct' as const, hits: a.instructed_targets.length, misses: 0, false_alarms: 0, correct_rejections: 3 }, trial: {
      trial_id: `test-${a.trial_index}`, session_id: 'test', trial_index: a.trial_index, stimulus_id: a.stimulus_id, stimulus_version: a.stimulus_version,
      onset_ms: 0, end_ms: 1000, selected_tile_ids: [...a.instructed_targets, stimulus.borderline_tile_ids![0]], selection_order: [],
      correct: true, outcome: 'correct' as const, hits: a.instructed_targets.length, misses: 0, false_alarms: 0, response_time_ms: 1000, timeout: false, interrupted: false,
    } } };
  });
}

describe('separate game modes', () => {
  it('keeps Standard as the default with the same seeded assignments', () => {
    const implicit = createSession(options);
    const explicit = createSession({ ...options, mode: 'standard' });
    expect(implicit).toEqual(explicit);
    expect(implicit.mode).toBe('standard');
    expect(implicit.assignments.every((a) => a.condition === 'v1_standard')).toBe(true);
  });

  it('makes five distinct, reproducible Experimental stages ending in houses', () => {
    const session = make();
    expect(session).toEqual(make());
    const ids = session.assignments.map((a) => a.stimulus_id);
    expect(new Set(ids).size).toBe(5);
    expect(['C07', 'C13', 'C08']).toContain(ids[0]);
    expect(['C01', 'C02', 'C09']).toContain(ids[1]);
    expect(ids[4]).toBe('C05');
    expect(session.assignments.every((a) => a.condition === 'v1_experimental')).toBe(true);
  });

  it('will not apply a shared Experimental order to Standard', () => {
    expect(() => createSession({ ...options, gridOrder: make().assignments.map((a) => a.stimulus_id) })).toThrow('Invalid shared');
  });
});

describe('version-pinned shared cases', () => {
  it('reproduces all five layouts even when the recipient has a different previous session', () => {
    const original = make();
    const shared = makeSharedCase(original);
    const url = caseLink(shared, 'https://example.org/game/?dev&seed=99#old');
    expect(new URL(url).search).toBe('');
    const parsed = readCase(new URL(url).hash, catalogue);
    expect(parsed.kind).toBe('valid');
    if (parsed.kind !== 'valid') throw new Error('Invalid fixture');
    const replayed = createSession({ ...options, mode: parsed.value.mode, seed: parsed.value.seed, gridOrder: parsed.value.grids.map((g) => g.id), avoid: original.assignments.map((a) => a.stimulus_id) });
    expect(replayed.assignments).toEqual(original.assignments);
    expect(parsed.value.answers).toBeUndefined();
  });

  it('shares a copy of original selections only when explicitly requested', () => {
    const rounds = completed();
    const shared = makeSharedCase(make(), rounds);
    expect(shared.answers).toEqual(rounds.map((r) => r.result.trial.selected_tile_ids));
    shared.answers![0].length = 0;
    expect(rounds[0].result.trial.selected_tile_ids.length).toBeGreaterThan(0);
    const parsed = readCase(new URL(caseLink(makeSharedCase(make(), rounds), 'https://example.org/game/')).hash, catalogue);
    expect(parsed.kind === 'valid' && parsed.value.answers).toEqual(rounds.map((r) => r.result.trial.selected_tile_ids));
    expect(() => makeSharedCase(createSession(options))).toThrow('Only Experimental');
    expect(() => makeSharedCase(make(), [])).toThrow('Complete');
  });

  it.each([
    { v: 2 }, { mode: 'standard' }, { seed: -1 }, { seed: 0x100000000 }, { seed: 1.5 }, { time: 'fast' }, { grids: [] }, { answers: [] },
  ])('rejects an invalid case field: %o', (change) => {
    const candidate = { ...makeSharedCase(make()), ...change } as SharedCase;
    expect(readCase(new URL(caseLink(candidate, 'https://example.org/')).hash, catalogue).kind).toBe('invalid');
  });

  it('rejects changed versions, duplicate grids and selections from another image set', () => {
    const link = (shared: SharedCase) => new URL(caseLink(shared, 'https://example.org/')).hash;
    const changed = makeSharedCase(make());
    changed.grids[0].version++;
    const versionResult = readCase(link(changed), catalogue);
    expect(versionResult.kind === 'invalid' && versionResult.message).toContain('different game version');
    const duplicate = makeSharedCase(make());
    duplicate.grids[1] = duplicate.grids[0];
    expect(readCase(link(duplicate), catalogue).kind).toBe('invalid');
    const foreign = makeSharedCase(make(), completed());
    foreign.answers![0] = ['C05-T1'];
    expect(readCase(link(foreign), catalogue).kind).toBe('invalid');
  });

  it('handles malformed and oversized fragments without throwing', () => {
    for (const hash of ['#case=', '#case=not-valid-json', '#case=%3Cscript%3E', '#case=' + 'A'.repeat(12_001)]) expect(readCase(hash, catalogue).kind).toBe('invalid');
    expect(readCase('', catalogue).kind).toBe('none');
    expect(readCase('#unrelated', catalogue).kind).toBe('none');
  });
});

describe('separate original and later judgements', () => {
  it('reports actual choices and includes the house precedent among personal decisions', () => {
    const rounds = completed();
    const decisions = borderlineDecisions(rounds);
    expect(decisions.some((d) => d.selected)).toBe(true);
    expect(decisions.some((d) => !d.selected)).toBe(true);
    expect(personalDecisions(decisions).some((d) => d.stimulus.stimulus_id === 'C05')).toBe(true);
    expect(new Set(personalDecisions(decisions).map((d) => d.round)).size).toBe(3);
    expect(decisionLabel(decisions[0])).toBe('Included');
    expect(decisionLabel({ ...decisions[0], timedOut: true, selected: false })).toBe('Unselected at expiry');
  });

  it('records a later appeal without mutating the original trial or its score', () => {
    const rounds = completed();
    const before = JSON.stringify(rounds);
    const d = borderlineDecisions(rounds)[0];
    const appeal: Appeal = { stimulus_id: d.stimulus.stimulus_id, stimulus_version: d.stimulus.version, tile_id: d.tile.tile_id, original_selected: d.selected, original_timed_out: d.timedOut, position: 'exclude', reason: 'function', t_ms: 1200 };
    expect(appealReply(appeal)).toContain('Function desk');
    expect(appealReply(appeal)).toContain('later judgement');
    expect(JSON.stringify(rounds)).toBe(before);
  });
});
