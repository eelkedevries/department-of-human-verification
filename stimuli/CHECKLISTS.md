# Stimulus procedure checklists

**Mandatory.** Before finishing any stimulus procedure, work through its checklist below and then the [closing checklist](#closing-checklist-every-procedure). Fix every failed item before committing. Where an item cannot be met, for example because no verified image exists, do not hide it: state it in the final report with the reason. Include the completed checklists in the final report (section 1 of the report required by the root `AGENTS.md`), marking each item met, not met or not applicable.

A check that passes for each image separately can still fail for the set. The set-level items are part of the procedure, not an optional extra.

## Search and selection (raw → suitable)

Before searching:

- [ ] Read `AGENTS.md`, `README.md`, the stage manifests and the [photography guidelines](../docs/stimuli.md#stimulus-photography-and-background-guidelines).
- [ ] Count what the request needs, by role (targets, distractors, borderline) and by object type.
- [ ] Write a pool plan that meets the [set-level variety targets](../docs/stimuli.md#set-level-variety-targets), counting images already selected: views, facing directions, colours, supports and settings. Vary the search terms to match the plan (for example “side view”, “three-quarter”, “bike rack”, “fence”, “railing”), not only side profiles.
- [ ] Check `catalogue.json` for duplicates and for previously rejected sources.
- [ ] Read [SOURCES.md](SOURCES.md); search the recommended sources first, and use index sources only for discovery.

For each image presented or selected:

- [ ] Meets every criterion of the [target clarity standard](../docs/stimuli.md#target-clarity-standard) in its planned square crop: one dominant instance, about 75–90% of the crop, roughly centred, side or shallow three-quarter view, nothing crossing it, clear figure–ground contrast (including no same-hue background), sharp even light.
- [ ] Viewed at 256 px and about 128 px and recognised at once.
- [ ] Crop side is at least 512 px of the reviewed preview, needs no upscaling and cuts nothing.
- [ ] No people; natural placement with visible support; complete defining parts.
- [ ] Quick rights check on the image's own page: a usable source (not a commercial stock agency such as Getty Images) and an open or free licence (avoid NoDerivatives for images to be edited); page URL, creator, licence, attribution, notable conditions, reviewer and date recorded.
- [ ] `content_origin` recorded (`photograph` for an unedited photograph).
- [ ] Description, object type, role, keywords and characteristics (colour, viewpoint, facing direction, environment, support, people) recorded from the image, not from the search query.

For the whole set, after selection:

- [ ] Reviewed as one contact sheet at tile size, including the images already selected.
- [ ] Meets the [set-level variety targets](../docs/stimuli.md#set-level-variety-targets) for views, facing direction, colour and support/setting, within each role as well as overall.
- [ ] No near-duplicates in composition, colour or backdrop.
- [ ] Neither view, colour, setting nor image quality distinguishes targets from distractors.
- [ ] The set-level assessment (counts per view, facing direction, colour and support) is written in the dated review document, together with the sources and queries searched and roughly how many results were screened.
- [ ] [SOURCES.md](SOURCES.md) is updated for every source used or tried: status, access, pitfalls, yield and the date last checked; any new source added under Evaluated sources.

## Rejection or demotion

- [ ] The reason is recorded on the version's review and in a history event.
- [ ] Only the relevant stage membership is removed; the raw record remains so that the source is not added again.
- [ ] Every unused standardised or edited derivative of a rejected source is withdrawn (files deleted, `withdrawn` entry and event).
- [ ] The image was rejected because it fails the clarity standard or the rights check, not to improve set-level variety (there is no reserve status).
- [ ] The remaining selection is re-checked against the set-level variety targets, and any shortfall is reported.

## Standardisation (suitable or manipulated → standardized)

- [ ] Each parent has approved visual and rights reviews and a reviewed crop.
- [ ] `tools/stimuli/standardise.py` is used; a preview whose bytes changed is accepted only after visual comparison and recorded as such.
- [ ] Every output is inspected at 256 px and about 128 px; the object is complete, uncut and as clear as in the reviewed crop.
- [ ] The versions are registered only with approved visual reviews; transformations, hashes and licence conditions are recorded, and `content_origin` is inherited from the parent.

## AI editing or generation (→ manipulated)

- [ ] For an edit: the source licence permits modification (not NoDerivatives), and the image is not added to any AI training dataset. For a generated image: the generator has an entry in [SOURCES.md](SOURCES.md) and no third-party image was used as input.
- [ ] Instructions, tool, provider, model, revision, seed (or the reason it is unavailable), actor, timestamp, parents and output hash are recorded.
- [ ] Only the intended change is present: support, shadows, functional parts and category features are otherwise intact.
- [ ] The edited image still meets the target clarity standard; its role and semantic class are reassessed for the edited content.
- [ ] `content_origin` is `ai-edited-photograph` for an edited photograph, or stays `ai-generated` for an edited generated image.
- [ ] The output is free of borders, frames, text, extra category members and broken anatomy, and the impossibility or category question reads at once at 128 px (the one-second, no-caption test in [stimulus-concepts.md](../docs/stimulus-concepts.md)); failures are not registered or are withdrawn.
- [ ] The render sidecar (prompt, seed, steps, revision, software) is recorded through `tools/stimuli/register.py ai`.
- [ ] The edit is standardised before any final selection.

## Final set (→ final)

- [ ] Nine distinct, standardised and approved images; byte-identical copies in the versioned set folder.
- [ ] Roles reviewed and defensible; the answer key contains exactly the clear targets; borderline tiles are listed.
- [ ] The nine-tile contact sheet meets the set-level variety targets and gives no cue to the answer through view, colour, setting or quality.
- [ ] The manifest, catalogue and history are complete; earlier set versions are unchanged.
- [ ] Publishing to the game is a separate task and has not happened implicitly.

## Publishing (final → game)

- [ ] Only final sets whose manifest sets `"game": {"publish": true}` are published, with `tools/stimuli/publish.py`.
- [ ] `src/stimuli/catalogue.json` gives every tile its credit (creator, source page, licence and, for AI images, the model) and no prompts, seeds or collection paths; the About dialog lists the credits.
- [ ] `npm run check`, the end-to-end tests and the public-build check pass; the live page is checked after the deploy.

## Closing checklist (every procedure)

- [ ] `catalogue.json`, the affected stage manifests and `history.jsonl` are updated together.
- [ ] `npm run gallery:collection` has regenerated [GALLERY.md](GALLERY.md).
- [ ] [SOURCES.md](SOURCES.md) reflects any source used, tried or newly found useful or unusable.
- [ ] Every document that states collection counts is updated: this folder's `README.md` and level READMEs, `docs/stimuli.md`, the root `README.md` and `docs-dev/planning/current_state.md`.
- [ ] `npm run validate:collection` and `npm run check` pass.
- [ ] The work is committed and pushed to `main`.
- [ ] The final report includes these checklists and every unmet item with its reason.
