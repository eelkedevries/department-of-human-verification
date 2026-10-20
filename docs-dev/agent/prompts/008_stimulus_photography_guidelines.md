# Task: Document natural, consistent stimulus photography

## Goal

Specify consistent, realistic, context-appropriate photographic backgrounds and composition for future stimuli without changing the live game or image-generation code.

## Scope

Implement only the documentation of stimulus-generation rules and references to it.

## Context

The owner has approved the recommendations for natural settings, consistent framing and lighting, object-centred humour, C01 background suggestions, and manual review. The existing implemented generator remains at 512 × 512 px, with 512/256 px published WebP files; do not silently replace it with the previously suggested 1024 px master.

## Required changes

1. Add a practical `Stimulus photography and background guidelines` section to `docs/stimuli.md`: natural, object-appropriate environments, low/moderate clutter, lighting, viewing angle, object prominence, image consistency, incidental cues, negative prompt constraints, provenance, implemented dimensions, and review checklist.
2. Specify an appropriate background for each of the nine C01 bicycle candidate images.
3. Add a concise cross-reference near the top of `docs/stimulus-concepts.md`, without rewriting the 15-row concept table.
4. Reflect this approved photographic direction in the binding `specification.md` (version bump and changelog) and the high-level current-state file.
5. Keep code, assets, deployed pages, existing published stimuli, and version 2 entirely unchanged.

## Do not implement

Do not generate images, change the FLUX.2 pipeline, alter the live images or scoring, implement eye-tracking, add tests, or deploy.

## Acceptance criteria

- The main guideline section and its short cross-reference both exist with working relative Markdown links.
- C01 has nine explicit environments.
- The specification documents the approved default and matches the implementation's existing dimensions.
- Source code and published images are untouched.

## Checks

Inspect the changed Markdown sections, their links and the diff. This is documentation-only; the repository's normal GitHub CI remains the authoritative complete `npm run check` after push.

## Commit and push

If the scope and checks pass, commit directly to `main` with this exact filename as commit message (`008_stimulus_photography_guidelines.md`) and push.

## Final report

End with the five-section report required by `AGENTS.md`.
