# Task: Version 1 deployment

## Goal

Publish version 1 at `https://eelkedevries.com/department-of-human-verification/` through the existing SiteGround deployment, verify it live, and list it on the website's Projects page.

## Scope

Implement only the work described in this prompt. Do not implement adjacent systems or future prompts.

## Required changes

In `eelkedevries/eelkedevries.com`:

1. A dedicated workflow, `deploy-department-of-human-verification.yml`, modelled on `deploy-eek-a-look.yml`: check out and build this repository, run its public-build check, reuse the site's SSH secrets, rsync **only** into `/department-of-human-verification/`, and verify from the origin that the live page serves this build's fingerprinted script. Triggered by `workflow_dispatch` and a `dhv-updated` repository dispatch; its own concurrency group.
2. `scripts/deploy.sh`: protect `/department-of-human-verification/***` from the main site's `rsync --delete-after`, as `/eek-a-look/***` is.
3. After the game is verified live: a Projects card linking the game and its source, marked as version 1 without eye-tracking.

In this repository:

4. `scripts/deploy.sh` and `npm run deploy`, as in eek-a-look: refuse to deploy uncommitted or unpushed work, dispatch the workflow, wait, and check the live URL.
5. `docs/deployment.md`.

## Do not implement

- Secrets in this repository.
- Any server-side code or storage (version 2, gated).

## Acceptance criteria

The task is complete when:
- the workflow run succeeds and its verification step confirms the live page serves the new build;
- the live page, a direct refresh and the stimulus images answer with HTTP 200 under the base path;
- a main-site deploy cannot delete the game;
- the Projects card is live and accurate.

## Checks

`npm run check`; the workflow's own verification; `curl` checks of the page, an asset and an image.

## Commit and push

If and only if the scope was followed and checks pass, create one commit on `main` using this file's exact filename (`005_v1_deployment.md`) as the commit message, then push. The eelkedevries.com changes are committed and pushed to its `main` in that repository's own style.

## Final report

End with the required final report specified in `AGENTS.md`.
