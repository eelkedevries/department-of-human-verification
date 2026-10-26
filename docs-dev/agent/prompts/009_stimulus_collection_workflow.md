# Task: Organise the stimulus collection and its provenance

## Goal

Create a mandatory, documented stimulus collection with raw, suitable, standardized, manipulated and final levels, preserving sources, tags, decisions and edit history.

## Scope

Implement this collection and its agent instructions as one reviewable change. Preserve the current game, published assets, scoring and deployment behaviour.

## Context

- Follow `AGENTS.md`, `docs/stimuli.md` and the current stimulus photography guidelines.
- The owner requests licensed internet photographs as possible inputs, as well as AI-manipulated derivatives. Update the relevant specification decisions accordingly; keep the existing generated-image workflow available.
- Input: the 20-image ranked gallery prepared on 26 October 2026, with its source metadata and review notes. The saved HTML contains an `image-manifest` JSON block. Original publisher pages were unresolved for 11 entries; those entries have an exact photograph URL and catalogue-supplied creator/licence information. Preserve this limitation explicitly.

## Required changes

1. Create the top-level `stimuli/` collection, organised first by level and then by theme:

   ```text
   stimuli/
     README.md
     AGENTS.md
     catalogue.json
     vocabulary.json
     history.jsonl
     raw/bicycles/
     suitable/bicycles/
     standardized/bicycles/
     manipulated/bicycles/
     final/bicycles/<set-id>/<version>/
   ```

   Create other theme directories when they are used. Retain these exact level names, including `standardized`, while using British English in prose. Each stage directory must have a short README or manifest so it is present in Git even when it contains no images.

2. Make `stimuli/catalogue.json` the canonical registry. Give each source asset a stable ID and each derived version its own ID. Stage manifests reference these IDs instead of duplicating metadata or source photographs. Retain raw records when promoting or rejecting a candidate; selection is recorded, not destructive movement. Support multiple independent manipulated variants and reuse across themes.

3. Define the levels and storage rules clearly:

   - `raw`: discovered or generated source candidates; preserve the source without claiming suitability. Internet images may remain external links.
   - `suitable`: an explicitly reviewed subset of raw candidates, with a reason for inclusion and any outstanding issues. These may also remain linked; do not copy their image bytes merely to promote them.
   - `standardized`: actual, tracked repository files prepared from suitable originals or manipulated versions. Use the implemented 512 × 512 and 256 × 256 RGB WebP formats and encoding settings in `tools/stimuli/build.py`. Document crops, orientation, colour handling and resizing; do not stretch, silently upscale or introduce generative changes during standardisation.
   - `manipulated`: actual edited image files tracked in the repository, plus the full input lineage, intended change, editing instructions, AI tool/model/revision, seed where available, actor, time and output hash. Preserve the unedited parent. Higher-resolution masters may be retained here. Any manipulated image must undergo standardisation and visual review before final use.
   - `final`: a versioned, curated set for a particular theme, with an explicit manifest listing the exact image versions, tile roles, instruction and corresponding game grid/version. Store the selected image files in the repository under that set. Preserve older set versions.

   These are workflow levels, not a requirement to manipulate every image. Document both routes: raw → suitable → standardized → final, and suitable → manipulated → standardized → final.

4. Record at least: asset/version IDs; level membership; theme and theme-specific role (`target`, `distractor`, `borderline`, `unassigned`); actual object type; keywords; short visible-content description; source/publisher/direct URLs; creator; licence name/URL; attribution and modification conditions; licence-evidence status; source dimensions and whether reported or verified; local path where required; parent version IDs; hashes of downloaded/derived bytes; creation/update times and actor; suitability rank/reason; and visual characteristics including colour, viewpoint, facing direction, environment, support, people and additional target objects. Theme and object type are separate: a motorcycle can be a distractor for bicycles and a target for another theme.

5. Define a small controlled vocabulary for levels, roles, review/licence statuses and established themes, allowing additional descriptive keywords. Treat unresolved publisher pages and catalogue-only licence evidence as unresolved provenance, not verified rights clearance. Verify the source and modification permission before generating a derivative or committing a third-party image. Keep third-party licences distinct from the repository's code licence.

6. Add an append-only JSON Lines history. Each event records an event ID, UTC timestamp, actor, action, asset/version or set IDs, previous/new level or status, parent/output references and a short reason. Cover discovery, selection/rejection, standardisation, AI edits, rights verification and final-set selection/replacement. Correct an earlier decision with a new event; do not rewrite it or invent historical approvals.

7. Seed `raw/bicycles/` with the 20 linked photographs from the gallery, preserving all original URLs, photographer credits, ranks, descriptions and provenance limitations. Do not commit the HTML gallery or its embedded image bytes. Seed `suitable/bicycles/` with the nine entries labelled `Strong base`, retaining their image-specific crop and preparation notes. Mark this as a visual shortlist and retain unresolved rights checks separately; it is not publication approval. Leave standardized/manipulated entries empty until corresponding images actually exist.

8. Populate the final bicycle level with a snapshot of the existing published G01 set, copied byte-for-byte from its current repository assets and described by its current catalogue/provenance. Record this as an import of an existing published set, not as a newly reviewed selection. Do not invent unavailable raw, suitable or manipulated ancestors. Do not change `public/stimuli/`, `src/stimuli/catalogue.json` or the live selection. Reuse existing Git blobs where possible when copying the final files.

9. Update root `AGENTS.md` with a mandatory instruction for every AI agent to read `stimuli/AGENTS.md` before finding, selecting, standardising, editing or publishing stimuli. In `stimuli/AGENTS.md`, explain the organisation, IDs, tags, logs, storage rules, permitted transitions and review gates. Require agents to use this collection for all future stimulus work, inspect existing candidates before adding duplicates, preserve provenance, store manipulated/final image bytes, and update the registry and history for every change. Use the repository's canonical uppercase `AGENTS.md`; do not add a competing lowercase rules file.

10. Add a small collection validator and include it in `npm run check`. Check identifiers, references/lineage, controlled tags, stage manifests, event records, required local files and recorded hashes, standardised format/dimensions, and final-set completeness. Check external URL syntax without requiring network availability in normal validation. Fail on missing manipulated/final files or promotion without the required reviews/rights evidence. Allow clearly marked legacy final imports with their existing recorded provenance.

11. Link the collection from the root README and `docs/stimuli.md`. Explain how final-set selection relates to the existing generation/publishing pipeline and that recording a final set does not automatically change or deploy the game. Update the specification version/changelog and `current_state.md` for the new workflow and the use of separately licensed source photographs. Keep `stimuli/` metadata, raw links and edit prompts outside the deployed bundle; only deliberately published game assets may reach it.

## Do not implement

- No new image generation, AI manipulation, bulk downloading of linked candidates or publication of the new photographs.
- No changes to gameplay, scoring, research collection, tracking, hosting or deployment.
- No web interface, external database, new framework or speculative collection-management features.
- No new test suite; use the collection validator and existing project checks.

## Acceptance criteria

- All five levels are present and their organisation and use are mandatory in agent instructions.
- Raw contains 20 linked candidates and suitable references the nine strongest visual candidates; original ranks and licence-evidence limitations are preserved.
- The existing nine-tile G01 final snapshot contains the exact committed image files and a complete theme/set/version manifest.
- Images, versions, theme-specific roles, content tags, decisions and transformations can be traced without duplicating source metadata.
- Manipulated/final files cannot be replaced with external-only links; raw/suitable do not require committed image bytes.
- No new photographs, candidate metadata or AI prompts enter the deployed build, and the existing game assets/catalogue remain unchanged.

## Checks

- Run the new collection validator and `npm run check`.
- Inspect the registry, stage manifests, history, local paths, licences and Markdown links.
- Compare every final snapshot file's bytes/hash with its existing published repository counterpart.
- Confirm that the diff contains no changes to current published game assets, generated game catalogue, gameplay or deployment settings.
- Inspect build output to confirm collection-only metadata and unpublished assets are absent.

## Commit and push

If and only if the scope was followed and checks pass, create one commit directly on `main` using `009_stimulus_collection_workflow.md` as the exact commit message, then push. Do not create a branch or pull request. Do not deploy.

## Final report

End with the five-section report required by `AGENTS.md`, including the commit hash and check results.
