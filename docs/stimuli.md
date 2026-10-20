# Stimuli

Each assessment shows nine images in a 3 × 3 grid. A grid is one instruction, nine images and an answer key.

## The pool

For now one grid is published, and the game shows it in all five assessments, each time in a different order. Nine more are drafted in [`tools/stimuli/source.json`](../tools/stimuli/source.json) and can be rendered and published one at a time.

| Grid | Family | Instruction | Answers | Status |
|---|---|---|---|---|
| G01 | Visual recognition | Select all images containing a bicycle. | 4 bicycles | published |
| G02 | Visual recognition | Select all images containing a lighthouse. | 4 lighthouses | drafted |
| G03 | Conceptual understanding | Select the animal dressed for a job interview. | the duck in a suit | drafted |
| G04 | Conceptual understanding | Select the animal dressed for the rain. | the corgi in a raincoat | drafted |
| G05 | Contextual judgement | Select the object that does not belong. | the tennis ball among fruit | drafted |
| G06 | Contextual judgement | Select the object that does not belong. | the garden hose among instruments | drafted |
| G07 | Functional reasoning | Select all objects designed for sitting. | chair, bench, sofa, bar stool | drafted |
| G08 | Functional reasoning | Select all objects designed for cutting. | scissors, knife, pizza cutter, shears | drafted |
| G09 | Advanced suspicion | Select the most suspicious duck. | the duck in a disguise | drafted |
| G10 | Advanced suspicion | Select the pigeon that is not who it claims to be. | the pigeon in a disguise | drafted |

Round *i* uses a grid of the *i*-th family. A family without a published grid borrows one from the others, preferring grids not yet shown in the session, then grids not shown in the previous session. Every round has its own seeded layout.

The full record of the published grids — instructions, hints, explanations, answer keys, image hashes and provenance — is [`src/stimuli/catalogue.json`](../src/stimuli/catalogue.json), generated from the source file.

## Answer rules

The concept art for this game contained two ambiguous rounds: several animals wore accessories, and "everything you could reasonably sit on" admits almost anything. The drafted grids resolve both.

- **One defensible answer set.** In the semantic grids, only the target animal wears anything at all. Functional grids ask what an object was *designed* for, not what it could be used for: a tree stump can be sat on, but it was not designed for sitting.
- **Single or multiple.** Single-answer grids say "Select the …"; multiple-answer grids say "Select all …". A single-answer grid accepts one selection at a time.
- **Stated definitions for the absurd round.** "Suspicious" is not a property of ducks, so the hint defines it: wearing a disguise. These grids are classed as *entertainment* and will be excluded from any confirmatory analysis in version 2.
- **Exact scoring.** An assessment is passed only when the selection matches the answer key exactly and in time. Partial credit appears in the feedback and in the report's image count, not in the pass count.
- **Nothing in the page gives the answer away.** Image files have content-hash names, tile identifiers never reach the page, and the alternative text describes only what the image shows. A static game necessarily ships its answer key in its script; it is a game, not a security control.

## How the images were made

Every image was generated for this game with [FLUX.2 [klein] 4B](https://huggingface.co/black-forest-labs/FLUX.2-klein-4B), an openly licensed model (Apache 2.0), from a written prompt and a fixed seed, at 512 × 512 pixels with four steps. Rendering ran on a four-core CPU, at about 2.5 minutes per image; on a GPU it takes seconds. Each tile's prompt, seed, model revision, settings and generation time are recorded in the catalogue. The only edits are a 256-pixel copy for small screens and WebP encoding.

Every render was checked by eye on a contact sheet. A render was replaced (with a clearer prompt or a new seed) when it did not show what its label says, or when a distractor could arguably satisfy the instruction.

No image depicts a real person, brand or place, and none is taken from the concept art.

## Adding or changing a grid

1. Edit [`tools/stimuli/source.json`](../tools/stimuli/source.json): the grid's instruction, mode, hint, explanation, feedback lines (one or more per outcome), difficulty and research class, and nine tiles with a label, role, prompt and seed. Set `"published": true` to include it. If a published grid changes, bump its `version`.
2. Render the new or changed tiles (in a Python environment with PyTorch, diffusers and transformers; about 2.5 minutes per tile on a four-core CPU):

   ```bash
   python tools/stimuli/generate.py            # every published tile that is missing or out of date
   python tools/stimuli/generate.py G04-T1     # one tile
   ```

3. Review the renders by eye: `python3 tools/stimuli/review.py G04` writes a labelled contact sheet to `tools/stimuli/.cache/sheets/`.
4. Publish and rebuild the catalogue: `python3 tools/stimuli/build.py`.
5. Validate: `npm run check` (or `npm run validate:stimuli` alone).

Raw renders stay in `tools/stimuli/.cache/`, which is not committed.
