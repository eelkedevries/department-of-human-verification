# Troubleshooting

## The images do not appear

The page shows *The case materials could not be retrieved* when an image fails to load, with a **Try again** button. On the live site this usually means a connection problem. Locally, check that `public/stimuli/` contains the files listed in `src/stimuli/catalogue.json`; `npm run validate:stimuli` reports any that are missing.

## Blank page after deployment

A blank page is usually a base-path problem. The build expects to be served from `/department-of-human-verification/`; check the browser console for 404s on files under `assets/`. Do not change the base path without changing the deploy workflow as well.

## `npm run check` fails on the public-build check

Version 1 must not contain camera, storage or network-submission APIs. If the check names one of `getUserMedia`, `mediaDevices`, `webgazer`, `sendBeacon`, `XMLHttpRequest`, `WebSocket`, `localStorage`, `sessionStorage`, `indexedDB` or `document.cookie`, find what introduced it. A new dependency is the usual cause.

## `npm run check` fails on the stimulus validator

The validator compares the catalogue with the image files. After changing a grid, rebuild with `python3 tools/stimuli/build.py` and bump the grid's `version` in `tools/stimuli/source.json` if its instruction, answer key or images changed.

## The end-to-end tests cannot find a browser

Set `PLAYWRIGHT_BROWSERS_PATH` to the directory containing Playwright's browser builds, or install them with `npx playwright install chromium firefox`.
