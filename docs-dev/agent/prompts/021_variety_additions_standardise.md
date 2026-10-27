# Task: Add varied photographs and standardise the suitable pool

## Goal

Find additional photographs that close the set-level variety shortfall (three-quarter views in settings other than walls), trying new sources where needed, and standardise every suitable photograph.

## Scope

Implement only the work described in this prompt. Do not implement adjacent systems or future prompts.

## Required changes

1. Search the registered sources and new ones (Openverse as an index, Flickr Creative Commons photographs) for clear three-quarter views in open settings; screen against the target clarity standard and the set-level variety targets.
2. Register each qualifying photograph as raw and suitable with a quick rights check on its own page, characteristics, a reviewed crop and `content_origin: photograph`, with history.
3. Add every new source to `stimuli/SOURCES.md` and update the entries of sources used or tried.
4. Standardise every suitable photograph without a standardised version using `tools/stimuli/standardise.py`, after inspection at 256 and 128 px.
5. Record the sources, queries, screening, new photographs and set-level counts in the dated review, and update every document that states collection counts.

## Do not implement

- No AI-generated or AI-edited images, no rejections of suitable images and no final sets.

## Acceptance criteria

The task is complete when:
- The new photographs are registered with verified rights and approved visual reviews, and their sources are documented.
- Every suitable photograph has an approved standardised version.
- Any remaining shortfall against the set-level variety targets is stated with the number of images still needed.
- `npm run validate:collection` and `npm run check` pass.

## Checks

Run `npm run gallery:collection`, `npm run validate:collection` and `npm run check`.

## Commit and push

If and only if the scope was followed and checks pass, create one commit on `main` using this file's exact filename (`021_variety_additions_standardise.md`) as the commit message, then push.

Do not commit or push partially completed work unless explicitly instructed.

## Final report

End with the required final report specified in `AGENTS.md`, including the completed checklists.
