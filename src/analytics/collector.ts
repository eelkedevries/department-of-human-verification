/**
 * Local-only behavioural log. Events stay in memory for the length of the page and
 * are never transmitted or stored: the only way out is the developer export, which
 * the player has to request explicitly.
 */

import type { Session, TrialAssignment } from '../app/session';
import type { Evaluation } from '../game/scoring';

export const EVENT_SCHEMA_VERSION = 1;

export type GameEventType =
  | 'session_start'
  | 'trial_start'
  | 'selection'
  | 'submit'
  | 'timeout'
  | 'trial_end'
  | 'visibility'
  | 'session_end';

export interface GameEvent {
  type: GameEventType;
  /** Milliseconds since the session's time origin (performance.now()-compatible). */
  t_ms: number;
  trial_index?: number;
  stimulus_id?: string;
  tile_id?: string;
  /** Display position, 0–8, reading row by row. */
  position?: number;
  selected?: boolean;
  visible?: boolean;
  correct?: boolean;
}

export interface TrialRecord {
  trial_id: string;
  session_id: string;
  trial_index: number;
  stimulus_id: string;
  stimulus_version: number;
  onset_ms: number;
  end_ms: number;
  selected_tile_ids: string[];
  /** Every toggle in order, including withdrawn selections. */
  selection_order: { tile_id: string; selected: boolean; t_ms: number }[];
  correct: boolean;
  outcome: Evaluation['outcome'];
  hits: number;
  misses: number;
  false_alarms: number;
  /** Active time from onset to submission; null when the round timed out. */
  response_time_ms: number | null;
  timeout: boolean;
  /** The page was hidden at some point during the round. */
  interrupted: boolean;
}

export interface SessionExport {
  export_kind: 'developer_only_local_export';
  notice: string;
  schema_version: number;
  app_version: string;
  exported_at: string;
  session: Omit<Session, 'assignments'>;
  environment: { viewport_width: number; viewport_height: number; device_pixel_ratio: number; reduced_motion: boolean };
  trial_assignments: TrialAssignment[];
  trials: TrialRecord[];
  events: GameEvent[];
}

export interface Collector {
  log(event: Omit<GameEvent, 't_ms'> & { t_ms?: number }): GameEvent;
  addTrial(trial: TrialRecord): void;
  events(): readonly GameEvent[];
  trials(): readonly TrialRecord[];
  /** Milliseconds since the time origin. */
  now(): number;
}

export function createCollector(clock: () => number): Collector {
  const origin = clock();
  const events: GameEvent[] = [];
  const trials: TrialRecord[] = [];
  const now = () => Math.round((clock() - origin) * 10) / 10;
  return {
    log(event) {
      const full = { ...event, t_ms: event.t_ms ?? now() } as GameEvent;
      events.push(full);
      return full;
    },
    addTrial(trial) {
      trials.push(trial);
    },
    events: () => events,
    trials: () => trials,
    now,
  };
}

export function buildExport(
  session: Session,
  collector: Collector,
  environment: SessionExport['environment'],
  appVersion: string,
  exportedAt = new Date(),
): SessionExport {
  const { assignments, ...meta } = session;
  return {
    export_kind: 'developer_only_local_export',
    notice: 'Developer-only test export, generated in the browser. Nothing in it has been sent anywhere.',
    schema_version: EVENT_SCHEMA_VERSION,
    app_version: appVersion,
    exported_at: exportedAt.toISOString(),
    session: meta,
    environment,
    trial_assignments: assignments,
    trials: collector.trials().slice(),
    events: collector.events().slice(),
  };
}
