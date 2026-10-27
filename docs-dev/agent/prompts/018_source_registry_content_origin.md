# Task: Source registry and content-origin tag

## Goal

Document where stimulus images are found and keep that registry current, and tag every image version with how its pixels came about.

## Scope

Implement only the work described in this prompt. Do not implement adjacent systems or future prompts.

## Required changes

1. Add `stimuli/SOURCES.md`, a registry of evaluated, unusable and candidate image sources, with access from agent sessions, licence model, verification route, pitfalls, yield and the date last checked, plus the generated and edited routes.
2. Make the registry consistently used: require it in the root and collection agent instructions, the guidelines and the checklists (read before searching, update before finishing when a source proves useful or unusable). The collection validator rejects any catalogue provider without an evaluated entry.
3. Add the version-level `content_origin` tag (`photograph`, `ai-edited-photograph`, `ai-generated`) to the vocabulary, every existing version and the standardisation tool. The validator derives the expected value from the lineage; show it in the gallery and document it.
4. Record both decisions in the specification and current state.

## Do not implement

- No new searches, images or source evaluations beyond those already recorded.
- No changes to selections, reviews or the game.

## Acceptance criteria

The task is complete when:
- Every catalogue provider has an evaluated entry in `stimuli/SOURCES.md`, and an undocumented provider fails validation.
- Every version has a `content_origin` that matches its lineage, and a mismatch fails validation.
- `npm run check` passes.

## Checks

Run `npm run gallery:collection`, `npm run validate:collection` and `npm run check`. Confirm that both new checks reject a deliberately wrong record.

## Commit and push

If and only if the scope was followed and checks pass, create one commit on `main` using this file's exact filename (`018_source_registry_content_origin.md`) as the commit message, then push.

Do not commit or push partially completed work unless explicitly instructed.

## Final report

End with the required final report specified in `AGENTS.md`, including the completed checklists.
