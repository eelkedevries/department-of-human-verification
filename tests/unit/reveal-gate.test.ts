// The rule for showing a personal gaze record, tested with synthetic samples.
import { describe, expect, it } from 'vitest';
import { displayable, type TrialGaze } from '../../src/eyetracking/reveal-data';
import { toFrame } from '../../src/research/geometry';

const tiles = Array.from({ length: 9 }, (_, i) => ({ x: (i % 3) * 110, y: Math.floor(i / 3) * 110, width: 100, height: 100 }));
const frame = toFrame({ viewport_width: 1280, viewport_height: 800, device_pixel_ratio: 1, scroll_x: 0, scroll_y: 0, grid: { x: 0, y: 0, width: 320, height: 320 }, tiles });

function trial(samples: number, durationMs: number, flags: string[] = []): TrialGaze {
  return {
    trial_index: 0,
    trial_id: 's-0',
    onset_ms: 0,
    duration_ms: durationMs,
    frame,
    flags,
    samples: Array.from({ length: samples }, (_, i) => ({ session_id: 's', trial_id: 's-0', t_ms: i * 33, x: 50, y: 50, valid: true, tile_position: 0, frame_id: 's-0' })),
  };
}

describe('personal gaze record gate', () => {
  it('shows a record only after a passed calibration check', () => {
    expect(displayable(trial(100, 3000), true)).toEqual({ ok: true, reason: null });
    expect(displayable(trial(100, 3000), false).ok).toBe(false);
  });

  it('withholds flagged trials and says why', () => {
    const result = displayable(trial(100, 3000, ['page scrolled during the trial']), true);
    expect(result.ok).toBe(false);
    expect(result.reason).toContain('page scrolled');
  });

  it('withholds trials with too few in-grid estimates per second', () => {
    expect(displayable(trial(10, 3000), true).ok).toBe(false);
    expect(displayable(trial(16, 3000), true).ok).toBe(true);
  });
});
