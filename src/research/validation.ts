/**
 * Calibration quality (version 2): error and sample availability at held-out
 * validation points, and the decision whether a session's estimates are good
 * enough to record and to show back to the participant.
 *
 * The thresholds are deliberately not fixed here. The brief requires them to be
 * predeclared from pilot data and scaled to the tile size; until a pilot exists,
 * DEVELOPMENT_THRESHOLDS stand in for testing only and must not be cited as
 * inclusion criteria.
 */

export interface TimedEstimate {
  /** Milliseconds since the validation point appeared. */
  t_ms: number;
  x: number | null;
  y: number | null;
}

export interface PointRecording {
  target: { x: number; y: number };
  /** Every estimate delivered while the point was shown, including empty ones. */
  estimates: TimedEstimate[];
  /** How long the point was shown, in milliseconds. */
  duration_ms: number;
}

export interface PointResult {
  x: number;
  y: number;
  samples: number;
  valid_samples: number;
  /** Mean distance from the target over valid estimates in the analysis window (accuracy and precision together). */
  mean_error_px: number | null;
  /** Distance from the target to the centroid of the valid estimates (systematic offset). */
  centroid_offset_px: number | null;
  /** Root-mean-square distance of valid estimates from their centroid (precision). */
  rms_spread_px: number | null;
}

export interface ValidationSummary {
  points: PointResult[];
  valid_sample_proportion: number;
  delivered_rate_hz: number;
  usable_rate_hz: number;
  /** Mean of the per-point mean errors over points with any valid estimate. */
  mean_error_px: number | null;
  /** Points with no valid estimate at all. */
  empty_points: number;
}

/**
 * Summarises the recordings. Estimates in the first `settleMs` of each point are
 * counted for availability but excluded from error, since the eyes need time to
 * reach a new target.
 */
export function summariseValidation(recordings: readonly PointRecording[], settleMs = 500): ValidationSummary {
  let samples = 0;
  let valid = 0;
  let durationMs = 0;
  const points = recordings.map((rec): PointResult => {
    const isValid = (e: TimedEstimate) => e.x !== null && e.y !== null && Number.isFinite(e.x) && Number.isFinite(e.y);
    const all = rec.estimates;
    const usable = all.filter((e) => isValid(e) && e.t_ms >= settleMs) as { t_ms: number; x: number; y: number }[];
    samples += all.length;
    valid += all.filter(isValid).length;
    durationMs += rec.duration_ms;
    if (usable.length === 0) {
      return { ...rec.target, samples: all.length, valid_samples: 0, mean_error_px: null, centroid_offset_px: null, rms_spread_px: null };
    }
    const cx = usable.reduce((n, e) => n + e.x, 0) / usable.length;
    const cy = usable.reduce((n, e) => n + e.y, 0) / usable.length;
    const meanError = usable.reduce((n, e) => n + Math.hypot(e.x - rec.target.x, e.y - rec.target.y), 0) / usable.length;
    const spread = Math.sqrt(usable.reduce((n, e) => n + (e.x - cx) ** 2 + (e.y - cy) ** 2, 0) / usable.length);
    return {
      ...rec.target,
      samples: all.length,
      valid_samples: usable.length,
      mean_error_px: meanError,
      centroid_offset_px: Math.hypot(cx - rec.target.x, cy - rec.target.y),
      rms_spread_px: spread,
    };
  });
  const withError = points.filter((p) => p.mean_error_px !== null);
  const seconds = durationMs / 1000;
  return {
    points,
    valid_sample_proportion: samples ? valid / samples : 0,
    delivered_rate_hz: seconds ? samples / seconds : 0,
    usable_rate_hz: seconds ? valid / seconds : 0,
    mean_error_px: withError.length ? withError.reduce((n, p) => n + p.mean_error_px!, 0) / withError.length : null,
    empty_points: points.length - withError.length,
  };
}

export interface QualityThresholds {
  /** Maximum mean error as a fraction of the tile's width. */
  max_error_tile_fraction: number;
  min_valid_proportion: number;
  min_usable_rate_hz: number;
  max_empty_points: number;
  /** Basis of the thresholds, recorded with every decision. */
  basis: string;
}

/** For development and automated tests only. Replace with pilot-based values before any research use. */
export const DEVELOPMENT_THRESHOLDS: QualityThresholds = {
  max_error_tile_fraction: 0.5,
  min_valid_proportion: 0.8,
  min_usable_rate_hz: 10,
  max_empty_points: 0,
  basis: 'development placeholder; not derived from pilot data',
};

export interface QualityDecision {
  passed: boolean;
  reasons: string[];
  basis: string;
}

/** Plain-English reasons, suitable for the participant-facing quality summary. */
export function assessQuality(summary: ValidationSummary, tileWidthPx: number, thresholds: QualityThresholds): QualityDecision {
  const reasons: string[] = [];
  const maxError = thresholds.max_error_tile_fraction * tileWidthPx;
  if (summary.empty_points > thresholds.max_empty_points) reasons.push('Your eyes could not be found for some of the checking points.');
  if (summary.mean_error_px === null || summary.mean_error_px > maxError) reasons.push('The estimates landed too far from the checking points to tell the images apart.');
  if (summary.valid_sample_proportion < thresholds.min_valid_proportion) reasons.push('Too many moments had no estimate at all, often because of lighting or head movement.');
  if (summary.usable_rate_hz < thresholds.min_usable_rate_hz) reasons.push('The camera delivered too few usable estimates per second.');
  return { passed: reasons.length === 0, reasons, basis: thresholds.basis };
}
