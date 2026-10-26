# Task: Target clarity standard for image searches

## Goal

Make image searches select photographs in which the object is as immediately clear as a dominant, unobstructed, well-contrasted near-profile subject.

## Scope

Implement only the work described in this prompt. Do not implement adjacent systems or future prompts.

## Required changes

1. Add a measurable target clarity standard to the photography guidelines in `docs/stimuli.md`: one dominant object, its size and position in the square crop, view, obstruction, figure–ground contrast, focus and light, and recognisability at tile size. It applies to all roles. Make variety in angle subordinate to it, and add it to the search checks and the manual review.
2. Make clarity screening part of the search procedure in `stimuli/AGENTS.md`: screen before rights checks, plan the crop during the search, record the clarity assessment, and keep searching rather than accepting a weaker image.
3. Record the decision in the specification, with a version bump and changelog entry.

## Do not implement

- No reference to the existing legacy final set.
- No changes to catalogue records, existing reviews, images, the validator or the game.
- No new searches.

## Acceptance criteria

The task is complete when:
- The guidelines and agent instructions state concrete clarity criteria that a searcher can apply at thumbnail and crop stage.
- No guide refers to the legacy set as the benchmark.
- `npm run check` passes.

## Checks

Run `npm run check`.

## Commit and push

If and only if the scope was followed and checks pass, create one commit on `main` using this file's exact filename (`013_target_clarity_search_standard.md`) as the commit message, then push.

Do not commit or push partially completed work unless explicitly instructed.

## Final report

End with the required final report specified in `AGENTS.md`.
