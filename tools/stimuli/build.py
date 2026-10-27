"""Superseded legacy publisher: published the raw renders as game assets and wrote the stimulus catalogue.

Kept for the record of how the retired generated G01 grid was built; use
tools/stimuli/publish.py, which publishes reviewed final sets from stimuli/.

Reads the published grids in tools/stimuli/source.json and their raw renders in
tools/stimuli/.cache/raw/, writes resized WebP files with opaque, content-hashed
names to public/stimuli/, and writes src/stimuli/catalogue.json, which the game
imports.

File names are content hashes so that neither a file name nor a URL can reveal
which tiles are targets. Only Pillow is required.

Usage: python3 tools/stimuli/build.py
"""

import hashlib
import io
import json
from datetime import date
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
HERE = ROOT / "tools" / "stimuli"
RAW = HERE / ".cache" / "raw"
PUBLIC = ROOT / "public" / "stimuli"
CATALOGUE = ROOT / "src" / "stimuli" / "catalogue.json"

SIZE = 512
SMALL = 256
QUALITY = 82
EDITS = f"Published at the rendered {SIZE} x {SIZE} pixels and as a {SMALL} x {SMALL} copy (Lanczos), both encoded as WebP at quality {QUALITY}. No other edits."
FAMILIES = ["recognition", "semantic", "odd_one_out", "functional", "absurd"]


def encode(image: Image.Image, size: int) -> bytes:
    buffer = io.BytesIO()
    image.resize((size, size), Image.Resampling.LANCZOS).save(buffer, "WEBP", quality=QUALITY, method=6)
    return buffer.getvalue()


def main() -> None:
    # The generated G01 grid was retired on 27 October 2026; the live catalogue now
    # comes from reviewed collection final sets.
    raise SystemExit("Superseded: publish reviewed collection final sets with tools/stimuli/publish.py.")
    spec = json.loads((HERE / "source.json").read_text())
    PUBLIC.mkdir(parents=True, exist_ok=True)
    published = set()
    stimuli = []
    for grid in spec["grids"]:
        if not grid["published"]:
            continue
        tiles = []
        for tile in grid["tiles"]:
            record = json.loads((RAW / f'{tile["tile_id"]}.json').read_text())
            if record["prompt"] != f'{tile["prompt"]}, {spec["style"][tile["style"]]}' or record["seed"] != tile["seed"]:
                raise SystemExit(f'{tile["tile_id"]}: the raw render does not match source.json; run generate.py first.')
            image = Image.open(RAW / f'{tile["tile_id"]}.png').convert("RGB")
            if image.size != (SIZE, SIZE):
                raise SystemExit(f'{tile["tile_id"]}: expected a {SIZE} x {SIZE} render, found {image.size}.')
            large, small = encode(image, SIZE), encode(image, SMALL)
            digest = hashlib.sha256(large).hexdigest()
            name = digest[:16]
            (PUBLIC / f"{name}.webp").write_bytes(large)
            (PUBLIC / f"{name}-s.webp").write_bytes(small)
            published.update({f"{name}.webp", f"{name}-s.webp"})
            tiles.append({
                "tile_id": tile["tile_id"],
                "src": f"{name}.webp",
                "src_small": f"{name}-s.webp",
                "width": SIZE,
                "height": SIZE,
                "sha256": digest,
                "alt": tile["label"],
                "provenance": {
                    "model": record["model"],
                    "model_revision": record["model_revision"],
                    "licence": spec["model_licence"],
                    "prompt": record["prompt"],
                    "seed": record["seed"],
                    "steps": record["steps"],
                    "guidance_scale": record["guidance_scale"],
                    "generated_at": record["generated_at"],
                    "edits": EDITS,
                },
            })
        answer_key = [t["tile_id"] for t in grid["tiles"] if t["role"] == "target"]
        # Compact separators match JSON.stringify, so scripts/validate-stimuli.mjs can recompute the hash.
        borderline_ids = [t["tile_id"] for t in grid["tiles"] if t["role"] == "borderline"]
        hash_parts = [grid["instruction"], grid["mode"], answer_key, [t["sha256"] for t in tiles]]
        if borderline_ids:
            hash_parts.append(borderline_ids)
        grid_hash = hashlib.sha256(json.dumps(
            hash_parts, separators=(",", ":"), ensure_ascii=False).encode()).hexdigest()
        variants = {k: grid[f"{k}_variant"] for k in ("direct", "semantic") if f"{k}_variant" in grid}
        stimulus = {
            "stimulus_id": grid["grid_id"],
            "version": grid.get("version", 1),
            "hash": grid_hash,
            "family": grid["family"],
            "mode": grid["mode"],
            "instruction": grid["instruction"],
            "instruction_variants": variants,
            "hint": grid["hint"],
            "explanation": grid["explanation"],
            "difficulty": grid["difficulty"],
            "research_class": grid["research_class"],
            "feedback": grid["feedback"],
            "tiles": tiles,
            "answer_key": answer_key,
        }
        if "operational_definition" in grid:
            stimulus["operational_definition"] = grid["operational_definition"]
        if borderline_ids:
            stimulus["borderline_tile_ids"] = borderline_ids
        stimuli.append(stimulus)

    for stale in PUBLIC.glob("*.webp"):
        if stale.name not in published:
            stale.unlink()
    overall = hashlib.sha256("".join(s["hash"] for s in stimuli).encode()).hexdigest()[:10]
    catalogue = {
        "schema_version": 1,
        "catalogue_version": f"{date.today().isoformat()}-{overall}",
        "families": FAMILIES,
        "stimuli": stimuli,
    }
    CATALOGUE.write_text(json.dumps(catalogue, indent=2, ensure_ascii=False) + "\n")
    print(f"Wrote {len(stimuli)} grids and {len(published)} files; catalogue {catalogue['catalogue_version']}.")


if __name__ == "__main__":
    main()
