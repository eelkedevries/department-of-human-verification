# Stimuli

Each assessment shows one ordinary instruction and nine individually selectable images in a 3 × 3 grid.

## Collection and preparation workflow

All stimulus work uses the [staged collection](../stimuli/README.md) and its mandatory [agent instructions](../stimuli/AGENTS.md). The five levels are `raw`, `suitable`, `standardized`, `manipulated` and `final`, with theme folders within each. Raw/suitable can remain linked photographs; standardised files, edited masters and final selections are stored in the repository. The canonical registry records descriptions, keywords, theme-specific roles, creator/licence evidence, visual characteristics, parent versions and file hashes. Stage manifests select versions, and an append-only log records decisions and edits.

Licensed photographs may supply ordinary images or inputs for later AI edits. Verify each source and its derivative permission automatically during the search, before presenting it as suitable or adding it to `suitable`; see the search procedure below. Third-party licences remain distinct from the code licence. Both ordinary and manipulated selections must meet the photography guidelines below; edited masters must be standardised before final selection.

The collection includes 46 linked raw candidates, of which twenty meet the target clarity standard and are suitable (four of them standardised), plus a versioned snapshot of the existing G01 files. Five more are reserves; twenty-one are rejected and remain raw only. The [source review](../stimuli/raw/bicycles/rights-review-2026-10-26.md) records the evidence. The collection does not replace the live catalogue or add a photograph-import path to the renderer-only publisher. Recording a final set is separate from changing the game or deploying it. The current 512/256 px WebP pipeline remains in use.

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

The existing renderer generates images locally with [FLUX.2 [klein] 4B](https://huggingface.co/black-forest-labs/FLUX.2-klein-4B), followed by visual review. The collection also accepts licensed photographs and AI-edited derivatives with verified permissions. Preserve source identity, creator, licences, parent versions, prompts/instructions, seeds where available, model revisions, hashes, output dimensions and edits. Do not invent FLUX provenance for a photograph. Photographic context should be plausible and consistent; spectacular errors unrelated to the instructed category are not the goal.

Every collection image records its `content_origin`: `photograph`, `ai-edited-photograph` or `ai-generated` (see [`stimuli/README.md`](../stimuli/README.md#metadata-and-tags)). Where sources yield no suitable photograph, [`stimuli/SOURCES.md`](../stimuli/SOURCES.md#generated-and-edited-images) describes the generated and edited routes.

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

### Automatic checks during image searches

Source and rights verification belongs to the search procedure and must happen without a separate user request. For every photograph that will be presented as suitable:

1. Search through the source registry [`stimuli/SOURCES.md`](../stimuli/SOURCES.md), recommended sources first, and update it with what you learn. Find the original publisher page and match the exact photograph, creator and native image ID. Do not substitute a similar photograph or infer identity from a caption alone.
2. Read the licence applying to that individual image and its current terms. Confirm that it permits the intended website/game use and later manipulation, including AI edits. Check any attribution, share-alike, non-commercial, branding, privacy and redistribution restrictions relevant to that use. An aggregator's `free` label or general platform terms without an image match is insufficient.
3. Record the publisher URL, licence/evidence URLs, matching basis, permissions, conditions, reviewer and verification date in `stimuli/catalogue.json`; append the rights decision to `stimuli/history.jsonl`.
4. Complete visual and quality review: the [target clarity standard](#target-clarity-standard) in the planned square crop; no people for an unused-object search; natural placement and visible support; complete defining parts; sufficient resolution for the crop and the 512/256 px outputs. Evaluate the proposed crop as well as the full source. Screen clarity first, at thumbnail size, so that rights checks are spent only on clear candidates.
5. Rank and present only verified, visually suitable images towards the requested total. Keep uncertain candidates in `raw`, explicitly flagged, and continue searching for verified replacements. Include clickable publisher and licence links in the delivered selection. Do not defer rights checks to a later editing or publication task.

Verification records the evidence for the intended use; it does not remove licence conditions. Where a source prohibits AI training, later editing must use tools/settings that do not train on its inputs. Permission to modify an image does not authorise a training dataset. Re-check before editing or publication when the use changes or the earlier evidence does not cover it.

### Target clarity standard

**The object must be the obvious, unobstructed subject of the tile and recognisable at a glance.** A photograph in which the object is merely present, small, partly hidden, seen end-on or lost against its background is not suitable, however attractive or well licensed. Apply the standard to every role, so that targets, borderline items and distractors are equally clear and clarity is never a clue to the answer. When it conflicts with variety, setting or a suggested shot, clarity wins: keep searching rather than accepting a weaker image.

Judge each criterion in the planned square crop, not in the full photograph:

| Criterion | Requirement | Reject, for example |
|---|---|---|
| One dominant subject | Exactly one instance of the object, which is the first thing seen. No other category member, similar object or person competes for attention. | Several bicycles; a car or person beside the object; a busy scene in which the object is one element among many |
| Size | The object's longest visible dimension spans about **75–90%** of the crop (never below two-thirds), with a small visible margin on every side. All defining parts are inside the crop. | Object filling half the tile; a wheel, handlebar or bumper touching or cut by the edge |
| Position | Roughly centred horizontally and resting in the lower-middle part of the frame, with its support visible. | Object pushed into a corner; large empty foreground or sky |
| View | A side profile or shallow three-quarter view (roughly within 30° of side-on for elongated objects), with the camera near the object's mid-height, so that the whole silhouette and every defining part read clearly. | Frontal, rear, overhead or steeply oblique views; close wide-angle shots that distort or foreshorten the object |
| Unobstructed | Supports and surroundings stay behind or beside the object. Nothing crosses its defining parts. | A pole, tree, railing, lock, branch or sign in front of the frame or wheels; another object overlapping the silhouette |
| Figure–ground contrast | The object's colour or tone separates clearly from a plain or low-detail background directly behind it. Mild background blur is acceptable. | Silver or grey on grey, black on a dark shadow, an object in the same hue as its background (a green bicycle against ivy or foliage), thin parts lost against fence mesh, grilles, foliage or patterned brickwork |
| Focus and light | The whole object is sharp, evenly exposed in daylight or diffused light, with its edges clearly defined. | Motion blur, shallow focus on one part, backlit silhouettes, deep shadow or glare over defining parts |
| Tile-size test | Viewed at 256 × 256 px, and again at about 128 px, a viewer names the object within about one second. | An object identifiable only on closer inspection or at full resolution |

Record the clarity assessment in the visual review: the object's approximate share of the crop, the view and facing direction, the background contrast and any obstruction. Grade a photograph that only nearly meets a criterion as a reserve, and do not count it towards a requested number of strong candidates.

### Photographic style

- Produce **one independent, square, photorealistic image per tile**. Use a documentary/product-documentary photographic look: credible materials, perspective, shadows and scale, including where the depicted object is impossible.
- Use a **plausible environment for that object**. Prefer a quiet street, cycle path, home, gym, nursery, farmyard or office as relevant. A studio is acceptable only where it is natural to the concept or explicitly required by a controlled comparison; it is **not the default**.
- Keep the scene **uncluttered but believable**: low to moderate background detail, no unrelated visual joke or deliberately surreal setting. A strange object in an otherwise ordinary place is the intended effect.
- Keep the object **clearly readable in the 3 × 3 game grid**, as set out in the [target clarity standard](#target-clarity-standard): about **75–90% of the crop** along its longest dimension, roughly centred, with small margins so that wheels, legs, wings or handles are never cropped. Vary facing direction and use shallow three-quarter as well as side views, within the limits of that standard.
- Use **soft natural daylight** or comparable diffused indoor light; consistent realistic sharpness, exposure, colour, contrast and depth of field. Avoid dramatic cinematic illumination, neon grading, heavy vignettes and excessively saturated colours. **Vary realistic object colours deliberately**: do not render most bicycles black or every member of a theme in the same colour. Distinct reds, greens, blues, yellows, neutral metallic finishes and natural materials can coexist in the same photographic style.
- Prefer **no people**, text overlays, logos, labels or watermarks. Avoid unintended instances of the instructed category elsewhere in a tile (e.g., another bicycle behind a motorcycle).
- The absurdity must belong to the **object**, not to accidental model defects. Check for unintended deformed anatomy, missing parts, fused backgrounds, unreadable features and accidental extra targets. Intentional square wheels are acceptable; random mangled spokes are not.
- Apply the same standards to **ordinary, bizarre, borderline and non-member** tiles. A target must not be identifiable merely because its image has different lighting, cleanliness, resolution or rendering style. Similarly, **do not assign all vivid colours or unusual camera angles to the bizarre targets**; mix colours and views across the four categories.

### Natural placement, support and physical coherence — all categories

**Stage the object as someone would normally encounter it, not as an isolated catalogue exhibit.** This applies to every theme and to normal, bizarre, debatable and non-member images. A suitable background alone is insufficient: the object's position, contact with its surroundings and means of support must also be believable.

- **Plan a concrete placement before rendering:** name the supporting surface or object, the contact points and the pose. Use a mix of walls, railings, racks, floors, tables, shelves, water and other category-appropriate surroundings. Do not repeat the same conspicuous support device across a pool.
- **Prefer ordinary contextual support.** Most parked bicycles should lean naturally against a wall, fence or railing, or rest against an ordinary bicycle rack (`fietsenrek`). A green wall, a weathered garden fence or a station rack can make the scene credible without becoming another visual joke. A deployed kickstand is acceptable for some shots when natural; do not solve the whole set with added kickstands, repair stands or showroom display stands.
- **Show a credible load path:** the object must actually touch the wall, rack, ground or other support. A support merely placed nearby is insufficient. Leaning objects need a plausible lean; feet, tyres, bases and contact shadows must agree with the same surface and perspective. A stationary two-wheeled bicycle cannot balance upright unsupported.
- **Keep support separate from function.** Stands must not replace pedals, crank arms, legs or other defining components. Check complete joints, frame connections, wheel axles, chain routing, handles and hinges after every edit. A plausible support does not compensate for a missing pedal or fused mechanism.
- **Preserve only the intended impossibility.** Explicitly identify the deliberate absurd feature, then require ordinary physical coherence elsewhere. A square-wheeled bicycle may have square wheels, but it still needs believable parking support. A floating van is an exception to ground contact because hovering is the specified joke; do not add a stand that defeats it.
- **Protect the category and punchline:** supports and surroundings must not obscure defining features, introduce another category member, or become an unintended clue to the answer. Apply comparable contextual care across all four roles. Genuine category ambiguity must come from the intended concept rather than rendering errors.

Use the relevant placement principle for **all fifteen candidate themes**:

| Theme | Natural placement and support checks |
|---|---|
| Bicycles | Mostly lean against walls, fences or railings, or park against ordinary racks; show actual contact. Use occasional deployed kickstands where appropriate. Preserve all pedals, chains and wheels. Exercise bikes use their normal stabiliser feet. |
| Chairs | Place feet, rockers or the normal wheeled base on a plausible floor or ground surface. For walking-chair concepts, show the intended feet making credible contact; preserve the deliberate anatomy. |
| Ducks | Show plausible feet on a bank, ground or perch, or believable immersion and ripples in water. Preserve intended hybrid features without unrelated anatomical errors. |
| Cars | Park on tyres in an ordinary bay or street, with consistent ground contact and shadows. Use the specified legs or hovering behaviour only when integral to the joke. |
| Houses | Relate foundations to the street or terrain; preserve plausible scale, access and perspective. Walking houses use the deliberately specified legs or boots as supports. |
| Lamps | Rest bases on tables or floors, or show a conventional wall/ceiling attachment where appropriate. Preserve intended surreal light or anatomy without making the whole lamp inexplicably float. |
| Shoes | Rest soles on a floor, shelf or other ordinary surface, or show them worn where required by the concept. Keep any intended walking legs, hand heel or other alteration deliberate and readable. |
| Clocks | Show a credible wall fastening, shelf, bedside table or floor placement appropriate to the clock. Keep supports clear of the dial and preserve intentional arms, legs or cuckoo features. |
| Boats | Show believable flotation, waterline, reflections and ripples, or ordinary shore/mooring support. For walking boats, relate the specified legs to the beach or ground. |
| Computers | Place devices and peripherals coherently on desks, worktops or laps when essential to the scene. Screens, keyboards and supports must remain structurally distinct from the intended impossible content. |
| Musical instruments | Use an ordinary case, instrument stand, floor or table placement appropriate to the instrument. Keep support away from keys, strings, valves and the central absurd feature. |
| Vehicles | Use appropriate road, rail or ground contact and ordinary parking arrangements; departures such as legs or hovering must be explicitly part of the concept. |
| Hats | Show headwear resting on a shelf, hook or table, or worn where the concept requires it. For walking hats, preserve the intended legs and their contact with the ground. |
| Bridges | Show credible connections to both banks or their intended supports, consistent water/ground relationships and clear load-bearing contact, apart from the explicitly specified impossible feature. |
| Sandwiches | Rest food on a plate, board, wrapping or tabletop with coherent contact and scale. Preserve intended sausage legs or oversized fillings without unrelated floating layers or props. |

Record **placement, support, contact points and intended exception** in each generation prompt and provenance sidecar. Inspect these at full resolution and actual tile size, then re-check the whole pool for repeated catalogue staging. Edits require the same review as first renders: reject unsupported balancing, floating contact points, interpenetrating supports, displaced shadows and replacement of functional parts.

### Variety within a consistent photographic style

**Consistency does not mean identical camera angle, colour, orientation or backdrop.** The initial bicycle samples leaned heavily towards black objects photographed from the same side; the resulting set looked like repeated catalogue photographs. Future images should have the variety of ordinary photographs taken by different people in real places, while retaining comparable legibility and rendering quality.

- **Plan the complete 12-image candidate pool before rendering** (and review the final nine-image subset again). Avoid choosing each prompt independently without looking at the others.
- **Vary the angle within the clarity standard:** combine left- and right-facing side profiles with shallow front or rear three-quarter views. Avoid frontal, overhead and steeply oblique views unless the object remains as immediately recognisable as in a profile. Do not force one of each view at the expense of clarity or the joke.
- **Vary facing direction:** some bicycles face left and others right. Do not simply mirror generated images if that makes mechanisms, writing, or lighting physically inconsistent; request a different shot during generation.
- **Vary object colours and finishes:** use believable greens, reds, blues, yellow, cream, silver, natural wood and black across the set, not an almost exclusively black palette. Colour should suit the object and setting.
- **Vary pose and placement:** lean against a wall or fence, park against an ordinary rack, rest on an appropriate surface, or use an occasional natural kickstand. Name and show the actual support; merely standing near a cycle path does not explain an upright bicycle. Vary the background, colour and support rather than the object's size or clarity; avoid cloning the same backdrop in every tile.
- **Keep the visual task fair:** vary colours, angles and backgrounds across **all four roles** (normal, bizarre, debatable and non-member). Neither “black object” nor “three-quarter view” should be a shortcut to identifying a target or distractor. Do not add excessive clutter or dramatic blur to make a particular category harder.
- **Preserve the punchline:** the camera must make the impossible feature visible. Square wheels benefit from an oblique/near-side view that shows both squares; a knotted frame needs its knot unobstructed; a six-saddle bicycle needs a wide-enough view to count saddles. Pick legibility over artificial variety.

#### Set-level variety targets

Apply these targets to every candidate pool and to every nine-image selection, counting images already selected. Check them within each role as well as across the whole set. All images must still meet the [target clarity standard](#target-clarity-standard); where both cannot be met, keep searching rather than relaxing either.

| Feature | Target |
|---|---|
| View | At most about half the images in a strict side profile; at least a third in shallow front or rear three-quarter views (about 15–30° from side-on). |
| Facing direction | Both directions; neither above about 60% of the images. |
| Colour | No single colour above about a quarter of the images; avoid a predominantly black or dark set. |
| Support and setting | At least four different supports or settings (for example a wall, a fence or railing, a bicycle rack, a kickstand on open pavement, a tree or post); none used by more than half the images. |
| Backdrop | No two images with near-identical composition, colour and backdrop. |

Record the counts in the dated review document. The [procedure checklists](../stimuli/CHECKLISTS.md) require this check before any search or selection is finished.

**Shared constraints:** realistic physical lighting, crisp object boundaries, photographic credibility, moderate background complexity, object prominence and approximately similar resolution. Camera position, scene and palette may vary naturally within those limits.

Backgrounds can themselves suggest category membership (a pedal-powered chair in an office versus on a cycle path). **Record colour, viewpoint, facing direction, environment and scale** in the generation brief/sidecar when available, and review them for category cues or confounds. If a later comparison *requires* matched variants, explicitly match or counterbalance these features for that comparison; do not impose uniformity on the entire entertainment set. A visually varied collection is more enjoyable, but not automatically an experimentally balanced one.

### C01 — bicycle pool: colour, angle and setting plan

The following are **twelve candidate shots**, not instructions to add twelve tiles to a nine-tile playable grid. The colours, viewpoints and locations are creative starting points; adjust if generation fails or a key category cue becomes difficult to see. Where a suggested view conflicts with the [target clarity standard](#target-clarity-standard), the standard takes precedence. Use enough varied angles and colours in any selected **nine-image subset** so it does not revert to a uniform black side-view series.

| Candidate | Suggested colour / material | Suggested view and direction | Plausible background and visible detail |
|---|---|---|---|
| Dutch city bicycle (normal) | Deep burgundy, cream mudguards | Front-left three-quarter, facing right | Quiet brick residential street; leaning against a muted green wall with visible saddle/handlebar contact; full wheels and frame visible |
| Racing bicycle (normal) | Cobalt blue with silver accents | Drive-side profile, facing left | Beside a cycle path among fields; leaning against a weathered wooden fence; clean drivetrain and drop handlebars |
| Folding bicycle (normal) | Mustard yellow or red | Slightly elevated front-right three-quarter | Pavement near a station; resting against an ordinary empty bicycle rack; folding joint, pedals and small wheels legible |
| Square-wheeled bicycle (bizarre) | Bright red steel frame | Left three-quarter / near-side profile | Residential street; leaning against a pale green wall with credible contact; **both square wheels** immediately recognisable |
| Six-saddle bicycle (bizarre) | Forest-green elongated frame | Wide side view, facing right | Beside an open cycle path; leaning against a long timber railing behind the saddles; **all six saddles and pedal sets** fit in image |
| Knotted-frame bicycle (bizarre) | Warm orange or turquoise | Right three-quarter with unobstructed centre | Quiet park lane; leaning against an ordinary park railing behind the bicycle; dramatic **frame knot** and pedals unobstructed |
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
[specific natural placement, support and visible contact points; intended exception if any],
soft natural or diffused indoor light, believable candid documentary photograph,
quiet uncluttered background, square composition, no text,
no unintended additional objects from the instructed category
```

### Manual review before publishing

For every tile, verify: (1) the intended object and modification are visible; (2) the natural background is plausible; (3) the object meets the [target clarity standard](#target-clarity-standard) and is recognisable at **actual game tile size**; (4) the scene has no accidental extra target or misleading prop; (5) photograph quality, object scale and visual clutter are comparable to the other eight tiles; (6) any bizarre feature is intentional; (7) the proposed `target`, `borderline` or `distractor` role remains defensible; and (8) placement, actual support contact, ground/water relationships, shadows and functional components are coherent apart from the specified impossibility. Reject bikes balancing upright unsupported and edits that turn pedals into stands. **Across the set**, check that object colours, facing directions, views and backgrounds have useful variety rather than repetitive black side-on imagery, and that the variation is not concentrated in one target class. Review the full nine-tile contact sheet as well as each image individually. Regenerate, edit with documented provenance, or discard failures before setting `published: true`.

### Publishing a new set

1. Choose and document **nine of the twelve candidate images** from the relevant theme's planning pool, then write an ordinary `instruction` and nine source tiles in [`tools/stimuli/source.json`](../tools/stimuli/source.json), with roles `target`, `borderline`, or `distractor`. Use `research_class: "category_judgement"`, `mode: "multiple"`, and dry feedback that does not prejudge borderline cases.
2. Generate the individual images (`python tools/stimuli/generate.py` or a single tile ID), review via `python3 tools/stimuli/review.py <GRID_ID>`, and revise failed images.
3. When all nine pass manual inspection, mark the source grid `published: true`, and bump its version whenever an existing grid changes.
4. Run `python3 tools/stimuli/build.py`, `npm run check`, and the relevant end-to-end tests before deploying.
5. Only the published assets and catalogue reach the live game; drafts and raw renders remain in the source workflow. Apply the humour/category gate above as well as the photographic quality review.

Nothing here activates webcam tracking, analytics, or remote research data collection.
