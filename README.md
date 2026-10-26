# The Department of Human Verification

*Humanity cannot be self-certified.*

A fictional, excessively bureaucratic agency would like you to prove that you are human. Five short image assessments are marked with deadpan severity, and the Department issues its verdict in a *Human Verification Report*. For now the Department owns a single set of images, bicycles, which it shows five times in a different order; more are drafted.

**Live:** <https://eelkedevries.com/department-of-human-verification/> (version 1).

It is a game. The Department does not exist, its verdicts mean nothing, and it is not affiliated with any government, authority or verification service.

## New stimulus direction: normal questions, unreasonable objects

The Department asks ordinary multiple-choice CAPTCHA questions, but its images will mix normal members of a category with surreal versions and borderline cases: a square-wheeled bicycle, an exercise machine or a horse furnished with pedals. The interesting answer is sometimes a judgement, not a mistake. The game now supports recording borderline selections without scoring them as right or wrong. See the [15-grid candidate table](docs/stimulus-concepts.md).

**Status:** The new catalogue consists of ideas, not rendered assets. Only the original bicycle grid is live; the other legacy drafts must be replaced and reviewed before publication. No camera or research collection is added to version 1.

## Versions

- **Version 1 (current):** the complete game. Five timed rounds of nine images, feedback after each, a final report, and replay in a new order. **No eye-tracking:** it never asks for a camera, sets no cookies, stores nothing and sends nothing anywhere.
- **Version 2 (preview, not deployed):** an optional, clearly explained *Play with eye-tracking* mode for research — consent, calibration and validation first, a personal gaze reveal only when the measurement is good enough, and the ordinary game unchanged for everyone else. It exists only in builds made with `VITE_EYE_TRACKING=1` and waits on a licence decision and tests with a real webcam. Research data collection will stay switched off until its privacy, storage and consent arrangements have been approved. See [`docs-dev/planning/v2_notes.md`](docs-dev/planning/v2_notes.md).

## The images

The images were generated for this game with FLUX.2 [klein] 4B (Apache 2.0) from written prompts and fixed seeds, checked by eye, and published with their provenance in [`src/stimuli/catalogue.json`](src/stimuli/catalogue.json). Nine more grids are drafted and can be published one at a time. See [`docs/stimuli.md`](docs/stimuli.md).

The [stimulus collection](stimuli/README.md) organises source candidates, suitable selections, standardised files, AI-edited variants and versioned final sets. It currently includes 24 linked raw photographs, a ranked selection of 20 with individual rights checks completed, and a byte-identical snapshot of the existing G01 selection. Four unresolved originals remain raw only. It does not change the live game. AI agents must follow [the collection instructions](stimuli/AGENTS.md), including automatic rights verification during every search.

## Development

Vite and TypeScript, built as a static site with no runtime framework and no third-party requests.

```bash
npm ci            # exact dependencies from the lockfile
npm run dev       # development server at http://localhost:5173/department-of-human-verification/
npm run check     # type-check, stimulus validation, unit tests, build and safety checks
npm run validate:collection  # source/version metadata, stage manifests, logs and stored image files
npm run test:e2e  # end-to-end tests in Chromium (desktop and phone); E2E_FIREFOX=1 adds Firefox
npm run test:e2e:eyetracking  # the eye-tracking preview, with a fake camera (code paths only)
npm run deploy    # publish what is on GitHub to eelkedevries.com (see docs/deployment.md)
```

User documentation is in [`docs/`](docs/). The development workflow, specification and plan are in [`docs-dev/`](docs-dev/): start with [`docs-dev/plan.md`](docs-dev/plan.md) and [`docs-dev/reference/primary_authoritative/specification.md`](docs-dev/reference/primary_authoritative/specification.md).

This repository follows the `eek-a-dev` workflow: numbered prompts in `docs-dev/agent/prompts/`, one commit per prompt, pushed directly to `main`.

## Hosting

Served from SiteGround under eelkedevries.com. The deploy workflow lives in the [eelkedevries.com repository](https://github.com/eelkedevries/eelkedevries.com), which holds the credentials; this repository holds none.

## Licence

Licensed under the GNU General Public License, version 3 or (at your option) any later version; see [`LICENSE`](LICENSE). Unless stated otherwise, this covers the code, documentation and existing generated images, whose provenance is recorded in the catalogue. Third-party source photographs and their derivatives retain the licences and conditions recorded for each asset in [`stimuli/catalogue.json`](stimuli/catalogue.json); linking or importing them does not relicense them under the GPL. The eye-tracking preview uses [WebGazer](https://github.com/brownhci/WebGazer), which is licensed the same way.
