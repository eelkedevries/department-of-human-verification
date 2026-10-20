# Stimuli

Each assessment shows one ordinary instruction and nine individually selectable images in a 3 × 3 grid.

## Current status and replacement direction

**Currently published:** G01 — “Select all images containing a bicycle”, with four ordinary bicycle targets. Its images and current scoring are still valid; this grid is temporarily reused when no other published grid exists.

**New direction:** ordinary instructions, absurd-but-category-relevant photographs and debatable category boundaries. The [candidate-stimulus table](stimulus-concepts.md) gives **15 fully sketched nine-image sets**, including ordinary members, bizarre clear members, borderline candidates and non-members. None of those images has been rendered and published yet.

**Earlier unpublished drafts:** G02–G10 remain as legacy entries in [`tools/stimuli/source.json`](../tools/stimuli/source.json). Their single-target and unusual-instruction ideas are **superseded**. Do not publish them as-is. Replace them one grid at a time with the new approach.

## Classification and scoring

The new preferred task format is **“Select all images containing a [normal category].”** Everything genuinely doubtful must be treated as a judgement, never as a provably wrong answer.

Each proposed tile receives a role in the source file:

- `target`: clearly belongs to the category; selecting it counts as a hit.
- `distractor`: clearly does not belong; selecting it counts as a false alarm.
- `borderline`: reasonable people could disagree; its selection **or rejection is recorded but excluded** from objective accuracy.

The built-in scoring now supports a `category_judgement` grid with a non-empty list of `borderline_tile_ids`. The publisher derives that list from source tiles with `"role": "borderline"`. Every such grid must use `"mode": "multiple"`. The summary's clear-cut accuracy denominator excludes those tiles. The Department is free to make bureaucratic jokes, but cannot mark a disputed judgement “incorrect”.

For a new category-judgement grid, include at least one clear target and one clear non-member; keep the answer key to clear targets. Pilot test tentative tile roles before asserting they are clear. Don't hide uncertainty with arbitrary strict answer keys.

## Game selection and randomisation

The game currently samples five rounds in a fixed family order and shuffles tile positions using a recorded seed. When a family lacks published content it borrows another grid, so G01 appears five times at present. Future distinct categories must be integrated into the round-selection design without repeated base categories in one short playthrough where the pool allows. Existing time limits remain unchanged pending usability testing.

For **systematic stimulus variation**, define matched grid variants that keep the wording, definite targets, image count, framing, and rendering quality stable. Independently vary visual resemblance, functional resemblance, or bizarreness; record a variant/condition ID and pilot the difference with human ratings. The concept table is a stimulus backlog, not yet a randomised factorial experiment.

## Image creation and provenance

Images are generated locally with [FLUX.2 [klein] 4B](https://huggingface.co/black-forest-labs/FLUX.2-klein-4B) and reviewed by eye. Preserve prompts, seeds, model revisions, licences, hashes, output dimensions and edits. Photographic context should be plausible and consistent; spectacular errors unrelated to the instructed category are not the goal.

Never use TV-programme stills or reconstruct recognisable proprietary props because an idea mentioned a programme. Cultural references can inspire original, rights-cleared satire.

### Publishing a new set

1. Write an ordinary `instruction` and nine source tiles in [`tools/stimuli/source.json`](../tools/stimuli/source.json), with roles `target`, `borderline`, or `distractor`. Use `research_class: "category_judgement"`, `mode: "multiple"`, and dry feedback that does not prejudge borderline cases.
2. Generate the individual images (`python tools/stimuli/generate.py` or a single tile ID), review via `python3 tools/stimuli/review.py <GRID_ID>`, and revise failed images.
3. When all nine pass manual inspection, mark the source grid `published: true`, and bump its version whenever an existing grid changes.
4. Run `python3 tools/stimuli/build.py`, `npm run check`, and the relevant end-to-end tests before deploying.
5. Only the published assets and catalogue reach the live game; drafts and raw renders remain in the source workflow.

Nothing here activates webcam tracking, analytics, or remote research data collection.
