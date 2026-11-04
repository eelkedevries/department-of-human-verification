# Task: Keep the house review together where space permits

## Goal

Complete visual QA of the clearer review and viewport design.

## Required changes

- Reduce excess picture height and spacing in the definition review so the image, definitions and answers share a desktop reading page when they fit.
- Preserve explicit reading pages on smaller screens, every choice and all image descriptions.
- Resolve any persistent browser-layout failure found by the complete checks without hiding content or removing assertions.

## Checks and delivery

Run `npm run check`, `git diff --check`, the complete game browser suite including Firefox on CI, and the seven optional preview regression checks. Check the review visually. Commit and push directly to main as `050_review_spacing_and_final_browser_check.md`. Deploy the ordinary game through its existing workflow after successful checks and verify the live build.
