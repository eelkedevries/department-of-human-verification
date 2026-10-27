# Current state

Living, high-level orientation for the project: what exists now, key architectural decisions, and what is in progress. Read it at the start of a session to orient quickly.

Update it only for genuinely useful orientation — a new system, an architectural decision — not after routine commits. A stale or bloated state file is worse than none.

This file records what *is* (current reality). The binding design canon is `docs-dev/reference/primary_authoritative/`; when the two conflict, the canon wins and the gap is work still to be done.

## Systems

- **Scaffold** from `eek-a-template` (Vite + TypeScript, static, base path `/department-of-human-verification/`). No GitHub Pages: hosting is SiteGround under eelkedevries.com.
- **Stimulus pipeline** (`tools/stimuli/`): `source.json` (ten legacy grids, G01 published) → `generate.py` (FLUX.2 [klein] 4B on the CPU) → `review.py` contact sheets → `build.py` (opaque WebP files, `src/stimuli/catalogue.json`) → `scripts/validate-stimuli.mjs`.
- **Stimulus collection** (`stimuli/`): 24 linked raw photographs, four suitable entries meeting the target clarity standard, four standardised WebP pairs (`tools/stimuli/standardise.py`), an empty manipulated level, and a byte-identical G01 final snapshot with both image sizes. Twenty sources are rejected for clarity and stay raw; sixteen standardised versions of them are withdrawn (files deleted, records kept). The source review records matching evidence and licence conditions. Rights checks happen automatically during every search, before suitable selection or presentation; the collection validator enforces the earlier gate within `npm run check`. All stimulus agents must follow `stimuli/AGENTS.md`. `stimuli/GALLERY.md`, generated from the catalogue and checked for staleness by `npm run check`, shows every image on GitHub. The collection does not change the renderer-only publisher or live catalogue.
- **The game** (`src/`): controller and screens (`app/`), seeded sessions, rounds, scoring and timer (`game/`), local event log and developer export (`analytics/`), copy (`content/`). Unit tests in `tests/unit/`.
- **End-to-end tests** (`tests/e2e/`, Playwright): Chromium desktop and phone, Firefox with `E2E_FIREFOX=1`; run in CI.
- **Deployment**: `deploy-department-of-human-verification.yml` in eelkedevries.com, started by `npm run deploy`; the main site's deploy protects the folder.
- **Version 2 preview** (`src/eyetracking/`, `src/research/`): opt-in, consent, WebGazer 3.5.3 (separate file), calibration, held-out validation, recording, testimony and reveal, only in builds with `VITE_EYE_TRACKING=1`; tested with a fake camera and a synthetic tracker (`tests/e2e-eyetracking/`); **not deployed**. Notes and blockers: `planning/v2_notes.md`.
- **Verify command** `npm run check`: type-check, stimulus validation, unit tests, build, public-build check (including the version 1 ban on camera, storage and network-submission APIs) and prompt validation.

## Key decisions

- Two releases with separate gates: version 1 (game, no eye-tracking) is deployed and verified before version 2 work reaches the public build; research data collection needs the owner's explicit approval.
- The current renderer generates locally with FLUX.2 [klein] 4B (Apache-2.0) from fixed prompts and seeds. The collection now also accepts licensed photographs and AI-edited derivatives; verify source rights and modification permission before derivatives or committed third-party image bytes. The concept mock-up is never used as interface or stimulus.
- One published grid at launch (bicycles), shown in all five rounds with a new layout each time; nine more grids are drafted (owner's decision, 20 October 2026, because CPU rendering takes about 2.5 minutes per image).
- Licence: GPL-3.0-or-later for code, documentation and existing generated assets, matching WebGazer (owner's decision, 20 October 2026). Third-party source images and derivatives retain the licences/conditions recorded per asset; they are not automatically GPL.
- **Stimulus photography:** new candidate images use plausible object-specific real-world settings, a unified realistic photographic look, deliberate variation in believable object colours, left/right orientations and photographic angles, consistent low/moderate background complexity, and explicit environment/viewpoint prompts. The scene remains ordinary even when the object is absurd. Across all fifteen themes, prompts and review must also specify natural placement, actual support/contact, coherent shadows and intact functional parts; most bicycles should lean against everyday walls, fences or railings, or park against ordinary racks rather than repeated display stands. See `docs/stimuli.md#stimulus-photography-and-background-guidelines`. This is a documented standard; source prompts and existing live images have not been changed.
- **Humour standard:** clearly recognisable but impossible objects with immediate visual punchlines for `member-bizarre`; defensible appearance/identity/function category conflicts for `member-debatable`. Mere novelty design, uncomfortable furniture and animal-shaped lamps do not qualify. All 15 concept pools updated. See `docs/stimuli.md#creative-direction-ridiculous-realities-not-novelty-products`.
- **New design:** ordinary CAPTCHA questions and contextually bizarre photographs; clear targets/distractors are scored but genuinely borderline category-membership choices are recorded and unscored. See `docs/stimulus-concepts.md` for 15 proposed **12-image candidate pools** (three examples of each of four classes); choose nine for each published 3 × 3 grid. Unpublished G02–G10 drafts belong to the superseded direction.

## In progress / next

- **V1 next:** generate, review and publish new category-judgement grids from the concept table, replacing the old unpublished one-target drafts. The scoring, publisher, validator and UI can already handle borderline selections. No new image assets are yet live.
- Real-webcam tests of the separately flagged preview remain a deferred project.

## Prompts run

- `001_setup.md`
- `002_stimulus_library.md`
- `003_v1_game.md`
- `004_v1_verification.md`
- `005_v1_deployment.md`
- `006_v2_eye_tracking_preview.md`
- `008_stimulus_photography_guidelines.md` (documentation update; 007 remains queued)

- `009_stimulus_collection_workflow.md` (five-level authoring collection; linked candidates and existing G01 final snapshot, no publication)
- `010_verify_stimulus_search_rights.md` (automatic rights checks during searches; twenty individually verified selections and four unresolved originals retained raw)
- `011_stimulus_gallery.md` (generated GitHub-rendered gallery of all collection images)
- `012_standardise_suitable_bicycles.md` (twenty suitable photographs standardised to `webp-512-256-v1`; the four unresolved raw-only photographs are not)
- `013_target_clarity_search_standard.md` (target clarity standard for searches)
- `014_remove_suboptimal_stimuli.md` (twenty photographs rejected for clarity; sixteen standardised versions withdrawn; four remain)
