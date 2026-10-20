# Task: Stimulus library with provenance

## Goal

Create the stimulus pipeline, catalogue and validator, and publish the first 3 × 3 grid (bicycles) as original, rights-cleared images with answer keys and provenance. Draft nine more grids, two per family in all, for later publication.

## Scope

Implement only the work described in this prompt. Do not implement adjacent systems or future prompts.

## Context

The concept panels are flattened mock-ups and must not be cropped or used as stimuli. Two of their answers are ambiguous (several accessorised animals; "could reasonably sit on"); the brief asks for fair, transparent answer keys instead.

The hosted GPU route ran out of free quota after three images, and local rendering on the CPU takes about 2.5 minutes per image. The owner therefore decided (20 October 2026) to launch with a single grid shown in all five rounds, and to publish the others later.

## Required changes

1. `tools/stimuli/source.json`: ten grids, each marked `published` or not (only G01 at first); for each grid, the instruction, selection mode, hint, explanation, feedback lines, difficulty, research class, direct and semantic instruction variants where they apply, operational definitions for the absurd grids, and for each tile a label, role, prompt and seed.
2. `tools/stimuli/generate.py`: render every tile locally with FLUX.2 [klein] 4B (Apache-2.0) from its prompt and fixed seed, recording a sidecar with model revision, settings and software versions.
3. `tools/stimuli/review.py`: contact sheets for checking every render by eye. Re-render (new seed or clearer prompt) any tile that does not show its label, or any distractor that could satisfy the instruction.
4. `tools/stimuli/build.py`: publish 512 and 256 pixel WebP files under opaque content-hash names in `public/stimuli/`, and write `src/stimuli/catalogue.json` with tile hashes, alternative text, provenance, answer keys and a grid hash.
5. `scripts/validate-stimuli.mjs`, run by `npm run check`: at least one grid, nine tiles per grid, valid answer keys (exactly one for single-selection grids), files present with recorded hashes and dimensions, approved licences, provenance complete, opaque file names, no revealing alternative text, no orphaned files.
6. `docs/stimuli.md`: the pool, the answer rules and how to add a grid.

## Do not implement

- The game itself (prompt 003).
- Version 2 condition assignment.

## Acceptance criteria

The task is complete when:
- every published tile has been checked by eye and shows its label;
- no distractor satisfies its grid's instruction, and each single-selection grid has one defensible answer;
- `npm run check` passes, including the stimulus validator.

## Checks

`npm run check`; review the contact sheet of every published grid.

## Commit and push

If and only if the scope was followed and checks pass, create one commit on `main` using this file's exact filename (`002_stimulus_library.md`) as the commit message, then push.

## Final report

End with the required final report specified in `AGENTS.md`.
