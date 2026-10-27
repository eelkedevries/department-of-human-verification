# Current state

Living, high-level orientation for the project: what exists now, key architectural decisions, and what is in progress. Read it at the start of a session to orient quickly.

Update it only for genuinely useful orientation — a new system, an architectural decision — not after routine commits. A stale or bloated state file is worse than none.

This file records what *is* (current reality). The binding design canon is `docs-dev/reference/primary_authoritative/`; when the two conflict, the canon wins and the gap is work still to be done.

## Systems

- **Scaffold** from `eek-a-template` (Vite + TypeScript, static, base path `/department-of-human-verification/`). No GitHub Pages: hosting is SiteGround under eelkedevries.com.
- **Stimulus tools** (`tools/stimuli/`): `register.py` (photographs, AI edits and generated images into the collection), `manipulate.py` (FLUX.2 [klein] 4B on the CPU, or the hosted Space), `standardise.py`, `finalise.py` (nine-image final sets with game metadata) and `publish.py` (latest version of each published final set → opaque WebP files and `src/stimuli/catalogue.json`, validated by `scripts/validate-stimuli.mjs`). The legacy `source.json`/`generate.py`/`build.py` route for the retired G01 grid is superseded.
- **Stimulus collection** (`stimuli/`): fifteen themes from `docs/stimulus-concepts.md`; 246 assets and 678 versions, including 143 suitable photographs (Unsplash, Pexels, Flickr), 78 AI masters (72 generated, 6 edits of photographs) and 221 standardised WebP pairs; twenty-one final sets (C01–C15, with second versions of C02, C04, C08, C09, C10 and C14). A screen or monitor on its own is not a computer (owner's correction, 27 October 2026; see `docs/stimulus-concepts.md`). Each theme has a dated review document under `raw/<theme>/`. The legacy G01 snapshot was removed on the owner's decision (27 October 2026), leaving tombstone records only. Rights checks happen during every search; all stimulus agents follow `stimuli/AGENTS.md`, search through `stimuli/SOURCES.md` and keep it current; every version records its `content_origin`. `stimuli/GALLERY.md`, checked for staleness by `npm run check`, shows every image on GitHub.
- **The game** (`src/`): controller and screens (`app/`), seeded sessions, rounds, scoring and timer (`game/`), local event log and developer export (`analytics/`), copy (`content/`). Unit tests in `tests/unit/`.
- **End-to-end tests** (`tests/e2e/`, Playwright): Chromium desktop and phone, Firefox with `E2E_FIREFOX=1`; run in CI.
- **Deployment**: `deploy-department-of-human-verification.yml` in eelkedevries.com, started by `npm run deploy`; the main site's deploy protects the folder.
- **Version 2 preview** (`src/eyetracking/`, `src/research/`): opt-in, consent, WebGazer 3.5.3 (separate file), calibration, held-out validation, recording, testimony and reveal, only in builds with `VITE_EYE_TRACKING=1`; tested with a fake camera and a synthetic tracker (`tests/e2e-eyetracking/`); **not deployed**. Notes and blockers: `planning/v2_notes.md`.
- **Verify command** `npm run check`: type-check, stimulus validation, unit tests, build, public-build check (including the version 1 ban on camera, storage and network-submission APIs) and prompt validation.

## Key decisions

- Two releases with separate gates: version 1 (game, no eye-tracking) is deployed and verified before version 2 work reaches the public build; research data collection needs the owner's explicit approval.
- The current renderer generates locally with FLUX.2 [klein] 4B (Apache-2.0) from fixed prompts and seeds. The collection now also accepts licensed photographs and AI-edited derivatives. Rights checks are quick and proportionate: openly licensed sources such as Wikimedia Commons are fine; commercial stock agencies such as Getty Images are never used (owner's decision, 27 October 2026). The concept mock-up is never used as interface or stimulus.
- Fifteen published category-judgement grids C01–C15 (27 October 2026), one per concept pool, each with ordinary, impossible, borderline (unscored) and non-member images and a credit for every image; a session shows five different grids. At launch there was one grid (owner's decision, 20 October 2026).
- Licence: GPL-3.0-or-later for code, documentation and existing generated assets, matching WebGazer (owner's decision, 20 October 2026). Third-party source images and derivatives retain the licences/conditions recorded per asset; they are not automatically GPL.
- **Stimulus photography:** new candidate images use plausible object-specific real-world settings, a unified realistic photographic look, deliberate variation in believable object colours, left/right orientations and photographic angles, consistent low/moderate background complexity, and explicit environment/viewpoint prompts. The scene remains ordinary even when the object is absurd. Across all fifteen themes, prompts and review must also specify natural placement, actual support/contact, coherent shadows and intact functional parts; most bicycles should lean against everyday walls, fences or railings, or park against ordinary racks rather than repeated display stands. See `docs/stimuli.md#stimulus-photography-and-background-guidelines`. This is a documented standard; source prompts and existing live images have not been changed.
- **Humour standard:** clearly recognisable but impossible objects with immediate visual punchlines for `member-bizarre`; defensible appearance/identity/function category conflicts for `member-debatable`. Mere novelty design, uncomfortable furniture and animal-shaped lamps do not qualify. All 15 concept pools updated. See `docs/stimuli.md#creative-direction-ridiculous-realities-not-novelty-products`.
- **New design:** ordinary CAPTCHA questions and contextually bizarre photographs; clear targets/distractors are scored but genuinely borderline category-membership choices are recorded and unscored. See `docs/stimulus-concepts.md` for 15 proposed **12-image candidate pools** (three examples of each of four classes); choose nine for each published 3 × 3 grid. Unpublished G02–G10 drafts belong to the superseded direction.

## In progress / next

- **V1 next:** eight concept items still lack a usable image after two render attempts (listed in `stimuli/SOURCES.md`); later grid versions may add them. The set-level variety targets of `docs/stimuli.md` were checked per set by review but not yet measured across all fifteen pools.
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
- `015_search_clear_replacements.md` (sixteen clarity-screened, rights-verified Unsplash replacements; twenty suitable again)
- `016_stimulus_procedure_checklists.md` (mandatory per-procedure checklists in `stimuli/CHECKLISTS.md`; measurable set-level variety targets)
- `017_rework_selection_variety.md` (five side-profile bicycles moved to reserves; six three-quarter or non-wall photographs added; two variety targets still unmet)
- `018_source_registry_content_origin.md` (image-source registry `stimuli/SOURCES.md`, validated against catalogue providers; version-level `content_origin` tag)
- `019_proportionate_rights_checks.md` (quick, proportionate rights checks; Wikimedia Commons usable; commercial stock agencies such as Getty Images excluded and rejected by the validator)
- `020_no_reserve_status.md` (every reviewed image is suitable or rejected; the five reserves restored to suitable)
- `021`–`025` (variety additions; G01 removed; AI image tools; concept-pool photographs; bicycles grid C01 published)
- `026`–`039` (generated and edited images for every concept pool; grids C02–C15 published; latest-version publishing and second versions of C02, C04, C08 and C09)
- `040_concept_table_complete.md` (bridges C14 version 2; documentation and specification 1.20)
- `041_computers_screens_not_computers.md` (computers theme redone: screens are not computers; C10 version 2)
