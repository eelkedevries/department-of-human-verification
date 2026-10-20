# Task: Version 1 end-to-end verification

## Goal

Verify the version 1 acceptance criteria in real browsers with automated end-to-end tests.

## Scope

Implement only the work described in this prompt. Do not implement adjacent systems or future prompts.

## Required changes

1. Playwright tests against the production build (`vite preview`) for Chromium desktop, Chromium on a phone profile (Pixel 7) and, where a Playwright Firefox build is installed (`E2E_FIREFOX=1`), Firefox desktop:
   - five correct rounds, report and a replay that draws the other grid in every family;
   - partial, wrong and empty answers, single-selection replacement, explanations;
   - keyboard-only play, digit keys;
   - timeout (with a controlled clock) and the untimed option;
   - developer export only with `?dev`, with a complete log;
   - reproducible layouts from a fixed seed;
   - no answer-revealing markup;
   - reduced motion;
   - no horizontal overflow at desktop or phone width;
   - no camera request, no storage writes, no cookies, and only same-origin GET requests;
   - axe-core WCAG 2.2 A/AA checks on every screen.
2. A CI job that runs the end-to-end tests on Chromium and Firefox.

## Do not implement

- Changes to game behaviour, except fixes for defects the tests reveal.

## Acceptance criteria

The task is complete when all end-to-end tests pass locally on Chromium desktop and mobile and on Firefox desktop, and `npm run check` passes.

## Checks

`npm run check`; `npm run test:e2e` (with `E2E_FIREFOX=1` where Firefox is installed).

## Commit and push

If and only if the scope was followed and checks pass, create one commit on `main` using this file's exact filename (`004_v1_verification.md`) as the commit message, then push.

## Final report

End with the required final report specified in `AGENTS.md`.
