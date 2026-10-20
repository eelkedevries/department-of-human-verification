# Version 2 technical notes

Working notes for the eye-tracking preview: what is built, what was decided and why, and what blocks release. The binding rules are in the specification; this file records the reasoning and the open questions.

## Status (20 October 2026)

Built, behind the build flag `VITE_EYE_TRACKING=1`, and **not deployed**:

- the choice between ordinary play and eye-tracking, offered only on desktop-sized windows with a fine pointer;
- plain-language research information and consent (adult, camera), separate from the fiction;
- camera start, face positioning with a live preview, and every way out (decline, refused camera, no face, *Play without eye-tracking*);
- nine-point click calibration over the exact area the grid will occupy;
- five held-out validation points, never used for training, with error, spread, availability and delivered-rate measures;
- a plain-English quality result with *Calibrate again* (up to three attempts), *Continue without eye-tracking*, and *Continue with eye-tracking* only when the check passes;
- gaze recording during rounds, with the coordinate frame captured at onset, per-tile assignment, and trial flags for scrolling, resizing, zoom, hidden pages and layout changes;
- a camera badge with **Stop** during play; the camera is released at the end of the last round, before anything is revealed;
- one testimony question (which image caught your attention first in assessment 2, and an optional strategy) asked before the reveal;
- the reveal: *Your testimony*, *Surveillance record (estimated)* per assessment, shown only when the session check passed and the trial is unflagged and has enough estimates, and *Automated assessment (predicted)*, which says plainly that no prediction exists yet;
- a developer export with consent, calibration quality, gaze samples and responses. Nothing is uploaded anywhere.

Not built: instruction-phrasing conditions, model predictions, the collection backend, analysis scripts, the dashboard and the pilot.

## Verified, and not verified

Verified automatically (`npm run test:e2e:eyetracking`, Chromium with a fake camera, plus unit tests):

- ordinary play never calls `getUserMedia`;
- declining consent and a refused camera both fall back to the ordinary game;
- real WebGazer starts on a camera stream without a face, loads its face-mesh model from this site only, offers no calibration, and releases the camera when the participant leaves;
- a failed check never offers tracking;
- a passed check records five trials with non-negative times relative to onset, asks for testimony before the reveal, switches the camera off, and renders the three accounts;
- **Stop** releases the camera mid-game and the game continues.

The passed-check and Stop tests use a *synthetic* tracker that reports the pointer position as gaze (enabled only in builds with `VITE_EYE_TRACKING_TEST=1` and the URL parameter `?tracker=synthetic`). They test code paths. They say nothing about how well WebGazer measures gaze.

**Not verified:** anything involving a real face. Calibration accuracy, the quality thresholds, sample rates on real hardware, Firefox and Safari behaviour with a real camera, and the effect of WebGazer's processing load on the round timers all need a person at a desktop or laptop with a webcam.

## Decisions

**WebGazer directly, not through jsPsych.** The brief prefers the jsPsych and WebGazer ecosystem. The jsPsych plugins (`plugin-webgazer-init-camera`, `-calibrate`, `-validate`, MIT) are thin wrappers around WebGazer that expect jsPsych to own the page and the timeline. The game already owns both, and the brief says not to redesign it to fit a library. The calibration and validation here follow the same design (click calibration at nine points, separate validation points, error in pixels, sample counts) without the jsPsych runtime. If the research timeline later moves to jsPsych, the tracker interface in `src/eyetracking/tracker.ts` is the seam.

**WebGazer as a separate file.** WebGazer 3.5.3 is loaded from `eyetracking/webgazer/webgazer.js`, its unmodified prebuilt file, with its licence beside it, rather than bundled into the game's code. Bundling its ES module source also fails: Vite cannot resolve MediaPipe's `FaceMesh` export from it.

**No third-party requests.** WebGazer's MediaPipe face-mesh files (about 17 MB of WebAssembly and weights) are served from this site. Its code mentions tfhub.dev, but with the `mediapipe` runtime and a local `solutionPath` it does not contact it; the end-to-end test asserts that every request goes to the site's own host.

**WebGazer's defaults overridden.** WebGazer stores its training data across sessions by default (localforage: IndexedDB or localStorage), trains on every click and mouse movement, shows a red gaze dot, and does not stop the camera on `end()`. The adapter turns off persistence, removes the mouse listeners after start (training happens only at calibration points, never on answers), hides the dot, and stops every camera track itself.

**Coordinate frame.** Estimates are viewport CSS pixels, the same coordinates as the calibration clicks. In eye-tracking mode the instruction always takes two lines, so the grid sits in the same place in every round and during calibration. The calibration screen renders the round's layout without content and places the points on the grid's actual rectangle.

**Timing.** Times are `performance.now()` at the moment WebGazer delivers an estimate, relative to the trial's onset (the first frame after all nine images decoded). WebGazer's own processing latency (from camera frame to estimate) is neither measured nor corrected. Saccade timing and first-fixation latencies are therefore exploratory, as the brief requires.

**Quality thresholds are placeholders.** `DEVELOPMENT_THRESHOLDS` (mean error at most half a tile, at least 80 % valid samples, at least 10 usable estimates per second, no empty validation point) exist so the code can be tested. They are labelled as provisional in the interface and must be replaced by predeclared, pilot-based values before any research use.

**Dependency advisories.** Installing WebGazer brings `@tensorflow/tfjs` and, through it, `argparse` and `sprintf-js`, for which `npm audit` reports four moderate advisories (20 October 2026). The game's build does not bundle these packages: the browser receives WebGazer's prebuilt `webgazer.js` and the face-mesh files only. Re-check when WebGazer is upgraded.

**One grid for now.** The testimony question refers to assessment 2, whatever grid it shows. Instruction-phrasing conditions (prompt 007) need published single-target grids, which the pool does not have yet.

## Blockers and decisions for the owner

1. **Licence.** WebGazer is GPL-3.0-or-later; its README offers LGPL-3.0 to companies valued under 1 million US dollars. Publishing the eye-tracking build distributes WebGazer with the game. The options are to licence this repository under the GPL (it is public already), to rely on the LGPL option if it applies, or to obtain a different licence from Brown. Until this is decided, the eye-tracking build must not be deployed.
2. **Real-hardware tests.** Run the preview on at least one Windows or macOS laptop in Chrome and Firefox, with good and poor lighting, and record the validation results honestly. Phones and tablets are excluded by design until a separate device test exists.
3. **Pilot-based thresholds** for including sessions and for showing personal records, scaled to the tile size.
4. **Research collection** (prompt 009) needs the owner's review of the information sheet, consent text, storage, retention and ethics before it is built, let alone enabled.

## Running the preview

```bash
VITE_EYE_TRACKING=1 npm run dev
# then open http://localhost:5173/department-of-human-verification/ on a laptop with a webcam
```

Add `?dev` to the URL to get the developer export at the end. The camera needs `localhost` or HTTPS.
