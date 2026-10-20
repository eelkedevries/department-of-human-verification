/**
 * Version 2 record types, from the implementation brief (section 6). Types only:
 * nothing in version 1 imports this module, and no gaze, camera or consent code
 * exists yet. Identifiers are non-identifying; timestamps are milliseconds on the
 * session's performance.now() origin unless stated otherwise.
 */

/** The page geometry against which a gaze estimate must be interpreted. */
export interface CoordinateFrame {
  /** Viewport size in CSS pixels. */
  viewport_width: number;
  viewport_height: number;
  device_pixel_ratio: number;
  scroll_x: number;
  scroll_y: number;
  /** The rendered 3 × 3 grid in viewport CSS pixels. */
  grid_rect: { x: number; y: number; width: number; height: number };
  /** Each tile's rectangle in viewport CSS pixels, by display position. */
  tile_rects: { position: number; x: number; y: number; width: number; height: number }[];
}

export interface GazeSample {
  session_id: string;
  trial_id: string;
  /** Prediction time relative to the trial onset. */
  t_ms: number;
  /** Estimated gaze in viewport CSS pixels; null when the tracker gave no estimate. */
  x: number | null;
  y: number | null;
  valid: boolean;
  /** The tile under the estimate, 0–8, or null outside the grid. */
  tile_position: number | null;
  frame_id: string;
}

export interface CalibrationQuality {
  session_id: string;
  method: string;
  method_version: string;
  /** Points used to fit the model, in viewport CSS pixels. */
  training_targets: { x: number; y: number }[];
  /** Held-out points, never used for fitting, with their measured error. */
  validation_points: { x: number; y: number; mean_error_px: number; samples: number; valid_samples: number }[];
  valid_sample_proportion: number;
  /** Samples per second actually delivered, and of those, usable. */
  delivered_rate_hz: number;
  usable_rate_hz: number;
  retry_count: number;
  passed: boolean;
}

export interface QualitativeResponse {
  session_id: string;
  question_id: string;
  /** Free text, or a category from a closed list; both optional. */
  text: string | null;
  category: string | null;
  trial_id: string | null;
}

export interface ModelPrediction {
  stimulus_id: string;
  stimulus_hash: string;
  /** Identifies the exact composite grid the prediction was computed on. */
  layout: string[];
  model_name: string;
  model_version: string;
  map_path: string;
  map_sha256: string;
  preprocessing: string;
}

export interface ConsentRecord {
  session_id: string;
  consent_version: string;
  camera_opt_in: boolean;
  research_storage_opt_in: boolean;
  /** Wall-clock time, ISO 8601. */
  recorded_at: string;
}

/**
 * Instruction conditions for the primary manipulation: the same target in the
 * same grid, described directly ("Select the duck.") or semantically ("Select the
 * animal dressed for a job interview."), assigned between participants.
 */
export type InstructionCondition = 'direct' | 'semantic';
