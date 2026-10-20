# The Department of Human Verification

*Humanity cannot be self-certified.*

A fictional, excessively bureaucratic agency would like you to prove that you are human. Five short image assessments — bicycles, interview attire, fruit, furniture and one suspicious duck — are marked with deadpan severity, and the Department issues its verdict in a *Human Verification Report*.

**Planned address:** <https://eelkedevries.com/department-of-human-verification/> (not yet live).

It is a game. The Department does not exist, its verdicts mean nothing, and it is not affiliated with any government, authority or verification service.

## Versions

- **Version 1 (in development):** the complete game. Five timed rounds of nine images, feedback after each, a final report, and replay with different grids. **No eye-tracking:** it never asks for a camera, sets no cookies, stores nothing and sends nothing anywhere.
- **Version 2 (planned):** an optional, clearly explained *Play with eye-tracking* mode for research — consent, calibration and validation first, a personal gaze reveal only when the measurement is good enough, and the ordinary game unchanged for everyone else. Research data collection will stay switched off until its privacy, storage and consent arrangements have been approved. See [`docs-dev/plan.md`](docs-dev/plan.md).

## Development

Vite and TypeScript, built as a static site with no runtime framework and no third-party requests.

```bash
npm ci            # exact dependencies from the lockfile
npm run dev       # development server at http://localhost:5173/department-of-human-verification/
npm run check     # type-check, build and safety checks
```

The development workflow, specification and plan are in [`docs-dev/`](docs-dev/): start with [`docs-dev/plan.md`](docs-dev/plan.md) and [`docs-dev/reference/primary_authoritative/specification.md`](docs-dev/reference/primary_authoritative/specification.md).

This repository follows the `eek-a-dev` workflow: numbered prompts in `docs-dev/agent/prompts/`, one commit per prompt, pushed directly to `main`.

## Hosting

Served from SiteGround under eelkedevries.com. The deploy workflow lives in the [eelkedevries.com repository](https://github.com/eelkedevries/eelkedevries.com), which holds the credentials; this repository holds none.

## Licence status

No licence has been granted for the code yet; all rights are reserved unless a `LICENSE` file is added.
