# Usage

*The Department of Human Verification* is a short browser game. A fictional agency asks you to prove that you are human by completing five image assessments, and then issues a verdict. The game is fiction from start to finish.

## Playing

1. **Notice.** Choose **Standard** or **Experimental**, then press **Begin assessment**. Standard is selected by default.
2. **Briefing.** Choose a time limit: *Standard* (15 seconds per assessment), *Extended* (30 seconds) or *No time limit*. Then press **Proceed to assessment 1**.
3. **Five assessments.** Each shows one instruction and nine images. Select the images that satisfy the instruction — some ask for one image, some for all that apply — and press **Submit selection**. Selecting an image again withdraws it. If time runs out, whatever is selected is recorded and the game moves on.
4. **Feedback.** After each assessment the Department stamps the result, says what it thinks, and marks each image: *Correct*, *Missed* or *Not a match*. Press **Continue** when ready; the feedback is not timed.
5. **Report.** The *Human Verification Report* lists the assessments passed, the images classified correctly, the average response time, any timeouts, the verdict and an explanation of every answer. **Request re-assessment** starts a new session.

The game has fifteen category grids. Standard chooses five distinct grids where the pool permits. Borderline choices appear as **Judgement noted** and are excluded from the clear-cut accuracy count. **Change game mode** on the report returns to the opening selector; re-assessment retains the chosen mode and time setting.

## Experimental mode

Experimental moves through first impressions, unreasonable objects, appearances, function and form, and a final houses case. An earlier judgement returns during the case file.

After the fifth assessment, **Continue to case review** opens a supplementary definition challenge. The original house image, question and choice are shown as a precedent. Choose a working definition and include, exclude or leave the image unresolved under it. You may skip this review.

The optional appeal lets you choose one disputed image, keep or reconsider your original judgement and give a reason. Both reviews are untimed and unscored. Original assessment choices are preserved. Your report shows specific decisions, the later interpretation and any appeal reply.

### Shared cases

- **Copy case link** copies the same five grids and tile layouts without answers.
- **Copy comparison link** deliberately includes your original tile selections. The next player sees the comparison only in their final report. Anyone with the link can read the included selections; they are not secret or encrypted.
- The timing setting is preselected from the link, and can be changed in the briefing.
- Links pin exact image-set versions. If an older version is no longer available, the game explains that the case cannot be reproduced instead of silently replacing it.
- Copying a link sends it to nobody. If copying is unavailable, select the displayed link and copy it yourself. No account is required.

Comparisons describe agreement and disagreement, not which person's category judgement is correct. Later interpretations and appeals are kept separate from the original selection comparison.

## Keyboard

- **Tab** moves between the main controls; the nine images form one stop.
- **Arrow keys** move between images; **Home** and **End** jump to the first and last.
- **Space** or **Enter** selects or withdraws the focused image.
- **1 to 9** select or withdraw an image directly, counting row by row from the top left.

The game also respects the system setting for reduced motion.

## Privacy

The public build never asks for a camera, contains no eye-tracking, sets no cookies, stores no progress and uploads no answers. Your answers exist in the open tab. An explicitly copied Experimental comparison link contains original selections; the game does not send that link to anyone for you. The separate eye-tracking preview is not enabled by Experimental mode.

## Developer options

These URL parameters exist for testing; players never need them.

| Parameter | Effect |
|---|---|
| `?seed=12345` | Fixes the session seed, so the grids and layout are reproducible. |
| `?time=extended` or `?time=none` | Preselects a time limit on the briefing. |
| `?dev` | Adds a **Developer tools** box to the report with **Export session log (JSON)**: the session's settings, trial assignments, trial records and timestamped events, generated in the browser. It is for testing only and is never sent anywhere. |
| `?mode=experimental` | Preselects Experimental on the opening screen. |

Parameters combine, for example `?dev&seed=4242`.
