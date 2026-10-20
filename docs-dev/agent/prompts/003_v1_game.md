# Task: Version 1 game

## Goal

Build the complete, accessible, responsive version 1 game: notice, briefing, five timed 3 × 3 rounds with feedback, the *Human Verification Report*, replay and an About dialog, with local-only behavioural logging.

## Scope

Implement only the work described in this prompt. Do not implement adjacent systems or future prompts.

## Required changes

1. Original Department interface: seal, letterhead, case number, progress dots, paper panel, monospace labelling, prominent **Submit selection**; no resemblance to a real CAPTCHA provider.
2. Session construction from a recorded 32-bit seed: one grid per family in fixed order, avoiding the previous session's grids, seeded tile layout.
3. Rounds: images decoded before the timer starts; reversible selection shown by outline, tick and scale (not colour alone); single-selection grids replace the previous choice; empty submission refused with a descriptive message; 15-second default limit with extended (30 s) and untimed options; timer paused while the page is hidden; timeout recorded and the game continues.
4. Feedback in place: stamp, dry line, explanation, and per-tile marks (correct, missed, not a match).
5. Report: rounds passed, tile accuracy, mean response time, timeouts, fictional verdict with a fiction notice, decisions with explanations, **Request re-assessment**.
6. Keyboard: roving focus with arrow keys, Space to select, digit keys 1–9; focus moved to each new screen's heading; reduced-motion support.
7. Local events (`session_start`, `trial_start`, `selection`, `submit`, `timeout`, `trial_end`, `visibility`, `session_end`) and trial records; a developer-only JSON export shown only with `?dev`.
8. About dialog: fiction, no eye-tracking, nothing stored or sent, image provenance, source link.
9. Unit tests (Vitest) for randomisation, scoring, timing and session assignment, run by `npm run check`; the public-build check extended to refuse camera, storage and network-submission APIs.

## Do not implement

- Any camera, tracking, calibration or gaze code, or any server submission.
- Sound (optional in the brief; omitted).

## Acceptance criteria

The task is complete when:
- a visitor can play five rounds, read feedback, see the report and replay without an account;
- `npm run check` passes, including the unit tests and the extended public-build check.

## Checks

`npm run check`; play through in a browser on desktop and phone widths.

## Commit and push

If and only if the scope was followed and checks pass, create one commit on `main` using this file's exact filename (`003_v1_game.md`) as the commit message, then push.

## Final report

End with the required final report specified in `AGENTS.md`.
