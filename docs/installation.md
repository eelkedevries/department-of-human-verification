# Installation

## Prerequisites

- Node.js 22 and npm.
- For the end-to-end tests: Playwright's Chromium (and, optionally, Firefox) builds.
- For regenerating images only: Python 3.11 or later with Pillow, and for rendering, PyTorch, diffusers and transformers (see [stimuli.md](stimuli.md)).

## Install and run

```bash
git clone https://github.com/eelkedevries/department-of-human-verification.git
cd department-of-human-verification
npm ci          # exact dependencies from the lockfile
npm run dev     # development server at http://localhost:5173/department-of-human-verification/
```

## Checks

```bash
npm run check     # type-check, stimulus validation, unit tests, build, public-build and prompt checks
npm run test:e2e  # end-to-end tests against the production build (Chromium desktop and phone)
E2E_FIREFOX=1 npm run test:e2e   # also Firefox, where Playwright's Firefox is installed
```

`npm run check` is the verify command: run it before every commit.
