"""Search Wikimedia Commons politely and cache candidate previews for review.

Wikimedia rate-limits unidentified or rapid clients, especially from shared
cloud addresses. This tool stays within its etiquette: an identifying
User-Agent, one batched API call per page of results (licence, author and
thumbnail URL together), maxlag, Retry-After back-off and one thumbnail
request per second at a standard thumbnail width.

For each query it writes stimuli/.cache/commons/<slug>/candidates.json, the
1280 px previews and a numbered contact sheet. Nothing is registered: review
the sheet, confirm the licence on the file page and register chosen images
as usual.

Usage: python3 tools/stimuli/commons_search.py "bicycle leaning fence" [--limit 40]

Only Pillow is required.
"""

import argparse
import io
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
CACHE = ROOT / "stimuli" / ".cache" / "commons"
API = "https://commons.wikimedia.org/w/api.php"
HEADERS = {"User-Agent": "DHV-stimulus-research/1.0 (https://github.com/eelkedevries/department-of-human-verification)"}
WIDTH = 1280  # a standard Commons thumbnail step
FIELDS = "LicenseShortName|LicenseUrl|Artist|Credit|AttributionRequired|ImageDescription"


def fetch(url: str, tries: int = 6) -> bytes:
    for attempt in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=HEADERS), timeout=60) as response:
                return response.read()
        except urllib.error.HTTPError as error:
            if error.code not in (429, 503) or attempt == tries - 1:
                raise
            wait = int(error.headers.get("Retry-After") or max(5, 2 ** attempt))
            print(f"  HTTP {error.code}; waiting {wait} s as requested", flush=True)
            time.sleep(wait)
    raise RuntimeError("unreachable")


def plain(html: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", html or "")).strip()


def search(query: str, limit: int) -> list:
    results, offset = [], 0
    while len(results) < limit:
        params = {
            "action": "query", "format": "json", "maxlag": 5,
            "generator": "search", "gsrsearch": f"{query} filetype:bitmap", "gsrnamespace": 6,
            "gsrlimit": min(50, limit - len(results)), "gsroffset": offset,
            "prop": "imageinfo", "iiprop": "url|size|mime|extmetadata", "iiurlwidth": WIDTH, "iiextmetadatafilter": FIELDS,
        }
        data = json.loads(fetch(f"{API}?{urllib.parse.urlencode(params)}"))
        pages = sorted(data.get("query", {}).get("pages", {}).values(), key=lambda p: p.get("index", 0))
        for page in pages:
            info = page["imageinfo"][0]
            meta = {k: plain(v.get("value", "")) for k, v in info.get("extmetadata", {}).items()}
            results.append({
                "title": page["title"],
                "page_url": info["descriptionurl"],
                "preview_url": info.get("thumburl", info["url"]),
                "original_width": info["width"],
                "original_height": info["height"],
                "licence": meta.get("LicenseShortName"),
                "licence_url": meta.get("LicenseUrl"),
                "author": meta.get("Artist"),
                "attribution_required": meta.get("AttributionRequired"),
                "description": meta.get("ImageDescription", "")[:200],
            })
        offset = data.get("continue", {}).get("gsroffset")
        if offset is None:
            break
    return results[:limit]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("query")
    parser.add_argument("--limit", type=int, default=40)
    args = parser.parse_args()

    folder = CACHE / re.sub(r"[^a-z0-9]+", "-", args.query.lower()).strip("-")
    folder.mkdir(parents=True, exist_ok=True)
    candidates = search(args.query, args.limit)
    cell, label, columns = 200, 16, 8
    rows = -(-len(candidates) // columns) or 1
    sheet = Image.new("RGB", (cell * columns, (cell + label) * rows), "white")
    draw = ImageDraw.Draw(sheet)
    for n, candidate in enumerate(candidates):
        path = folder / f"{n:03d}.jpg"
        if not path.exists():
            path.write_bytes(fetch(candidate["preview_url"]))
            print(f"  preview {n + 1}/{len(candidates)}", flush=True)
            time.sleep(1)
        candidate["preview_file"] = path.name
        image = Image.open(path).convert("RGB")
        candidate["preview_width"], candidate["preview_height"] = image.size
        image.thumbnail((cell, cell))
        x, y = (n % columns) * cell, (n // columns) * (cell + label)
        sheet.paste(image, (x + (cell - image.width) // 2, y + (cell - image.height) // 2))
        draw.text((x + 3, y + cell + 2), f"{n} {candidate['licence'] or '?'}", fill="red")
    (folder / "candidates.json").write_text(json.dumps(candidates, indent=1, ensure_ascii=False) + "\n")
    sheet.save(folder / "sheet.jpg", quality=85)
    print(f"{len(candidates)} candidates; sheet: {folder / 'sheet.jpg'}")


if __name__ == "__main__":
    main()
