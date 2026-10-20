# Usage

*The Department of Human Verification* is a short browser game. A fictional agency asks you to prove that you are human by completing five image assessments, and then issues a verdict. The game is fiction from start to finish.

## Playing

1. **Notice.** Press **Begin assessment**.
2. **Briefing.** Choose a time limit: *Standard* (15 seconds per assessment), *Extended* (30 seconds) or *No time limit*. Then press **Proceed to assessment 1**.
3. **Five assessments.** Each shows one instruction and nine images. Select the images that satisfy the instruction — some ask for one image, some for all that apply — and press **Submit selection**. Selecting an image again withdraws it. If time runs out, whatever is selected is recorded and the game moves on.
4. **Feedback.** After each assessment the Department stamps the result, says what it thinks, and marks each image: *Correct*, *Missed* or *Not a match*. Press **Continue** when ready; the feedback is not timed.
5. **Report.** The *Human Verification Report* lists the assessments passed, the images classified correctly, the average response time, any timeouts, the verdict and an explanation of every answer. **Request re-assessment** starts a new session.

For now the game has one set of images (bicycles), so all five assessments show it, each time in a different order. As more grids are published, the assessments follow five families in order: visual recognition, conceptual understanding, contextual judgement (the odd one out), functional reasoning, and advanced suspicion; a family without a grid of its own borrows one from the others.

## Keyboard

- **Tab** moves between the main controls; the nine images form one stop.
- **Arrow keys** move between images; **Home** and **End** jump to the first and last.
- **Space** or **Enter** selects or withdraws the focused image.
- **1 to 9** select or withdraw an image directly, counting row by row from the top left.

The game also respects the system setting for reduced motion.

## Privacy

Version 1 never asks for a camera, contains no eye-tracking, sets no cookies, stores nothing on your device and sends nothing anywhere. Your answers exist only in the open tab.

## Developer options

These URL parameters exist for testing; players never need them.

| Parameter | Effect |
|---|---|
| `?seed=12345` | Fixes the session seed, so the grids and layout are reproducible. |
| `?time=extended` or `?time=none` | Preselects a time limit on the briefing. |
| `?dev` | Adds a **Developer tools** box to the report with **Export session log (JSON)**: the session's settings, trial assignments, trial records and timestamped events, generated in the browser. It is for testing only and is never sent anywhere. |

Parameters combine, for example `?dev&seed=4242`.
