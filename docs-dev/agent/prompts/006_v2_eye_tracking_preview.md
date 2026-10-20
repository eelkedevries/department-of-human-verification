# Task: Version 2 eye-tracking preview (not deployed)

## Goal

Add the optional eye-tracking path — opt-in, consent, camera, calibration, independent validation, quality gate, gaze recording, testimony and a quality-gated reveal — behind a build flag, so that it can be tested on real hardware without changing the deployed version 1 game.

## Scope

Implement only the work described in this prompt. Do not implement adjacent systems or future prompts.

## Context

Version 1 is live. The brief's delivery steps 4 to 6 (camera and calibration; research instrumentation; personal result) cannot be completed here: they need a real face in front of a real camera, a licence decision about WebGazer (GPL-3.0-or-later), and precomputed model maps. This prompt builds and tests everything that does not depend on those, and keeps it out of the public build.

## Required changes

1. Build flag `VITE_EYE_TRACKING=1`. Without it, the build contains no eye-tracking code and the version 1 public-build check still passes unchanged.
2. Choice between ordinary play and eye-tracking, offered only on desktop-sized windows with a fine pointer; research information and consent (adult; camera) separate from the fiction; nothing touches the camera before consent.
3. A tracker interface with a WebGazer 3.5.3 adapter: WebGazer loaded as its own unmodified file with its licence; face-mesh files served from this site; no persistence across sessions; no training on clicks or mouse movement except at calibration points; every camera track stopped on exit.
4. Camera screen with face positioning and all fallbacks (declined, refused, unavailable, no face).
5. Nine-point click calibration over the grid's actual rectangle; five held-out validation points; error, spread, availability and delivered rate; plain-English result; *Calibrate again* (three attempts), *Continue without eye-tracking*, and *Continue with eye-tracking* only when the check passes. Thresholds explicitly provisional.
6. Gaze recording during rounds: coordinate frame at onset, per-tile assignment, times relative to onset, flags for scrolling, resizing, zoom, hidden pages and layout changes. A camera badge with **Stop**.
7. Camera released at the end of the last round; one testimony question before the reveal; the reveal with *Your testimony*, *Surveillance record (estimated)* (only when the check passed and the trial is unflagged and has enough estimates) and *Automated assessment (predicted)*, which states that no prediction exists yet.
8. Developer export extended with consent, calibration quality, gaze samples and responses. No upload of any kind.
9. Tests: unit tests for the gate; end-to-end tests with Chromium's fake camera and a synthetic tracker (test builds only), run in CI.
10. Notes in `docs-dev/planning/v2_notes.md`; specification and plan updated.

## Do not implement

- Deployment of the eye-tracking build.
- Instruction-phrasing conditions, model predictions, the collection backend, analysis or dashboard.
- Any claim that the estimates are accurate.

## Acceptance criteria

The task is complete when:
- the default build contains no eye-tracking module, no WebGazer and no camera API, and passes `npm run check`;
- the eye-tracking build passes `EYE_TRACKING_BUILD=1 bash scripts/check-public-build.sh`;
- the eye-tracking end-to-end tests pass;
- the notes state plainly what was not verified.

## Checks

`npm run check`; `npm run test:e2e`; `npm run test:e2e:eyetracking`.

## Commit and push

If and only if the scope was followed and checks pass, create one commit on `main` using this file's exact filename (`006_v2_eye_tracking_preview.md`) as the commit message, then push. Do not deploy.

## Final report

End with the required final report specified in `AGENTS.md`.
