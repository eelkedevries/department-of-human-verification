# The Department of Human Verification
## Implementation brief for Claude Code — V1 and V2

**Tagline:** *Humanity cannot be self-certified.*  
**Repository:** [`eelkedevries/department-of-human-verification`](https://github.com/eelkedevries/department-of-human-verification) (**already exists; public and empty when checked on 20 October 2026**)  
**Production URL:** `https://eelkedevries.com/department-of-human-verification/` (proposed; do not claim it is live until verified)  
**Source language:** British English.  
**Visual references included in this handoff:** `visual_references/overview.png` and three separately viewable panels (bicycle recognition, job-interview animal, functional categorisation). These illustrate the design, **not** final experimental stimuli.

> **Instruction to Claude Code:** Build and deploy a polished standalone browser game in two successive releases. Complete, test and publish **Version 1 first**, without any webcam functionality. Then implement **Version 2** with **optional webcam eye-tracking, actual calibration and validation, personal gaze results, research instrumentation and an analysis interface**. Follow the established `eek-a-template` / `eek-a-dev` conventions and the existing `eelkedevries.com` SiteGround deployment approach. Work in small, verifiable, documented increments. Do not create another repository, do not deploy to GitHub Pages, and do not invent data or completed research results. Preserve full functionality without a camera.

## Using the supplied visual references

All four PNG files are located in `visual_references/`:

| File | Concept | Role in implementation |
|---|---|---|
| `overview.png` | Three Department assessment screens together | Overall look, layout, spacing, typography, stamps, palette and image-grid scale. |
| `01_bicycles.png` | “Select all images containing a bicycle.” | Straightforward recognition task; multiple selectable tiles. |
| `02_job_interview.png` | “Select the animal dressed for a job interview.” | Semantic interpretation, absurd illustration, dry bureaucratic framing. |
| `03_sitting.png` | “Select everything you could reasonably sit on.” | Functional categorisation and ambiguous humour. |

**These are concept art, not website screenshots to embed or final research stimuli.** Recreate the game as accessible, responsive HTML/CSS/TypeScript components, with *nine separate actual image assets per grid* and functional selection, submission, timing and results. The panels are **illustrative**: some shown answers are ambiguous (the job-interview panel contains more than one accessorised/dressed animal, and “reasonably sit on” permits subjective answers). For scored V1 rounds, adjust the wording, images or answer rules so the answer key is fair and transparent. For V2 confirmatory research trials, use unambiguously labelled, versioned, licensed stimuli; allow subjective puzzles only as clearly separated playful/exploratory trials.

Style guidance: preserve the fictional seal, official case identifier, paper-inspired panel, restrained navy/cream/grey palette, clear monospace labelling, dry language, pronounced instruction heading, generous image grid, and a prominent **SUBMIT SELECTION** action. Improve visual hierarchy, accessibility and responsive layout rather than tracing pixels. **Do not use** the full mock-up image as the user interface, slice it into fake clickable regions, generate final scores from the concept art, reproduce a real CAPTCHA provider's branding, or present the artwork as measured gaze or validated experimental stimuli.

The three examples are **not the whole five-round V1 content**. Supply at least five playable rounds with original, rights-cleared assets; the remaining challenge families are specified below. Develop everything for **V1 without camera permissions, eye-tracking libraries or gaze displays**. Add optional eye-tracking only in V2, after V1 works and is deployed.

## 1. Product and tone

The player is being evaluated by a fictional, excessively bureaucratic government agency. The increasingly questionable CAPTCHA-style tests are brief, visually attractive, easy to understand, and genuinely playable. The Department treats trivial tasks with undue seriousness.

**Opening screen (use as the baseline copy):**

> **THE DEPARTMENT OF HUMAN VERIFICATION**  
> **NOTICE OF MANDATORY HUMAN VERIFICATION**  
> You have been provisionally classified as human.  
> Recent developments in artificial intelligence have raised some concerns.  
> To maintain your human status, you must complete five routine visual assessments.  
> **[BEGIN ASSESSMENT]**

**Tone:** dry, formal, deadpan, playful; never condescending to players. Example responses: “Your understanding of bicycles has been noted.” / “The Department of Ducks has been notified.” / “An unusually confident response. Suspicious.”

**Visual direction:** an original government-paperwork aesthetic (official seal, file numbers, restrained navy/cream/grey, crisp type, subtle stamps and tasteful animations), contrasted with **colourful, beautiful, richly detailed stimulus images**. The UI must not imitate Google's reCAPTCHA branding or suggest association with an actual authority. Clearly identify it as a fictional game outside the story text. Use the provided mock-up as visual direction, not as the actual game screen or data source.

**Accessibility:** keyboard and touch controls; visible focus; labels and descriptive error messages; reduced-motion support; WCAG-conscious contrast. Do not use colour alone to indicate selected tiles. Responsive V1 from phones to desktop; no horizontal overflow. Gameplay must work entirely without camera permission.

**Session target:** five quick challenges, ideally **60–100 seconds of actual gameplay** and **never more than two minutes of timed gameplay**. Research information, camera permission, face positioning and calibration may add time in V2; do not compromise measurement quality to imply these fit within two minutes.

## 2. Game mechanics — shared across versions

1. Start screen and a concise explanation.
2. Present **five** rounds, each with one written instruction and a visually balanced **3 × 3 grid** of nine independent image tiles.
3. Players select **one or more tiles**, as appropriate to the instruction, then press **Submit selection**. Selection is clearly indicated and reversible.
4. Give immediate, short, dry feedback; progress automatically after a brief delay or on **Next**.
5. Display a final, attractively designed **Human Verification Report** with score, errors and amusing fictional departmental verdict.
6. Provide **Play again**, creating a genuinely new session with a different selection/order where feasible.

Provide a configurable round timer (default: approximately **12–15 seconds per round**, not including the short feedback transition). On expiry, record a timeout and continue. The game is *not* a genuine human/bot classifier: a verdict such as **PROVISIONALLY HUMAN** is comic fiction, not a statistical claim.

**Five challenge families (examples, to be refined for scientific clarity):**

| Round | Type | Example instruction | Design rule |
|---|---|---|---|
| 1 | Familiar object recognition | “Select all images containing a bicycle.” | Clearly labelled positive/negative tiles. |
| 2 | Semantic description | “Find the animal dressed for a job interview.” | Exactly one unequivocal target. No other formally dressed animals. |
| 3 | Context/odd-one-out | “Select the object that does not belong.” | Establish one defensible answer; ambiguous versions are entertainment-only and explicitly tagged. |
| 4 | Functional categorisation | “Select the objects intended for sitting.” | Explicit category rule; avoid ambiguous “could sit on” for primary trials. |
| 5 | Absurd finale | “Find the most suspicious duck.” | Funny, but either give an objective operational definition or exclude from confirmatory analysis. |

**Important:** the five *visible* rounds should draw from a larger pool over repeated sessions. Do not use a single static, unvarying set. At least five curated, playable grids are required at V1 launch; prepare a path to 10–20 validated grids for research. Any ambiguous humour should be separated from trials used for hypothesis testing.

**No deceptive interaction:** never present faux OS alerts, collect credentials, or suggest actual legal consequences for “failing” verification.

## 3. Version 1 — complete game, NO eye-tracking

**Goal:** Release an attractive, bug-free standalone game that people want to replay. **No camera requests, permissions, tracking libraries, calibration, gaze claims or participant video collection anywhere in V1.**

### V1 requirements

- Full design and content: start/instructions, five 3 × 3 challenges, selection states, per-round feedback, progress indicator, optional sound toggle (off by default if implemented), timer, final results, replay.
- A small **stimulus catalogue** with proper image licences/provenance, machine-readable instructions, answer keys, AOIs/tiles, difficulty flags, IDs and versioning. Do not present the concept mock-up collage as nine separate true-labelled trial assets.
- The game can use original illustrations or appropriately licensed/generated images, but all assets must be visually coherent, crisp and suitable for later controlled manipulation. Record source, licence/creation provenance and any edits. Avoid watermarks and third-party brand confusion.
- Randomise grid and tile ordering using a per-session seed; retain stimulus identity, condition, layout and response mapping. Do not inadvertently reveal correct answers through file names, CSS classes or accessible labels before submission.
- Instrument basic *local* behavioural events (`trial_start`, `selection`, `submit`, `timeout`, `trial_end`) with timestamps, correctness and response time. Provide an explicitly labelled **developer-only JSON export** for testing. **Do not transmit or store participant-level data on a server in V1.**
- Final report includes score, decisions, fictional verdict and simple explanatory feedback. No “Your eyes looked here” or fake heatmaps.
- Mobile and desktop, accessible, responsive, works with no webcam. Respect reduced motion and touch target sizes.
- Include a short About section explaining this is a fictional research-inspired game and that V1 contains **no eye-tracking**.

### V1 suggested technical structure

- **Vite + TypeScript**, static output with base path `/department-of-human-verification/`.
- Use the existing [`eek-a-template`](https://github.com/eelkedevries/eek-a-template) / eek-a-dev scaffold and conventions for `AGENTS.md`, `CLAUDE.md`, `docs/`, `docs-dev/`, versioned specification, numbered work prompts and `npm run check`.
- A lightweight state machine for `intro → instructions → round → feedback → report` (and replay); prefer minimal dependencies. Keep display and gameplay logic separate from stimulus manifest and metrics so V2 can add tracking without a rewrite.
- Suggested layout:

```text
src/
  app/                 # state machine, routing, session logic
  game/                # round rendering, selection, scoring, timing
  components/          # common accessible UI and visual design
  stimuli/             # typed stimulus/condition manifests
  analytics/           # event schema and local-only V1 collector
  research/            # interfaces/stubs for V2 (not executed in V1)
  styles/
public/stimuli/        # licensed / generated image assets
scripts/               # validation, public-build checks, build/deploy helpers
docs/                  # player-facing documentation
docs-dev/              # specification, prompt records, tests and planning
```

**V1 acceptance criteria**

1. A new visitor can play five varied rounds, receive meaningful feedback and replay without account creation.
2. Game works on Firefox and Chromium desktop and Chrome mobile (test representative viewport sizes).
3. No camera access or gaze-related code runs in V1; no participant data is submitted to a server.
4. Stimuli and answer keys validate automatically; all displayed images load; correct answers remain unambiguous in research-labelled trials.
5. Keyboard, touch, focus states, timeouts and reduced-motion handling work.
6. `npm run check` passes; production serves the correct build under the target path and a main-site deploy cannot delete it.

## 4. Version 2 — optional webcam eye-tracking and research mode

**Goal:** Keep the V1 game intact, and add a clearly explained **Play with eye-tracking** option. No webcam access unless the participant explicitly chooses it. The no-camera flow remains identical.

### Participant flow

1. Choose **Play normally** or **Play with eye-tracking**. Explain plainly what will be measured and for what purpose; separate research consent from fictional departmental copy.
2. For eye-tracking: show device requirements (desktop/laptop first), camera explanation and explicit consent **before** camera activation.
3. Request camera permission, display a small local face-positioning preview and instructions (good lighting, face centred, relatively still, stable viewing distance).
4. **Calibrate** using visible points spread over the playable stimulus area. Start with **nine points** or an empirically justified equivalent; clicking a target for WebGazer's supported click calibration is acceptable. Calibration is *training*, not validation.
5. **Validate** with a separate set of points that were **not used for fitting** where possible. Measure spatial error, sample availability and effective temporal sampling. Show a plain-English quality result and offer **Recalibrate**, **Continue without eye-tracking** and, only when appropriate, **Continue with tracking**.
6. Present the same five challenges; preserve consistent coordinate frames, image sizes and orientation after calibration. Record gaze estimates with stimulus onset/offset, per-trial layout and behavioural events.
7. After the game, ask one optional **brief self-report before the reveal**, e.g. “Which object caught your attention first?” and/or “What helped you decide?”
8. Show the *Human Verification Report* with three clearly separated accounts: **Your testimony** (participant report), **Surveillance record** (estimated personal gaze *if valid*) and **Automated assessment** (AI-predicted attention). If tracking is unreliable, show behavioural results and explain why no personal gaze map is available.
9. Explicitly stop camera capture, release the video stream, and provide a clear option to withhold or withdraw the research submission before data is sent. Never leave the camera running after a session.

### Libraries and tracking design

- Prefer the established **jsPsych + WebGazer** ecosystem instead of Saccadacus. The jsPsych WebGazer extension has camera initialisation, [calibration](https://www.jspsych.org/latest/plugins/webgazer-calibrate/), [validation](https://www.jspsych.org/latest/plugins/webgazer-validate/) and gaze-sampling support. Verify currently compatible package versions and licence terms when implementing; pin exact tested versions.
- Keep `auto_initialize: false`; do not prompt for a camera until the user opts in.
- Consider using jsPsych to drive the experiment timeline, with the existing game components reused as custom trials/plugins if needed. Do not redesign the V1 game solely to fit a library.
- Record original prediction timestamps (`performance.now()`-compatible), rendered stimulus rectangle, viewport, pixel density and trial onset. Do not assume nominal webcam FPS equals actual valid gaze FPS.
- Ensure gaze events cannot be misaligned by page scrolling, resizing, zoom changes, browser navigation, tab visibility changes or orientation changes. Pause/revalidate or flag such trials. Do not calibrate opportunistically on answer clicks during research trials without documenting the implications.
- Keep media frames locally processed. **No raw camera frames, face images, audio or biometric templates are uploaded or saved.** Do not use covert tracking, third-party analytics or face-identification functionality.
- Supported tracking hardware for initial research: desktop/laptop webcam. Android/iOS can still play the game, but **no claim of validated smartphone eye-tracking** until a separate device test is completed.

### Quality controls and result guardrails

- Persist validation errors and usable sample counts per participant/session and trial.
- Establish **pilot-based, predeclared thresholds** for including eye-tracking sessions and for displaying individual gaze visualisations. The thresholds should reflect tile size and expected position error; do not invent clinical-grade or pixel-perfect precision.
- Treat gaze data as estimates; with ordinary cameras prefer coarse 3 × 3 tile AOIs and grouped distributions. Saccades, exact fixation ordering and latencies remain **exploratory pending independent validation**.
- Calibration failures, denied permission or incompatible browsers **must fall back gracefully to V1 gameplay** with no misleading personalised gaze claims.
- Personal gaze visualisation: overlay a smoothed approximate density map or coarse per-tile attention bars only when quality passes; offer a comparison with a clearly labelled model prediction. A predicted map must never be labelled as a recording.

## 5. Scientific structure (V2)

**Public-facing question:** *Can AI predict where you look when you're trying to prove you're human?*

**Scientific question:** *How does the way a visual-search instruction is phrased influence performance and gaze allocation, and how well do image-based attention models predict the distribution of gaze?*

**Primary manipulation:** Direct versus semantically phrased instruction for the **same target in the same grid** (across different participants, not repeated to an individual). Example:

| Direct | Semantic | Same target |
|---|---|---|
| Find the duck. | Find the animal dressed for a job interview. | Duck wearing a tie |
| Find the bicycle. | Find the vehicle powered by pedals. | Bicycle |

- Distinguish single-target confirmatory grids from entertaining multi-select or ambiguous grids; do not combine incompatible task types in the primary analysis.
- Present instructions before the stimulus in a controlled interval; define response-time origin unambiguously. Log instruction length/read time where relevant so differences in language processing are not mistaken for effects on gaze.
- Each grid is presented once per participant. Counterbalance instruction assignment, grid selection, target position and order across sessions. Use a reproducible randomisation seed and record it.
- Primary outcomes: correctness, time to correct selection (or search response time) and target/distractor attention proportion when gaze quality permits.
- Exploratory: timing of large tile transitions, first reliably observed AOI, reported attention and model prediction differences.
- Pilot the duration, gaze precision, task difficulty, balance and camera opt-in. Estimate main-study sample size using simulations based on pilot data; account for crossed participant/item effects and device-selection bias.

### AI comparison

- **Reuse predictions from eek-a-look's existing model tooling** rather than reimplementing saliency networks in the browser or publishing restricted model weights. Precompute prediction maps for the **exact composite grid** that participants see, including layout and cropping, with its corresponding stimulus version/hash.
- Begin with a well-defined baseline and one compatible saliency model (e.g. centre bias + UNISAL or DeepGaze); expand only if the first comparison is sound. Free-viewing saliency models do **not** receive the CAPTCHA search instruction; their limitations must be made explicit.
- Compare predicted versus observed spatial probability **at tile level** first, with image-level heatmaps as a supplementary visualisation. Normalise both sides consistently; document smoothing choices. Do not infer model success from attractive overlays alone.
- Preserve versioned provenance for stimuli, model weights/identifier, code, generated maps, and preprocessing. Ensure image and model licensing permits redistribution of each published derivative.

### Mixed methods and dashboard

- Capture **one short optional qualitative response** at the end, *before* participants see gaze feedback.
- Include a later optional interview workflow for a small purposive sample (e.g. disagreement between reported search strategy, gaze and behaviour), with a semi-structured interview guide and coding codebook.
- Implement a simple **research dashboard** (restricted-access for individual data; public view aggregated only) with participant/trial counts, quality/attrition, behavioural results, per-grid AOI distributions, model comparisons and a *joint display* of coded reports alongside quantitative results. Do not fabricate interview findings or claim mixed-methods results before interviews have occurred.
- Provide reproducible analysis scripts (prefer **R** for statistics/Quarto), schema documentation and a brief study protocol. Automated object segmentation is a later optional layer; in the first study **tile AOIs and curated object labels** are the ground truth for scoring. Any automatically generated labels must be distinguished from human-checked labels.

## 6. Data model, security and privacy

Use versioned, typed JSON schemas (or documented TypeScript types) with stable, non-identifying identifiers. Minimum records:

| Record | Required fields |
|---|---|
| `stimulus` | stimulus_id, version/hash, tile assets, tile IDs, image provenance/licences, geometry, labels, validated answer key |
| `trial_assignment` | session_id, condition, stimulus_id/version, seeded layout, instructed target(s), order |
| `trial` | trial_id, onset/end timestamps, selected tile IDs/order, correctness, response_time_ms, timeout |
| `gaze_sample` (V2 only) | session_id, trial_id, relative timestamp, estimated x/y, validity/quality, coordinate-frame metadata |
| `calibration_quality` (V2 only) | method/version, training target locations, held-out validation points/errors, valid-sample proportion, delivered/usable sample rate, retry count |
| `qualitative_response` (V2) | question_id, optional text/category, related trial_id where applicable |
| `model_prediction` (V2) | stimulus version/hash, model name/version, prediction map path/hash and preprocessing |
| `consent_record` (V2) | consent version, opt-in status, timestamp, session identifier; *no names/emails unless separately and explicitly needed* |

**V1:** keep event logging local to the browser with an explicit developer export. No public participant-level submissions.

**V2:** before enabling research uploads, build and test a **secured submission endpoint and private storage** compatible with the existing SiteGround account. Inspect hosting support first (e.g. PHP with a supported database or a suitable managed service), rather than assuming a particular database extension is available. The public build must not contain credentials or direct database access. Validate server-side schemas and sizes; use HTTPS, origin restrictions as appropriate, request throttling, safe storage outside the public document root, restricted access, retention/deletion policy, backups, and a means to revoke/withdraw a session where feasible. Treat CORS and client-side IDs as insufficient security controls. No public leaderboard based on sensitive data.

**Research compliance:** Provide plain-language information and separate consent for optional camera tracking and research storage; do not describe tracking as secret surveillance outside the fictional story. Adults only for the initial research release; document controller/contact, lawful basis, retention, withdrawals and ethical review as applicable. **Do not start public participant data collection until the research information, storage and access controls have been reviewed and approved by the owner.** Publishing a demo and collecting research data are distinct release gates.

## 7. Website deployment and repository conventions

- Initialise **the existing** `eelkedevries/department-of-human-verification` repository; use the owner's `eek-a-template` scaffold and project-specific `AGENTS.md` / `CLAUDE.md`. Public repo = public documentation; never commit private participant data, keys or hidden backend configuration.
- Host **on SiteGround under eelkedevries.com**, not on GitHub Pages. Build the static front end with the correct Vite `base` path.
- Follow [`eek-a-look`'s established deployment design](https://github.com/eelkedevries/eek-a-look/blob/main/docs/deployment.md): a dedicated workflow in `eelkedevries/eelkedevries.com` using its existing SSH secrets, deploying **only** the game subdirectory and verifying it serves the expected build. Avoid duplicating the secrets into this repository.
- **Critical:** change `eelkedevries.com/scripts/deploy.sh` to protect `/department-of-human-verification/***` during the main website's `rsync --delete-after`, as it already protects `/eek-a-look/***`.
- Add a project card to the existing `eelkedevries.com/projects.md` linking the live game and public GitHub source; accurately indicate V1 versus V2 status.
- Keep V1 and V2 releases reviewable (version tags/clear milestones), use the existing owner convention of **small commits to `main`** and numbered prompts, and run the repository's verify command before commits. Avoid accidental deployment of incomplete V2 research infrastructure.
- Configure deployment paths so a GitHub Actions site deploy never deletes server-side private research storage or server endpoint configuration. Verify staging and live routes, static caching, direct refreshes and asset paths.

## 8. Testing and definition of done

**Automated checks** (add as part of implementation, despite the general template default not to add tests unless requested; this brief explicitly requests them):

- Unit: deterministic randomisation, answer evaluation, scoring, timeout handling, timestamp alignment, coordinate transformations, schema validation.
- Data: every research-labelled trial has valid labels, one defensible answer set, licensed assets, stable image dimensions, and a matching version/hash.
- E2E smoke: V1 five rounds and replay; desktop and mobile; keyboard navigation; V2 denied camera, unsuccessful calibration, successful calibration, tracking shutdown, and conditional results rendering.
- Build/security: no secret files, no participant data, no source maps exposing sensitive config, no dev docs in production bundle; correct base-path links.
- Browser checks: Chrome/Chromium and Firefox desktop for V2; V1 mobile browser smoke check. Verify real camera tests on physical hardware; synthetic gaze is only for testing code, **not** for claiming measurement validity.

**Milestone V1 complete when:** the live five-round game is polished, responsive, accessible, replayable, contains no tracking functionality, and passes checks. Report the deployed URL, commit and tests.

**Milestone V2 technically complete when:** optional webcam access, calibration, independent validation, correctly aligned recording, a genuine per-participant gaze reveal gated by quality, AI model predictions, and a secure opt-in research pipeline all work on tested hardware. Provide actual validation results and known limitations. The research dashboard must use real pilot data or clearly marked example data, never fictitious findings. Research collection is enabled **only after separate privacy/ethics approval**.

## 9. Delivery sequence for Claude Code

1. **Repository scaffold and binding specification:** inspect empty repo, existing eek-a-template and sister projects; create appropriate project docs, `AGENTS.md`, `CLAUDE.md`, `npm run check` and CI. Record the V1/V2 contract.
2. **V1 game and art:** design the original Department UI, prepare the initial stimulus library, implement five rounds, scoring, timer, feedback, results and replay.
3. **V1 verification and deployment:** complete tests, add the dedicated SiteGround deployment workflow and main-site protection, publish the production game, then add it to the website's projects page.
4. **V2 camera and calibration:** add explicit opt-in, jsPsych/WebGazer integration, camera preview, nine-point calibration and independent validation, quality summary, failure recovery and stream shutdown.
5. **V2 research instrumentation:** log behavioural and estimated gaze signals with known coordinate frames; add fixed and versioned stimuli, instruction variants and balanced assignment.
6. **V2 personalised result and AI comparison:** precompute labelled model maps, create trustworthy per-tile/heatmap comparison and report participant answers before reveal.
7. **V2 secured collection and analysis:** implement consented backend, document data schema, add reproducible R/Quarto analysis, simple restricted research dashboard and interview/codebook/joint-display templates. Gate research collection on owner approval.
8. **V2 pilot:** real-browser/device checks and pilot-quality report. Do not claim that full scientific validity, power or participant recruitment has been achieved just because the software is deployed.

**Operating rule:** complete each numbered step before moving on. If a required external service, camera capability, server configuration or permission is missing, implement and test what is possible and clearly report the blocker rather than substitute simulated success. Do not create extra games or extend this project into Slop Detector.

## 10. Authoritative references

- Existing site source and host configuration: <https://github.com/eelkedevries/eelkedevries.com>
- Existing sister app and deploy pattern: <https://github.com/eelkedevries/eek-a-look>
- Owner's scaffold/conventions: <https://github.com/eelkedevries/eek-a-template>
- jsPsych eye-tracking overview: <https://www.jspsych.org/latest/overview/eye-tracking/>
- jsPsych WebGazer calibration plugin: <https://www.jspsych.org/latest/plugins/webgazer-calibrate/>
- jsPsych WebGazer validation plugin: <https://www.jspsych.org/latest/plugins/webgazer-validate/>
- WebGazer project and licence (review before bundling): <https://github.com/brownhci/WebGazer>

**Source of design decisions:** The Department of Human Verification proposal and supplied three-panel concept mock-up. The specifications above introduce the requested V1/V2 implementation plan and explicit data/privacy/testing requirements; they are design decisions for this build, not claims of existing functionality.
