# Deployment

The game is served at <https://eelkedevries.com/department-of-human-verification/>.

## How to deploy

Push to `main`, then run:

```bash
npm run deploy
```

This starts the workflow
[`deploy-department-of-human-verification.yml`](https://github.com/eelkedevries/eelkedevries.com/actions/workflows/deploy-department-of-human-verification.yml)
in the eelkedevries.com repository. That workflow checks out this repository from GitHub, builds it, runs the stimulus validator and the public-build check, and copies the build into `/department-of-human-verification/` on the web host. It then confirms, from the host itself, that the live page serves the new build's script and that a stimulus image loads. The command waits for the run and checks that the live page answers.

Without a terminal, use **Run workflow** on that page instead.

## Things to know

- **A push alone does not deploy.** The workflow builds what is on GitHub, so `npm run deploy` refuses to run with uncommitted or unpushed changes.
- **No secrets live in this repository.** The SSH secrets belong to the eelkedevries.com repository.
- **The main site cannot delete the game.** The site's own deploy (`scripts/deploy.sh` in eelkedevries.com) protects `/department-of-human-verification/***` from its `rsync --delete-after`, and this game's workflow writes nowhere else.
- **Caching.** The host's `.htaccess` stops browsers caching HTML, while scripts, styles and images have content-hashed names, so a new deploy is visible on the next page load.
- **Time-outs:** the host sometimes blocks GitHub's runners for a few minutes. `npm run deploy` re-runs a deploy that failed at *Test SSH connectivity* up to three times. Background is in the eelkedevries.com README, under *Deploy reliability*.
- **Version 2 research storage**, when it exists, must live outside the public document root, where neither deploy can reach it.

## Checking the live site

The end-to-end tests run against any deployed copy when `E2E_BASE_URL` is set:

```bash
E2E_BASE_URL=https://eelkedevries.com/department-of-human-verification/ npm run test:e2e
```
