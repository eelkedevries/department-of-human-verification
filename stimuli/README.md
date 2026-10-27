# Stimulus collection

This folder holds possible stimuli and records how they become game images. Browse the images in the [gallery](GALLERY.md). Start with [AGENTS.md](AGENTS.md) for mandatory agent instructions. The [catalogue](catalogue.json) is the canonical record; stage manifests select its version IDs without duplicating source metadata. [history.jsonl](history.jsonl) records decisions and transformations in order.

## Levels

| Level | Contents | Image storage |
|---|---|---|
| [raw](raw/bicycles/index.json) | Discovered sources, including candidates that still need review | External links are sufficient. Local downloads belong in the ignored `.cache/` folder. |
| [suitable](suitable/bicycles/index.json) | A visually reviewed, rights-verified subset, with reasons and preparation notes | References to raw versions; no duplicate photographs required |
| [standardized](standardized/bicycles/index.json) | Suitable originals or edited versions converted to the game format | Commit the 512 px and 256 px WebP files and their metadata. |
| [manipulated](manipulated/bicycles/index.json) | Edited variants, including AI edits, with their original inputs preserved | Commit the edited master and its provenance. |
| [final](final/bicycles/index.json) | Versioned nine-image selections for a theme and game grid | Commit the exact selected image files in each set folder. |

Within each level, use a theme folder, such as `bicycles/` or `chairs/`. Create other themes when needed and add them to [vocabulary.json](vocabulary.json). A theme is the instructed category. The object's actual type is recorded separately: a motorcycle is a distractor for the bicycle theme and may be a target for another theme.

An unchanged photograph keeps the same version ID when it enters `suitable`. A change to its pixels creates a new version with parent IDs. Raw records remain available after selection or rejection. Multiple edited versions can share the same parent. A standardised or edited version that is rejected before any final set uses it is withdrawn rather than deleted: its files are removed, while its record keeps its identity, parents and a `withdrawn` entry with the reason and the removed file records, and a `withdrawn` history event is appended. Final-set versions are never withdrawn.

The usual route is raw → suitable → standardized → final. For an edited stimulus, use suitable → manipulated → standardized → final. The folder order is not a requirement to edit every image or to put an unstandardised edit directly into a final set.

## Current contents

- Twenty-four linked raw photographs: the original twenty and four verified replacements. Original gallery ranks and discovery history are preserved.
- Four suitable photographs that meet the [target clarity standard](../docs/stimuli.md#target-clarity-standard), with approved visual and individual rights reviews: two bicycles, a motor scooter and a skateboard. The other twenty sources are rejected for clarity and remain raw only, with their reasons, so that they are not added again. The [rights review](raw/bicycles/rights-review-2026-10-26.md) records publisher links, matching evidence, licence conditions and exclusions.
- Four standardised 512/256 px WebP pairs, one for each suitable photograph, cropped as reviewed from the recorded previews. Sixteen earlier standardised versions of rejected photographs are withdrawn. No manipulated photographs yet; the empty manifest is intentional.
- A [G01 version 1 snapshot](final/bicycles/G01/1/README.md) containing byte-identical copies of the existing published grid. It is an import of the existing selection, with inherited provenance and no invented intermediate stages.

## Metadata and tags

`catalogue.json` separates three kinds of records:

- `assets`: source identity and original description, source URLs, creator, source dimensions and licence evidence.
- `versions`: visible-content description, actual object type, keywords, theme-specific assessments, stage membership, parent version IDs, review state, local files and hashes, visual characteristics, operation details and unresolved issues.
- `sets`: stable `set-id@version` keys pointing to the final selection manifests.

IDs are immutable. Internet assets use `photo-<stable-source-id>` (the initial collection uses Pexafy photo IDs); imported legacy assets use `legacy-<grid>-<tile>`. Native stock-provider IDs and catalogue IDs are recorded separately; an unresolved native ID stays `null`. Versions append a meaningful suffix, such as `-source-v1`, `-square-wheels-v1` or `-standardized-v1`. Do not reuse an ID for different bytes. Stage `index.json` files contain only selected version IDs, or set keys for `final`.

Descriptions, object types and roles are version-specific. An edit may turn a clear bicycle target into a debatable hybrid; record that on the edited version while preserving the original source's description and its raw version's role. Reusing the same source does not force all its derivatives to share a category judgement.

Controlled fields are listed in `vocabulary.json`: levels, themes, roles, origins, semantic classes, review states, rights-evidence states and log actions. Keywords are descriptive lowercase kebab-case tags; add as many as are useful without creating synonyms for the same concept. Store colour, viewpoint, facing direction, environment, support, people and additional category members in `characteristics`. Use `unknown` or an explicit unresolved issue when a detail has not been checked.

Each source licence records its name, URL, attribution, conditions, evidence status and modification permission. A catalogue's `free` label and a known publisher URL are not independent verification. Automatically verify the exact photograph, creator, applicable licence and intended reuse/modification rights during the search, before presenting it as suitable or selecting it into `suitable`. Record the matching basis, publisher evidence, reviewer and date. Keep unresolved sources raw and search for verified replacements. Re-check before later work when the intended use changes or earlier evidence does not cover it. The code's GPL licence does not relicense a photographer's work. Existing generated G01 files retain the repository's GPL terms and the recorded Apache-2.0 model provenance separately.

Licence conditions survive review: some sources restrict standalone distribution or model training. Use photographs within the authored game/review and use AI editing tools/settings that do not train on inputs where required. Permission to modify does not grant training-dataset rights. Keep third-party source files linked at raw/suitable rather than distributing a stock-image collection. The historical white folding bicycle is recorded as CC0 using its 2016 publisher date and Pixabay terms section 4; later Pixabay photographs retain their individual Content License records.

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
| `final-copy` | One approved standardised parent; local large/small copies must have the same hashes as that parent. |

New versions also need approved visual/rights review records, version-specific content metadata, local file records, and matching history/stage entries. The final copy's category judgement must be `reviewed`, not provisional.

## Final sets and publishing

Use `final/<theme>/<set-id>/<version>/` for a complete selection. Its manifest pins nine distinct image versions, tile IDs and theme-specific roles, the instruction/mode, answer key, game grid/version, and selection review. Copy both WebP sizes into that set folder. Preserve old versions, even after the game changes. New selections require cleared rights, visual approval, standardisation and a reviewed set; borderline choices remain unscored.

The imported G01 snapshot is explicitly exempt from new-stage review gates because it records an existing published set. Its original catalogue entry is retained in the manifest and its files are checked against the recorded hashes. This exception must not be used to import new candidates as final images.

Recording a final set does not publish it. The existing `tools/stimuli/source.json` → generation/review → `tools/stimuli/build.py` workflow still owns the live catalogue and opaque files in `public/stimuli/`. Use an explicit publishing task to integrate a reviewed final set; an external-photograph importer is not implemented here. Do not feed photographs into the existing renderer-only builder by pretending they have FLUX provenance. Keep collection metadata, source links, edit prompts and unpublished images outside the deployed bundle.

## Log and validation

Append one JSON object per line to `history.jsonl`. Include a unique event ID, UTC time, actor, action, affected asset/version/set IDs, parent/output IDs, previous/new level or state, and the reason. Add a new event to correct a decision. Never erase earlier decisions or invent an approval time that is not known. Git preserves previous snapshots; the validator checks the current log's references and current-state events, not the honesty of an agent's judgement.

Run `npm run validate:collection` and `npm run gallery:collection` (which regenerates [GALLERY.md](GALLERY.md)) after collection changes, and `npm run check` before committing; the check fails when the gallery is stale. Validation is offline: it checks URL syntax, not whether a remote photograph is still available or legally cleared. Agents must perform and record those checks during the search. The validator requires approved rights and verified modification permission for suitable selection, and also checks local file hashes, WebP dimensions, lineage, stage membership and final-set completeness.
