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

## Creative direction: ridiculous realities, not novelty products

**Bizarre means clearly impossible, not merely unusual.** An uncomfortable chair, an eccentric commercially plausible product, an animal-shaped lamp or a slightly impractical hat is not a strong bizarre stimulus. Begin with a conventional and **identifiable member** of the category, then add one visually dominant absurdity that an ordinary photograph could never show: a chair walking on human legs, a square-wheeled bicycle, a miniature thunderstorm under a lamp shade, or a sandwich walking on sausage legs. The category should remain clear even though the reality is impossible.

**Debatable means contested category membership, not just weirdness.** Create a conflict between **what an object looks like, what it is, what it was designed to do, and what it actually does**. A human wearing a chair backrest, a bath with an outboard motor, or a horse fitted with working pedals invites category judgement; an uncomfortable chair is still simply a chair. Humour and ambiguity are separate axes: a bizarre image can be a clear member, and a debatable one need not be visually bizarre.

### Reject or retain an idea before rendering

1. **Recognise:** Can viewers identify the main object in about a second, without zooming, at actual game tile size?
2. **Understand the joke:** Is there an obvious, unexpected *visual* contradiction without a caption? Reject ordinary novelty design and ideas whose only funny part is a long description.
3. **Classify:** For `member-bizarre`, does the item obviously still belong to the requested category? For `member-debatable`, can reasonable viewers argue both for and against its membership?
4. **Photograph:** Can the concept look like a coherent real photograph in a normal setting, rather than an accidental image-model glitch? Is the impossible feature visually prominent and internally intentional?
5. **Diversify:** Does the idea offer a different joke or conceptual mechanism from adjacent images, rather than yet another pair of human legs or simply a larger object?

Prefer strong, legible absurdity: impossible physics, deliberately hybrid anatomy, scale contradictions, objects apparently acting by themselves, recursion and literalised phrases. Reject vague deformations, merely uncomfortable objects, extra limbs that look like generation errors, busy jokes illegible at 512 px, shock imagery and unrelated background surrealism.

The standard is **an ordinary photograph of an impossible reality**. As a conceptual reference, [Erik Johansson](https://www.erikjo.com/about) uses realistic impossible imagery. [Katerina Kamprani's deliberately inconvenient objects](https://www.theuncomfortable.com/about/) illustrate why an impractical object alone does not necessarily meet this project's threshold. Do not reproduce existing artwork.

## Stimulus photography and background guidelines

**Default: an ordinary photograph of an extraordinary object.** Use natural, object-appropriate settings rather than a plain studio backdrop. The Department's instruction remains entirely conventional; the image provides the humour. A square-wheeled bicycle should appear to have been parked on a street without anyone considering that unusual.

### Photographic style

- Produce **one independent, square, photorealistic image per tile**. Use a documentary/product-documentary photographic look: credible materials, perspective, shadows and scale, including where the depicted object is impossible.
- Use a **plausible environment for that object**. Prefer a quiet street, cycle path, home, gym, nursery, farmyard or office as relevant. A studio is acceptable only where it is natural to the concept or explicitly required by a controlled comparison; it is **not the default**.
- Keep the scene **uncluttered but believable**: low to moderate background detail, no unrelated visual joke or deliberately surreal setting. A strange object in an otherwise ordinary place is the intended effect.
- Keep the object **clearly readable in the 3 × 3 game grid**. Aim for approximately **65–80% of the frame** where the object's shape permits; **vary camera angles between images** instead of making them all side-view catalogue shots. Use side views, left- and right-facing three-quarter views, and modestly elevated or lower perspectives where useful. Always show the defining features and leave enough margins to avoid cropping wheels, legs, wings or handles. Extra-long objects may need smaller framing.
- Use **soft natural daylight** or comparable diffused indoor light; consistent realistic sharpness, exposure, colour, contrast and depth of field. Avoid dramatic cinematic illumination, neon grading, heavy vignettes and excessively saturated colours. **Vary realistic object colours deliberately**: do not render most bicycles black or every member of a theme in the same colour. Distinct reds, greens, blues, yellows, neutral metallic finishes and natural materials can coexist in the same photographic style.
- Prefer **no people**, text overlays, logos, labels or watermarks. Avoid unintended instances of the instructed category elsewhere in a tile (e.g., another bicycle behind a motorcycle).
- The absurdity must belong to the **object**, not to accidental model defects. Check for unintended deformed anatomy, missing parts, fused backgrounds, unreadable features and accidental extra targets. Intentional square wheels are acceptable; random mangled spokes are not.
- Apply the same standards to **ordinary, bizarre, borderline and non-member** tiles. A target must not be identifiable merely because its image has different lighting, cleanliness, resolution or rendering style. Similarly, **do not assign all vivid colours or unusual camera angles to the bizarre targets**; mix colours and views across the four categories.

### Variety within a consistent photographic style

**Consistency does not mean identical camera angle, colour, orientation or backdrop.** The initial bicycle samples leaned heavily towards black objects photographed from the same side; the resulting set looked like repeated catalogue photographs. Future images should have the variety of ordinary photographs taken by different people in real places, while retaining comparable legibility and rendering quality.

- **Plan the complete 12-image candidate pool before rendering** (and review the final nine-image subset again). Avoid choosing each prompt independently without looking at the others.
- **Vary the angle:** combine full side profiles, front-left and front-right three-quarter views, occasional rear three-quarter views and modestly higher or lower camera positions. Use direct frontal or overhead views only when the target remains unmistakably recognisable. Do not force one of each view at the expense of the joke.
- **Vary facing direction:** some bicycles face left and others right. Do not simply mirror generated images if that makes mechanisms, writing, or lighting physically inconsistent; request a different shot during generation.
- **Vary object colours and finishes:** use believable greens, reds, blues, yellow, cream, silver, natural wood and black across the set, not an almost exclusively black palette. Colour should suit the object and setting.
- **Vary pose and placement:** parked against a wall, leaning on a kickstand, standing near a cycle path, photographed diagonally, or placed in an appropriate indoor setting. Avoid cloning the same “centred side profile against a brick wall” layout.
- **Keep the visual task fair:** vary colours, angles and backgrounds across **all four roles** (normal, bizarre, debatable and non-member). Neither “black object” nor “three-quarter view” should be a shortcut to identifying a target or distractor. Do not add excessive clutter or dramatic blur to make a particular category harder.
- **Preserve the punchline:** the camera must make the impossible feature visible. Square wheels benefit from an oblique/near-side view that shows both squares; a knotted frame needs its knot unobstructed; a six-saddle bicycle needs a wide-enough view to count saddles. Pick legibility over artificial variety.

**Shared constraints:** realistic physical lighting, crisp object boundaries, photographic credibility, moderate background complexity, object prominence and approximately similar resolution. Camera position, scene and palette may vary naturally within those limits.

Backgrounds can themselves suggest category membership (a pedal-powered chair in an office versus on a cycle path). **Record colour, viewpoint, facing direction, environment and scale** in the generation brief/sidecar when available, and review them for category cues or confounds. If a later comparison *requires* matched variants, explicitly match or counterbalance these features for that comparison; do not impose uniformity on the entire entertainment set. A visually varied collection is more enjoyable, but not automatically an experimentally balanced one.

### C01 — bicycle pool: colour, angle and setting plan

The following are **twelve candidate shots**, not instructions to add twelve tiles to a nine-tile playable grid. The colours, viewpoints and locations are creative starting points; adjust if generation fails or a key category cue becomes difficult to see. Use enough varied angles and colours in any selected **nine-image subset** so it does not revert to a uniform black side-view series.

| Candidate | Suggested colour / material | Suggested view and direction | Plausible background and visible detail |
|---|---|---|---|
| Dutch city bicycle (normal) | Deep burgundy, cream mudguards | Front-left three-quarter, facing right | Quiet brick residential street; full wheels and familiar frame visible |
| Racing bicycle (normal) | Cobalt blue with silver accents | Drive-side profile, facing left | Cycle path among fields; clean drivetrain and drop handlebars |
| Folding bicycle (normal) | Mustard yellow or red | Slightly elevated front-right three-quarter | Pavement near a station; folding joint and small wheels legible |
| Square-wheeled bicycle (bizarre) | Bright red steel frame | Left three-quarter / near-side profile | Residential street; **both square wheels** recognisable immediately |
| Six-saddle bicycle (bizarre) | Forest-green elongated frame | Wide side view, facing right | Open cycle path; **all saddles and pedal sets** fit in image |
| Knotted-frame bicycle (bizarre) | Warm orange or turquoise | Right three-quarter with unobstructed centre | Quiet park lane; dramatic **frame knot** plainly visible between normal wheels |
| Stationary exercise bike (debatable) | Teal and light grey | Front-right three-quarter, slightly elevated | Home gym; pedals, saddle and flywheel visible |
| Pedal-powered horse (debatable) | Natural chestnut coat, mixed metal fittings | Left three-quarter, facing left | Country lane or farmyard; horse, wheels **and pedals** visible |
| Pedal-powered office chair (debatable) | Grey fabric, silver mechanism, coloured trim | Front-left three-quarter | Office corridor; wheelbase, pedals and seating visible |
| Rocking horse (non-member) | Painted cream wood with dark mane | Right three-quarter | Child's room; unmistakable curved rockers |
| Motorcycle (non-member) | Metallic red or silver | Front-right three-quarter, facing left | Parking bay; engine and motorbike silhouette distinguish it from a bicycle |
| Kick scooter (non-member) | Mint-green frame | Side/left three-quarter, facing right | Urban pavement; handlebar and standing deck distinct |

**Review the whole set for colour and camera diversity** before packaging or publishing. The table is deliberately not a requirement that all categories receive identical views or colours. If the model outputs several same-looking dark objects from the same perspective, regenerate some of them—even when they are individually acceptable. Use a different viewpoint, facing direction and/or colour in the next prompt, but preserve the intended category, normal-looking environment and clear bizarre feature.

### Resolution and existing workflow

The **current implemented pipeline** generates raw images at **512 × 512 px**, then publishes **512 × 512 and 256 × 256 WebP** derivatives with opaque content-hash names. Keep that format until the generator, publisher, validator and catalogue are changed together. A higher-resolution master (e.g., 1024 × 1024 px) may be valuable for future production but **is not an implemented requirement** and must not be assumed by the current code.

Write the **specific environment, viewpoint and visible features in each tile's `prompt`** in `tools/stimuli/source.json`; the shared `style` suffix alone does not guarantee a suitable background. Keep model revision, complete prompt, seed, licence, edits and output hashes in the existing provenance system. Do not treat a contact sheet or a combined mock-up as a substitute for nine separately generated images.

Example prompt pattern:

```text
[object and exact intended oddity, including a realistic colour/material],
[plausible location DIFFERENT from other candidate shots],
[specific camera view: left or right side / front-left or front-right three-quarter / modestly elevated],
[object facing left or right; all defining features visible],
soft natural or diffused indoor light, believable candid documentary photograph,
quiet uncluttered background, square composition, no text,
no unintended additional objects from the instructed category
```

### Manual review before publishing

For every tile, verify: (1) the intended object and modification are visible; (2) the natural background is plausible; (3) the object is recognisable at **actual game tile size**; (4) the scene has no accidental extra target or misleading prop; (5) photograph quality, object scale and visual clutter are comparable to the other eight tiles; (6) any bizarre feature is intentional; and (7) the proposed `target`, `borderline` or `distractor` role remains defensible. **Across the set**, check that object colours, facing directions, views and backgrounds have useful variety rather than repetitive black side-on imagery, and that the variation is not concentrated in one target class. Review the full nine-tile contact sheet as well as each image individually. Regenerate, edit with documented provenance, or discard failures before setting `published: true`.

### Publishing a new set

1. Choose and document **nine of the twelve candidate images** from the relevant theme's planning pool, then write an ordinary `instruction` and nine source tiles in [`tools/stimuli/source.json`](../tools/stimuli/source.json), with roles `target`, `borderline`, or `distractor`. Use `research_class: "category_judgement"`, `mode: "multiple"`, and dry feedback that does not prejudge borderline cases.
2. Generate the individual images (`python tools/stimuli/generate.py` or a single tile ID), review via `python3 tools/stimuli/review.py <GRID_ID>`, and revise failed images.
3. When all nine pass manual inspection, mark the source grid `published: true`, and bump its version whenever an existing grid changes.
4. Run `python3 tools/stimuli/build.py`, `npm run check`, and the relevant end-to-end tests before deploying.
5. Only the published assets and catalogue reach the live game; drafts and raw renders remain in the source workflow. Apply the humour/category gate above as well as the photographic quality review.

Nothing here activates webcam tracking, analytics, or remote research data collection.
