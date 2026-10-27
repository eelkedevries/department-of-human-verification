# Task: Cars grid C04 and clocks grid C08

## Goal

Record and publish final sets for the cars and clocks themes of the concept table from the reviewed photographs and generated images already in the collection.

## Scope

Implement only the work described in this prompt. Do not implement adjacent systems or future prompts.

## Required changes

1. Record final sets C04@1 (cars) and C08@1 (clocks) with `tools/stimuli/finalise.py`, after a joint review of each set at tile size.
2. Publish them with `tools/stimuli/publish.py`.
3. Write `stimuli/raw/cars/review-2026-10-27.md` and `stimuli/raw/clocks/review-2026-10-27.md`, the review documents their records cite.

## Do not implement

- No other themes' final sets in this prompt.

## Acceptance criteria

The task is complete when:
- The game catalogue contains C01, C02, C04, C08 and C09, validated, with credits.
- `npm run check` and the end-to-end tests pass.

## Checks

Run `npm run gallery:collection`, `npm run validate:collection`, `npm run check` and `npm run test:e2e`.

## Commit and push

If and only if the scope was followed and checks pass, create one commit on `main` using this file's exact filename (`028_cars_and_clocks_grids.md`) as the commit message, then push.

Do not commit or push partially completed work unless explicitly instructed.

## Final report

End with the required final report specified in `AGENTS.md`, including the completed checklists.
