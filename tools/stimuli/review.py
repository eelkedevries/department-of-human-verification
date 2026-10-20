"""Contact sheets for checking the raw renders by eye before they are published.

Writes one 3 x 3 sheet per grid to tools/stimuli/.cache/sheets/, each tile
labelled with its ID and role, so a reviewer can confirm that every target shows
what its label says and no distractor could satisfy the instruction.

Usage: python3 tools/stimuli/review.py [GRID_ID ...]
"""

import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
RAW = HERE / ".cache" / "raw"
SHEETS = HERE / ".cache" / "sheets"
CELL = 300


def main() -> None:
    spec = json.loads((HERE / "source.json").read_text())
    SHEETS.mkdir(parents=True, exist_ok=True)
    wanted = set(sys.argv[1:])
    for grid in spec["grids"]:
        if wanted and grid["grid_id"] not in wanted:
            continue
        sheet = Image.new("RGB", (CELL * 3, CELL * 3 + 30), "white")
        draw = ImageDraw.Draw(sheet)
        draw.text((6, CELL * 3 + 8), f'{grid["grid_id"]}: {grid["instruction"]}', fill="black")
        for i, tile in enumerate(grid["tiles"]):
            path = RAW / f'{tile["tile_id"]}.png'
            x, y = (i % 3) * CELL, (i // 3) * CELL
            if path.exists():
                sheet.paste(Image.open(path).convert("RGB").resize((CELL, CELL)), (x, y))
            colour = "green" if tile["role"] == "target" else "red"
            draw.rectangle((x, y, x + 120, y + 16), fill="white")
            draw.text((x + 3, y + 2), f'{tile["tile_id"]} {tile["role"]}', fill=colour)
        sheet.save(SHEETS / f'{grid["grid_id"]}.png')
        print(SHEETS / f'{grid["grid_id"]}.png')


if __name__ == "__main__":
    main()
