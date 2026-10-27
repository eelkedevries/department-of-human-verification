"""Register reviewed photographs and AI-made images in the stimulus collection.

Two modes, both run only after the images have been inspected and their rights
checked as stimuli/CHECKLISTS.md requires:

  python3 tools/stimuli/register.py photos THEME RECORDS.json
      Each record describes one photograph from a source page: provider,
      provider_id, image_key (Unsplash only), creator, creator_handle,
      publisher_url, preview_url, preview_file (the reviewed 1,280 px preview),
      original_width/original_height, crop {x, y, side}, crop_share,
      description, object_type, colour, viewpoint, facing_direction,
      environment, support, keywords, rights_evidence, limitations, role,
      semantic_class, search (where and how it was found) and an optional
      visual_reason. The photograph is registered as raw and suitable, with
      discovered, rights_verified and selected events, and the reviewed
      preview bytes are cached for tools/stimuli/standardise.py.

  python3 tools/stimuli/register.py ai THEME RECORDS.json
      Each record names a rendered master (master: PNG path) and its render
      sidecar (sidecar: JSON written by tools/stimuli/manipulate.py), plus
      description, object_type, the characteristics above, keywords, role,
      semantic_class, intended_change, visual_reason and limitations. A record
      with parent_version_id is an AI edit of that standardised photograph
      (a new version of the same asset, ai-edited-photograph); a record
      without one is a fully generated image (a new generated asset,
      ai-generated). The master is stored under manipulated/THEME/ and a
      manipulated event is logged.

  python3 tools/stimuli/register.py withdraw THEME RECORDS.json
      Each record is {"version_id", "reason"}: an unused manipulated master
      that failed review is withdrawn (file deleted, record kept with a
      withdrawn entry and event).

Missing theme folders and stage manifests are created. Ranks continue after
the theme's highest rank. Only Pillow is required.
"""

import argparse
import hashlib
import json
import shutil
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
COLLECTION = ROOT / "stimuli"
CATALOGUE = COLLECTION / "catalogue.json"
HISTORY = COLLECTION / "history.jsonl"
LEVELS = ["raw", "suitable", "standardized", "manipulated", "final"]
INTENDED = "Department of Human Verification game, illustrated selection review and later object edits"
GENERATOR = "FLUX.2 [klein] 4B local generation"
MODEL_PAGE = "https://huggingface.co/black-forest-labs/FLUX.2-klein-4B"
EVIDENCE = [""]

CONDITIONS = {
    "Unsplash": [
        "Use within the authored game or illustrated research gallery; preserve the per-image licence and credit, with no implied endorsement.",
        "Do not sell the image without significant modification or compile Unsplash images into a similar or competing service.",
        "Do not use in AI/ML datasets or train models. Later AI editing must use tools/settings that do not train on these inputs.",
        "The licence does not cover recognisable people, trademarks, logos or artworks that appear in the image; no brand endorsement is authorised.",
    ],
    "Pexels": [
        "Use within the authored game or illustrated research gallery; preserve the per-image licence and credit, with no implied endorsement.",
        "Do not sell or distribute standalone source images; resizing or cropping alone does not remove this restriction. Keep repository copies within the authored game and its provenance context.",
        "Observe the source terms on brands, people and misleading uses; no commercial brand endorsement is authorised.",
        "Pexels terms prohibit scraping content for machine learning; do not use in AI/ML datasets or train models, and use AI editing tools/settings that do not train on these inputs.",
    ],
}
LICENCES = {
    "Unsplash": ("Unsplash License", "https://unsplash.com/license", ["https://unsplash.com/license", "https://unsplash.com/terms"]),
    "Pexels": ("Pexels License", "https://www.pexels.com/license/", ["https://www.pexels.com/license/", "https://www.pexels.com/terms-of-service/"]),
}


def now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def ensure_theme(theme: str) -> None:
    vocabulary = json.loads((COLLECTION / "vocabulary.json").read_text())
    if theme not in vocabulary["themes"]:
        raise SystemExit(f"Unknown theme {theme}; add it to vocabulary.json first.")
    title = theme.replace("-", " ").capitalize()
    for level in LEVELS:
        folder = COLLECTION / level / theme
        folder.mkdir(parents=True, exist_ok=True)
        index = folder / "index.json"
        if not index.exists():
            key = "set_keys" if level == "final" else "version_ids"
            index.write_text(json.dumps({"schema": "dhv-stimulus-stage-v1", "schema_version": 1, "level": level, "theme": theme, key: []}, indent=2) + "\n")
        readme = folder / "README.md"
        if not readme.exists():
            readme.write_text(f"# {title} {level} level\n\nSee [index.json](index.json), the [catalogue](../../catalogue.json), the [gallery](../../GALLERY.md) and the mandatory [agent instructions](../../AGENTS.md).\n")


class Log:
    def __init__(self, timestamp: str):
        self.lines = HISTORY.read_text().rstrip("\n").split("\n")
        self.prefix = f'evt-{timestamp[:10].replace("-", "")}-'
        numbers = [int(json.loads(line)["event_id"].rsplit("-", 1)[1]) for line in self.lines if json.loads(line)["event_id"].startswith(self.prefix)]
        self.number = max(numbers, default=0)
        self.timestamp = timestamp
        self.events = []

    def add(self, action, asset_id, version_id, frm, to, reason, parents=()):
        self.number += 1
        self.events.append({
            "event_id": f"{self.prefix}{self.number:04d}", "timestamp": self.timestamp, "actor": "claude", "action": action,
            "asset_ids": [asset_id], "version_ids": [version_id], "set_ids": [], "parent_version_ids": list(parents),
            "output_version_ids": [version_id] if parents else [], "from": frm, "to": to, "reason": reason,
        })

    def write(self):
        HISTORY.write_text("\n".join(self.lines + [json.dumps(e) for e in self.events]) + "\n")


def next_rank(catalogue: dict, theme: str) -> int:
    ranks = [a.get("rank") or 0 for v in catalogue["versions"] for a in v.get("assessments", []) if a["theme"] == theme and "suitable" in v["levels"] or (a["theme"] == theme and "manipulated" in v["levels"])]
    return max(ranks, default=0) + 1


def characteristics(r: dict, scope: str) -> dict:
    return {
        "colour": r["colour"], "viewpoint": r["viewpoint"], "facing_direction": r["facing_direction"],
        "environment": r["environment"], "support": r["support"],
        "people": r.get("people", "none-observed-in-proposed-crop"),
        "additional_category_members": r.get("additional_category_members", "none-observed"),
        "assessment_scope": scope,
    }


def add_to_stage(level: str, theme: str, version_ids: list) -> None:
    path = COLLECTION / level / theme / "index.json"
    stage = json.loads(path.read_text())
    stage["version_ids"] += version_ids
    path.write_text(json.dumps(stage, indent=2) + "\n")


def register_photos(theme: str, records: list) -> None:
    catalogue = json.loads(CATALOGUE.read_text())
    known = {a["asset_id"] for a in catalogue["assets"]} | {f'{a["source"].get("provider")}:{a["source"].get("provider_id")}' for a in catalogue["assets"]}
    stamp = now(); log = Log(stamp); rank = next_rank(catalogue, theme); new = []
    (COLLECTION / ".cache").mkdir(exist_ok=True)
    for r in records:
        provider = r["provider"]
        asset_id = f'photo-unsplash-{r["image_key"][6:]}' if provider == "Unsplash" else f'photo-{provider.lower()}-{r["provider_id"]}'
        if asset_id in known or f'{provider}:{r["provider_id"]}' in known:
            raise SystemExit(f"{asset_id} is already registered.")
        version_id = f"{asset_id}-source-v1"
        data = Path(r["preview_file"]).read_bytes()
        width, height = Image.open(r["preview_file"]).size
        shutil.copyfile(r["preview_file"], COLLECTION / ".cache" / f"{version_id}.preview")
        crop = r["crop"]
        if crop["side"] < 512 or crop["x"] + crop["side"] > width or crop["y"] + crop["side"] > height:
            raise SystemExit(f"{asset_id}: invalid crop for a {width} x {height} preview.")
        name, url, terms = LICENCES[provider]
        creator = r["creator"]
        rights = f'{r["rights_evidence"]} The licence permits modification; recorded conditions include no AI/ML datasets or training and no brand endorsement.'
        matching = (f'The publisher page\'s image key {r["image_key"]} is the key of the reviewed preview URL.' if provider == "Unsplash"
                    else f'The publisher page\'s photo ID {r["provider_id"]} is the ID in the reviewed preview URL.')
        dims = ({"width": r["original_width"], "height": r["original_height"], "status": "reported", "basis": f"{provider} API record or publisher page, 27 October 2026."}
                if r.get("original_width") else {"status": "unknown", "basis": "Not stated by the source; only the 1,280 px preview was reviewed."})
        catalogue["assets"].append({
            "asset_id": asset_id, "origin": "internet-photo", "description": r["description"],
            "source": {
                "provider": provider, "provider_id": r["provider_id"], "creator": creator, "publisher_url": r["publisher_url"],
                "direct_url": r["preview_url"], "discovered_at": stamp, "actor": "claude", "original_dimensions": dims,
                "licence": {
                    "name": name, "url": url, "evidence_status": "verified", "modification_permission": "allowed",
                    "attribution": f"Photo by {creator} on {provider}", "conditions": CONDITIONS[provider],
                    "evidence_urls": [r["publisher_url"], *terms], "verified_by": "claude", "verified_at": stamp,
                    "notes": "Verified for the authored game and later modifications under the recorded conditions. This is not permission for model training.",
                    "verification": {"publisher_evidence": r["rights_evidence"], "matching_basis": matching, "intended_use": INTENDED, "evidence_document": EVIDENCE[0]},
                },
            },
            "created_at": stamp, "updated_at": stamp, "actor": "claude",
        })
        reason = r.get("visual_reason") or (
            f'Meets the target clarity standard in the proposed crop: the {r["object_type"].replace("-", " ")} spans about {r["crop_share"]}% of the crop, '
            f'{r["viewpoint"].lower()}, {r["colour"]}, against {r["environment"]}; one instance, unobstructed, recognisable at 128 px.')
        catalogue["versions"].append({
            "version_id": version_id, "asset_id": asset_id, "levels": ["raw", "suitable"], "parent_version_ids": [],
            "external_url": r["preview_url"], "files": [],
            "observed_preview": {"width": width, "height": height, "sha256": sha256(data), "format": "jpeg", "stored_in_repository": False,
                                 "notes": f"Hash identifies the {width} px preview served for this image, not the original master; the CDN may re-encode previews."},
            "characteristics": characteristics(r, "proposed-preview-crop"),
            "reviews": {"visual": {"status": "approved", "actor": "claude", "timestamp": stamp, "reason": reason, "scope": "proposed-preview-crop"},
                        "rights": {"status": "approved", "actor": "claude", "timestamp": stamp, "reason": f"{rights} {matching}"}},
            "operation": {"type": "discovery", "timestamp": stamp, "actor": "claude", "notes": r["search"]},
            "unresolved_issues": list(r.get("limitations", [])), "created_at": stamp, "updated_at": stamp, "actor": "claude",
            "description": r["description"], "object_type": r["object_type"], "content_origin": "photograph", "keywords": r["keywords"],
            "assessments": [{"theme": theme, "role": r["role"], "semantic_class": r["semantic_class"], "role_status": "reviewed", "rank": rank,
                             "grade": "Meets target clarity", "reason": reason, "preparation_notes": "Use the proposed crop.", "scope": "proposed-preview-crop",
                             "proposed_crop": {"x": crop["x"], "y": crop["y"], "side": crop["side"], "reference_width": width, "reference_height": height,
                                               "coordinate_space": "downloaded-preview-pixels", "applied": False}}],
        })
        log.add("discovered", asset_id, version_id, None, "raw", r["search"])
        log.add("rights_verified", asset_id, version_id, "pending", "approved", rights)
        log.add("selected", asset_id, version_id, "raw", "suitable", f"Rank {rank}. {reason}")
        new.append(version_id); known.add(asset_id); rank += 1
        print(f"{version_id}: rank {rank - 1}, {r['role']} ({r['semantic_class']})")
    catalogue["updated_at"] = stamp
    CATALOGUE.write_text(json.dumps(catalogue, indent=2, ensure_ascii=False) + "\n")
    add_to_stage("raw", theme, new); add_to_stage("suitable", theme, new)
    log.write()


def register_ai(theme: str, records: list) -> None:
    catalogue = json.loads(CATALOGUE.read_text())
    versions = {v["version_id"]: v for v in catalogue["versions"]}
    assets = {a["asset_id"]: a for a in catalogue["assets"]}
    stamp = now(); log = Log(stamp); rank = next_rank(catalogue, theme); new = []
    folder = COLLECTION / "manipulated" / theme
    for r in records:
        sidecar = json.loads(Path(r["sidecar"]).read_text())
        parent_id = r.get("parent_version_id")
        if parent_id:
            parent = versions[parent_id]
            if "standardized" not in parent["levels"]:
                raise SystemExit(f"{parent_id} is not a standardised version.")
            asset_id = parent["asset_id"]
            number = 1
            while f'{asset_id}-{r["slug"]}-v{number}' in versions:
                number += 1
            version_id = f'{asset_id}-{r["slug"]}-v{number}'
            origin = "ai-edited-photograph"
        else:
            asset_id = f'generated-{theme}-{r["slug"]}'
            if asset_id in assets:
                raise SystemExit(f"{asset_id} already exists.")
            version_id = f"{asset_id}-v1"
            origin = "ai-generated"
            assets[asset_id] = {
                "asset_id": asset_id, "origin": "generated", "description": r["description"],
                "source": {
                    "provider": GENERATOR, "provider_id": asset_id, "creator": "Department of Human Verification (generated with FLUX.2 [klein] 4B)",
                    "publisher_url": MODEL_PAGE, "direct_url": None, "discovered_at": stamp, "actor": "claude",
                    "original_dimensions": {"width": sidecar["width"], "height": sidecar["height"], "status": "verified", "basis": "Dimensions of the rendered master stored in the collection."},
                    "licence": {
                        "name": "Project-generated image (FLUX.2 [klein] 4B, Apache-2.0 model)", "url": "https://www.apache.org/licenses/LICENSE-2.0",
                        "evidence_status": "verified", "modification_permission": "allowed",
                        "attribution": "Generated for the Department of Human Verification with FLUX.2 [klein] 4B",
                        "conditions": ["Generated by the project from a written prompt; no third-party image was used as input.",
                                       "Label it as AI-generated wherever its origin matters; do not present it as a photograph of a real event."],
                        "evidence_urls": [MODEL_PAGE, "https://www.apache.org/licenses/LICENSE-2.0"], "verified_by": "claude", "verified_at": stamp,
                        "notes": "The model weights are licensed under Apache-2.0; the image is the project's own output.",
                        "verification": {"publisher_evidence": "The model page states the Apache-2.0 licence for FLUX.2 [klein] 4B at the pinned revision.",
                                         "matching_basis": f'Rendered locally at revision {sidecar["model_revision"]} with seed {sidecar["seed"]}; the sidecar is kept with the master.',
                                         "intended_use": INTENDED, "evidence_document": EVIDENCE[0]},
                    },
                },
                "created_at": stamp, "updated_at": stamp, "actor": "claude",
            }
            catalogue["assets"].append(assets[asset_id])
        folder.mkdir(parents=True, exist_ok=True)
        target = folder / f"{version_id}{Path(r['master']).suffix.lower()}"
        shutil.copyfile(r["master"], target)
        data = target.read_bytes()
        image = Image.open(target)
        on_space = "Space" in sidecar["precision"]
        operation = {
            "type": "ai-edit" if parent_id else "generation", "timestamp": stamp, "actor": "claude",
            "intended_change": r["intended_change"], "instructions": sidecar["prompt"], "tool": "tools/stimuli/manipulate.py" + (" --space" if on_space else ""),
            "provider": (f'Hugging Face Space {sidecar["software"]["space"]} (ZeroGPU), called with gradio_client' if on_space
                         else "local CPU inference with Hugging Face diffusers (Flux2KleinPipeline)"), "model": sidecar["model"],
            "model_revision": sidecar["model_revision"], "seed": sidecar["seed"], "steps": sidecar["steps"], "guidance_scale": sidecar["guidance_scale"],
            "precision": sidecar["precision"], "software": sidecar["software"], "rendered_at": sidecar["generated_at"],
            "output_sha256": sha256(data),
            "training_note": ("Inference only on the model makers' public Space; the prompt" + (" and the input photograph were" if parent_id else " was") + " sent for generation, not for training."
                              if on_space else "Local inference only; no input or output is sent to a service or used for training."),
        }
        if parent_id:
            operation["input"] = {"version_id": parent_id, "sha256": next(f["sha256"] for f in parent["files"] if f["purpose"] == "large")}
        reason = r["visual_reason"]
        rights = ("Derivative of the parent's individually verified source, whose licence permits modification; edited with an Apache-2.0 model for inference only, not training. The source's recorded conditions apply unchanged."
                  if parent_id else "Generated by the project with an Apache-2.0 model from a written prompt; no third-party image input.")
        version = {
            "version_id": version_id, "asset_id": asset_id, "levels": ["manipulated"], "parent_version_ids": [parent_id] if parent_id else [],
            "external_url": None,
            "files": [{"purpose": "master", "path": f"stimuli/manipulated/{theme}/{target.name}", "sha256": sha256(data), "width": image.width, "height": image.height,
                       "format": image.format.lower(), "colour_mode": image.mode, "colour_space": "sRGB", "bytes": len(data)}],
            "characteristics": characteristics(r, "master"),
            "reviews": {"visual": {"status": "approved", "actor": "claude", "timestamp": stamp, "reason": reason, "scope": "master"},
                        "rights": {"status": "approved", "actor": "claude", "timestamp": stamp, "reason": rights}},
            "operation": operation, "unresolved_issues": list(r.get("limitations", [])),
            "created_at": stamp, "updated_at": stamp, "actor": "claude", "description": r["description"], "object_type": r["object_type"],
            "content_origin": origin, "keywords": r["keywords"],
            "assessments": [{"theme": theme, "role": r["role"], "semantic_class": r["semantic_class"], "role_status": "reviewed", "rank": rank,
                             "grade": "Meets target clarity", "reason": reason, "preparation_notes": "Standardise the whole square master.", "scope": "master"}],
        }
        catalogue["versions"].append(version); versions[version_id] = version
        log.add("manipulated", asset_id, version_id, "standardized" if parent_id else None, "manipulated",
                f'{"AI edit" if parent_id else "Generation"}: {r["intended_change"]} Visual review: {reason}', [parent_id] if parent_id else [])
        new.append(version_id); rank += 1
        print(f"{version_id}: {origin}, {r['role']} ({r['semantic_class']})")
    catalogue["updated_at"] = stamp
    CATALOGUE.write_text(json.dumps(catalogue, indent=2, ensure_ascii=False) + "\n")
    add_to_stage("manipulated", theme, new)
    log.write()


def withdraw(theme: str, records: list) -> None:
    catalogue = json.loads(CATALOGUE.read_text())
    versions = {v["version_id"]: v for v in catalogue["versions"]}
    stamp = now(); log = Log(stamp); gone = []
    for r in records:
        v = versions[r["version_id"]]
        if v["levels"] != ["manipulated"] or any(v["version_id"] in w["parent_version_ids"] for w in catalogue["versions"]):
            raise SystemExit(f'{v["version_id"]}: only unused manipulated masters can be withdrawn here.')
        for f in v["files"]:
            (ROOT / f["path"]).unlink(missing_ok=True)
        v["withdrawn"] = {"timestamp": stamp, "actor": "claude", "reason": r["reason"], "files": v["files"]}
        v["levels"], v["files"], v["updated_at"] = [], [], stamp
        log.add("withdrawn", v["asset_id"], v["version_id"], "manipulated", "withdrawn", r["reason"])
        gone.append(v["version_id"])
    catalogue["updated_at"] = stamp
    CATALOGUE.write_text(json.dumps(catalogue, indent=2, ensure_ascii=False) + "\n")
    path = COLLECTION / "manipulated" / theme / "index.json"
    stage = json.loads(path.read_text()); stage["version_ids"] = [i for i in stage["version_ids"] if i not in gone]
    path.write_text(json.dumps(stage, indent=2) + "\n")
    log.write()
    print(f"Withdrew {len(gone)} versions.")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("mode", choices=["photos", "ai", "withdraw"])
    parser.add_argument("theme")
    parser.add_argument("records", type=Path)
    parser.add_argument("--evidence", help="dated review document that records the search and checks (default stimuli/raw/THEME/review-2026-10-27.md)")
    args = parser.parse_args()
    EVIDENCE[0] = args.evidence or f"stimuli/raw/{args.theme}/review-2026-10-27.md"
    ensure_theme(args.theme)
    records = json.loads(args.records.read_text())
    {"photos": register_photos, "ai": register_ai, "withdraw": withdraw}[args.mode](args.theme, records)


if __name__ == "__main__":
    main()
