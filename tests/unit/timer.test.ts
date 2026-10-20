import { describe, expect, it } from 'vitest';
import { createRoundTimer } from '../../src/game/timer';

function fakeClock(start = 1000) {
  let t = start;
  return { now: () => t, advance: (ms: number) => (t += ms) };
}

describe('round timer', () => {
  it('expires once, at the limit', () => {
    const clock = fakeClock();
    let expired = 0;
    const timer = createRoundTimer(15_000, clock.now, () => expired++);
    timer.start();
    clock.advance(14_999);
    expect(timer.tick()).toBe(1);
    expect(expired).toBe(0);
    clock.advance(1);
    expect(timer.tick()).toBe(0);
    expect(expired).toBe(1);
    clock.advance(5_000);
    timer.tick();
    expect(expired).toBe(1);
  });

  it('excludes paused time from the elapsed and remaining time', () => {
    const clock = fakeClock();
    let expired = false;
    const timer = createRoundTimer(10_000, clock.now, () => (expired = true));
    timer.start();
    clock.advance(4_000);
    timer.pause();
    expect(timer.isPaused()).toBe(true);
    clock.advance(60_000);
    expect(timer.tick()).toBe(6_000);
    expect(expired).toBe(false);
    timer.resume();
    clock.advance(5_000);
    expect(timer.elapsedMs()).toBe(9_000);
    clock.advance(1_000);
    timer.tick();
    expect(expired).toBe(true);
  });

  it('freezes the elapsed time when stopped and never expires afterwards', () => {
    const clock = fakeClock();
    let expired = false;
    const timer = createRoundTimer(5_000, clock.now, () => (expired = true));
    timer.start();
    clock.advance(2_500);
    timer.stop();
    clock.advance(10_000);
    timer.tick();
    expect(timer.elapsedMs()).toBe(2_500);
    expect(expired).toBe(false);
  });

  it('runs without a limit and never expires', () => {
    const clock = fakeClock();
    const timer = createRoundTimer(null, clock.now, () => {
      throw new Error('should not expire');
    });
    timer.start();
    clock.advance(10 * 60_000);
    expect(timer.tick()).toBeNull();
    expect(timer.remainingMs()).toBeNull();
    expect(timer.elapsedMs()).toBe(600_000);
  });

  it('does not count time before start', () => {
    const clock = fakeClock();
    const timer = createRoundTimer(1_000, clock.now, () => {});
    clock.advance(5_000);
    expect(timer.elapsedMs()).toBe(0);
    timer.start();
    clock.advance(200);
    expect(timer.elapsedMs()).toBe(200);
  });
});
