# Current state

Living, high-level orientation for the project: what exists now, key architectural decisions, and what is in progress. Read it at the start of a session to orient quickly.

Update it only for genuinely useful orientation — a new system, an architectural decision — not after routine commits. A stale or bloated state file is worse than none.

This file records what *is* (current reality). The binding design canon is `docs-dev/reference/primary_authoritative/`; when the two conflict, the canon wins and the gap is work still to be done.

## Systems

- **Scaffold** from `eek-a-template` (Vite + TypeScript, static, base path `/department-of-human-verification/`). No GitHub Pages: hosting is SiteGround under eelkedevries.com.
- **Stimulus pipeline** (`tools/stimuli/`): `source.json` (ten grids, G01 published) → `generate.py` (FLUX.2 [klein] 4B on the CPU) → `review.py` contact sheets → `build.py` (opaque WebP files, `src/stimuli/catalogue.json`) → `scripts/validate-stimuli.mjs`.
- **Verify command** `npm run check`: type-check, stimulus validation, build, public-build check (including the version 1 ban on camera, storage and network-submission APIs) and prompt validation.

## Key decisions

- Two releases with separate gates: version 1 (game, no eye-tracking) is deployed and verified before version 2 work reaches the public build; research data collection needs the owner's explicit approval.
- Stimuli are generated locally with FLUX.2 [klein] 4B (Apache-2.0) from fixed prompts and seeds; the concept mock-up is never used as interface or stimulus.
- One published grid at launch (bicycles), shown in all five rounds with a new layout each time; nine more grids are drafted (owner's decision, 20 October 2026, because CPU rendering takes about 2.5 minutes per image).
- Ambiguous mock-up rounds are made fair in the drafts: undressed distractor animals; "designed for sitting"; absurd rounds scored by a stated operational definition and classed as entertainment.

## In progress / next

- `003_v1_game.md`, `004_v1_verification.md`, `005_v1_deployment.md`.

## Prompts run

- `001_setup.md`
- `002_stimulus_library.md`
