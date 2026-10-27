# Task: Remove the legacy G01 final set

## Goal

Remove the nine legacy G01 images completely from the stimulus collection, on the owner's decision.

## Scope

Implement only the work described in this prompt. Do not implement adjacent systems or future prompts.

## Required changes

1. Delete the G01 version 1 final-set folder (manifest, README and all eighteen WebP files) and remove the set from the final stage manifest.
2. Keep tombstones only: move the set reference to `retired_sets` with the removed paths, mark the nine legacy versions withdrawn, and append `withdrawn` and `set_retired` history events.
3. Extend the collection validator and vocabulary to accept retired sets and withdrawn legacy versions while keeping history resolvable.
4. Update the specification, collection documents and source registry.

## Do not implement

- No change to the live game catalogue in this prompt; replacing the published grid is a separate publishing task.

## Acceptance criteria

The task is complete when:
- No G01 image file remains in the collection and the gallery shows no final set.
- `npm run validate:collection` and `npm run check` pass.

## Checks

Run `npm run gallery:collection`, `npm run validate:collection` and `npm run check`.

## Commit and push

If and only if the scope was followed and checks pass, create one commit on `main` using this file's exact filename (`022_remove_legacy_g01_set.md`) as the commit message, then push.

Do not commit or push partially completed work unless explicitly instructed.

## Final report

End with the required final report specified in `AGENTS.md`, including the completed checklists.
