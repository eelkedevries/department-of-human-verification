# Task: Standardise the suitable bicycle photographs

## Goal

Convert every suitable, rights-verified bicycle-theme photograph to the `webp-512-256-v1` game format.

## Scope

Implement only the work described in this prompt. Do not implement adjacent systems or future prompts.

## Required changes

1. Add `tools/stimuli/standardise.py`. For each suitable version of a theme without a standardised child, it downloads the recorded preview into the ignored `stimuli/.cache/`, checks it against the recorded preview hash, applies orientation, sRGB conversion and the recorded square crop, and writes 512 and 256 px RGB WebP files (quality 82, method 6, Lanczos) to `standardized/<theme>/`, plus a contact sheet for review. It registers the new versions only with an approved visual review supplied by the reviewer.
2. Standardise the twenty suitable bicycle photographs, inspect them at tile size, and register them in `catalogue.json`, the stage manifest and `history.jsonl`, with parents, crop, input dimensions/hash, operations, hashes, assessments and retained licence conditions.
3. Update the collection documentation, current state and the generated gallery.

## Do not implement

- No standardisation of the four raw-only photographs: their rights are unresolved.
- No upscaling, stretching, content changes, AI edits, final sets, game changes or deployment.
- No changes to the source (raw/suitable) version records.

## Acceptance criteria

The task is complete when:
- Twenty standardised versions exist, each with an opaque 512/256 px RGB WebP pair, a visually approved crop showing the whole object and its support, and complete provenance.
- `npm run validate:collection` and `npm run check` pass.

## Checks

Run `npm run gallery:collection`, `npm run validate:collection` and `npm run check`. Inspect every output at tile size.

## Commit and push

If and only if the scope was followed and checks pass, create one commit on `main` using this file's exact filename (`012_standardise_suitable_bicycles.md`) as the commit message, then push.

Do not commit or push partially completed work unless explicitly instructed.

## Final report

End with the required final report specified in `AGENTS.md`.
