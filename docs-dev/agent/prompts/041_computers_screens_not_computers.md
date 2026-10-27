# Task: Computers theme — a screen is not a computer

## Goal

Correct the computers theme after the owner's ruling that computer screens are not computers: fix the concept table and every assessment that treated a screen as a computer, redo the image search and the impossible computers, and replace the published grid.

## Scope

Implement only the work described in this prompt. Do not implement adjacent systems or future prompts.

## Required changes

1. Rewrite the computers row of `docs/stimulus-concepts.md` so that impossible computers show the computer itself (laptop, tablet or tower), replace the typewriter-with-touchscreen borderline concept with a bare single-board computer, and state the rule.
2. Reassess the collection's computer images (standalone monitor: non-member; all-in-ones: debatable; typewriter carrying a tablet: target), with `corrected` history events; leave final set C10@1 unchanged and supersede it.
3. Search again and register clarity-screened, rights-checked photographs of a laptop, a desktop tower and a single-board computer; make the impossible computers by editing laptop and tower photographs and by generation, and review every render at tile size.
4. Record C10@2, publish it, rewrite the computers review document, and update the counts in `stimuli/README.md`, `stimuli/SOURCES.md` and `docs-dev/planning/current_state.md`.
5. Deploy and check the live page.

## Do not implement

- No changes to other themes.

## Acceptance criteria

The task is complete when:
- No published computers tile counts a screen on its own as a computer, and the live game serves C10 version 2.
- `npm run check` and the end-to-end tests pass.

## Checks

Run `npm run gallery:collection`, `npm run validate:collection`, `npm run check` and `npm run test:e2e`.

## Commit and push

If and only if the scope was followed and checks pass, create one commit on `main` using this file's exact filename (`041_computers_screens_not_computers.md`) as the commit message, then push.

Do not commit or push partially completed work unless explicitly instructed.

## Final report

End with the required final report specified in `AGENTS.md`, including the completed checklists.
