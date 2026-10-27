# Task: Version-2 grids for chairs, cars, clocks and boats

## Goal

Bring the impossible and borderline images that were re-rendered after their themes' first grids into the game, by recording second versions of those grids.

## Scope

Implement only the work described in this prompt. Do not implement adjacent systems or future prompts.

## Required changes

1. Make `tools/stimuli/publish.py` serve only the latest published version of each grid, and document this in `stimuli/README.md` and `stimuli/CHECKLISTS.md`.
2. Record C02@2 (adds the toilet armchair), C04@2 (adds the estate car edited onto horse legs), C08@2 (adds the clock with arms for hands and the bursting cuckoo) and C09@2 (adds the rowing boat edited to row with human arms) with `tools/stimuli/finalise.py`, after a joint review of each at tile size.
3. Register the re-rendered self-playing piano and saxophone with lips for the musical-instruments pool.
4. Publish with `tools/stimuli/publish.py`.

## Do not implement

- No change to the version-1 manifests, which remain recorded.

## Acceptance criteria

The task is complete when:
- The game catalogue serves C02, C04, C08 and C09 at version 2 and the other grids at version 1, validated, with credits.
- `npm run check` and the end-to-end tests pass.

## Checks

Run `npm run gallery:collection`, `npm run validate:collection`, `npm run check` and `npm run test:e2e`.

## Commit and push

If and only if the scope was followed and checks pass, create one commit on `main` using this file's exact filename (`036_grid_versions_two.md`) as the commit message, then push.

Do not commit or push partially completed work unless explicitly instructed.

## Final report

End with the required final report specified in `AGENTS.md`, including the completed checklists.
