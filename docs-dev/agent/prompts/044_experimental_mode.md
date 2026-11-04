# Task: Add Standard and Experimental game modes

## Goal

Keep the existing game as Standard and implement the six proposed gameplay elements in a separately selectable Experimental mode.

## Scope

The owner explicitly requested implementation on 4 November 2026. Implement the mode as one complete, reviewable feature, including its documentation, tests and deployment.

## Required changes

1. Offer Standard and Experimental on the first screen, with Standard selected by default. Preserve Standard selection, scoring, timing, feedback and replay behaviour.
2. Give Experimental five ordered assessment stages using existing published grids and seeded layouts, ending with the houses grid. Add truthful callbacks to earlier decisions.
3. Add a personal record of actual borderline choices. After the assessments, offer a skippable, unscored definition challenge which cites an earlier choice as a precedent, followed by one optional appeal. Keep original responses immutable and show subsequent decisions separately.
4. Add explicit case-only and comparison links for Experimental. Pin the seed, grid versions/hashes, mode and timing. Comparison links intentionally include original selections, concealed in the interface until completion. Reject malformed or unavailable cases clearly. Do not add a backend, automatic submission or persistent storage.
5. Keep all interactions accessible by keyboard and on a phone. Preserve untimed play and reduced motion. Experimental uses ordinary play, not the separately gated eye-tracking preview.
6. Update the specification, current state and public documentation. Add meaningful unit and end-to-end coverage for mode isolation, review/appeal, link validation, reproducibility, blind comparisons and accessibility.

## Do not implement

- No new stimulus images, collection changes, crowd statistics, live AI, accounts or research uploads.
- No changes to Standard answer keys or fictional verdict thresholds.

## Acceptance criteria

- Either mode can be selected before play; replay retains the mode and changing mode returns to the selector.
- Standard's existing tests pass with only navigation adjustments required by the new selector.
- Experimental shows five distinct staged grids, actual personal decisions, the definition review, one optional appeal and an accurate final record.
- A shared case reproduces all five grids and layouts, or displays a clear unavailable-case message; reference answers do not appear before the recipient completes the assessments.
- Reviews and appeals do not change the original trials or clear-cut score.
- `npm run check`, relevant end-to-end tests and responsive layout checks pass, with a visual inspection of the available preview.

## Checks

Run `npm run check`, `git diff --check` and the Standard and Experimental end-to-end tests. Check the first screen, review, appeal and report, including desktop and phone layout checks. If the managed preview cannot be reached by the local test runner, complete interactive preview checks and run the end-to-end suite through the existing repository CI after pushing. Verify no camera, persistent storage or answer submission is added.

## Commit and push

After passing available local checks, commit on `main` using `044_experimental_mode.md` as the message and push. Check CI before deploying through the existing SiteGround workflow, and verify its result. Do not create a replacement hosting project.

## Final report

Report the implemented features, validation, commit, deployment result and any remaining limitation.
