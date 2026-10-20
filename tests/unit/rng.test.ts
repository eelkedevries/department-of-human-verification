import { describe, expect, it } from 'vitest';
import { createRng, deriveSeed, pick, shuffle } from '../../src/game/rng';

describe('seeded randomisation', () => {
  it('repeats exactly for the same seed', () => {
    const a = createRng(42);
    const b = createRng(42);
    expect(Array.from({ length: 20 }, a)).toEqual(Array.from({ length: 20 }, b));
  });

  it('differs between seeds', () => {
    expect(createRng(1)()).not.toEqual(createRng(2)());
  });

  it('stays within [0, 1)', () => {
    const rng = createRng(7);
    for (let i = 0; i < 10_000; i++) {
      const x = rng();
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });

  it('derives stable, label-specific sub-seeds', () => {
    expect(deriveSeed(99, 'layout:G01')).toBe(deriveSeed(99, 'layout:G01'));
    expect(deriveSeed(99, 'layout:G01')).not.toBe(deriveSeed(99, 'layout:G02'));
    expect(deriveSeed(99, 'grids')).not.toBe(deriveSeed(100, 'grids'));
  });

  it('shuffles into a permutation without mutating the input', () => {
    const items = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
    const copy = items.slice();
    const out = shuffle(items, createRng(3));
    expect(items).toEqual(copy);
    expect(out.slice().sort()).toEqual(copy);
  });

  it('places every item in every position roughly equally often', () => {
    const counts = Array.from({ length: 9 }, () => new Array(9).fill(0));
    const rng = createRng(2026);
    const n = 18_000;
    for (let i = 0; i < n; i++) {
      shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8], rng).forEach((item, position) => counts[item][position]++);
    }
    for (const row of counts) for (const c of row) expect(Math.abs(c - n / 9)).toBeLessThan(n / 9 * 0.15);
  });

  it('refuses to pick from an empty list', () => {
    expect(() => pick([], createRng(1))).toThrow();
  });
});
