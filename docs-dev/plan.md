# Plan

The delivery plan for *The Department of Human Verification*, from the owner's implementation brief of 20 October 2026 (`reference/secondary_background/implementation_brief.md`). The binding decisions are in `reference/primary_authoritative/specification.md`; this file records the sequence and the reasoning.

## Release gates

1. **Version 1 deployed and verified.** The game, with no eye-tracking, live at `https://eelkedevries.com/department-of-human-verification/`, protected from the main site's deploy and listed on the Projects page as version 1.
2. **Version 2 demo.** Optional webcam eye-tracking with calibration, independent validation and a quality-gated personal reveal, working on tested hardware. No participant data leaves the browser.
3. **Version 2 research collection.** A secured, consented submission endpoint and private storage. Disabled by default; enabled only after the owner has approved privacy, storage, consent and ethics arrangements.

Each gate is a separate decision. Passing one does not authorise the next.

## Prompt sequence

| Prompt | Unit of work | Gate |
|---|---|---|
| `001_setup.md` | Scaffold from `eek-a-template`, binding specification, plan, verify command and CI. | 1 |
| `002_stimulus_library.md` | Stimulus pipeline, catalogue and validator; publish the first grid (bicycles) and draft nine more. | 1 |
| `003_v1_game.md` | The game: screens, rounds, selection, timer, scoring, feedback, report, replay, About, local events and developer export. Unit tests. | 1 |
| `004_v1_verification.md` | End-to-end tests (Chromium desktop and mobile, Firefox where available), keyboard, reduced motion, no-camera and no-network checks. | 1 |
| `005_v1_deployment.md` | Deploy workflow in `eelkedevries.com`, `deploy.sh` protection, live verification, Projects card. | 1 |
| `006_v2_eye_tracking_preview.md` | Opt-in, consent, WebGazer camera and face positioning, nine-point calibration, held-out validation, quality gate, gaze recording with coordinate frames, testimony and a quality-gated reveal. Behind the build flag `VITE_EYE_TRACKING=1`; **not deployed**. | 2 |
| `007_v1_surreal_bicycle_grid.md` | Generate, review and publish the first nine-image surreal bicycle category-judgement grid; keep original G01 playable. | Revised V1 |
| `008_v1_category_sets.md` *(proposed, not yet written)* | Generate and review additional normal-instruction, bizarre-but-relevant category grids from `docs/stimulus-concepts.md`. | Revised V1 |
| `009_v1_distinct_rounds_pilot.md` *(proposed, not yet written)* | Prefer five distinct category grids per session, check timing, feedback and selection behaviour, and run a playability pilot. | Revised V1 |

Prompt 006 was completed as a separately flagged, undeployed preview. **Further version 2 work is deferred**, and its previously proposed prompt numbers 007–011 have been withdrawn to avoid colliding with the revised version 1 roadmap. Possible later topics include instruction conditions, AI model maps, private data collection, analysis and a real-hardware pilot; these will receive new numbers only if the owner requests them.

## Stimulus pool (version 1)

Rendering runs on a CPU at about 2.5 minutes per image, so the owner decided on 20 October 2026 to launch with **one grid**, the bicycles (G01), shown in all five rounds with a new layout each time, and to add the others later. Nine more grids are drafted in `tools/stimuli/source.json` with `"published": false`:

| Family | Published | Drafted |
|---|---|---|
| Recognition (multiple) | bicycles (G01) | lighthouses (G02) |
| Semantic description (single) | — | job interview (G03), dressed for the rain (G04) |
| Odd one out (single) | — | fruit and a tennis ball (G05), instruments and a garden hose (G06) |
| Functional categorisation (multiple) | — | designed for sitting (G07), designed for cutting (G08) |
| Absurd finale (single, entertainment) | — | suspicious duck (G09), impostor pigeon (G10) |

The drafts already resolve the mock-up's ambiguities as the brief asks: distractor animals wear nothing, so only one animal is dressed for anything; "could reasonably sit on" becomes "designed for sitting"; the absurd rounds state an operational definition (wearing a disguise) and are classed as entertainment. The targets of G03, G04, G05, G06, G09 and G10 have test renders already, but they stay unpublished until their grids are complete and checked.

To publish a drafted grid: set `"published": true`, render, review the contact sheet, build and validate (`docs/stimuli.md`). The game fills each round from its own family as soon as one exists. The path to 10–20 validated grids for research runs through the same pipeline; a GPU (or a Hugging Face PRO quota) would cut rendering from hours to minutes.

## Revised V1 stimulus direction (20 October 2026)

The owner prioritises a **fun category-boundary game**, not a clean laboratory-like identification test. Every new grid has a normal “Select all…” instruction, a blend of ordinary objects and contextual AI-style absurdity, and some defensible borderline items. See `docs/stimulus-concepts.md` for 15 nine-image candidate sets. The prototype's strict answer key was extended to allow unscored borderline judgements. G01 stays live until replacement assets are rendered and checked; G02–G10 are superseded draft ideas, not ready to publish. Future V1 implementation work: generate and review new images, upgrade session sampling to distinct new category grids, review score/feedback pacing and run a usability pilot. No V2 implementation is authorised by this revision.

## Later work (not scheduled)

- More grids per family, and a pilot rating of each grid's difficulty.
- Optional sound (off by default).
- A Dutch translation.
