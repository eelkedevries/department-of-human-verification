# Task: Browsable stimulus gallery on GitHub

## Goal

Let the owner browse the stimulus collection's images on github.com.

## Scope

Implement only the work described in this prompt. Do not implement adjacent systems or future prompts.

## Required changes

1. Add `scripts/build-stimulus-gallery.mjs`, which generates `stimuli/GALLERY.md` from `stimuli/catalogue.json` and the stage manifests. Per theme, show image grids for raw-only, suitable (by rank), standardised, manipulated and final versions, with short captions: description, object type, role, creator, licence and review status. Committed images are shown from the repository; linked photographs are shown from their recorded source URL and link to the publisher page.
2. Make the output deterministic. A `--check` mode fails when the committed gallery is stale; run it in `npm run check`. Add `npm run gallery:collection` to regenerate it.
3. Mention the gallery and its regeneration in `stimuli/README.md` and `stimuli/AGENTS.md`.

## Do not implement

- No interactive HTML viewer, filtering or deployment of the gallery.
- No committed third-party image bytes; linked photographs stay linked.
- No catalogue, stage manifest, history or game changes.

## Acceptance criteria

The task is complete when:
- `stimuli/GALLERY.md` renders on github.com with all collection images and correct captions.
- `npm run check` passes and fails when the gallery is stale.

## Checks

Run `npm run check`. Confirm the `--check` mode detects a stale gallery.

## Commit and push

If and only if the scope was followed and checks pass, create one commit on `main` using this file's exact filename (`011_stimulus_gallery.md`) as the commit message, then push.

Do not commit or push partially completed work unless explicitly instructed.

## Final report

End with the required final report specified in `AGENTS.md`, linking the gallery on GitHub.
