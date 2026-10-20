/**
 * Coordinate frames for gaze estimates (version 2). A gaze estimate is a point in
 * viewport CSS pixels; it means something only together with the page geometry at
 * that moment. These helpers capture that geometry, map points to tiles, and
 * detect changes (scrolling, resizing, zoom) that would misalign a trial.
 */

import type { CoordinateFrame } from './types';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FrameSource {
  viewport_width: number;
  viewport_height: number;
  device_pixel_ratio: number;
  scroll_x: number;
  scroll_y: number;
  grid: Rect;
  tiles: Rect[];
}

export function toFrame(source: FrameSource): CoordinateFrame {
  const round = (r: Rect) => ({ x: round1(r.x), y: round1(r.y), width: round1(r.width), height: round1(r.height) });
  return {
    viewport_width: source.viewport_width,
    viewport_height: source.viewport_height,
    device_pixel_ratio: source.device_pixel_ratio,
    scroll_x: source.scroll_x,
    scroll_y: source.scroll_y,
    grid_rect: round(source.grid),
    tile_rects: source.tiles.map((t, position) => ({ position, ...round(t) })),
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Reads the current geometry of a rendered grid. */
export function captureFrame(grid: Element, tiles: readonly Element[]): CoordinateFrame {
  const rect = (el: Element): Rect => {
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  };
  return toFrame({
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    device_pixel_ratio: window.devicePixelRatio,
    scroll_x: window.scrollX,
    scroll_y: window.scrollY,
    grid: rect(grid),
    tiles: tiles.map(rect),
  });
}

/**
 * The tile under a viewport point. Points in the gaps between tiles are assigned to
 * the nearest tile if they lie within `gapTolerance` pixels of it, since a gap is
 * narrower than the error of any webcam estimate; points further out return null.
 */
export function tileAt(frame: CoordinateFrame, x: number, y: number, gapTolerance = 0): number | null {
  let best: number | null = null;
  let bestDistance = Infinity;
  for (const t of frame.tile_rects) {
    const dx = Math.max(t.x - x, 0, x - (t.x + t.width));
    const dy = Math.max(t.y - y, 0, y - (t.y + t.height));
    const distance = Math.hypot(dx, dy);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = t.position;
    }
  }
  return bestDistance <= gapTolerance ? best : null;
}

/**
 * Whether two frames differ enough to misalign gaze with the stimulus: any change of
 * viewport size, pixel ratio (zoom) or scroll, or a grid that moved by more than
 * `tolerance` pixels.
 */
export function frameChanged(a: CoordinateFrame, b: CoordinateFrame, tolerance = 1): boolean {
  if (a.viewport_width !== b.viewport_width || a.viewport_height !== b.viewport_height) return true;
  if (a.device_pixel_ratio !== b.device_pixel_ratio) return true;
  if (a.scroll_x !== b.scroll_x || a.scroll_y !== b.scroll_y) return true;
  const g = a.grid_rect;
  const h = b.grid_rect;
  return (
    Math.abs(g.x - h.x) > tolerance ||
    Math.abs(g.y - h.y) > tolerance ||
    Math.abs(g.width - h.width) > tolerance ||
    Math.abs(g.height - h.height) > tolerance
  );
}

/** Points as fractions of an area, converted to viewport pixels. */
export function placePoints(area: Rect, fractions: readonly [number, number][]): { x: number; y: number }[] {
  return fractions.map(([fx, fy]) => ({ x: area.x + fx * area.width, y: area.y + fy * area.height }));
}

/** Nine calibration points spread over the stimulus area (training only). */
export const CALIBRATION_FRACTIONS: [number, number][] = [
  [0.1, 0.1], [0.5, 0.1], [0.9, 0.1],
  [0.1, 0.5], [0.5, 0.5], [0.9, 0.5],
  [0.1, 0.9], [0.5, 0.9], [0.9, 0.9],
];

/** Held-out validation points, deliberately different from every calibration point. */
export const VALIDATION_FRACTIONS: [number, number][] = [
  [0.3, 0.3], [0.7, 0.3], [0.3, 0.7], [0.7, 0.7], [0.5, 0.3],
];
