# Task: Remove stimuli below the target clarity standard

## Goal

Keep only the bicycle-theme photographs that fully meet the target clarity standard.

## Scope

Implement only the work described in this prompt. Do not implement adjacent systems or future prompts.

## Required changes

1. Reject every photograph that fails or only nearly meets the target clarity standard: remove the sixteen affected versions from `suitable`, and record a rejected visual review with the clarity reason on them and on the four raw-only photographs. Keep raw source records and history, so that the photographs are not added again.
2. Withdraw the sixteen standardised derivatives of the rejected photographs and delete their files. Add a withdrawal state for unused processed versions: no levels or files, the removed file records, a stamped reason and a `withdrawn` history event. Final-set versions cannot be withdrawn. Enforce this in the collection validator, and let the standardisation tool choose an unused version number.
3. Show rejected photographs in the gallery only as a collapsed, linked list. Update the collection documentation, current state and specification.

## Do not implement

- No new searches, re-crops or replacement images.
- No changes to the four passing photographs, the final G01 snapshot or the game.
- No deletion of raw source records or rewriting of history.

## Acceptance criteria

The task is complete when:
- Suitable and standardised each contain only the four passing photographs: the motor scooter, skateboard, cream bicycle and red city bicycle.
- The twenty rejected photographs remain traceable as rejected raw records with their reasons, and the sixteen withdrawn derivatives keep their identity, parents and removed hashes.
- `npm run validate:collection` and `npm run check` pass.

## Checks

Run `npm run gallery:collection`, `npm run validate:collection` and `npm run check`.

## Commit and push

If and only if the scope was followed and checks pass, create one commit on `main` using this file's exact filename (`014_remove_suboptimal_stimuli.md`) as the commit message, then push.

Do not commit or push partially completed work unless explicitly instructed.

## Final report

End with the required final report specified in `AGENTS.md`.
