# Task: Exercise visible controls in paginated browser tests

## Goal

Complete verification of the viewport design using the app's keyboard navigation before clicking controls on later reading pages.

## Required changes

- Use native focus to reveal reading-page controls, assert that they are fully within the viewport, then exercise their pointer click handlers.
- Apply this navigation to the existing copy, export and reading-screen actions in the game and optional preview tests. Preserve all assertions about scores, records, privacy, downloads and camera release.
- Keep the explicit Previous/Next page and viewport containment tests.

## Checks and delivery

Run `npm run check`, `git diff --check` and the complete CI browser suites. Commit and push directly to main as `048_paginated_test_navigation.md`. Deploy only after successful checks and verify the live page.
