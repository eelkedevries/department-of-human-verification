import { describe, expect, it } from 'vitest';
import { evaluate, summarise, verdictFor, type RoundSummary } from '../../src/game/scoring';

const tiles = ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9'];

describe('evaluate', () => {
  it('accepts an exact match in any order', () => {
    const e = evaluate(['t3', 't1'], ['t1', 't3'], tiles, false);
    expect(e).toEqual({ outcome: 'correct', correct: true, hits: 2, misses: 0, false_alarms: 0, correct_rejections: 7 });
  });

  it('calls a multi-target answer with some hits partial', () => {
    const e = evaluate(['t1', 't5'], ['t1', 't3'], tiles, false);
    expect(e.outcome).toBe('partial');
    expect(e.correct).toBe(false);
    expect([e.hits, e.misses, e.false_alarms, e.correct_rejections]).toEqual([1, 1, 1, 6]);
  });

  it('calls a superset partial, not correct', () => {
    expect(evaluate(['t1', 't3', 't4'], ['t1', 't3'], tiles, false).outcome).toBe('partial');
  });

  it('never calls a single-target answer partial', () => {
    expect(evaluate(['t2'], ['t1'], tiles, false).outcome).toBe('incorrect');
  });

  it('marks a timeout as such, even with a correct selection, and does not pass it', () => {
    const e = evaluate(['t1'], ['t1'], tiles, true);
    expect(e.outcome).toBe('timeout');
    expect(e.correct).toBe(false);
    expect(e.hits).toBe(1);
  });

  it('scores an empty timed-out selection as all misses', () => {
    const e = evaluate([], ['t1', 't2'], tiles, true);
    expect([e.hits, e.misses, e.false_alarms, e.correct_rejections]).toEqual([0, 2, 0, 7]);
  });

  it('ignores selections outside the grid', () => {
    const e = evaluate(['t1', 'elsewhere'], ['t1'], tiles, false);
    expect(e.outcome).toBe('correct');
  });
});

function round(outcome: 'correct' | 'incorrect' | 'timeout', ms: number | null = 5000): RoundSummary {
  const evaluation = outcome === 'correct'
    ? evaluate(['t1'], ['t1'], tiles, false)
    : outcome === 'incorrect'
      ? evaluate(['t2'], ['t1'], tiles, false)
      : evaluate([], ['t1'], tiles, true);
  return { evaluation, response_time_ms: outcome === 'timeout' ? null : ms };
}

describe('summarise and verdict', () => {
  it('counts passes, timeouts, tiles and mean response time over answered rounds', () => {
    const s = summarise([round('correct', 4000), round('incorrect', 6000), round('timeout'), round('correct', 2000), round('correct', 3000)]);
    expect(s).toEqual({ rounds: 5, passed: 3, timeouts: 1, tiles_total: 45, tiles_correct: 42, mean_response_time_ms: 3750 });
  });

  it('reports no mean when nothing was answered in time', () => {
    expect(summarise([round('timeout'), round('timeout')]).mean_response_time_ms).toBeNull();
  });

  it('maps the number of passes to the fictional verdicts', () => {
    const make = (passes: number, ms = 5000) =>
      summarise(Array.from({ length: 5 }, (_, i) => round(i < passes ? 'correct' : 'incorrect', ms)));
    expect(verdictFor(make(5))).toBe('human');
    expect(verdictFor(make(5, 1000))).toBe('suspiciously_competent');
    expect(verdictFor(make(4))).toBe('reservations');
    expect(verdictFor(make(3))).toBe('review');
    expect(verdictFor(make(2))).toBe('insufficient');
    expect(verdictFor(make(1))).toBe('ducks');
    expect(verdictFor(make(0))).toBe('ducks');
    expect(verdictFor(summarise(Array.from({ length: 5 }, () => round('timeout'))))).toBe('absent');
  });
});
