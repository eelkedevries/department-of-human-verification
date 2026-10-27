# Stimulus collection

This folder holds possible stimuli and records how they become game images. Browse the images in the [gallery](GALLERY.md). Start with [AGENTS.md](AGENTS.md) for mandatory agent instructions and [CHECKLISTS.md](CHECKLISTS.md) for the checklists that every procedure must complete. [SOURCES.md](SOURCES.md) is the registry of image sources. The [catalogue](catalogue.json) is the canonical record; stage manifests select its version IDs without duplicating source metadata. [history.jsonl](history.jsonl) records decisions and transformations in order.

## Levels

| Level | Contents | Image storage |
|---|---|---|
| [raw](raw/bicycles/index.json) | Discovered sources, including candidates that still need review | External links are sufficient. Local downloads belong in the ignored `.cache/` folder. |
| [suitable](suitable/bicycles/index.json) | A visually reviewed, rights-verified subset, with reasons and preparation notes | References to raw versions; no duplicate photographs required |
| [standardized](standardized/bicycles/index.json) | Suitable originals or edited versions converted to the game format | Commit the 512 px and 256 px WebP files and their metadata. |
| [manipulated](manipulated/bicycles/index.json) | Edited variants, including AI edits, with their original inputs preserved | Commit the edited master and its provenance. |
| [final](final/bicycles/index.json) | Versioned nine-image selections for a theme and game grid | Commit the exact selected image files in each set folder. |

Within each level, use a theme folder, such as `bicycles/` or `chairs/`. Create other themes when needed and add them to [vocabulary.json](vocabulary.json). A theme is the instructed category. The object's actual type is recorded separately: a motorcycle is a distractor for the bicycle theme and may be a target for another theme.

An unchanged photograph keeps the same version ID when it enters `suitable`. A change to its pixels creates a new version with parent IDs. Raw records remain available after selection or rejection. There is no reserve status (owner's decision, 27 October 2026): a raw image is suitable if it meets the clarity standard and the rights check, rejected with a reason if it does not, or awaiting review until it is decided. Suitable images are not removed to improve set-level variety. Multiple edited versions can share the same parent. A standardised or edited version that is rejected before any final set uses it is withdrawn rather than deleted: its files are removed, while its record keeps its identity, parents and a `withdrawn` entry with the reason and the removed file records, and a `withdrawn` history event is appended. Final-set versions are never withdrawn.

The usual route is raw → suitable → standardized → final. For an edited stimulus, use suitable → manipulated → standardized → final. The folder order is not a requirement to edit every image or to put an unstandardised edit directly into a final set.

## Current contents

Fifteen themes, one for each pool of the [concept table](../docs/stimulus-concepts.md); each theme's dated review document under `raw/<theme>/` records its searches, rights checks, renders and rejections.

- **Bicycles:** fifty-two linked raw photographs, thirty-one of them suitable (twenty-one rejected for clarity remain raw, with reasons); the rights reviews of [26 October](raw/bicycles/rights-review-2026-10-26.md) and [27 October](raw/bicycles/rights-review-2026-10-27.md) record publisher links, matching evidence, licence conditions and exclusions.
- **Themes 2–15:** 107 suitable photographs from Unsplash and Pexels, found by screening about 9,800 search results, plus one bicycle photograph reused as a cars non-member.
- 140 suitable photographs in all, and 214 standardised 512/256 px WebP pairs; earlier standardised versions of rejected photographs are withdrawn.
- 75 AI masters under `manipulated/`: 71 images generated with FLUX.2 [klein] 4B and 4 AI edits of verified photographs, each with its prompt, seed, model revision and review. Rejected renders were not registered.
- Twenty final sets: C01–C15, one per theme, and second versions of C02, C04, C08, C09 and C14 that add images re-rendered after the first versions. All are marked for publication; the game serves the latest version of each grid.
- The legacy G01 version 1 snapshot was removed on the owner's decision of 27 October 2026; its records remain only as tombstones (`retired_sets` and `withdrawn` entries) so that the history stays resolvable.

## Metadata and tags

`catalogue.json` separates three kinds of records:

- `assets`: source identity and original description, source URLs, creator, source dimensions and licence evidence.
- `versions`: visible-content description, actual object type, content origin, keywords, theme-specific assessments, stage membership, parent version IDs, review state, local files and hashes, visual characteristics, operation details and unresolved issues.
- `sets`: stable `set-id@version` keys pointing to the final selection manifests.

IDs are immutable. Internet assets use `photo-<stable-source-id>` (the initial collection uses Pexafy photo IDs); imported legacy assets use `legacy-<grid>-<tile>`. Native stock-provider IDs and catalogue IDs are recorded separately; an unresolved native ID stays `null`. Versions append a meaningful suffix, such as `-source-v1`, `-square-wheels-v1` or `-standardized-v1`. Do not reuse an ID for different bytes. Stage `index.json` files contain only selected version IDs, or set keys for `final`.

Descriptions, object types and roles are version-specific. An edit may turn a clear bicycle target into a debatable hybrid; record that on the edited version while preserving the original source's description and its raw version's role. Reusing the same source does not force all its derivatives to share a category judgement.

`content_origin` records how the version's pixels came about: `photograph` (a camera photograph, changed at most by standardisation), `ai-edited-photograph` (a photograph whose content an AI edit has altered) or `ai-generated` (generated entirely by a model, including later edits). It is distinct from the asset's `origin`, which describes how the source entered the collection. The validator derives the expected value from the lineage. The names avoid "natural", which the guidelines use for settings and placement, and "manipulated", which is a level name.

Controlled fields are listed in `vocabulary.json`: levels, themes, roles, origins, semantic classes, review states, rights-evidence states and log actions. Keywords are descriptive lowercase kebab-case tags; add as many as are useful without creating synonyms for the same concept. Store colour, viewpoint, facing direction, environment, support, people and additional category members in `characteristics`. Use `unknown` or an explicit unresolved issue when a detail has not been checked.

Each source licence records its name, URL, attribution, conditions, evidence status and modification permission. Rights checks are quick and proportionate (see the [guidelines](../docs/stimuli.md#rights-checks-during-image-searches)): use openly licensed and free-licence sources, never commercial stock agencies such as Getty Images, and confirm the licence on the image's own page rather than an index label. `verified` means that check was done and the page URL, licence, reviewer and date are recorded; the more detailed evidence in earlier records is not required for new ones. The code's GPL licence does not relicense a photographer's work. Existing generated G01 files retain the repository's GPL terms and the recorded Apache-2.0 model provenance separately.

Licence conditions survive review: some sources ask for credit, share-alike or non-commercial use, or restrict standalone redistribution or training datasets. Use photographs within the authored game and review, and never add them to an AI training dataset; AI editing tools may be used. Keep third-party source files linked at raw/suitable rather than distributing a stock-image collection. The historical white folding bicycle is recorded as CC0 using its 2016 publisher date and Pixabay terms section 4; later Pixabay photographs retain their individual Content License records.

`files` records repository-relative paths, SHA-256 hashes, dimensions, format, colour mode/space, byte count and purpose (`large`, `small` or `master`). A downloaded preview's hash identifies that preview only; do not present it as the unknown original master's hash. Crop coordinates state their reference dimensions and whether they describe a preview or verified master.

## Standardisation and editing

The `webp-512-256-v1` profile matches the current publisher: square RGB images in sRGB, 512 × 512 and 256 × 256 px, WebP quality 82, method 6, with Lanczos resizing. Apply orientation and colour conversion, then a reviewed square crop. Preserve the full object and visible support. Do not stretch a rectangular photograph or silently upscale a small crop. Record the input dimensions, crop, orientation, colour conversion, resampling and encoder; keep the output files and hashes.

`python3 tools/stimuli/standardise.py <theme>` applies this profile to every suitable photograph without a standardised child, using the reviewed preview and its recorded crop. It refuses a preview whose bytes changed at the source unless the version is passed to `--accept-reencoded` with unchanged dimensions, writes a contact sheet to `.cache/`, and registers the versions only after the reviewer inspects them and supplies approved visual reviews (`--reviews <file> --actor <name>`).

For an AI edit, record the parent versions, intended change, complete instructions, tool/provider, model and revision, seed where available, timestamp, actor, output hash and visual review. If a value is unavailable, record `null` with an explanation. Check support, shadows, functional parts and the defining category features after editing. Preserve only the intended impossibility. The [photography guidelines](../docs/stimuli.md#stimulus-photography-and-background-guidelines) apply to all levels and roles.

All operation records include `type`, `timestamp` and `actor`. Use these fields for new derivatives:

| Operation | Additional fields |
|---|---|
| `standardisation` | `profile: "webp-512-256-v1"`, `input_dimensions: {width, height}`, `crop: {x, y, side}` in oriented input pixels, `orientation`, `colour_conversion`, `resampling`, `encoder`, `content_changes: false`, `allow_upscale: false` |
| `ai-edit` | `intended_change`, `instructions`, `tool`, `provider`, `model`, `model_revision`, `seed`; for unavailable values, use `null` and an explanation under `unavailable_fields.<field>` |
| `generation` | The same fields as `ai-edit`, on the parentless manipulated root version of a `generated` asset (an image generated from a prompt alone, `content_origin: ai-generated`). |
| `final-copy` | One approved standardised parent; local large/small copies must have the same hashes as that parent. |

New versions also need approved visual/rights review records, version-specific content metadata, local file records, and matching history/stage entries. The final copy's category judgement must be `reviewed`, not provisional.

## Final sets and publishing

Use `final/<theme>/<set-id>/<version>/` for a complete selection. Its manifest pins nine distinct image versions, tile IDs and theme-specific roles, the instruction/mode, answer key, game grid/version, and selection review. Copy both WebP sizes into that set folder. Preserve old versions, even after the game changes. New selections require cleared rights, visual approval, standardisation and a reviewed set; borderline choices remain unscored.

The imported G01 snapshot was exempt from new-stage review gates because it recorded an existing published set; it was retired on the owner's decision of 27 October 2026. A retired set keeps a tombstone in `retired_sets` with the removed file paths and a `set_retired` history event; its versions are withdrawn. Only the owner can retire a final set, and no new legacy imports may be made.

Recording a final set does not publish it. `tools/stimuli/publish.py` publishes the final sets whose manifest says `"game": {"publish": true, ...}`: it copies their WebP pairs to `public/stimuli/` under opaque content-hash names and writes `src/stimuli/catalogue.json` with each tile's credit (creator, source page, licence and, for AI images, the model). Where a grid has several published versions, only the latest is served; earlier versions stay recorded in the collection. Prompts, seeds, collection paths and unpublished images stay out of the deployed bundle. The legacy `tools/stimuli/build.py` route for generated renders is superseded.

## Tools

| Step | Tool |
|---|---|
| Register reviewed photographs (raw → suitable) or AI masters (→ manipulated) | `python3 tools/stimuli/register.py photos THEME RECORDS.json` or `… register.py ai THEME RECORDS.json` |
| Render AI edits of standardised photographs and fully generated images | `python tools/stimuli/manipulate.py JOBS.json OUT` (FLUX.2 [klein] 4B on the CPU; needs torch, diffusers and transformers) |
| Standardise suitable photographs and manipulated masters | `python3 tools/stimuli/standardise.py THEME [--reviews R --actor A]` |
| Record a nine-image final set | `python3 tools/stimuli/finalise.py SET.json` |
| Publish final sets to the game | `python3 tools/stimuli/publish.py` |

## Log and validation

Append one JSON object per line to `history.jsonl`. Include a unique event ID, UTC time, actor, action, affected asset/version/set IDs, parent/output IDs, previous/new level or state, and the reason. Add a new event to correct a decision. Never erase earlier decisions or invent an approval time that is not known. Git preserves previous snapshots; the validator checks the current log's references and current-state events, not the honesty of an agent's judgement.

Run `npm run validate:collection` and `npm run gallery:collection` (which regenerates [GALLERY.md](GALLERY.md)) after collection changes, and `npm run check` before committing; the check fails when the gallery is stale. Validation is offline: it checks URL syntax, not whether a remote photograph is still available or legally cleared. Agents must perform and record those checks during the search. The validator requires approved rights and verified modification permission for suitable selection, and also checks local file hashes, WebP dimensions, lineage, stage membership and final-set completeness.
