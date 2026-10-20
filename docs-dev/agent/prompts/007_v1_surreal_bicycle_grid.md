# Task: Publish the first surreal bicycle category grid

## Goal

Make the first nine-image “ordinary question, unreasonable objects” category-judgement grid playable, using the C01 bicycle concept as the pilot.

## Scope

Implement only the work described in this prompt. Do not implement adjacent systems or future prompts.

## Context

Read `docs/stimulus-concepts.md` (C01 and the editorial filter), `docs/stimuli.md` (creative-direction and photography sections), and the binding `docs-dev/reference/primary_authoritative/specification.md`. Existing G01 is the live fallback and must stay playable until a complete, reviewed replacement exists. The scoring and publishing pipeline already support `borderline` roles.

## Required changes

1. Design nine individually rendered and source-tracked photographs for a bicycle grid: two ordinary clear bicycles, two visually absurd but recognisable bicycles, three defensible borderline cases (stationary exercise bike, pedal-powered horse, pedal-powered office chair), and two clear non-members (e.g. rocking horse, motorcycle). Keep the stationary exercise bike a conventional, clearly recognisable fitness machine.
2. Preserve the utterly ordinary instruction “Select all images containing a bicycle.” Use multiple selection and `research_class: "category_judgement"`. Provide accurate source labels, `target` / `borderline` / `distractor` roles, prompts, seeds, licence/provenance, a clear but playful explanation, and several outcome-appropriate dry feedback lines that do not declare ambiguous judgements wrong.
3. Plan colour, facing direction, viewpoint and scene variety **across all candidate images**, following the C01 shot plan in `docs/stimuli.md`; avoid a grid of predominantly black objects viewed side-on. Retain enough similar lighting, scale and detail that viewpoint or colour does not reveal category role. Ensure bizarre members meet the stronger visual-humour threshold (clearly impossible, not just impractical product design), borderline cases actually challenge category membership, and each gag is readable at tile size without captions. Render the assets using the existing pipeline and review all nine images manually (or record clearly why publication cannot proceed); verify category legibility and ambiguity at the actual displayed tile size. Do not label an image “borderline” merely because it is bizarre.
4. Publish only a complete, verified grid; never flip `published` on an incomplete set. Keep the old G01 playable as fallback during the transition, including for session randomisation.
5. Confirm that a player's selection of a borderline image appears as “Judgement noted” and never as a false alarm, and that the counted images exclude borderline tiles.
6. Update the public stimulus documentation and current state to reflect exactly which candidate images actually exist.

## Do not implement

Do not implement:
- the other 14 candidate grids;
- webcam tracking or version 2 experimental conditions;
- remote analytics, accounts, or participant research collection;
- new dependencies, hosting services, or copyrighted television stills;
- any unapproved changes to scoring, accessibility or the existing live grid.

## Acceptance criteria

The task is complete when:
- the published grid contains nine separately reviewed original assets with defensible clear/borderline roles, legible absurdities that are more than novelty design, and an intentional mix of natural object colours and camera perspectives;
- the ordinary instruction and multi-select controls work in browser;
- borderline choices are preserved but not scored as errors;
- the previous G01 can still be played;
- the catalogue validator and other checks pass.

## Checks

Run `npm run check` and `npm run test:e2e`. Manually preview the result before publishing. Only deploy if the reviewed assets and both checks are satisfactory; report clearly if live deployment has not happened.

## Commit and push

If and only if the scope was followed and checks pass, create one commit on `main` using this file's exact filename (`007_v1_surreal_bicycle_grid.md`) as the commit message, then push.

Do not commit or push partially completed work unless explicitly instructed.

## Final report

End with the required final report specified in `AGENTS.md`.
