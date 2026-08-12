"""Regenerates public/frames/panel-frame.png — the pixel-art border-image
used by the home page's Pokedex screen (docs/design/pixel-pokedex-home.md).

Draws a picture-frame outline (a solid rim of BORDER_COLOR, THICKNESS px
thick) with a small staircase notch cut out of all four corners, as real
pixel-by-pixel bitmap data (not an upscaled/interpolated shape) — the point
is for image-rendering: pixelated to keep the corners genuinely blocky,
which a CSS clip-path/border-radius can never do (those are vector shapes
the browser always anti-aliases).

Requires Pillow: pip install pillow

Run from anywhere:
    python3 scripts/generate-panel-frame.py

CORNER must match the `border-image-slice` value used everywhere this
asset is referenced in pokedex-home.module.css. If you change CANVAS,
THICKNESS, or CORNER, update border-image-slice at every call site to match.
"""

from pathlib import Path

from PIL import Image

CANVAS = 24  # source image is CANVAS x CANVAS px
THICKNESS = 3  # rim thickness in source px
CORNER = 6  # corner region size in source px — must equal border-image-slice
STEP = 1  # staircase step size in source px (keep small — see note below)
STEP_COUNT = 2  # how many steps get cut away from each corner

# STEP_COUNT=3 with STEP=2 (an earlier version of this asset) cut away most
# of the corner and left the frame looking like 4 disconnected segments
# instead of a continuous frame with a small nick. Keep the notch subtle.

BORDER_COLOR = (76, 127, 192, 255)  # #4C7FC0 — must match --border in pokedex-home.module.css

OUTPUT_PATH = Path(__file__).resolve().parent.parent / "public" / "frames" / "panel-frame.png"


def is_border(x: int, y: int) -> bool:
    return x < THICKNESS or x >= CANVAS - THICKNESS or y < THICKNESS or y >= CANVAS - THICKNESS


def in_corner(x: int, y: int) -> bool:
    return (
        (x < CORNER and y < CORNER)
        or (x >= CANVAS - CORNER and y < CORNER)
        or (x < CORNER and y >= CANVAS - CORNER)
        or (x >= CANVAS - CORNER and y >= CANVAS - CORNER)
    )


def notch_cut(x: int, y: int) -> bool:
    if x < CORNER and y < CORNER:
        cx, cy = x, y
    elif x >= CANVAS - CORNER and y < CORNER:
        cx, cy = (CANVAS - 1 - x), y
    elif x < CORNER and y >= CANVAS - CORNER:
        cx, cy = x, (CANVAS - 1 - y)
    else:
        cx, cy = (CANVAS - 1 - x), (CANVAS - 1 - y)
    step = (cx // STEP) + (cy // STEP)
    return step < STEP_COUNT


def main() -> None:
    img = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    px = img.load()

    for y in range(CANVAS):
        for x in range(CANVAS):
            if is_border(x, y) and not (in_corner(x, y) and notch_cut(x, y)):
                px[x, y] = BORDER_COLOR

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUTPUT_PATH)
    print(f"saved {img.size} -> {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
