# Task: Computers theme — if it has a computer, it is a computer

## Goal

Apply the owner's rule that anything containing a computer is a computer, while a screen on its own is not, and replace the computers grid accordingly.

## Scope

Implement only the work described in this prompt. Do not implement adjacent systems or future prompts.

## Required changes

1. Reassess the all-in-one photograph, the generated all-in-one with a miniature office and the single-board computer as targets, with `corrected` history events; leave earlier final sets unchanged.
2. State the rule in `docs/stimulus-concepts.md` and replace the single-board-computer borderline concept with a children's toy laptop.
3. Search for a toy laptop photograph; failing that, generate one, review it at tile size, register and standardise it.
4. Record C10@3 with the toy laptop as the borderline case, publish it, update the computers review document and the counts in `stimuli/README.md`, `stimuli/SOURCES.md` and `docs-dev/planning/current_state.md`, and deploy.

## Do not implement

- No changes to other themes.

## Acceptance criteria

The task is complete when:
- Every published computers tile that contains a computer is a target, no screen on its own is a target, and the live game serves C10 version 3.
- `npm run check` and the end-to-end tests pass.

## Checks

Run `npm run gallery:collection`, `npm run validate:collection`, `npm run check` and `npm run test:e2e`.

## Commit and push

If and only if the scope was followed and checks pass, create one commit on `main` using this file's exact filename (`042_computers_contain_a_computer.md`) as the commit message, then push.

Do not commit or push partially completed work unless explicitly instructed.

## Final report

End with the required final report specified in `AGENTS.md`, including the completed checklists.
