// Tests of the version 2 analysis code with synthetic estimates. They check the
// arithmetic, not the accuracy of any eye tracker.
import { describe, expect, it } from 'vitest';
import { CALIBRATION_FRACTIONS, frameChanged, placePoints, tileAt, toFrame, VALIDATION_FRACTIONS } from '../../src/research/geometry';
import { assessQuality, DEVELOPMENT_THRESHOLDS, summariseValidation, type PointRecording } from '../../src/research/validation';
import { targetShare, tileAttention } from '../../src/research/attention';

// A 3 × 3 grid of 100-pixel tiles with 10-pixel gaps, starting at (50, 200).
const tiles = Array.from({ length: 9 }, (_, i) => ({ x: 50 + (i % 3) * 110, y: 200 + Math.floor(i / 3) * 110, width: 100, height: 100 }));
const frame = toFrame({
  viewport_width: 1280,
  viewport_height: 800,
  device_pixel_ratio: 2,
  scroll_x: 0,
  scroll_y: 0,
  grid: { x: 50, y: 200, width: 320, height: 320 },
  tiles,
});

describe('coordinate frames', () => {
  it('maps points to tiles row by row, and points far outside to nothing', () => {
    expect(tileAt(frame, 60, 210)).toBe(0);
    expect(tileAt(frame, 365, 515)).toBe(8);
    expect(tileAt(frame, 210, 360)).toBe(4);
    expect(tileAt(frame, 10, 10, 8)).toBeNull();
  });

  it('assigns a point in a gap to the nearest tile only within the tolerance', () => {
    expect(tileAt(frame, 153, 250, 0)).toBeNull();
    expect(tileAt(frame, 153, 250, 8)).toBe(0);
    expect(tileAt(frame, 158, 250, 8)).toBe(1);
  });

  it('detects scrolling, resizing, zoom and layout shifts', () => {
    const same = toFrame({ viewport_width: 1280, viewport_height: 800, device_pixel_ratio: 2, scroll_x: 0, scroll_y: 0, grid: { x: 50.4, y: 200, width: 320, height: 320 }, tiles });
    expect(frameChanged(frame, same)).toBe(false);
    expect(frameChanged(frame, { ...frame, scroll_y: 40 })).toBe(true);
    expect(frameChanged(frame, { ...frame, viewport_width: 1000 })).toBe(true);
    expect(frameChanged(frame, { ...frame, device_pixel_ratio: 2.2 })).toBe(true);
    expect(frameChanged(frame, { ...frame, grid_rect: { ...frame.grid_rect, y: 230 } })).toBe(true);
  });

  it('never validates at a calibration point', () => {
    const area = { x: 0, y: 0, width: 1000, height: 600 };
    const calibration = placePoints(area, CALIBRATION_FRACTIONS);
    for (const v of placePoints(area, VALIDATION_FRACTIONS)) {
      for (const c of calibration) expect(Math.hypot(v.x - c.x, v.y - c.y)).toBeGreaterThan(50);
    }
  });
});

function recording(target: { x: number; y: number }, offset: { x: number; y: number }, n: number, gaps = 0): PointRecording {
  const estimates = Array.from({ length: n }, (_, i) => {
    const t_ms = (i * 1500) / n;
    if (i < gaps) return { t_ms: 600 + i, x: null, y: null };
    const jitter = i % 2 ? 4 : -4;
    return { t_ms, x: target.x + offset.x + jitter, y: target.y + offset.y };
  });
  return { target, estimates, duration_ms: 1500 };
}

describe('validation summary', () => {
  it('separates systematic offset from spread and ignores the settling period for error', () => {
    const summary = summariseValidation([recording({ x: 100, y: 100 }, { x: 30, y: 40 }, 30)]);
    const p = summary.points[0];
    expect(p.centroid_offset_px).toBeCloseTo(50, 0);
    expect(p.rms_spread_px).toBeCloseTo(4, 5);
    expect(p.samples).toBe(30);
    expect(p.valid_samples).toBe(20); // 10 of 30 fall in the first 500 ms
    expect(summary.delivered_rate_hz).toBeCloseTo(20, 5);
  });

  it('counts empty estimates against availability and points without any estimate', () => {
    const summary = summariseValidation([recording({ x: 100, y: 100 }, { x: 0, y: 0 }, 30, 15), { target: { x: 500, y: 500 }, estimates: [], duration_ms: 1500 }]);
    expect(summary.valid_sample_proportion).toBeCloseTo(0.5, 5);
    expect(summary.empty_points).toBe(1);
  });

  it('passes good data and explains each failure in plain English', () => {
    const good = summariseValidation(VALIDATION_FRACTIONS.map(([fx, fy]) => recording({ x: fx * 1000, y: fy * 600 }, { x: 10, y: 10 }, 30)));
    expect(assessQuality(good, 150, DEVELOPMENT_THRESHOLDS)).toEqual({ passed: true, reasons: [], basis: DEVELOPMENT_THRESHOLDS.basis });
    const far = summariseValidation(VALIDATION_FRACTIONS.map(([fx, fy]) => recording({ x: fx * 1000, y: fy * 600 }, { x: 120, y: 0 }, 30)));
    const decision = assessQuality(far, 150, DEVELOPMENT_THRESHOLDS);
    expect(decision.passed).toBe(false);
    expect(decision.reasons).toEqual(['The estimates landed too far from the checking points to tell the images apart.']);
    const sparse = summariseValidation([recording({ x: 100, y: 100 }, { x: 0, y: 0 }, 6)]);
    expect(assessQuality(sparse, 150, DEVELOPMENT_THRESHOLDS).reasons).toContain('The camera delivered too few usable estimates per second.');
  });
});

describe('tile attention', () => {
  it('distributes valid in-grid estimates over tiles and reports the rest', () => {
    const samples = [
      { x: 60, y: 210, valid: true },
      { x: 61, y: 211, valid: true },
      { x: 62, y: 212, valid: true },
      { x: 210, y: 360, valid: true },
      { x: 10, y: 10, valid: true },
      { x: null, y: null, valid: false },
    ];
    const a = tileAttention(samples, frame);
    expect(a.counts[0]).toBe(3);
    expect(a.counts[4]).toBe(1);
    expect(a.proportions[0]).toBeCloseTo(0.75, 5);
    expect(a.outside).toBe(1);
    expect(a.invalid_samples).toBe(1);
    expect(a.valid_samples).toBe(5);
    expect(a.first_tile).toBe(0);
    expect(targetShare(a, [4])).toBeCloseTo(0.25, 5);
  });

  it('reports no first tile until a run of estimates stays on one tile', () => {
    const a = tileAttention([{ x: 60, y: 210, valid: true }, { x: 210, y: 360, valid: true }, { x: 60, y: 210, valid: true }], frame);
    expect(a.first_tile).toBeNull();
  });
});
