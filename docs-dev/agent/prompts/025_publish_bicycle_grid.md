# Task: Publish the first collection grid (bicycles)

## Goal

Replace the retired generated G01 grid in the game with the reviewed bicycle final set C01 from the stimulus collection, with image credits, and deploy it.

## Scope

Implement only the work described in this prompt. Do not implement adjacent systems or future prompts.

## Required changes

1. Register the bicycle pool's further AI images (chestnut pedal horse, pedal-powered office chair), standardise them, and record final set C01@1 with `tools/stimuli/finalise.py` (manifests now record the grid hash).
2. Publish it with `tools/stimuli/publish.py`: `public/stimuli/` and `src/stimuli/catalogue.json` hold only C01, each tile with its credit and no prompts or seeds.
3. Extend the game's provenance type and catalogue validator to photographs, edited photographs and generated images; list image credits in the About dialog.
4. Make the end-to-end tests count only clear-cut tiles and choose wrong answers among clear non-members, since borderline tiles are unscored.
5. Add the Hugging Face Space mode to `tools/stimuli/manipulate.py` and WebP masters to `register.py`; update the documentation and specification (version 1.19).
6. Deploy through the site repository's workflow.

## Do not implement

- No other grids in this prompt.

## Acceptance criteria

The task is complete when:
- The game catalogue contains C01 only, validated, with credits.
- `npm run check` and the end-to-end tests pass.
- The live page serves the new grid.

## Checks

Run `npm run gallery:collection`, `npm run validate:collection`, `npm run check` and `npm run test:e2e`.

## Commit and push

If and only if the scope was followed and checks pass, create one commit on `main` using this file's exact filename (`025_publish_bicycle_grid.md`) as the commit message, then push.

Do not commit or push partially completed work unless explicitly instructed.

## Final report

End with the required final report specified in `AGENTS.md`, including the completed checklists.
