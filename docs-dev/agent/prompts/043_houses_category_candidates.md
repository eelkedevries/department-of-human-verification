# Task: Record the requested houses category additions

## Goal

Extend the houses candidate concepts with a shelled snail, treehouse, toy-sized dollhouse and residential houseboat while accurately recording existing image availability.

## Scope

Implement only the work described in this prompt. This is a concept-documentation change, not an image-production or publishing task.

## Context

The owner requested these additions on 4 November 2026. Interpret “house boot” as “houseboat” and state that assumption. Read the houses entries in `stimuli/catalogue.json`, `stimuli/raw/houses/review-2026-10-27.md`, `src/stimuli/catalogue.json` and `docs/stimulus-concepts.md` before adding duplicate concepts.

## Required changes

1. Add a houses extension beneath the twelve-item base table, preserving all existing ideas. Describe an ordinary snail's natural shell, a tree-supported house, an ordinary toy-sized dollhouse and a residential houseboat.
2. Record that a human-sized generated dollhouse already exists in the collection but is not in C05 version 1. Distinguish it from the new toy-sized candidate, and distinguish the snail from the existing hermit crab with a brick house.
3. Keep category treatments provisional until actual images are reviewed. Preserve the ordinary house instruction and unscored borderline judgements.
4. Record the owner-requested pool extension in the specification with a version increment and changelog entry. Update current state to show that image sourcing and a revised selection remain pending, without changing collection counts.

## Do not implement

- Do not search, generate, register, standardise or publish new images.
- Do not alter C05 version 1, other themes, scoring, the nine-image layout or eye-tracking.
- Do not deploy the game.

## Acceptance criteria

- All four requested concepts are explicitly recorded without duplicates or invented image availability.
- The existing human-sized dollhouse, hermit crab and house in boots retain their distinct identities.
- The specification and current state agree on the scope and pending image work.
- No source code, collection metadata or image files change.

## Checks

Run `npm run check` and `git diff --check`. Inspect the diff to confirm that only this prompt, `docs/stimulus-concepts.md`, the specification and current state changed. No new tests are required for this documentation change.

## Commit and push

If and only if the scope was followed and checks pass, create one commit on `main` using this exact filename (`043_houses_category_candidates.md`) as the commit message, then push.

Do not commit or push partially completed work unless explicitly instructed.

## Final report

End with the required final report specified in `AGENTS.md`. State clearly that these are candidate concepts and that no new images have been published.
