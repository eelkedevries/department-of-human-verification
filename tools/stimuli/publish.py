"""Publish reviewed final sets from the stimulus collection to the game.

  python3 tools/stimuli/publish.py

Reads every final set in stimuli/catalogue.json whose manifest has
"game": {"publish": true, ...}, copies its 512 and 256 px WebP files (already
standardised and byte-identical to the final set) to public/stimuli/ under
opaque content-hash names, and writes src/stimuli/catalogue.json with each
tile's provenance and credit. Files no grid uses any more are removed. The
grid hash covers the instruction, mode, answer key, tile hashes and borderline
tiles, as scripts/validate-stimuli.mjs recomputes it.

This replaces tools/stimuli/build.py, which published the retired generated
G01 grid. Only the Python standard library is required.
"""

import hashlib
import json
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
COLLECTION = ROOT / "stimuli"
PUBLIC = ROOT / "public" / "stimuli"
OUTPUT = ROOT / "src" / "stimuli" / "catalogue.json"
FAMILIES = ["recognition", "semantic", "odd_one_out", "functional", "absurd"]
EDITS = "Cropped to a square, resized to 512 and 256 pixels (Lanczos) and encoded as WebP at quality 82."


def provenance(version: dict, versions: dict, assets: dict) -> dict:
    """Credit and origin of a published image, following its lineage back to the source."""
    chain, current = [], version
    while current["parent_version_ids"]:
        current = versions[current["parent_version_ids"][0]]
        chain.append(current)
    root_asset = assets[current["asset_id"]]
    source = root_asset["source"]
    licence = source["licence"]
    edit = next((v for v in chain if v["operation"]["type"] in ("ai-edit", "generation")), None)
    record = {"kind": version["content_origin"], "edits": EDITS}
    if version["content_origin"] != "ai-generated":
        record |= {
            "creator": source["creator"], "source": source["provider"], "source_url": source["publisher_url"],
            "licence": licence["name"], "licence_url": licence["url"], "attribution": licence["attribution"],
        }
    else:
        record |= {"creator": source["creator"], "licence": "Apache-2.0", "licence_url": licence["url"], "attribution": licence["attribution"]}
    # Prompts, seeds and source paths stay in the collection; the game carries only the credit.
    if edit:
        op = edit["operation"]
        record |= {"model": op["model"], "model_revision": op["model_revision"]}
        if version["content_origin"] == "ai-edited-photograph":
            record["edits"] = f"Edited with FLUX.2 [klein] 4B: {op['intended_change']} Then {EDITS[0].lower()}{EDITS[1:]}"
        else:
            record["edits"] = f"Generated with FLUX.2 [klein] 4B from a written description. {EDITS}"
    return record


def main() -> None:
    catalogue = json.loads((COLLECTION / "catalogue.json").read_text())
    versions = {v["version_id"]: v for v in catalogue["versions"]}
    assets = {a["asset_id"]: a for a in catalogue["assets"]}
    PUBLIC.mkdir(parents=True, exist_ok=True)
    published, stimuli = set(), []
    for ref in sorted(catalogue["sets"], key=lambda s: s["set_key"]):
        manifest = json.loads((ROOT / ref["manifest"]).read_text())
        game = manifest["game"]
        if not game.get("publish"):
            continue
        tiles = []
        for tile in manifest["tiles"]:
            version = versions[tile["version_id"]]
            files = {f["purpose"]: f for f in version["files"]}
            large, small = (ROOT / files["large"]["path"]).read_bytes(), (ROOT / files["small"]["path"]).read_bytes()
            digest = hashlib.sha256(large).hexdigest()
            name = digest[:16]
            (PUBLIC / f"{name}.webp").write_bytes(large)
            (PUBLIC / f"{name}-s.webp").write_bytes(small)
            published.update({f"{name}.webp", f"{name}-s.webp"})
            tiles.append({"tile_id": tile["tile_id"], "src": f"{name}.webp", "src_small": f"{name}-s.webp", "width": 512, "height": 512,
                          "sha256": digest, "alt": version["description"], "provenance": provenance(version, versions, assets)})
        answer_key, borderline = manifest["answer_key"], manifest["borderline_tile_ids"]
        parts = [manifest["instruction"], manifest["mode"], answer_key, [t["sha256"] for t in tiles]]
        if borderline:
            parts.append(borderline)
        grid_hash = hashlib.sha256(json.dumps(parts, separators=(",", ":"), ensure_ascii=False).encode()).hexdigest()
        stimulus = {
            "stimulus_id": game["grid_id"], "version": manifest["version"], "hash": grid_hash, "family": game["family"], "mode": manifest["mode"],
            "instruction": manifest["instruction"], "instruction_variants": {"direct": manifest["instruction"], **({"semantic": game["semantic_variant"]} if game.get("semantic_variant") else {})},
            "hint": game["hint"], "explanation": game["explanation"], "difficulty": game["difficulty"], "research_class": manifest["research_class"],
            "feedback": game["feedback"], "tiles": tiles, "answer_key": answer_key,
        }
        if borderline:
            stimulus["borderline_tile_ids"] = borderline
        stimuli.append(stimulus)
    for stale in PUBLIC.glob("*.webp"):
        if stale.name not in published:
            stale.unlink()
    overall = hashlib.sha256("".join(s["hash"] for s in stimuli).encode()).hexdigest()[:10]
    out = {"schema_version": 1, "catalogue_version": f"{date.today().isoformat()}-{overall}", "families": FAMILIES, "stimuli": stimuli}
    OUTPUT.write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n")
    print(f"Published {len(stimuli)} grids and {len(published)} files; catalogue {out['catalogue_version']}.")


if __name__ == "__main__":
    main()
