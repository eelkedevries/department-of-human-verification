# Task: Fit the game to its viewport and clarify the house review

## Goal

Apply the owner's feedback of 4 November 2026: make the definition review explicit and ensure the app never requires horizontal or vertical scrollbars.

## Required changes

- Keep the complete image grid and assessment controls together within the visible viewport. Adapt to phone portrait and short landscape windows without changing scoring or timers.
- Paginate longer instructions, reviews, reports, About text and image credits with accessible Previous/Next controls. Preserve all content and native form state. Do not merely hide overflowing content.
- Keep feedback compact and make its full explanation available in a paginated dialog.
- Explain the review as two actions: choose a definition of house, then judge the named object using that definition. Use explicit yes/no/undecided buttons and describe the earlier answer plainly.
- Update the specification, usage notes and existing browser checks. Add focused coverage for viewport containment, page navigation and the revised question.

## Checks and delivery

Run `npm run check`, `git diff --check` and the repository CI browser suites, including desktop, phone and Firefox. Check representative small portrait and landscape sizes and long content. Verify that every assessment tile and its controls remain accessible. Commit and push directly to main as `046_viewport_layout_and_clear_review.md`, deploy through the existing workflow and verify the live build.
