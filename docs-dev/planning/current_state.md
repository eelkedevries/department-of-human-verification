# Current state

Living, high-level orientation for the project: what exists now, key architectural decisions, and what is in progress. Read it at the start of a session to orient quickly.

Update it only for genuinely useful orientation — a new system, an architectural decision — not after routine commits. A stale or bloated state file is worse than none.

This file records what *is* (current reality). The binding design canon is `docs-dev/reference/primary_authoritative/`; when the two conflict, the canon wins and the gap is work still to be done.

## Systems

- **Scaffold** from `eek-a-template` (Vite + TypeScript, static, base path `/department-of-human-verification/`). No GitHub Pages: hosting is SiteGround under eelkedevries.com.
- **Stimulus pipeline** (`tools/stimuli/`): `source.json` (ten grids, G01 published) → `generate.py` (FLUX.2 [klein] 4B on the CPU) → `review.py` contact sheets → `build.py` (opaque WebP files, `src/stimuli/catalogue.json`) → `scripts/validate-stimuli.mjs`.
- **The game** (`src/`): controller and screens (`app/`), seeded sessions, rounds, scoring and timer (`game/`), local event log and developer export (`analytics/`), copy (`content/`). Unit tests in `tests/unit/`.
- **End-to-end tests** (`tests/e2e/`, Playwright): Chromium desktop and phone, Firefox with `E2E_FIREFOX=1`; run in CI.
- **Deployment**: `deploy-department-of-human-verification.yml` in eelkedevries.com, started by `npm run deploy`; the main site's deploy protects the folder.
- **Version 2 preview** (`src/eyetracking/`, `src/research/`): opt-in, consent, WebGazer 3.5.3 (separate file), calibration, held-out validation, recording, testimony and reveal, only in builds with `VITE_EYE_TRACKING=1`; tested with a fake camera and a synthetic tracker (`tests/e2e-eyetracking/`); **not deployed**. Notes and blockers: `planning/v2_notes.md`.
- **Verify command** `npm run check`: type-check, stimulus validation, unit tests, build, public-build check (including the version 1 ban on camera, storage and network-submission APIs) and prompt validation.

## Key decisions

- Two releases with separate gates: version 1 (game, no eye-tracking) is deployed and verified before version 2 work reaches the public build; research data collection needs the owner's explicit approval.
- Stimuli are generated locally with FLUX.2 [klein] 4B (Apache-2.0) from fixed prompts and seeds; the concept mock-up is never used as interface or stimulus.
- One published grid at launch (bicycles), shown in all five rounds with a new layout each time; nine more grids are drafted (owner's decision, 20 October 2026, because CPU rendering takes about 2.5 minutes per image).
- Ambiguous mock-up rounds are made fair in the drafts: undressed distractor animals; "designed for sitting"; absurd rounds scored by a stated operational definition and classed as entertainment.

## In progress / next

- Owner decisions: WebGazer licence; real-webcam tests of the preview. Publishing the drafted grids (needed for prompt 007's conditions).

## Prompts run

- `001_setup.md`
- `002_stimulus_library.md`
- `003_v1_game.md`
- `004_v1_verification.md`
- `005_v1_deployment.md`
- `006_v2_eye_tracking_preview.md`
