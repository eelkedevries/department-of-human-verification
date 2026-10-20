/** Answer evaluation, session scoring and the (fictional) verdict. */

export type Outcome = 'correct' | 'partial' | 'incorrect' | 'timeout';

export interface Evaluation {
  outcome: Outcome;
  /** True only when the selected set equals the answer key exactly. */
  correct: boolean;
  hits: number;
  misses: number;
  false_alarms: number;
  correct_rejections: number;
}

/**
 * A timed-out round is scored on whatever was selected when time ran out, but its
 * outcome is always `timeout` and it never counts as passed.
 */
export function evaluate(selected: readonly string[], answerKey: readonly string[], allTiles: readonly string[], timedOut: boolean): Evaluation {
  const chosen = new Set(selected);
  const key = new Set(answerKey);
  let hits = 0;
  let falseAlarms = 0;
  for (const tile of allTiles) {
    if (chosen.has(tile) && key.has(tile)) hits++;
    else if (chosen.has(tile)) falseAlarms++;
  }
  const misses = key.size - hits;
  const correctRejections = allTiles.length - key.size - falseAlarms;
  const exact = hits === key.size && falseAlarms === 0;
  let outcome: Outcome;
  if (timedOut) outcome = 'timeout';
  else if (exact) outcome = 'correct';
  else if (hits > 0 && key.size > 1) outcome = 'partial';
  else outcome = 'incorrect';
  return { outcome, correct: exact && !timedOut, hits, misses, false_alarms: falseAlarms, correct_rejections: correctRejections };
}

export interface RoundSummary {
  evaluation: Evaluation;
  response_time_ms: number | null;
}

export interface SessionSummary {
  rounds: number;
  passed: number;
  timeouts: number;
  tiles_total: number;
  tiles_correct: number;
  /** Mean response time over rounds answered before the limit; null when none were. */
  mean_response_time_ms: number | null;
}

export function summarise(rounds: readonly RoundSummary[]): SessionSummary {
  const answered = rounds.filter((r) => r.evaluation.outcome !== 'timeout' && r.response_time_ms !== null);
  const tilesCorrect = rounds.reduce((n, r) => n + r.evaluation.hits + r.evaluation.correct_rejections, 0);
  const tilesTotal = rounds.reduce(
    (n, r) => n + r.evaluation.hits + r.evaluation.misses + r.evaluation.false_alarms + r.evaluation.correct_rejections,
    0,
  );
  return {
    rounds: rounds.length,
    passed: rounds.filter((r) => r.evaluation.correct).length,
    timeouts: rounds.filter((r) => r.evaluation.outcome === 'timeout').length,
    tiles_total: tilesTotal,
    tiles_correct: tilesCorrect,
    mean_response_time_ms: answered.length ? answered.reduce((n, r) => n + (r.response_time_ms ?? 0), 0) / answered.length : null,
  };
}

export type VerdictCode = 'suspiciously_competent' | 'human' | 'reservations' | 'review' | 'insufficient' | 'ducks' | 'absent';

/** Comic fiction, not a classification: the thresholds are arbitrary and say so in the report. */
export function verdictFor(summary: SessionSummary): VerdictCode {
  if (summary.rounds > 0 && summary.timeouts === summary.rounds) return 'absent';
  const all = summary.passed === summary.rounds;
  if (all && summary.mean_response_time_ms !== null && summary.mean_response_time_ms < 2500) return 'suspiciously_competent';
  if (all) return 'human';
  if (summary.passed === summary.rounds - 1) return 'reservations';
  if (summary.passed === summary.rounds - 2) return 'review';
  if (summary.passed === summary.rounds - 3) return 'insufficient';
  return 'ducks';
}
