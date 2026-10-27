# Task: Generated chairs, chairs grid C02 and theme review documents

## Goal

Complete the chairs theme of the concept table: register and standardise its generated images, record and publish final set C02, and document the photograph searches of themes 2–15.

## Scope

Implement only the work described in this prompt. Do not implement adjacent systems or future prompts.

## Required changes

1. Register the reviewed generated chairs (office chair on crab legs, armchair reading a newspaper, walking chair, person as a chair, stump chair); the toilet armchair render is rejected. Standardise them.
2. Record final set C02@1 with `tools/stimuli/finalise.py` and publish it with `tools/stimuli/publish.py`.
3. Assess the registered black city bicycle as a non-member for the cars theme (the duplicate the cars search found).
4. Write `stimuli/raw/chairs/review-2026-10-27.md`, the review document the chairs records cite.
5. Make the replay end-to-end test expect fresh grids only where the round's pool still holds one, as the session logic does.

## Do not implement

- No other themes' final sets in this prompt.

## Acceptance criteria

The task is complete when:
- The game catalogue contains C01 and C02, validated, with credits.
- `npm run check` and the end-to-end tests pass.

## Checks

Run `npm run gallery:collection`, `npm run validate:collection`, `npm run check` and `npm run test:e2e`.

## Commit and push

If and only if the scope was followed and checks pass, create one commit on `main` using this file's exact filename (`026_chairs_grid.md`) as the commit message, then push.

Do not commit or push partially completed work unless explicitly instructed.

## Final report

End with the required final report specified in `AGENTS.md`, including the completed checklists.
