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
| `002_stimulus_library.md` | Generate, review and publish the stimulus pool (ten grids, two per family) with provenance; catalogue and validator. | 1 |
| `003_v1_game.md` | The game: screens, rounds, selection, timer, scoring, feedback, report, replay, About, local events and developer export. Unit tests. | 1 |
| `004_v1_verification.md` | End-to-end tests (Chromium desktop and mobile, Firefox where available), keyboard, reduced motion, no-camera and no-network checks. | 1 |
| `005_v1_deployment.md` | Deploy workflow in `eelkedevries.com`, `deploy.sh` protection, live verification, Projects card. | 1 |
| `006_v2_opt_in_and_consent.md` | *Play normally* / *Play with eye-tracking* choice; device requirements; research information and consent screens, separate from the fiction. No camera yet. | 2 |
| `007_v2_camera_and_calibration.md` | jsPsych WebGazer extension (pinned, licence reviewed), camera preview and face positioning, nine-point calibration, held-out validation, quality summary, recalibrate / continue without tracking, stream shutdown. | 2 |
| `008_v2_gaze_recording.md` | Gaze samples with coordinate-frame metadata, alignment to trial onsets, guards for scroll, resize, zoom and visibility; per-tile attention. | 2 |
| `009_v2_conditions.md` | Direct versus semantic instruction conditions on single-target grids, counterbalanced and seeded. | 2 |
| `010_v2_reveal_and_model_maps.md` | Pre-reveal self-report; the three-part reveal; precomputed model maps from eek-a-look's tooling for the exact composite grids. | 2 |
| `011_v2_collection_backend.md` | Hosting inspection, submission endpoint, private storage, schema validation, throttling, withdrawal. Disabled by default. | 3 |
| `012_v2_analysis_and_dashboard.md` | R / Quarto analysis, restricted dashboard, interview guide and codebook templates. | 3 |
| `013_v2_pilot.md` | Real-device checks and a pilot-quality report. | 3 |

Prompts 006 onwards will be drafted in full when version 1 has been verified live.

## Stimulus pool (version 1)

Ten grids, two per family, so that a replay can show a different grid in every round:

| Family | Grids |
|---|---|
| Recognition (multiple) | bicycles (G01), lighthouses (G02) |
| Semantic description (single) | job interview (G03), dressed for the rain (G04) |
| Odd one out (single) | fruit and a tennis ball (G05), instruments and a garden hose (G06) |
| Functional categorisation (multiple) | designed for sitting (G07), designed for cutting (G08) |
| Absurd finale (single, entertainment) | suspicious duck (G09), impostor pigeon (G10) |

The mock-up's ambiguities are resolved as the brief asks: distractor animals wear nothing, so only one animal is dressed for anything; "could reasonably sit on" becomes "designed for sitting"; the absurd rounds state an operational definition (wearing a disguise) and are classed as entertainment.

The path to 10–20 validated grids for research runs through the same pipeline: add grids to `tools/stimuli/source.json`, render, review the contact sheets, build and validate. Version 2's direct/semantic variants are already recorded for the single-target grids.

## Later work (not scheduled)

- More grids per family, and a pilot rating of each grid's difficulty.
- Optional sound (off by default).
- A Dutch translation.
