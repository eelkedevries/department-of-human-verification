# Task: AI image tools and first concept-pool photographs

## Goal

Equip the stimulus collection to register, render, standardise, finalise and publish AI-edited and AI-generated images, and register the first photographs for the concept pools.

## Scope

Implement only the work described in this prompt. Do not implement adjacent systems or future prompts.

## Required changes

1. Add `tools/stimuli/register.py` (photographs, AI masters, withdrawals), `tools/stimuli/manipulate.py` (local FLUX.2 [klein] 4B edits and generations), `tools/stimuli/finalise.py` (final sets) and `tools/stimuli/publish.py` (final sets to the game); let `standardise.py` read stored masters; mark the legacy `build.py` superseded.
2. Accept fully generated images in the validator (a `generation` operation on parentless manipulated versions of generated assets) and document the generator in `SOURCES.md`.
3. Register the bicycle pool's exercise bike, rocking horse and kick scooter, the first AI images (angular-wheeled bicycle edit, pedal horse), and rights-checked photographs for clocks, boats, vehicles and hats; standardise them.

## Do not implement

- No final sets and no change to the live game catalogue in this prompt.

## Acceptance criteria

The task is complete when:
- The new versions validate, with provenance, reviews and history.
- `npm run validate:collection` and `npm run check` pass.

## Checks

Run `npm run gallery:collection`, `npm run validate:collection` and `npm run check`.

## Commit and push

If and only if the scope was followed and checks pass, create one commit on `main` using this file's exact filename (`023_ai_image_tools_and_theme_photos.md`) as the commit message, then push.

Do not commit or push partially completed work unless explicitly instructed.

## Final report

End with the required final report specified in `AGENTS.md`, including the completed checklists.
