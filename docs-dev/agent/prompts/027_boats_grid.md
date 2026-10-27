# Task: Boats grid C09

## Goal

Complete the boats theme of the concept table and publish its final set, together with the generated images registered so far for the other themes.

## Scope

Implement only the work described in this prompt. Do not implement adjacent systems or future prompts.

## Required changes

1. Register and standardise the reviewed generated boats (yacht on mechanical legs, sailboat with a lighthouse, motorised bathtub, inflatable duck float, floating picnic table); the rowing boat with human arms is redone as an edit later.
2. Record final set C09@1 with `tools/stimuli/finalise.py` and publish it with `tools/stimuli/publish.py`.
3. Write `stimuli/raw/boats/review-2026-10-27.md`, the review document the boats records cite.

## Do not implement

- No other themes' final sets in this prompt.

## Acceptance criteria

The task is complete when:
- The game catalogue contains C01, C02 and C09, validated, with credits.
- `npm run check` and the end-to-end tests pass.

## Checks

Run `npm run gallery:collection`, `npm run validate:collection`, `npm run check` and `npm run test:e2e`.

## Commit and push

If and only if the scope was followed and checks pass, create one commit on `main` using this file's exact filename (`027_boats_grid.md`) as the commit message, then push.

Do not commit or push partially completed work unless explicitly instructed.

## Final report

End with the required final report specified in `AGENTS.md`, including the completed checklists.
