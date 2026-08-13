"""Regenerates the pixel-art border-image frame(s) used as border-image
sources across the site's pixel-art panels.

Two consumers use this script's output:
  - public/frames/panel-frame.png (default) — the home page's Pokedex
    screen, referenced from pokedex-home.module.css.
  - public/frames/panel-frame-light.png (via PANEL_FRAME_OUTPUT/
    PANEL_FRAME_COLOR below) — the light-mode pixel-theme frame,
    referenced from src/app/_components/ui/pixel/pixel-theme.module.css.

Draws a picture-frame outline with a highlight/shadow bevel (top/left rim
pixels get a lighter tint, bottom/right rim pixels get a darker tint, both
derived from a single base color) and a staircase notch cut out of all
four corners, as real pixel-by-pixel bitmap data (not an upscaled/
interpolated shape) — the point is for image-rendering: pixelated to keep
the corners genuinely blocky, which a CSS clip-path/border-radius can
never do (those are vector shapes the browser always anti-aliases).

Requires Pillow: pip install pillow

Run from anywhere:
    python3 scripts/generate-panel-frame.py

Environment variables (optional):
    PANEL_FRAME_COLOR             — base hex color the bevel is derived
                                     from (default: #4C7FC0)
    PANEL_FRAME_HIGHLIGHT_TARGET  — hex color to blend the base toward for
                                     the highlight tint (default: #7FA6D9,
                                     matches --border-light)
    PANEL_FRAME_SHADOW_TARGET     — hex color to blend the base toward for
                                     the shadow tint (default: #0B1119,
                                     matches --border-dark)
    PANEL_FRAME_OUTPUT            — output file path (default:
                                     public/frames/panel-frame.png)

CORNER must match the `border-image-slice` value used everywhere this
asset is referenced: pokedex-home.module.css AND
src/app/_components/ui/pixel/pixel-theme.module.css. If you change CANVAS,
THICKNESS, or CORNER, update border-image-slice at every call site to match.
"""

import os
from pathlib import Path

from PIL import Image

CANVAS = 24  # source image is CANVAS x CANVAS px
THICKNESS = 3  # rim thickness in source px
CORNER = 6  # corner region size in source px — must equal border-image-slice
STEP = 1  # staircase step size in source px (keep small — see note below)
STEP_COUNT = 4  # how many steps get cut away from each corner

# STEP_COUNT=4 with STEP=1 cuts a real multi-step staircase within the 6px
# corner region without disconnecting the frame (worked through by hand:
# the corner ends up as an ascending 2px/3px/4px staircase, not a single
# shallow nick). An earlier version of this asset used STEP_COUNT=2, which
# only nicked ~1-2px off the very tip — barely visible at real border
# widths. A much older attempt at STEP_COUNT=3 with STEP=2 cut so much
# that the frame looked like 4 disconnected segments — that failure mode
# was from the larger STEP=2 unit, not from a larger STEP_COUNT alone.


def hex_to_rgb(hex_color: str) -> tuple:
    """Convert hex color like #4C7FC0 to an (r, g, b) tuple."""
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i : i + 2], 16) for i in (0, 2, 4))


def blend(c1: tuple, c2: tuple, t: float) -> tuple:
    """Blend two (r, g, b) tuples. t=0 returns c1, t=1 returns c2."""
    return tuple(round(c1[i] * (1 - t) + c2[i] * t) for i in range(3))


def rgb_to_rgba(rgb: tuple) -> tuple:
    return (*rgb, 255)


# Read base color and blend targets from environment, with defaults
_base_hex = os.environ.get("PANEL_FRAME_COLOR", "#4C7FC0")
_highlight_target_hex = os.environ.get("PANEL_FRAME_HIGHLIGHT_TARGET", "#7FA6D9")
_shadow_target_hex = os.environ.get("PANEL_FRAME_SHADOW_TARGET", "#0B1119")

BASE_RGB = hex_to_rgb(_base_hex)
HIGHLIGHT_COLOR = rgb_to_rgba(blend(BASE_RGB, hex_to_rgb(_highlight_target_hex), 0.5))
SHADOW_COLOR = rgb_to_rgba(blend(BASE_RGB, hex_to_rgb(_shadow_target_hex), 0.5))

_output_rel = os.environ.get("PANEL_FRAME_OUTPUT", "public/frames/panel-frame.png")
OUTPUT_PATH = Path(_output_rel) if Path(_output_rel).is_absolute() else Path(__file__).resolve().parent.parent / _output_rel


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


def pixel_color(x: int, y: int) -> tuple:
    """Highlight wins on the top/left rim; shadow covers the rest of the
    border. Checked in this order so the top-right and bottom-left corners
    (which could match either rule) deterministically resolve to highlight."""
    if x < THICKNESS or y < THICKNESS:
        return HIGHLIGHT_COLOR
    return SHADOW_COLOR


def main() -> None:
    img = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    px = img.load()

    for y in range(CANVAS):
        for x in range(CANVAS):
            if is_border(x, y) and not (in_corner(x, y) and notch_cut(x, y)):
                px[x, y] = pixel_color(x, y)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUTPUT_PATH)
    print(f"saved {img.size} -> {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
