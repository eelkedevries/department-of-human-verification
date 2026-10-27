"""Standardise suitable collection photographs to the webp-512-256-v1 format.

For each suitable version of THEME without a standardised child, downloads the
recorded preview to stimuli/.cache/, checks it against the recorded preview
hash, applies orientation, sRGB conversion and the recorded square crop, and
writes 512 and 256 px WebP files to stimuli/standardized/THEME/. A contact
sheet for review at tile size is written to stimuli/.cache/.

Nothing is registered until the reviewer has inspected the outputs and supplies
REVIEWS, a JSON object mapping each parent version ID to an approved visual
review reason. The catalogue, stage manifest and history are then updated.

Usage:
  python3 tools/stimuli/standardise.py THEME
  python3 tools/stimuli/standardise.py THEME --reviews REVIEWS --actor NAME

A preview whose bytes changed at the source is refused unless its version ID
is passed to --accept-reencoded and its dimensions are unchanged.

Only Pillow is required.
"""

import argparse
import copy
import hashlib
import io
import json
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

import PIL
from PIL import Image, ImageCms, ImageDraw, ImageOps, features

ROOT = Path(__file__).resolve().parents[2]
COLLECTION = ROOT / "stimuli"
CACHE = COLLECTION / ".cache"
CATALOGUE = COLLECTION / "catalogue.json"
HISTORY = COLLECTION / "history.jsonl"
PROFILE = "webp-512-256-v1"
SIZES = {"large": 512, "small": 256}
QUALITY = 82
METHOD = 6


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def download(version: dict, accepted: set) -> tuple[bytes, str | None]:
    path = CACHE / f'{version["version_id"]}.preview'
    if not path.exists():
        request = urllib.request.Request(version["external_url"], headers={"User-Agent": "DHV-stimulus-research/1.0 (https://github.com/eelkedevries/department-of-human-verification)"})
        with urllib.request.urlopen(request, timeout=60) as response:
            path.write_bytes(response.read())
    data = path.read_bytes()
    expected = version["observed_preview"]["sha256"]
    if sha256(data) == expected:
        return data, None
    # Image CDNs may re-encode a preview; accept new bytes only on request and
    # only when the dimensions still match, then review the output by eye.
    size = Image.open(io.BytesIO(data)).size
    if version["version_id"] in accepted and size == (version["observed_preview"]["width"], version["observed_preview"]["height"]):
        return data, expected
    raise SystemExit(f'{version["version_id"]}: downloaded preview hash {sha256(data)} differs from the reviewed preview {expected}; inspect it and pass --accept-reencoded to use it.')


def to_srgb(image: Image.Image) -> tuple[Image.Image, str]:
    icc = image.info.get("icc_profile")
    if icc:
        source = ImageCms.ImageCmsProfile(io.BytesIO(icc))
        name = ImageCms.getProfileDescription(source).strip()
        converted = ImageCms.profileToProfile(image, source, ImageCms.createProfile("sRGB"), outputMode="RGB")
        note = f"Embedded ICC profile '{name}' converted to sRGB (perceptual intent); output untagged sRGB."
    else:
        converted = image.convert("RGB")
        note = f"No embedded ICC profile; {image.mode} input treated as sRGB; output untagged sRGB."
    converted.info.pop("icc_profile", None)
    converted.info.pop("exif", None)
    return converted, note


def encode(image: Image.Image, size: int) -> bytes:
    buffer = io.BytesIO()
    image.resize((size, size), Image.Resampling.LANCZOS).save(buffer, "WEBP", quality=QUALITY, method=METHOD)
    return buffer.getvalue()


def standardise(version: dict, theme: str, accepted: set, taken: set) -> dict:
    data, reviewed_hash = download(version, accepted)
    source = Image.open(io.BytesIO(data))
    orientation = source.getexif().get(0x0112, 1)
    oriented = ImageOps.exif_transpose(source)
    image, colour = to_srgb(oriented)
    assessment = next(a for a in version["assessments"] if a["theme"] == theme)
    crop = assessment["proposed_crop"]
    if image.size != (crop["reference_width"], crop["reference_height"]) or crop["coordinate_space"] != "downloaded-preview-pixels":
        raise SystemExit(f'{version["version_id"]}: crop reference does not match the {image.size} preview.')
    if crop["side"] < SIZES["large"]:
        raise SystemExit(f'{version["version_id"]}: a {crop["side"]} px crop would need upscaling.')
    square = image.crop((crop["x"], crop["y"], crop["x"] + crop["side"], crop["y"] + crop["side"]))

    number = 1
    while f'{version["asset_id"]}-standardized-v{number}' in taken:
        number += 1
    version_id = f'{version["asset_id"]}-standardized-v{number}'
    folder = COLLECTION / "standardized" / theme
    files = []
    for purpose, size in SIZES.items():
        name = f"{version_id}{'-s' if purpose == 'small' else ''}.webp"
        encoded = encode(square, size)
        (folder / name).write_bytes(encoded)
        files.append({
            "purpose": purpose,
            "path": f"stimuli/standardized/{theme}/{name}",
            "sha256": sha256(encoded),
            "width": size,
            "height": size,
            "format": "webp",
            "colour_mode": "RGB",
            "colour_space": "sRGB",
            "bytes": len(encoded),
        })
    return {
        "parent": version,
        "version_id": version_id,
        "files": files,
        "small": square.resize((SIZES["small"],) * 2, Image.Resampling.LANCZOS),
        "operation": {
            "input": {"url": version["external_url"], "sha256": sha256(data), "format": (source.format or "unknown").lower()}
            | ({"reviewed_preview_sha256": reviewed_hash, "notes": "The source CDN re-encoded the preview after review; same dimensions, content checked visually against the parent record."} if reviewed_hash else {}),
            "input_dimensions": {"width": image.width, "height": image.height},
            "crop": {"x": crop["x"], "y": crop["y"], "side": crop["side"]},
            "orientation": "EXIF orientation 1 (none needed)" if orientation == 1 else f"EXIF orientation {orientation} applied before cropping",
            "colour_conversion": colour,
        },
    }


def contact_sheet(results: list, theme: str, assessments: dict) -> Path:
    cell, label, columns = SIZES["small"], 34, 5
    rows = -(-len(results) // columns)
    sheet = Image.new("RGB", (cell * columns, (cell + label) * rows), "white")
    draw = ImageDraw.Draw(sheet)
    for i, result in enumerate(results):
        x, y = (i % columns) * cell, (i // columns) * (cell + label)
        sheet.paste(result["small"], (x, y))
        a = assessments[result["parent"]["version_id"]]
        draw.text((x + 4, y + cell + 3), f'#{a["rank"]} {a["role"]}', fill="black")
        draw.text((x + 4, y + cell + 17), result["parent"]["description"][:40], fill="black")
    path = CACHE / f"standardized-{theme}-sheet.png"
    sheet.save(path)
    return path


def register(catalogue: dict, results: list, theme: str, reviews: dict, actor: str) -> None:
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    encoder = f'Pillow {PIL.__version__} WebP (libwebp {features.version("webp")}), quality {QUALITY}, method {METHOD}'
    stage_path = COLLECTION / "standardized" / theme / "index.json"
    stage = json.loads(stage_path.read_text())
    history = HISTORY.read_text().rstrip("\n").split("\n")
    prefix = f'evt-{now[:10].replace("-", "")}-'
    numbers = [int(json.loads(line)["event_id"].rsplit("-", 1)[1]) for line in history if json.loads(line)["event_id"].startswith(prefix)]
    number = max(numbers, default=0)
    events = []
    for result in results:
        parent = result["parent"]
        reason = reviews[parent["version_id"]]
        assessments = []
        for a in copy.deepcopy(parent["assessments"]):
            a.pop("proposed_crop", None)
            a["scope"] = "standardised-crop"
            assessments.append(a)
        characteristics = dict(parent["characteristics"], assessment_scope="standardised-crop")
        operation = {
            "type": "standardisation",
            "timestamp": now,
            "actor": actor,
            "profile": PROFILE,
            **result["operation"],
            "resampling": "Lanczos",
            "encoder": encoder,
            "tool": "tools/stimuli/standardise.py",
            "content_changes": False,
            "allow_upscale": False,
            "notes": "Input is the reviewed preview recorded on the parent; the crop is the parent's reviewed proposed crop. The original master was not used.",
        }
        catalogue["versions"].append({
            "version_id": result["version_id"],
            "asset_id": parent["asset_id"],
            "levels": ["standardized"],
            "parent_version_ids": [parent["version_id"]],
            "external_url": None,
            "files": result["files"],
            "characteristics": characteristics,
            "reviews": {
                "visual": {"status": "approved", "actor": actor, "timestamp": now, "reason": reason, "scope": "standardised-512-256"},
                "rights": {"status": "approved", "actor": actor, "timestamp": now, "reason": "Derivative of the parent's individually verified source; its licence permits modification and its recorded conditions apply unchanged."},
            },
            "operation": operation,
            "unresolved_issues": list(parent["unresolved_issues"]),
            "created_at": now,
            "updated_at": now,
            "actor": actor,
            "description": parent["description"],
            "object_type": parent["object_type"],
            "content_origin": parent["content_origin"],
            "keywords": list(parent["keywords"]),
            "assessments": assessments,
        })
        stage["version_ids"].append(result["version_id"])
        number += 1
        crop = result["operation"]["crop"]
        size = result["operation"]["input_dimensions"]
        events.append({
            "event_id": f"{prefix}{number:04d}",
            "timestamp": now,
            "actor": actor,
            "action": "standardized",
            "asset_ids": [parent["asset_id"]],
            "version_ids": [result["version_id"]],
            "set_ids": [],
            "parent_version_ids": [parent["version_id"]],
            "output_version_ids": [result["version_id"]],
            "from": "suitable",
            "to": "standardized",
            "reason": f'{PROFILE}: {crop["side"]} px square crop at ({crop["x"]}, {crop["y"]}) of the {size["width"]} x {size["height"]} preview. Visual review: {reason}',
        })
    catalogue["updated_at"] = now
    CATALOGUE.write_text(json.dumps(catalogue, indent=2, ensure_ascii=False) + "\n")
    stage_path.write_text(json.dumps(stage, indent=2) + "\n")
    HISTORY.write_text("\n".join(history + [json.dumps(e) for e in events]) + "\n")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("theme")
    parser.add_argument("--reviews", type=Path, help="JSON object of parent version ID to approved visual review reason")
    parser.add_argument("--actor", help="reviewer recorded on the new versions")
    parser.add_argument("--accept-reencoded", nargs="*", default=[], metavar="VERSION_ID", help="accept a re-encoded preview with unchanged dimensions")
    args = parser.parse_args()
    if bool(args.reviews) != bool(args.actor):
        parser.error("--reviews and --actor are used together")

    catalogue = json.loads(CATALOGUE.read_text())
    versions = {v["version_id"]: v for v in catalogue["versions"]}
    suitable = json.loads((COLLECTION / "suitable" / args.theme / "index.json").read_text())["version_ids"]
    done = {p for v in catalogue["versions"] if "standardized" in v["levels"] for p in v["parent_version_ids"]}
    pending = [versions[i] for i in suitable if i not in done]
    assessments = {v["version_id"]: next(a for a in v["assessments"] if a["theme"] == args.theme) for v in pending}
    pending.sort(key=lambda v: assessments[v["version_id"]]["rank"] or 0)
    if not pending:
        print(f"No suitable {args.theme} versions await standardisation.")
        return

    CACHE.mkdir(parents=True, exist_ok=True)
    taken = {v["version_id"] for v in catalogue["versions"]}
    results = [standardise(v, args.theme, set(args.accept_reencoded), taken) for v in pending]
    print(f"Wrote {len(results)} standardised pairs; review sheet: {contact_sheet(results, args.theme, assessments)}")
    if not args.reviews:
        print("Inspect the outputs, then rerun with --reviews and --actor to register them.")
        return
    reviews = json.loads(args.reviews.read_text())
    missing = [r["parent"]["version_id"] for r in results if not str(reviews.get(r["parent"]["version_id"], "")).strip()]
    if missing:
        raise SystemExit(f"Missing approved visual reviews for: {', '.join(missing)}")
    register(catalogue, results, args.theme, reviews, args.actor)
    print(f"Registered {len(results)} standardised versions.")


if __name__ == "__main__":
    main()
