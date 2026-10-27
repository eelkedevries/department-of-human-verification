# Specification

**Version:** 1.17 · **Last updated:** 27 October 2026

The authoritative design canon for this project. Only the sections that are filled in are binding. An empty or stubbed section means "not yet decided", not a constraint.

When the codebase and this document conflict, this document is correct. When a decision is made or revised, update the relevant section here, bump the version and note the change in the changelog at the end.

The decisions below implement the owner's implementation brief of 20 October 2026 (`../secondary_background/implementation_brief.md`). Where this specification is silent, the brief is the reference.

## Scope

*The Department of Human Verification* is a standalone browser game. A fictional, excessively bureaucratic agency subjects the player to five CAPTCHA-style visual assessments and issues a comic verdict. It is research-inspired, not a research instrument, in version 1.

### Revised version 1 direction (owner decision, 20 October 2026)

The Department's written instructions are wholly normal image-CAPTCHA tasks. Candidate images range from ordinary members through contextually bizarre but recognisable members to uncertain boundary cases (e.g., conventional bicycle, square-wheeled bicycle, stationary fitness cycle and a pedal-powered horse). Every newly designed grid has **multiple selectable targets**, with a mixture of clear members, clear non-members and debatable candidates. An odd image is not necessarily incorrect. Do not use “find what is suspicious/AI-generated/strange” as the standard instruction. More detailed candidates and design rules are in [`docs/stimulus-concepts.md`](../../../docs/stimulus-concepts.md). Each theme now has a **12-item candidate pool** with three ideas in each of four classes (normal member, bizarre member, debatable member, clear non-member). A **curated subset of nine** is still required for every playable grid; the app's 3 × 3 structure and source schema are unchanged.

**Bizarre-category threshold (owner decision, 20 October 2026):** a `member-bizarre` item must remain recognisably within its category while showing an obvious, deliberately impossible and visually funny reality. Merely impractical or eccentric design, novelty animal-shaped products and accidental model artefacts are insufficient. `Member-debatable` images require plausible disagreement about **category membership** based on appearance, identity and function; bizarreness itself is not ambiguity. The image should communicate without captions at its actual grid-tile size. See [`docs/stimuli.md`](../../../docs/stimuli.md#creative-direction-ridiculous-realities-not-novelty-products) and [`docs/stimulus-concepts.md`](../../../docs/stimulus-concepts.md) for the updated editorial rules and table.

**Visual generation decision:** new images should use natural, context-appropriate surroundings (not automatically blank studio backgrounds), with consistent realistic lighting, framing, object legibility and moderate background complexity across each nine-tile grid. The surrounding scene should look ordinary even when the object is absurd. Exceptions are allowed where a neutral studio is contextually appropriate or part of a controlled design. Images in the same pool must **not** all share one dark palette, facing direction, side-on camera angle or near-identical composition. Plan a mixture of realistic colours, left/right orientations and side/three-quarter/elevated views *across* target categories, while protecting object legibility and the bizarre feature. The specific environment, viewpoint, facing direction and colour must be described in the generation brief/prompt and reviewed for visual category cues or confounds. Binding details for this production decision are elaborated in [`docs/stimuli.md`](../../../docs/stimuli.md#stimulus-photography-and-background-guidelines). Natural placement and actual support are required across all fifteen themes and all four image roles: most parked bicycles should lean against ordinary walls, fences or railings, or rest against bicycle racks, with occasional natural kickstands rather than repeated display stands. Prompts and manual review must cover support contact, load-bearing relationships, ground/water contact, shadows and intact functional components. Only the explicitly intended absurdity may violate ordinary physics; do not introduce unsupported balancing, floating contacts or stands that replace pedals. **Target clarity:** in every tile and role, the object must be the single, dominant, unobstructed subject, recognisable at a glance at tile size: about 75–90% of the square crop along its longest dimension, roughly centred, in a side or shallow three-quarter view, with clear contrast against a plain or low-detail background and sharp, even light. Image searches screen for this before rights checks and record the assessment; variety in angle, colour and setting operates within it. Every reviewed image is either suitable or rejected; there is no reserve status, and suitable images are never removed to improve variety. Every pool and selection must also meet measurable set-level variety targets for view, facing direction, colour, support and backdrop, met by adding varied images and by choosing varied nine-image sets, and every stimulus procedure ends with its mandatory checklist in `stimuli/CHECKLISTS.md`, reported in the final report. The criteria are set out in [`docs/stimuli.md`](../../../docs/stimuli.md#target-clarity-standard). The existing 512 px render and 512/256 px published formats remain unchanged.

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
- **Stimulus collection:** `stimuli/` is the mandatory authoring collection, organised by `raw`, `suitable`, `standardized`, `manipulated` and `final`, then theme. `catalogue.json` records source assets and immutable derived versions; stage manifests select them, `vocabulary.json` defines tags, and `history.jsonl` records decisions and edits. Raw/suitable photographs may remain external links. Standardised files, edited masters and versioned final nine-image sets are stored in the repository, with parent references, actual file hashes, source/creator/licence evidence, theme-specific roles and review records. An unused standardised or edited version of a rejected source is withdrawn: its files are deleted, while its record, lineage and removed hashes are kept. Final-set versions are never withdrawn. Existing G01 is imported as a historical final snapshot without fabricated intermediate history. This collection does not automatically update the renderer-only publisher, live catalogue or deployment. Collection metadata, source links and edit prompts must remain outside the deployed bundle. `stimuli/SOURCES.md` is the registry of image sources; it is consulted for every search, updated whenever a source proves useful or unusable, and must document every provider in the catalogue. Every version records `content_origin` (`photograph`, `ai-edited-photograph` or `ai-generated`), checked against its lineage. See `stimuli/AGENTS.md` and `stimuli/README.md`.
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
8. **Stimuli:** every published image is original or appropriately licensed, with recorded provenance and rights to use it and make any intended derivatives. Rights checks are part of image search, without a separate owner request, but quick and proportionate (owner's decision, 27 October 2026): they must not make searching difficult. Openly licensed and free-licence sources are acceptable, including Wikimedia Commons, Unsplash, Pexels, Pixabay and Creative Commons photographs on Flickr; any open licence is acceptable (NonCommercial while the project is non-commercial; avoid NoDerivatives for images to be edited). Commercial stock agencies that enforce their licences actively (for example Getty Images, iStock, Shutterstock, Alamy and Adobe Stock), news agency photographs and images without a licence statement are never used. Confirm the licence on the image's own page, not an index label, and record the page URL, creator, licence, attribution, notable conditions, reviewer and date before presenting an image as suitable or selecting it into `suitable`. Images without a confirmed licence remain `raw` only and cannot be edited, committed as third-party image bytes or selected into new final sets. Keep recorded conditions such as attribution and share-alike, and never add source images to AI training datasets. The collection records source/version lineage and theme-specific roles; AI-edited masters require full editing provenance and standardisation before final use. Third-party licences remain distinct from the code licence. The concept mock-up is never used as interface or stimulus material.
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
- Stimuli: the existing generator uses local FLUX.2 [klein] 4B (Apache-2.0) with fixed prompts/seeds. Licensed photographs and AI-edited derivatives may also enter the staged collection after a quick, proportionate licence check and with complete provenance; commercial stock agencies are excluded. New final sets require reviewed standardised files; publishing remains a separate task. Published formats remain 512 × 512 and 256 × 256 px WebP.
- Deployment: a dedicated workflow in `eelkedevries/eelkedevries.com`, which also protects `/department-of-human-verification/***` from the main site's `rsync --delete-after`.
- Research data collection, when built, stays disabled until the owner explicitly approves the privacy, storage and consent arrangements.
- Licence: GPL-3.0-or-later for the code, documentation and existing generated assets (owner's decision, 20 October 2026), so that the game can be published together with WebGazer. Third-party images and derivatives retain their recorded licences and conditions (owner's source-photograph workflow decision, 26 October 2026).

## Changelog

- **1.17 (27 October 2026):** no reserve status: an image that meets the clarity standard and the rights check is suitable, otherwise rejected with a reason. Variety shortfalls are closed by adding images and by choosing varied nine-image sets, not by demoting suitable images.

- **1.16 (27 October 2026):** rights checks are quick and proportionate rather than exhaustive: openly licensed sources such as Wikimedia Commons are fine, any open licence is acceptable (NonCommercial while non-commercial; no NoDerivatives for edited images), and only a few facts are recorded from the image's own page. Commercial stock agencies that actively enforce their licences, such as Getty Images, news agency photographs and images without a licence statement are excluded.

- **1.15 (27 October 2026):** added the image-source registry `stimuli/SOURCES.md` (required for searches, updated when a source proves useful or unusable, and validated against catalogue providers) and the version-level `content_origin` tag (`photograph`, `ai-edited-photograph`, `ai-generated`).

- **1.14 (27 October 2026):** added measurable set-level variety targets (view, facing direction, colour, support and backdrop) and mandatory per-procedure checklists, including set-level and closing checks, that must be completed and reported before any stimulus procedure is finished.

- **1.13 (27 October 2026):** unused standardised or edited versions of rejected sources may be withdrawn: their files are deleted, and their records keep identity, lineage, removed hashes and a logged reason. Final-set versions cannot be withdrawn.

- **1.12 (27 October 2026):** added a measurable target clarity standard for all stimulus images and roles (one dominant, unobstructed object filling about 75–90% of the square crop, side or shallow three-quarter view, clear figure–ground contrast, recognisable at tile size). Searches screen for it before rights checks; variety operates within it.

- **1.11 (26 October 2026):** require automatic individual publisher/licence checks during every image search, before suitable selection or presentation; unresolved candidates remain raw and are replaced in delivered suitable totals. Record matching evidence and conditions, including AI-training and redistribution limits. The current bicycle selection now has twenty individually verified entries.

- **1.10 (26 October 2026):** added the mandatory five-level stimulus collection, linked raw/suitable candidates, versioned stored derivatives/final sets, controlled tags, append-only decision history and validation. Licensed source photographs are permitted with per-asset rights verification and retained licences. Existing G01 is snapshotted without changing the game or its publisher.

- **1.9 (20 October 2026):** required natural placement and credible physical support across all fifteen stimulus themes, with ordinary leaning/rack parking for most bicycles, explicit contact and functional-part checks, and exceptions only for the intended absurdity.

- **1.8 (20 October 2026):** stimulus-generation sets should vary believable colours, object orientation, side/three-quarter camera views and scene composition across categories; common photographic realism and legibility remain consistent. Added a 12-shot bicycle example plan to avoid repetitive black side-view renders.

- **1.7 (20 October 2026):** raised the humour threshold to unmistakable surreal impossibilities instead of novelty product design, distinguished these from truly debatable category judgements, and revised the bizarre and debatable examples in all 15 twelve-image theme pools.

- **1.6 (20 October 2026):** expanded each proposed theme to a 12-image candidate pool (three normal, three bizarre, three debatable, three non-members); a curated nine-tile subset remains the actual playable grid.

- **1.5 (20 October 2026):** new stimuli use believable, object-appropriate natural backgrounds, standardised photographic presentation, recorded settings and context-aware review. The currently implemented 512/256 px pipeline is unchanged.

- **1.4 (20 October 2026):** ordinary CAPTCHA instructions with bizarre, contextual category members and genuinely borderline options become the preferred stimulus direction. Introduced `category_judgement` and unscored borderline tile IDs; legacy unpublished single-target drafts must be replaced, not released unchanged.

- **1.3 (20 October 2026):** the project is licensed GPL-3.0-or-later; the licence no longer blocks deploying the eye-tracking preview.
- **1.2 (20 October 2026):** version 2 preview: the build flag, the `eyetracking/` module, rule 11, and the condition that the preview is not deployed until the licence and real-hardware questions are settled.
- **1.1 (20 October 2026):** the pool starts with one published grid, repeated in all five rounds with a new layout each time; families without a grid borrow from the pool; feedback has alternative lines per outcome.
- **1.0 (20 October 2026):** first binding version: scope, architecture, schemas, rules and voice for version 1, and the version 2 boundary.
