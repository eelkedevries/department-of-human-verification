/**
 * Coarse per-tile attention (version 2). With ordinary webcams, the 3 × 3 tiles are
 * the finest areas of interest the estimates can support; fixation order and
 * saccade timing remain exploratory until validated independently.
 */

import { tileAt } from './geometry';
import type { CoordinateFrame, GazeSample } from './types';

export interface TileAttention {
  /** Proportion of valid in-grid estimates on each tile, by display position. */
  proportions: number[];
  /** Valid estimates on each tile. */
  counts: number[];
  valid_samples: number;
  /** Valid estimates that fell outside the grid. */
  outside: number;
  invalid_samples: number;
  /** The first tile with `firstRunLength` consecutive estimates on it; exploratory only. */
  first_tile: number | null;
}

export function tileAttention(
  samples: readonly Pick<GazeSample, 'x' | 'y' | 'valid'>[],
  frame: CoordinateFrame,
  gapTolerance = 8,
  firstRunLength = 3,
): TileAttention {
  const counts = new Array(frame.tile_rects.length).fill(0);
  let outside = 0;
  let invalid = 0;
  let first: number | null = null;
  let run: { tile: number | null; length: number } = { tile: null, length: 0 };
  for (const s of samples) {
    if (!s.valid || s.x === null || s.y === null) {
      invalid++;
      continue;
    }
    const tile = tileAt(frame, s.x, s.y, gapTolerance);
    if (tile === null) outside++;
    else counts[tile]++;
    run = tile !== null && tile === run.tile ? { tile, length: run.length + 1 } : { tile, length: 1 };
    if (first === null && run.tile !== null && run.length >= firstRunLength) first = run.tile;
  }
  const inGrid = counts.reduce((n, c) => n + c, 0);
  return {
    proportions: counts.map((c) => (inGrid ? c / inGrid : 0)),
    counts,
    valid_samples: inGrid + outside,
    outside,
    invalid_samples: invalid,
    first_tile: first,
  };
}

/** Attention on the target tiles as a share of all in-grid attention. */
export function targetShare(attention: TileAttention, targetPositions: readonly number[]): number {
  return targetPositions.reduce((n, p) => n + attention.proportions[p], 0);
}
