# Task: No reserve status

## Goal

Every reviewed stimulus image is either suitable or rejected; remove the reserve status.

## Scope

Implement only the work described in this prompt. Do not implement adjacent systems or future prompts.

## Required changes

1. Restore the five individually suitable reserves to `suitable` (ranks 21–25), with history.
2. Remove the reserves section from the gallery; keep "Awaiting review" for undecided images and the collapsed list of rejected images.
3. State in the guidelines, agent instructions, checklists, README and specification that there is no reserve status and that suitable images are not removed to improve variety; update the counts and the dated review.

## Do not implement

- No new searches, rejections, standardisation or final sets.

## Acceptance criteria

The task is complete when:
- No raw image is approved but outside `suitable`, and the gallery has no reserves section.
- The documentation consistently describes the suitable-or-rejected rule.
- `npm run validate:collection` and `npm run check` pass.

## Checks

Run `npm run gallery:collection`, `npm run validate:collection` and `npm run check`.

## Commit and push

If and only if the scope was followed and checks pass, create one commit on `main` using this file's exact filename (`020_no_reserve_status.md`) as the commit message, then push.

Do not commit or push partially completed work unless explicitly instructed.

## Final report

End with the required final report specified in `AGENTS.md`, including the completed checklists.
