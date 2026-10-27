# Task: Rework the bicycle selection for set-level variety

## Goal

Bring the suitable bicycle selection as close as the available sources allow to the set-level variety targets, and fill the empty rank, without relaxing the target clarity standard.

## Scope

Implement only the work described in this prompt. Do not implement adjacent systems or future prompts.

## Required changes

1. Plan the pool against the set-level variety targets. Move over-represented side-profile, wall-backed or black bicycles from suitable to raw as reserves, with the reason recorded.
2. Search for clear three-quarter views and settings other than walls, in non-black colours. Verify the clarity and rights of each selected photograph and register it with its crop, characteristics, reviews, conditions and history. Restore twenty ranked suitable photographs.
3. Complete the search-and-selection and closing checklists in `stimuli/CHECKLISTS.md`. Record the set-level counts in the dated review document, update the documentation and gallery, and report every unmet target.

## Do not implement

- No relaxation of the clarity standard to meet a variety target.
- No standardisation, editing, final sets, game changes or deployment.

## Acceptance criteria

The task is complete when:
- Twenty suitable photographs meet the target clarity standard and are rights-verified.
- The set-level counts and any unmet targets are recorded and reported.
- `npm run validate:collection` and `npm run check` pass.

## Checks

Run `npm run gallery:collection`, `npm run validate:collection` and `npm run check`.

## Commit and push

If and only if the scope was followed and checks pass, create one commit on `main` using this file's exact filename (`017_rework_selection_variety.md`) as the commit message, then push.

Do not commit or push partially completed work unless explicitly instructed.

## Final report

End with the required final report specified in `AGENTS.md`, including the completed checklists.
