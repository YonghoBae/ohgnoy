"""Regenerates public/frames/cursor-glove.png — the pixel-art gloved-finger
pointer used as the CSS cursor over clickable elements on the home page
(docs/design/pixel-pokedex-home.md), styled after the classic mainline
Pokemon games' menu-selection cursor.

Built the same way as generate-panel-frame.py/generate-pokeball-icon.py:
per-pixel math (union of an ellipse "palm", a capsule "finger", and a
circle "thumb"), then a black outline traced on the shape's edge pixels.
Hand-drawn ASCII-grid attempts at this same shape didn't read as a hand
at cursor size — circular/elliptical math shapes with a real thumb bump
did.

Requires Pillow: pip install pillow
Run from anywhere: python3 scripts/generate-cursor-glove.py
"""

from pathlib import Path

from PIL import Image

N = 24  # logical canvas size in px
OUTPUT_SCALE = 2  # nearest-neighbor upscale so the cursor is visible on screen
# while staying genuinely blocky (image-rendering: pixelated has no effect on
# native OS cursor rendering, so the upscale has to be baked into the PNG).

PALM_CENTER = (11, 15.5)
PALM_RADII = (7.5, 6.5)

FINGER_X_RANGE = (8, 12)
FINGER_Y_RANGE = (2, 15)
FINGER_TIP_CENTER = (10, 3)
FINGER_TIP_RADIUS = 2.2

THUMB_CENTER = (18, 15)
THUMB_RADIUS = 3.6

BLACK = (11, 17, 25, 255)  # matches --border-dark in pokedex-home.module.css
WHITE = (240, 243, 246, 255)

OUTPUT_PATH = Path(__file__).resolve().parent.parent / "public" / "frames" / "cursor-glove.png"


def in_ellipse(x: float, y: float, cx: float, cy: float, rx: float, ry: float) -> bool:
    return ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1


def in_circle(x: float, y: float, cx: float, cy: float, r: float) -> bool:
    return (x - cx) ** 2 + (y - cy) ** 2 <= r * r


def inside_glove(x: int, y: int) -> bool:
    if in_ellipse(x, y, *PALM_CENTER, *PALM_RADII):
        return True
    fx0, fx1 = FINGER_X_RANGE
    fy0, fy1 = FINGER_Y_RANGE
    if fx0 <= x <= fx1 and fy0 <= y <= fy1:
        return True
    if in_circle(x, y, *FINGER_TIP_CENTER, FINGER_TIP_RADIUS):
        return True
    if in_circle(x, y, *THUMB_CENTER, THUMB_RADIUS):
        return True
    return False


def main() -> None:
    fill = [[inside_glove(x, y) for x in range(N)] for y in range(N)]

    img = Image.new("RGBA", (N, N), (0, 0, 0, 0))
    px = img.load()

    for y in range(N):
        for x in range(N):
            if not fill[y][x]:
                continue
            is_edge = any(
                nx < 0 or ny < 0 or nx >= N or ny >= N or not fill[ny][nx]
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1))
            )
            px[x, y] = BLACK if is_edge else WHITE

    if OUTPUT_SCALE != 1:
        img = img.resize((N * OUTPUT_SCALE, N * OUTPUT_SCALE), Image.NEAREST)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUTPUT_PATH)
    print(f"saved {img.size} -> {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
