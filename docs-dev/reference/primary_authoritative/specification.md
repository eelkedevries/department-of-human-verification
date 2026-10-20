# Specification

**Version:** 1.4 · **Last updated:** 20 October 2026

The authoritative design canon for this project. Only the sections that are filled in are binding. An empty or stubbed section means "not yet decided", not a constraint.

When the codebase and this document conflict, this document is correct. When a decision is made or revised, update the relevant section here, bump the version and note the change in the changelog at the end.

The decisions below implement the owner's implementation brief of 20 October 2026 (`../secondary_background/implementation_brief.md`). Where this specification is silent, the brief is the reference.

## Scope

*The Department of Human Verification* is a standalone browser game. A fictional, excessively bureaucratic agency subjects the player to five CAPTCHA-style visual assessments and issues a comic verdict. It is research-inspired, not a research instrument, in version 1.

### Revised version 1 direction (owner decision, 20 October 2026)

The Department's written instructions are wholly normal image-CAPTCHA tasks. Candidate images range from ordinary members through contextually bizarre but recognisable members to uncertain boundary cases (e.g., conventional bicycle, square-wheeled bicycle, stationary fitness cycle and a pedal-powered horse). Every newly designed grid has **multiple selectable targets**, with a mixture of clear members, clear non-members and debatable candidates. An odd image is not necessarily incorrect. Do not use “find what is suspicious/AI-generated/strange” as the standard instruction. More detailed candidates and design rules are in [`docs/stimulus-concepts.md`](../../../docs/stimulus-concepts.md).

**Migration:** the original G01 bicycle grid remains a playable fallback. The unpublished G02–G10 one-answer drafts are superseded and must not be published unchanged. New images still need to be generated and reviewed: the concept table is not a built catalogue. The current V1 remains a fun game, not a validated behavioural experiment.

The project ships in two successive releases. **Version 1 must be complete, deployed and verified before any version 2 code reaches the public build.**

### Version 1 — the game, with no eye-tracking

- Notice screen, briefing, five timed rounds, per-round feedback, final *Human Verification Report*, replay, About dialog.
- Each round: one written instruction and a 3 × 3 grid of nine independent image tiles.
- **Excluded from version 1, absolutely:** camera requests or permissions, eye-tracking or face libraries, calibration, gaze estimates, heatmaps or "your eyes looked here" displays, and any transmission or server-side storage of participant data.
- Behavioural events are logged locally, in memory, and leave the page only through an explicitly labelled developer export.

### Version 2 — optional eye-tracking and research mode (preview built, not deployed)

Version 2 keeps the version 1 game intact and adds an explicit, opt-in *Play with eye-tracking* path: consent before camera activation, face positioning, nine-point calibration, independent validation, quality gating, gaze recording with known coordinate frames, instruction-phrasing conditions, a reveal (*Your testimony* / *Surveillance record* / *Automated assessment*) only when quality permits, and later a secured, consented collection pipeline and dashboard. Research uploads are **disabled by default** and must not be enabled until the owner has reviewed privacy, storage and consent. Publishing a demo and collecting research data are distinct release gates.

The preview exists only in builds made with `VITE_EYE_TRACKING=1`. The deployed build is made without it and must contain no eye-tracking module, no WebGazer and no camera API. The preview must not be deployed until it has been tested on real hardware (`docs-dev/planning/v2_notes.md`). The licence question is settled: the project is GPL-3.0-or-later, like WebGazer.

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
  - `research/` — version 2 record types and pure analysis (coordinate frames, validation measures, per-tile attention); nothing in it executes in the deployed build.
  - `eyetracking/` — the version 2 preview (consent, tracker adapter, calibration, validation, recording, testimony, reveal). Loaded only in eye-tracking builds, and only after the participant chooses it.
- **Flow:** notice → briefing (time-limit choice) → round 1…5 (each round reveals its own feedback in place) → report → replay, which starts a new session directly at round 1 with the same settings.
- Gameplay, display, stimulus data and metrics are separate modules so that version 2 can add a gaze source and research conditions without rewriting the game.
- **Stimulus pipeline:** `tools/stimuli/source.json` (prompts, seeds, instructions, answer keys) → `generate.py` (local render) → human review with `review.py` contact sheets → `build.py` (publish WebP files with opaque names, write the catalogue) → `scripts/validate-stimuli.mjs` (part of `npm run check`).
- **Hosting:** SiteGround under eelkedevries.com, deployed by a dedicated workflow in `eelkedevries/eelkedevries.com` that reuses that repository's SSH secrets. Never GitHub Pages. This repository holds no secrets.

## Data schemas

TypeScript types in `src/stimuli/types.ts`, `src/app/session.ts` and `src/analytics/collector.ts` are the canonical definitions. Summary:

### `stimulus` (catalogue entry)

`stimulus_id`, `version` (integer, bumped whenever a grid's instruction, answer key or images change), `hash` (SHA-256 over instruction, mode, answer key and tile hashes), `family`, `mode` (`single` | `multiple`), `instruction`, `instruction_variants` (`direct`, `semantic`; for version 2), `hint`, `operational_definition` (required for `entertainment` grids), `explanation`, `difficulty`, `research_class` (`unambiguous` | `entertainment` | `category_judgement`), optional `borderline_tile_ids`, `feedback` (alternative lines per outcome), `tiles[9]`, `answer_key` (tile IDs). Only grids marked `published` in the source become catalogue entries.

Each tile: `tile_id` (stable, never written into the page), `src` and `src_small` (opaque content-hash file names), `width`, `height`, `sha256`, `alt` (human-checked description), `provenance` (`model`, `model_revision`, `licence`, `prompt`, `seed`, `steps`, `guidance_scale`, `generated_at`, `edits`).

### `trial_assignment`

`session_id`, `trial_index`, `condition` (`v1_standard`), `stimulus_id`, `stimulus_version`, `stimulus_hash`, `family`, `mode`, `instruction`, `layout` (tile IDs by display position, row-major from the top left), `instructed_targets`.

### `trial`

`trial_id`, `session_id`, `trial_index`, `stimulus_id`, `stimulus_version`, `onset_ms`, `end_ms`, `selected_tile_ids`, `selection_order` (every toggle with its time), `correct`, `outcome`, `hits`, `misses`, `false_alarms`, `response_time_ms` (active time; `null` on timeout), `timeout`, `interrupted`.

### Events

`session_start`, `trial_start`, `selection`, `submit`, `timeout`, `trial_end`, `visibility`, `session_end`, each with `t_ms` relative to the session's `performance.now()` origin. Schema version 1.

### Version 2 records (see `src/research/types.ts`)

`gaze_sample`, `calibration_quality`, `qualitative_response`, `model_prediction`, `consent_record`, as listed in the brief, section 6. Gaze estimates are viewport CSS pixels with times relative to the trial's stimulus onset; each trial carries the coordinate frame captured at onset.

## Domain rules

1. **Five rounds, fixed family order:** recognition, semantic description, odd one out, functional categorisation, absurd finale. Round *i* uses a grid of the *i*-th family; a family with no published grid borrows one from the rest of the pool. Grids already used in the session, then those of the previous session, are avoided where the pool allows. Every round has its own seeded layout, so a grid shown twice is laid out differently. **At launch the pool holds one grid (bicycles), shown in all five rounds** — the owner's decision of 20 October 2026, until more grids are rendered; nine further grids are drafted in `tools/stimuli/source.json`.
2. **Seeded randomisation:** one 32-bit session seed (from `crypto.getRandomValues`, or `?seed=` for testing) drives grid choice, tile layout and feedback-line choice through labelled sub-seeds. The seed is recorded.
3. **Scoring:** in unambiguous grids, a round is passed only when the selected set equals the answer key exactly and the round did not time out. In `category_judgement` grids, borderline tile selections are recorded but ignored when computing correctness, hits, false alarms, correct rejections and the report's clear-cut accuracy denominator. Clear-category choices must match the answer key to pass. Outcomes are `correct`, `partial` (multiple-answer grids with at least one hit), `incorrect` and `timeout`. Tile-level hits, misses, false alarms and correct rejections are recorded.
4. **Selection:** single-answer grids allow one selection (a new choice replaces the old); multiple-answer grids allow any number. Submitting with nothing selected is refused with a descriptive message; a timeout submits whatever is selected.
5. **Timing:** the default limit is 15 seconds per round; players may choose 30 seconds or no limit before starting (WCAG 2.2.1). The timer starts only after all nine images have decoded and been painted, and counts active time only: it pauses while the page is hidden, and the round is flagged `interrupted`. Feedback time is excluded. Five rounds at the default limit cap timed gameplay at 75 seconds.
6. **Answer keys must be defensible.** `unambiguous` grids have one defensible answer set under a literal reading of the instruction. In the new `category_judgement` grids, tiles are `target`, `distractor` or `borderline`: only the first two are objectively graded; ambiguous choices must never receive a wrong-answer badge. `entertainment` grids in the older pool remain scored by a stated convention and excluded from confirmatory analysis. All newly designed candidate grids use ordinary instructions and multiple selections.
7. **No answer leakage through the page:** file names are content hashes, tile IDs and roles never appear in the DOM, and alternative text describes only what is visible. The answer key is necessarily present in the client bundle of a static game; that is accepted, since the game is not a security control.
8. **Stimuli:** every image is original and rights-cleared, with recorded provenance and licence. The concept mock-up is never used as interface or stimulus material.
9. **Verdicts are fiction** and always appear with a notice saying so. They depend only on the number of rounds passed (and, for *Suspiciously competent*, a mean response under 2.5 seconds).
10. **No deceptive interaction:** no imitation system dialogues, no credential requests, no suggestion of real consequences.
11. **Eye-tracking (version 2 preview).** The camera starts only after consent. Training happens only at the nine calibration points, never on answers. Validation uses separate points never used for training. A personal gaze record is shown only when the session's check passed and the trial was not flagged (scrolling, resizing, zoom, hidden page, layout change) and had enough estimates on the grid. The camera is released before the reveal and on **Stop**. Quality thresholds are provisional until a pilot sets them. Estimates are approximate and counted per whole tile; fixation order and latency are exploratory. A model prediction is never presented as a recording. Nothing is uploaded.

## Naming and voice

- Player-facing name: *The Department of Human Verification*. Tagline: *Humanity cannot be self-certified.*
- Voice: formal, dry, deadpan British English; the Department takes trivial things seriously and is never unkind to the player. Jokes are original and must not mislead about anyone's real status.
- The game identifies itself as fiction outside the story (footer, briefing, report, About).
- Visual identity: an original seal (an eye with a tick, laurels, "Est. MMXXVI"), cream paper on a grey desk, navy ink, IBM Plex Mono for official labelling and IBM Plex Sans for prose. No resemblance to any real CAPTCHA provider or authority.

## Locked decisions

- Version 1 contains no camera, tracking or gaze code of any kind, and sends nothing to any server. `scripts/check-public-build.sh` enforces the absence of camera and network-submission APIs in the build.
- Five rounds, 3 × 3 grids, 15-second default limit with extended and untimed options. Grids are published one at a time; the game is playable with a single grid. New category-judgement grids use multiple selection and unscored borderline tiles.
- Stimuli: generated locally with FLUX.2 [klein] 4B (Apache-2.0) from fixed prompts and seeds, published at 512 × 512 and 256 × 256 pixels as WebP.
- Deployment: a dedicated workflow in `eelkedevries/eelkedevries.com`, which also protects `/department-of-human-verification/***` from the main site's `rsync --delete-after`.
- Research data collection, when built, stays disabled until the owner explicitly approves the privacy, storage and consent arrangements.
- Licence: GPL-3.0-or-later for the whole repository (owner's decision, 20 October 2026), so that the game can be published together with WebGazer.

## Changelog

- **1.4 (20 October 2026):** ordinary CAPTCHA instructions with bizarre, contextual category members and genuinely borderline options become the preferred stimulus direction. Introduced `category_judgement` and unscored borderline tile IDs; legacy unpublished single-target drafts must be replaced, not released unchanged.

- **1.3 (20 October 2026):** the project is licensed GPL-3.0-or-later; the licence no longer blocks deploying the eye-tracking preview.
- **1.2 (20 October 2026):** version 2 preview: the build flag, the `eyetracking/` module, rule 11, and the condition that the preview is not deployed until the licence and real-hardware questions are settled.
- **1.1 (20 October 2026):** the pool starts with one published grid, repeated in all five rounds with a new layout each time; families without a grid borrow from the pool; feedback has alternative lines per outcome.
- **1.0 (20 October 2026):** first binding version: scope, architecture, schemas, rules and voice for version 1, and the version 2 boundary.
