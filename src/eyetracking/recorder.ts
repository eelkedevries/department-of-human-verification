/**
 * Gaze recording during rounds (version 2). Each estimate is stored with its time
 * relative to the trial's stimulus onset and the tile under it, in the coordinate
 * frame captured at onset. A trial is flagged, not silently kept, if the page
 * scrolled, resized, zoomed or was hidden while it ran.
 */

import type { RoundInstrumentation } from '../game/round';
import { attentionFor, type TrialGaze } from './reveal-data';
import { captureFrame, frameChanged, tileAt } from '../research/geometry';
import type { GazeSample } from '../research/types';
import type { Tracker } from './tracker';

/** Points in the gaps between tiles go to the nearest tile within this distance. */
const GAP_TOLERANCE_PX = 12;

export interface Recorder extends RoundInstrumentation {
  trials(): readonly TrialGaze[];
  /** Stops recording for good (withdrawal or the end of the game). */
  stop(): void;
}

export function createRecorder(tracker: Tracker, sessionId: string): Recorder {
  const trials: TrialGaze[] = [];
  let current: TrialGaze | null = null;
  let onsetPerf = 0;
  let unsubscribe: (() => void) | null = null;
  let stopped = false;
  let gridEl: HTMLElement | null = null;
  let tileEls: HTMLElement[] = [];

  const flag = (reason: string) => {
    if (current && !current.flags.includes(reason)) current.flags.push(reason);
  };
  const onResize = () => flag('viewport resized or zoomed during the trial');
  const onScroll = () => flag('page scrolled during the trial');
  const onVisibility = () => {
    if (document.visibilityState !== 'visible') flag('page hidden during the trial');
  };

  return {
    onOnset(grid, tiles, trialIndex, onsetMs) {
      if (stopped) return;
      gridEl = grid;
      tileEls = tiles;
      onsetPerf = performance.now();
      const frame = captureFrame(grid, tiles);
      const trialId = `${sessionId}-${trialIndex}`;
      current = { trial_index: trialIndex, trial_id: trialId, onset_ms: onsetMs, frame, samples: [], flags: [], duration_ms: 0 };
      addEventListener('resize', onResize);
      addEventListener('scroll', onScroll, { passive: true });
      document.addEventListener('visibilitychange', onVisibility);
      unsubscribe = tracker.onEstimate((e) => {
        if (!current) return;
        const valid = e.x !== null && e.y !== null;
        const sample: GazeSample = {
          session_id: sessionId,
          trial_id: trialId,
          t_ms: Math.round((e.t - onsetPerf) * 10) / 10,
          x: e.x === null ? null : Math.round(e.x),
          y: e.y === null ? null : Math.round(e.y),
          valid,
          tile_position: valid ? tileAt(current.frame, e.x!, e.y!, GAP_TOLERANCE_PX) : null,
          frame_id: trialId,
        };
        current.samples.push(sample);
      });
    },
    onOffset() {
      if (!current) return;
      unsubscribe?.();
      unsubscribe = null;
      current.duration_ms = Math.round(performance.now() - onsetPerf);
      if (gridEl && frameChanged(current.frame, captureFrame(gridEl, tileEls))) flag('layout differed at the end of the trial');
      current.attention = attentionFor(current);
      trials.push(current);
      current = null;
      removeEventListener('resize', onResize);
      removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
    },
    trials: () => trials,
    stop() {
      stopped = true;
      if (current) {
        flag('recording stopped during the trial');
        this.onOffset(current.trial_index, 0);
      }
      unsubscribe?.();
    },
  };
}
