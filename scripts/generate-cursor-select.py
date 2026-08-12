"""Fetches public/frames/cursor-select.png — the real menu-selection cursor
sprite from Pokemon Ruby/Sapphire/Emerald (the orange triangular pointer
used to select items in the Start menu, Bag, etc.), sourced from the
pokeemerald decompilation project, pinned to a specific commit so this
script keeps producing the same file even if that repo's master branch
changes.

Replaces an earlier hand-drawn "gloved finger" cursor asset — the request
was for a real, verified in-game asset instead of an invented one.

Source: https://github.com/pret/pokeemerald
        graphics/interface/arrow_cursor.png
        pinned at commit 3b1c8dfb17a361dcb00d3bd76d8e322ac51d1ddc

The raw file has no alpha channel — GBA decomp graphics export the
"transparent" palette index as an opaque backdrop color instead (here a
blue-gray, RGB 115,164,197). This script keys that color out to real
alpha transparency, then upscales 2x with nearest-neighbor (same reason
as generate-cursor-glove.py: image-rendering: pixelated has no effect on
native OS cursor rendering, so the blockiness has to be baked into the
PNG's actual pixels).

Requires Pillow: pip install pillow
Run from anywhere: python3 scripts/generate-cursor-select.py
"""

import urllib.request
from pathlib import Path

from PIL import Image

SOURCE_URL = (
    "https://raw.githubusercontent.com/pret/pokeemerald/"
    "3b1c8dfb17a361dcb00d3bd76d8e322ac51d1ddc/graphics/interface/arrow_cursor.png"
)
BACKDROP_COLOR = (115, 164, 197)  # the flat "transparent" placeholder color in the raw file
OUTPUT_SCALE = 2

OUTPUT_PATH = Path(__file__).resolve().parent.parent / "public" / "frames" / "cursor-select.png"


def main() -> None:
    tmp_path = Path("/tmp/cursor-select-source.png")
    urllib.request.urlretrieve(SOURCE_URL, tmp_path)

    img = Image.open(tmp_path).convert("RGBA")
    px = img.load()
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = px[x, y]
            if (r, g, b) == BACKDROP_COLOR:
                px[x, y] = (0, 0, 0, 0)

    if OUTPUT_SCALE != 1:
        img = img.resize((img.width * OUTPUT_SCALE, img.height * OUTPUT_SCALE), Image.NEAREST)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUTPUT_PATH)
    print(f"saved {img.size} -> {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
