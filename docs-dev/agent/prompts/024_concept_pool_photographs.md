# Task: Concept-pool photographs for the remaining themes

## Goal

Register and standardise rights-checked photographs for the ordinary, borderline and non-member items of the concept pools in `docs/stimulus-concepts.md`.

## Scope

Implement only the work described in this prompt. Do not implement adjacent systems or future prompts.

## Required changes

1. Register the reviewed photographs for lamps, shoes, bridges, sandwiches, cars, houses, computers and musical instruments (search agents screened the results; each crop was reviewed at 256 and 128 px and each licence confirmed on the photograph's own page).
2. Standardise every new suitable photograph.
3. Update the agent instructions and checklists for generated images and publishing.

## Do not implement

- No final sets and no change to the live game catalogue in this prompt.

## Acceptance criteria

The task is complete when:
- Every new photograph is registered, suitable and standardised with rights evidence and history.
- `npm run validate:collection` and `npm run check` pass.

## Checks

Run `npm run gallery:collection`, `npm run validate:collection` and `npm run check`.

## Commit and push

If and only if the scope was followed and checks pass, create one commit on `main` using this file's exact filename (`024_concept_pool_photographs.md`) as the commit message, then push.

Do not commit or push partially completed work unless explicitly instructed.

## Final report

End with the required final report specified in `AGENTS.md`, including the completed checklists.
