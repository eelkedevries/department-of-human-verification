# Specification

**Version:** 1.0 · **Last updated:** 20 October 2026

The authoritative design canon for this project. Only the sections that are filled in are binding. An empty or stubbed section means "not yet decided", not a constraint.

When the codebase and this document conflict, this document is correct. When a decision is made or revised, update the relevant section here, bump the version and note the change in the changelog at the end.

The decisions below implement the owner's implementation brief of 20 October 2026 (`../secondary_background/implementation_brief.md`). Where this specification is silent, the brief is the reference.

## Scope

*The Department of Human Verification* is a standalone browser game. A fictional, excessively bureaucratic agency subjects the player to five CAPTCHA-style visual assessments and issues a comic verdict. It is research-inspired, not a research instrument, in version 1.

The project ships in two successive releases. **Version 1 must be complete, deployed and verified before any version 2 code reaches the public build.**

### Version 1 — the game, with no eye-tracking

- Notice screen, briefing, five timed rounds, per-round feedback, final *Human Verification Report*, replay, About dialog.
- Each round: one written instruction and a 3 × 3 grid of nine independent image tiles.
- **Excluded from version 1, absolutely:** camera requests or permissions, eye-tracking or face libraries, calibration, gaze estimates, heatmaps or "your eyes looked here" displays, and any transmission or server-side storage of participant data.
- Behavioural events are logged locally, in memory, and leave the page only through an explicitly labelled developer export.

### Version 2 — optional eye-tracking and research mode (not yet built)

Version 2 keeps the version 1 game intact and adds an explicit, opt-in *Play with eye-tracking* path: consent before camera activation, face positioning, nine-point calibration, independent validation, quality gating, gaze recording with known coordinate frames, instruction-phrasing conditions, a reveal (*Your testimony* / *Surveillance record* / *Automated assessment*) only when quality permits, and later a secured, consented collection pipeline and dashboard. Research uploads are **disabled by default** and must not be enabled until the owner has reviewed privacy, storage and consent. Publishing a demo and collecting research data are distinct release gates.

### Never in scope

Other games from the same proposal; a public leaderboard; any real verification or bot-detection claim; covert tracking; face identification; third-party analytics.

## Architecture

- **Stack:** Vite + TypeScript, static output, no runtime framework. Fonts are self-hosted (`@fontsource`); the page makes no third-party requests.
- **Base path:** `/department-of-human-verification/`. Production URL: `https://eelkedevries.com/department-of-human-verification/`.
- **Modules** (`src/`):
  - `app/` — controller (`main.ts`), session construction (`session.ts`) and screens.
  - `game/` — seeded randomisation, scoring, timer and the round view.
  - `components/` — page furniture (letterhead, seal, progress, stamps, buttons).
  - `stimuli/` — typed catalogue (`catalogue.json`, generated) and its loader.
  - `analytics/` — event schema, the local collector and the developer export.
  - `content/` — all player-facing copy.
  - `research/` — version 2 interfaces only; nothing in it may execute in version 1.
- **Flow:** notice → briefing (time-limit choice) → round 1…5 (each round reveals its own feedback in place) → report → replay, which starts a new session directly at round 1 with the same settings.
- Gameplay, display, stimulus data and metrics are separate modules so that version 2 can add a gaze source and research conditions without rewriting the game.
- **Stimulus pipeline:** `tools/stimuli/source.json` (prompts, seeds, instructions, answer keys) → `generate.py` (local render) → human review with `review.py` contact sheets → `build.py` (publish WebP files with opaque names, write the catalogue) → `scripts/validate-stimuli.mjs` (part of `npm run check`).
- **Hosting:** SiteGround under eelkedevries.com, deployed by a dedicated workflow in `eelkedevries/eelkedevries.com` that reuses that repository's SSH secrets. Never GitHub Pages. This repository holds no secrets.

## Data schemas

TypeScript types in `src/stimuli/types.ts`, `src/app/session.ts` and `src/analytics/collector.ts` are the canonical definitions. Summary:

### `stimulus` (catalogue entry)

`stimulus_id`, `version` (integer, bumped whenever a grid's instruction, answer key or images change), `hash` (SHA-256 over instruction, mode, answer key and tile hashes), `family`, `mode` (`single` | `multiple`), `instruction`, `instruction_variants` (`direct`, `semantic`; for version 2), `hint`, `operational_definition` (required for `entertainment` grids), `explanation`, `difficulty`, `research_class` (`unambiguous` | `entertainment`), `feedback`, `tiles[9]`, `answer_key` (tile IDs).

Each tile: `tile_id` (stable, never written into the page), `src` and `src_small` (opaque content-hash file names), `width`, `height`, `sha256`, `alt` (human-checked description), `provenance` (`model`, `model_revision`, `licence`, `prompt`, `seed`, `steps`, `guidance_scale`, `generated_at`, `edits`).

### `trial_assignment`

`session_id`, `trial_index`, `condition` (`v1_standard`), `stimulus_id`, `stimulus_version`, `stimulus_hash`, `family`, `mode`, `instruction`, `layout` (tile IDs by display position, row-major from the top left), `instructed_targets`.

### `trial`

`trial_id`, `session_id`, `trial_index`, `stimulus_id`, `stimulus_version`, `onset_ms`, `end_ms`, `selected_tile_ids`, `selection_order` (every toggle with its time), `correct`, `outcome`, `hits`, `misses`, `false_alarms`, `response_time_ms` (active time; `null` on timeout), `timeout`, `interrupted`.

### Events

`session_start`, `trial_start`, `selection`, `submit`, `timeout`, `trial_end`, `visibility`, `session_end`, each with `t_ms` relative to the session's `performance.now()` origin. Schema version 1.

### Version 2 records (types only; see `src/research/types.ts`)

`gaze_sample`, `calibration_quality`, `qualitative_response`, `model_prediction`, `consent_record`, as listed in the brief, section 6.

## Domain rules

1. **Five rounds, fixed family order:** recognition, semantic description, odd one out, functional categorisation, absurd finale. Each session draws one grid per family from the pool, avoiding the previous session's grids where the pool allows.
2. **Seeded randomisation:** one 32-bit session seed (from `crypto.getRandomValues`, or `?seed=` for testing) drives grid choice, tile layout and feedback-line choice through labelled sub-seeds. The seed is recorded.
3. **Scoring:** a round is passed only when the selected set equals the answer key exactly and the round did not time out. Outcomes are `correct`, `partial` (multiple-answer grids with at least one hit), `incorrect` and `timeout`. Tile-level hits, misses, false alarms and correct rejections are recorded.
4. **Selection:** single-answer grids allow one selection (a new choice replaces the old); multiple-answer grids allow any number. Submitting with nothing selected is refused with a descriptive message; a timeout submits whatever is selected.
5. **Timing:** the default limit is 15 seconds per round; players may choose 30 seconds or no limit before starting (WCAG 2.2.1). The timer starts only after all nine images have decoded and been painted, and counts active time only: it pauses while the page is hidden, and the round is flagged `interrupted`. Feedback time is excluded. Five rounds at the default limit cap timed gameplay at 75 seconds.
6. **Answer keys must be defensible.** `unambiguous` grids have one defensible answer set under a literal reading of the instruction. `entertainment` grids (the absurd finale) are scored by a stated operational definition shown in the hint and are excluded from any confirmatory analysis.
7. **No answer leakage through the page:** file names are content hashes, tile IDs and roles never appear in the DOM, and alternative text describes only what is visible. The answer key is necessarily present in the client bundle of a static game; that is accepted, since the game is not a security control.
8. **Stimuli:** every image is original and rights-cleared, with recorded provenance and licence. The concept mock-up is never used as interface or stimulus material.
9. **Verdicts are fiction** and always appear with a notice saying so. They depend only on the number of rounds passed (and, for *Suspiciously competent*, a mean response under 2.5 seconds).
10. **No deceptive interaction:** no imitation system dialogues, no credential requests, no suggestion of real consequences.

## Naming and voice

- Player-facing name: *The Department of Human Verification*. Tagline: *Humanity cannot be self-certified.*
- Voice: formal, dry, deadpan British English; the Department takes trivial things seriously and is never unkind to the player. Jokes are original and must not mislead about anyone's real status.
- The game identifies itself as fiction outside the story (footer, briefing, report, About).
- Visual identity: an original seal (an eye with a tick, laurels, "Est. MMXXVI"), cream paper on a grey desk, navy ink, IBM Plex Mono for official labelling and IBM Plex Sans for prose. No resemblance to any real CAPTCHA provider or authority.

## Locked decisions

- Version 1 contains no camera, tracking or gaze code of any kind, and sends nothing to any server. `scripts/check-public-build.sh` enforces the absence of camera and network-submission APIs in the build.
- Five rounds, 3 × 3 grids, one grid per family per session, 15-second default limit with extended and untimed options.
- Stimuli: generated locally with FLUX.2 [klein] 4B (Apache-2.0) from fixed prompts and seeds, published at 512 × 512 and 256 × 256 pixels as WebP.
- Deployment: a dedicated workflow in `eelkedevries/eelkedevries.com`, which also protects `/department-of-human-verification/***` from the main site's `rsync --delete-after`.
- Research data collection, when built, stays disabled until the owner explicitly approves the privacy, storage and consent arrangements.

## Changelog

- **1.0 (20 October 2026):** first binding version: scope, architecture, schemas, rules and voice for version 1, and the version 2 boundary.
