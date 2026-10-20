# Claude Code handoff — The Department of Human Verification

## Task
Implement **The Department of Human Verification**, a fictional bureaucratic CAPTCHA game, in the **existing public GitHub repository** `eelkedevries/department-of-human-verification` (do not create another repository). Publish the application under **https://eelkedevries.com/department-of-human-verification/** using the existing SiteGround/GitHub Actions deployment in `eelkedevries/eelkedevries.com`, not GitHub Pages.

**First read** `department_of_human_verification_implementation_brief.md`; then inspect all four images in `visual_references/`. The brief is the implementation contract; the pictures are *style and interaction concepts*, not valid production assets or experimental stimuli.

## Version contract — follow in this order

**V1 — polished game, no eye-tracking.** Complete a fully playable, accessible and responsive five-round, 3×3-grid CAPTCHA game with genuine independently selectable tiles, original or properly licensed stimulus images, time limits, scoring, dry departmental feedback, replay and a final *Human Verification Report*. Absolutely **no webcam request, calibration, gaze estimate, heatmap, tracking library or participant research upload in V1**. Provide local developer-only behavioural export for testing.

**Deploy and verify V1.** Reuse the main website's existing SiteGround secrets in a separate deployment workflow. Protect the new subdirectory from the main website's rsync `--delete-after`. Add a Projects-page entry only once the game is live, accurately marking V1. Check the live URL and asset paths. Keep V1 in a working, reviewable state.

**V2 — opt-in research experience.** Retain normal gameplay for users without cameras. Add explicit optional webcam access, face positioning, **calibration plus independent validation**, timestamped gaze measurement, condition assignment, per-tile attention analysis, and a personal *Your testimony / Your eyes / AI prediction* reveal only when eye-tracking quality permits. Later add consented, secure data collection and a research dashboard. Make research uploads **disabled by default until the owner has explicitly reviewed privacy, storage and consent**, and never claim webcam estimates are precise saccade measures without validation.

## Mock-up asset map

- `visual_references/overview.png` — combined three-panel reference.
- `visual_references/01_bicycles.png` — object recognition (select bicycles).
- `visual_references/02_job_interview.png` — semantic interpretation (job-interview animal).
- `visual_references/03_sitting.png` — functional judgement (objects for sitting).

**Crucial:** These are *not* ready-to-use game tiles: each panel is one flattened image. Build real HTML/CSS UI and independently selectable, rights-cleared images. The middle example has multiple dressed/accessorised animals and the right-hand instruction is deliberately ambiguous; improve these for objectively scored trials. Treat the examples as the aesthetic direction, not a strict pixel-perfect layout.

## Repository access

- **Write:** `eelkedevries/department-of-human-verification` and `eelkedevries/eelkedevries.com`.
- **Reference only:** `eelkedevries/eek-a-look` (prediction/visualisation approaches), `eelkedevries/eek-a-template` / `eek-a-dev` (project conventions). Do not alter these reference repositories.

Use the established British English, project scaffolding, numbered prompts and commit-to-`main` conventions. Implement in manageable, tested steps. Report what was implemented, what is deployed and verified, and any real blocker; do not fabricate successful camera tests, scientifically valid data or deployment results. Do not build the other two games.

