# Stimuli

Each assessment shows one ordinary instruction and nine individually selectable images in a 3 × 3 grid.

## Current status and replacement direction

**Currently published:** G01 — “Select all images containing a bicycle”, with four ordinary bicycle targets. Its images and current scoring are still valid; this grid is temporarily reused when no other published grid exists.

**New direction:** ordinary instructions, absurd-but-category-relevant photographs and debatable category boundaries. The [candidate-stimulus table](stimulus-concepts.md) gives **15 twelve-image concept pools** (three normal members, three bizarre members, three debatable candidates and three non-members). Each pool supplies alternatives for a separately curated **nine-image playable grid**; it is not a change to the 3 × 3 game format. None of those images has been rendered and published yet.

**Earlier unpublished drafts:** G02–G10 remain as legacy entries in [`tools/stimuli/source.json`](../tools/stimuli/source.json). Their single-target and unusual-instruction ideas are **superseded**. Do not publish them as-is. Replace them one grid at a time with the new approach.

## Classification and scoring

The new preferred task format is **“Select all images containing a [normal category].”** Everything genuinely doubtful must be treated as a judgement, never as a provably wrong answer.

Each proposed tile receives a role in the source file:

- `target`: clearly belongs to the category; selecting it counts as a hit.
- `distractor`: clearly does not belong; selecting it counts as a false alarm.
- `borderline`: reasonable people could disagree; its selection **or rejection is recorded but excluded** from objective accuracy.

The built-in scoring now supports a `category_judgement` grid with a non-empty list of `borderline_tile_ids`. The publisher derives that list from source tiles with `"role": "borderline"`. Every such grid must use `"mode": "multiple"`. The summary's clear-cut accuracy denominator excludes those tiles. The Department is free to make bureaucratic jokes, but cannot mark a disputed judgement “incorrect”.

For a new category-judgement grid, include at least one clear target and one clear non-member; keep the answer key to clear targets. Pilot test tentative tile roles before asserting they are clear. Don't hide uncertainty with arbitrary strict answer keys.

## Game selection and randomisation

The game currently samples five rounds in a fixed family order and shuffles tile positions using a recorded seed. When a family lacks published content it borrows another grid, so G01 appears five times at present. Future distinct categories must be integrated into the round-selection design without repeated base categories in one short playthrough where the pool allows. Existing time limits remain unchanged pending usability testing.

For **systematic stimulus variation**, define matched grid variants that keep the wording, definite targets, image count, framing, and rendering quality stable. Independently vary visual resemblance, functional resemblance, or bizarreness; record a variant/condition ID and pilot the difference with human ratings. The concept table is a stimulus backlog, not yet a randomised factorial experiment.

## Image creation and provenance

Images are generated locally with [FLUX.2 [klein] 4B](https://huggingface.co/black-forest-labs/FLUX.2-klein-4B) and reviewed by eye. Preserve prompts, seeds, model revisions, licences, hashes, output dimensions and edits. Photographic context should be plausible and consistent; spectacular errors unrelated to the instructed category are not the goal.

Never use TV-programme stills or reconstruct recognisable proprietary props because an idea mentioned a programme. Cultural references can inspire original, rights-cleared satire.

## Stimulus photography and background guidelines

**Default: an ordinary photograph of an extraordinary object.** Use natural, object-appropriate settings rather than a plain studio backdrop. The Department's instruction remains entirely conventional; the image provides the humour. A square-wheeled bicycle should appear to have been parked on a street without anyone considering that unusual.

### Photographic style

- Produce **one independent, square, photorealistic image per tile**. Use a documentary/product-documentary photographic look: credible materials, perspective, shadows and scale, including where the depicted object is impossible.
- Use a **plausible environment for that object**. Prefer a quiet street, cycle path, home, gym, nursery, farmyard or office as relevant. A studio is acceptable only where it is natural to the concept or explicitly required by a controlled comparison; it is **not the default**.
- Keep the scene **uncluttered but believable**: low to moderate background detail, no unrelated visual joke or deliberately surreal setting. A strange object in an otherwise ordinary place is the intended effect.
- Keep the object **clearly readable in the 3 × 3 game grid**. Aim for approximately **65–80% of the frame** where the object's shape permits; use a side or three-quarter view, show its defining features and leave enough margins to avoid cropping wheels, legs, wings or handles. Extra-long objects may need smaller framing.
- Use **soft natural daylight** or comparable diffused indoor light; consistent realistic sharpness, exposure, colour, contrast and depth of field. Avoid dramatic cinematic illumination, neon grading, heavy vignettes and excessively saturated colours.
- Prefer **no people**, text overlays, logos, labels or watermarks. Avoid unintended instances of the instructed category elsewhere in a tile (e.g., another bicycle behind a motorcycle).
- The absurdity must belong to the **object**, not to accidental model defects. Check for unintended deformed anatomy, missing parts, fused backgrounds, unreadable features and accidental extra targets. Intentional square wheels are acceptable; random mangled spokes are not.
- Apply the same standards to **ordinary, bizarre, borderline and non-member** tiles. A target must not be identifiable merely because its image has different lighting, cleanliness, resolution or rendering style.

### Within-grid consistency versus natural context

Use **plausible different locations**, not necessarily nine identical backdrops. Keep camera distance, viewing angle, main-object coverage, background complexity and overall lighting **reasonably comparable** across the whole set. An indoor exercise bike and an outdoor road bike need different locations; neither should become conspicuous simply because its background is unusually colourful or busy.

Backgrounds can themselves suggest category membership (a pedal-powered chair in an office versus on a cycle path). **Record the environment and review it as a possible cue or confound.** If comparing matched variants, preserve or deliberately match the background, viewpoint, scale and photographic style; any intentional contextual change must be defined as its own manipulation. Different natural backgrounds **are not a scientifically controlled factor by themselves**.

### C01 — bicycle grid: suggested environments (illustrative nine-image selection)

| Candidate image | Plausible environment | Specific composition note |
|---|---|---|
| Dutch bicycle | Quiet Dutch residential street, parked by a wall or fence | Side/three-quarter view; full frame and wheels visible |
| Racing bicycle | Empty paved cycle path | Similar scale and lighting to the Dutch bicycle |
| Square-wheeled bicycle | Ordinary residential street | Both square wheels legible; background completely unremarkable |
| Bicycle with implausibly many saddles | Quiet open road or long cycle path | Allow extra space for the full extended frame |
| Stationary exercise bike | Gym or home exercise room | No additional exercise bikes in the background |
| Horse fitted with wheels and pedals | Farmyard or country lane | Full horse and its mechanical parts visible; plausible outdoor daylight |
| Pedal-powered office chair | Office corridor or quiet business park | The pedals and chair structure clearly visible |
| Rocking horse | Child's room or nursery | Plain, recognisable domestic surroundings |
| Motorcycle | Quiet street or parking area | No bicycles behind it; framing comparable to the bicycle tiles |

The C01 [concept pool](stimulus-concepts.md#candidate-image-pools-12-examples-per-theme) now lists 12 alternatives rather than nine. The table above describes one possible nine-image selection. When selecting another candidate, specify its context using the same rules (e.g. a folding bicycle on a residential street, an unusually tall bicycle on a clear cycle path, a kick scooter on a pavement).

### Resolution and existing workflow

The **current implemented pipeline** generates raw images at **512 × 512 px**, then publishes **512 × 512 and 256 × 256 WebP** derivatives with opaque content-hash names. Keep that format until the generator, publisher, validator and catalogue are changed together. A higher-resolution master (e.g., 1024 × 1024 px) may be valuable for future production but **is not an implemented requirement** and must not be assumed by the current code.

Write the **specific environment, viewpoint and visible features in each tile's `prompt`** in `tools/stimuli/source.json`; the shared `style` suffix alone does not guarantee a suitable background. Keep model revision, complete prompt, seed, licence, edits and output hashes in the existing provenance system. Do not treat a contact sheet or a combined mock-up as a substitute for nine separately generated images.

Example prompt pattern:

```text
[object, including the precise intended oddity], [specific plausible location],
[side or three-quarter view], full object and key features visible,
soft natural/diffused light, believable documentary photograph,
quiet background with low visual clutter, square composition,
no people, no text, no additional objects from the named category
```

### Manual review before publishing

For every tile, verify: (1) the intended object and modification are visible; (2) the natural background is plausible; (3) the object is recognisable at **actual game tile size**; (4) the scene has no accidental extra target or misleading prop; (5) photograph quality, object scale and visual clutter are comparable to the other eight tiles; (6) any bizarre feature is intentional; and (7) the proposed `target`, `borderline` or `distractor` role remains defensible. Review the full nine-tile contact sheet as well as each image individually. Regenerate, edit with documented provenance, or discard failures before setting `published: true`.

### Publishing a new set

1. Choose and document **nine of the twelve candidate images** from the relevant theme's planning pool, then write an ordinary `instruction` and nine source tiles in [`tools/stimuli/source.json`](../tools/stimuli/source.json), with roles `target`, `borderline`, or `distractor`. Use `research_class: "category_judgement"`, `mode: "multiple"`, and dry feedback that does not prejudge borderline cases.
2. Generate the individual images (`python tools/stimuli/generate.py` or a single tile ID), review via `python3 tools/stimuli/review.py <GRID_ID>`, and revise failed images.
3. When all nine pass manual inspection, mark the source grid `published: true`, and bump its version whenever an existing grid changes.
4. Run `python3 tools/stimuli/build.py`, `npm run check`, and the relevant end-to-end tests before deploying.
5. Only the published assets and catalogue reach the live game; drafts and raw renders remain in the source workflow.

Nothing here activates webcam tracking, analytics, or remote research data collection.
