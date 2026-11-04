# Task: Complete viewport verification and deployment

## Goal

Finish the clearer definition review and the design without scrollbars authorised by the owner.

## Required changes

- Resolve the unreachable last reading page found by the new report pagination checks.
- Resolve any remaining short-screen overflow or existing browser regression failures without removing their assertions.
- Preserve scoring, session records, privacy, mode separation and all image assets.
- Remove temporary manual QA fixtures before delivery.

## Checks and delivery

Run `npm run check`, `git diff --check`, all 57 game browser checks including Firefox, and all seven gated eye-tracking checks. Use the equivalent local browser suites if hosted jobs remain queued. Retain the explicit portrait and landscape page-navigation assertions. Commit and push directly to main as `049_complete_viewport_verification.md`. Deploy through the existing workflow only after checks pass and verify the live build.
