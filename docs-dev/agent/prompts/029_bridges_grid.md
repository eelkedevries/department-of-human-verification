# Task: Bridges grid C14

## Goal

Record and publish the final set for the bridges theme of the concept table from the reviewed photographs and generated images in the collection.

## Scope

Implement only the work described in this prompt. Do not implement adjacent systems or future prompts.

## Required changes

1. Register and standardise the reviewed generated bridges (bridge held up by giant hands, footbridge on insect legs, knotted bridge), then record final set C14@1 with `tools/stimuli/finalise.py` after a joint review at tile size.
2. Publish it with `tools/stimuli/publish.py`.
3. Write `stimuli/raw/bridges/review-2026-10-27.md`, the review document its records cite.

## Do not implement

- No other themes' final sets in this prompt.

## Acceptance criteria

The task is complete when:
- The game catalogue contains C01, C02, C04, C08, C09 and C14, validated, with credits.
- `npm run check` and the end-to-end tests pass.

## Checks

Run `npm run gallery:collection`, `npm run validate:collection`, `npm run check` and `npm run test:e2e`.

## Commit and push

If and only if the scope was followed and checks pass, create one commit on `main` using this file's exact filename (`029_bridges_grid.md`) as the commit message, then push.

Do not commit or push partially completed work unless explicitly instructed.

## Final report

End with the required final report specified in `AGENTS.md`, including the completed checklists.
