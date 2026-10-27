# Task: Complete the concept table and update the project record

## Goal

Finish the last retry of the concept-table run, refresh the bridges grid with it, and bring the source registry, project state, concept brief and specification up to date now that all fifteen concept pools are published.

## Scope

Implement only the work described in this prompt. Do not implement adjacent systems or future prompts.

## Required changes

1. Register and standardise the re-rendered fallen tree with a handrail, and record C14@2 with it in place of the thin photographed log.
2. Update the bridges and sandwiches review documents with the outcome of their last retries.
3. Record the generation yield, failures and remaining gaps in `stimuli/SOURCES.md`; update `docs-dev/planning/current_state.md` and `docs/stimulus-concepts.md`; bump the specification to 1.20.
4. Publish with `tools/stimuli/publish.py` and deploy.

## Do not implement

- No further renders in this prompt.

## Acceptance criteria

The task is complete when:
- The game catalogue serves all fifteen grids, C14 at version 2, validated, with credits.
- `npm run check` and the end-to-end tests pass, and the live page serves the fifteen grids.

## Checks

Run `npm run gallery:collection`, `npm run validate:collection`, `npm run check` and `npm run test:e2e`.

## Commit and push

If and only if the scope was followed and checks pass, create one commit on `main` using this file's exact filename (`040_concept_table_complete.md`) as the commit message, then push.

Do not commit or push partially completed work unless explicitly instructed.

## Final report

End with the required final report specified in `AGENTS.md`, including the completed checklists.
