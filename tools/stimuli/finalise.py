"""Record a reviewed nine-image final set in the stimulus collection.

  python3 tools/stimuli/finalise.py SET.json

SET.json names the theme, set_id, version, instruction, the game metadata
(family, hint, explanation, difficulty, feedback lines, semantic variant), the
selection review reason and nine tiles, each {"version_id": a standardised
version, "role": "target" | "borderline" | "distractor"}. Tile order is the
reviewed listing order, not the game layout (the game shuffles positions).

For every tile a final version is created that copies the standardised
512/256 WebP pair byte for byte into final/THEME/SET_ID/VERSION/; the manifest,
set reference, stage manifest and history (final_selected events) are written
together. A set version is never overwritten. Recording a set does not publish
it; tools/stimuli/publish.py does that for sets marked "publish": true.
"""

import argparse
import hashlib
import json
import shutil
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
COLLECTION = ROOT / "stimuli"
CATALOGUE = COLLECTION / "catalogue.json"
HISTORY = COLLECTION / "history.jsonl"
CLASSES = {"target": ["member-normal", "member-bizarre"], "distractor": ["non-member"], "borderline": ["member-debatable"]}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("set", type=Path)
    spec = json.loads(parser.parse_args().set.read_text())
    theme, set_id, number = spec["theme"], spec["set_id"], spec["version"]
    key = f"{set_id}@{number}"
    catalogue = json.loads(CATALOGUE.read_text())
    versions = {v["version_id"]: v for v in catalogue["versions"]}
    if any(s["set_key"] == key for s in catalogue["sets"] + catalogue.get("retired_sets", [])):
        raise SystemExit(f"{key} already exists; choose a new version number.")
    if len(spec["tiles"]) != 9 or len({t["version_id"] for t in spec["tiles"]}) != 9:
        raise SystemExit("A final set needs nine distinct standardised versions.")
    folder = COLLECTION / "final" / theme / set_id / str(number)
    folder.mkdir(parents=True, exist_ok=False)
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    tiles, new_versions = [], []
    for n, tile in enumerate(spec["tiles"], 1):
        parent = versions[tile["version_id"]]
        if "standardized" not in parent["levels"]:
            raise SystemExit(f'{tile["version_id"]} is not standardised.')
        assessment = next(a for a in parent["assessments"] if a["theme"] == theme)
        if assessment["role"] != tile["role"] or assessment["semantic_class"] not in CLASSES[tile["role"]]:
            raise SystemExit(f'{tile["version_id"]}: role {tile["role"]} disagrees with its assessment ({assessment["role"]}, {assessment["semantic_class"]}).')
        version_id = f'{parent["asset_id"]}-{set_id.lower()}-{number}-final'
        files = []
        for f in parent["files"]:
            name = Path(f["path"]).name
            shutil.copyfile(ROOT / f["path"], folder / name)
            assert hashlib.sha256((folder / name).read_bytes()).hexdigest() == f["sha256"]
            files.append(dict(f, path=f"stimuli/final/{theme}/{set_id}/{number}/{name}"))
        assessments = [dict(a, role_status="reviewed", scope="final-set") for a in parent["assessments"] if a["theme"] == theme]
        new_versions.append({
            "version_id": version_id, "asset_id": parent["asset_id"], "levels": ["final"], "parent_version_ids": [parent["version_id"]],
            "external_url": None, "files": files, "characteristics": dict(parent["characteristics"], assessment_scope="final-set"),
            "reviews": {"visual": {"status": "approved", "actor": "claude", "timestamp": stamp, "reason": f'Selected for {key}: {spec["selection_review"]}', "scope": "final-set"},
                        "rights": dict(parent["reviews"]["rights"], timestamp=stamp)},
            "operation": {"type": "final-copy", "timestamp": stamp, "actor": "claude", "notes": f"Byte-identical copy of {parent['version_id']} for final set {key}."},
            "unresolved_issues": list(parent["unresolved_issues"]), "created_at": stamp, "updated_at": stamp, "actor": "claude",
            "description": parent["description"], "object_type": parent["object_type"], "content_origin": parent["content_origin"],
            "keywords": list(parent["keywords"]), "assessments": assessments,
        })
        tiles.append({"tile_id": f"{set_id}-T{n}", "version_id": version_id, "role": tile["role"]})
    answer = [t["tile_id"] for t in tiles if t["role"] == "target"]
    borderline = [t["tile_id"] for t in tiles if t["role"] == "borderline"]
    manifest = {
        "schema": "dhv-stimulus-final-set-v1", "schema_version": 1, "set_key": key, "set_id": set_id, "version": number, "theme": theme,
        "status": "approved", "instruction": spec["instruction"], "mode": "multiple",
        "research_class": "category_judgement" if borderline else "unambiguous",
        "game": spec["game"], "tiles": tiles, "answer_key": answer, "borderline_tile_ids": borderline,
        "selection_review": {"status": "approved", "actor": "claude", "timestamp": stamp, "reason": spec["selection_review"]},
        "created_at": stamp, "actor": "claude",
    }
    manifest_path = folder / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")
    catalogue["versions"] += new_versions
    catalogue["sets"].append({"set_key": key, "set_id": set_id, "version": number, "theme": theme, "manifest": f"stimuli/final/{theme}/{set_id}/{number}/manifest.json"})
    catalogue["updated_at"] = stamp
    CATALOGUE.write_text(json.dumps(catalogue, indent=2, ensure_ascii=False) + "\n")
    stage_path = COLLECTION / "final" / theme / "index.json"
    stage = json.loads(stage_path.read_text()); stage["set_keys"].append(key)
    stage_path.write_text(json.dumps(stage, indent=2) + "\n")
    lines = HISTORY.read_text().rstrip("\n").split("\n")
    prefix = f'evt-{stamp[:10].replace("-", "")}-'
    count = max([int(json.loads(l)["event_id"].rsplit("-", 1)[1]) for l in lines if json.loads(l)["event_id"].startswith(prefix)], default=0)
    events = []
    for v in new_versions:
        count += 1
        events.append({"event_id": f"{prefix}{count:04d}", "timestamp": stamp, "actor": "claude", "action": "final_selected", "asset_ids": [v["asset_id"]],
                       "version_ids": [v["version_id"]], "set_ids": [key], "parent_version_ids": v["parent_version_ids"], "output_version_ids": [v["version_id"]],
                       "from": "standardized", "to": "final", "reason": f"Copied byte for byte into final set {key}."})
    count += 1
    events.append({"event_id": f"{prefix}{count:04d}", "timestamp": stamp, "actor": "claude", "action": "final_selected", "asset_ids": [],
                   "version_ids": [v["version_id"] for v in new_versions], "set_ids": [key], "parent_version_ids": [], "output_version_ids": [],
                   "from": None, "to": "final", "reason": spec["selection_review"]})
    HISTORY.write_text("\n".join(lines + [json.dumps(e) for e in events]) + "\n")
    readme = [f"# {set_id} version {number}", "", f"“{spec['instruction']}” — {len(answer)} targets, {len(borderline)} borderline, {9 - len(answer) - len(borderline)} distractors. See [manifest.json](manifest.json).", "",
              "| Tile | Role | Image |", "|---|---|---|"]
    for t, v in zip(tiles, new_versions):
        large = next(f for f in v["files"] if f["purpose"] == "large")
        readme.append(f"| {t['tile_id']} | {t['role']} | [{v['description']}]({Path(large['path']).name}) |")
    (folder / "README.md").write_text("\n".join(readme) + "\n")
    print(f"Recorded {key}: {len(answer)} targets, {len(borderline)} borderline.")


if __name__ == "__main__":
    main()
