# Task: Project scaffold and binding specification

## Goal

Initialise the existing, empty `eelkedevries/department-of-human-verification` repository from `eek-a-template` and record the version 1 / version 2 contract as the binding specification.

## Scope

Implement only the work described in this prompt. Do not implement adjacent systems or future prompts.

## Context

The owner's handoff of 20 October 2026 (`docs-dev/reference/secondary_background/`) asks for a polished CAPTCHA-style game in two releases: version 1 without any eye-tracking, deployed and verified first; version 2 with optional, consented webcam eye-tracking later. The repository already exists and is public.

## Required changes

1. Scaffold with Copier from `gh:eelkedevries/eek-a-template` (stack `node-vite + typescript`, public, static site, commit-to-`main`).
2. Remove the templated GitHub Pages workflow: the site is hosted on SiteGround under eelkedevries.com.
3. Add a minimal Vite + TypeScript entry with base path `/department-of-human-verification/`, and `npm run check` (type-check, build, public-build check, prompt validation).
4. Write the binding specification (scope, architecture, schemas, domain rules, voice, locked decisions), `docs-dev/plan.md` with the prompt sequence and release gates, and `current_state.md`.
5. Keep the owner's brief, handoff notes and concept panels in `docs-dev/reference/secondary_background/` as non-binding background.

## Do not implement

- Game screens, stimuli or scoring (prompts 002–003).
- Deployment (prompt 005).
- Anything for version 2.

## Acceptance criteria

The task is complete when:
- `npm ci` and `npm run check` pass on a clean checkout;
- the specification records the version 1 exclusions (no camera, tracking, gaze display or data transmission) and the version 2 gates;
- no GitHub Pages workflow remains.

## Checks

`npm ci && npm run check`.

## Commit and push

If and only if the scope was followed and checks pass, create one commit on `main` using this file's exact filename (`001_setup.md`) as the commit message, then push.

## Final report

End with the required final report specified in `AGENTS.md`.
