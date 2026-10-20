/**
 * Round timer measured in active time: time while the page is hidden is excluded,
 * so a player who switches tabs is neither penalised nor credited. The caller drives
 * `tick()` (from requestAnimationFrame or an interval); tests drive it with a fake clock.
 */

export type Now = () => number;

export interface RoundTimer {
  readonly limitMs: number | null;
  start(): void;
  pause(): void;
  resume(): void;
  stop(): void;
  /** Checks for expiry; calls onExpire at most once. Returns the remaining time. */
  tick(): number | null;
  elapsedMs(): number;
  remainingMs(): number | null;
  isPaused(): boolean;
}

export function createRoundTimer(limitMs: number | null, now: Now, onExpire: () => void): RoundTimer {
  let startedAt: number | null = null;
  let accumulated = 0;
  let running = false;
  let finished = false;

  const elapsedMs = () => accumulated + (running && startedAt !== null ? now() - startedAt : 0);
  const remainingMs = () => (limitMs === null ? null : Math.max(0, limitMs - elapsedMs()));

  return {
    limitMs,
    start() {
      if (finished || running) return;
      startedAt = now();
      running = true;
    },
    pause() {
      if (!running || startedAt === null) return;
      accumulated += now() - startedAt;
      running = false;
    },
    resume() {
      if (finished || running || startedAt === null) return;
      startedAt = now();
      running = true;
    },
    stop() {
      if (running && startedAt !== null) accumulated += now() - startedAt;
      running = false;
      finished = true;
    },
    tick() {
      const remaining = remainingMs();
      if (!finished && running && remaining !== null && remaining <= 0) {
        this.stop();
        onExpire();
      }
      return remaining;
    },
    elapsedMs,
    remainingMs,
    isPaused: () => !running && !finished && startedAt !== null,
  };
}
