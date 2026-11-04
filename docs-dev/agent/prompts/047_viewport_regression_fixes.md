# Task: Resolve viewport regression checks

## Goal

Complete the browser verification for `046_viewport_layout_and_clear_review.md` before deployment.

## Required changes

- Keep page navigation from moving an already visible control during pointer activation, preserving copy and export actions.
- Let long report verdicts and decision text fragment into reading pages rather than overflow a short viewport; preserve dialog padding in Firefox.
- Keep the house question whole and group it with concise answer controls on phone portrait screens.
- Keep the optional calibration grid in the same fixed-screen structure as assessment grids; scope container-relative grid sizing to that structure.
- Preserve all existing scoring, records, privacy controls, image assets and mode isolation.

## Checks and delivery

Run `npm run check`, `git diff --check`, the complete game browser suite and the optional eye-tracking regression suite. Verify portrait/landscape reading, copy/export actions and page controls. Commit and push directly to main as `047_viewport_regression_fixes.md`, deploy through the existing workflow after checks pass and verify the live build.
