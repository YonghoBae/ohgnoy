"""Regenerates public/frames/pokeball.png — the pixel-art Poke Ball icon
shown next to the "POKEDEX" wordmark in the home page sidebar
(docs/design/pixel-pokedex-home.md).

Drawn as real pixel-by-pixel bitmap data at 16x16, same rationale as
generate-panel-frame.py: image-rendering: pixelated only stays crisp on
genuine bitmap data, not on anything upscaled/interpolated.

Requires Pillow: pip install pillow
Run from anywhere: python3 scripts/generate-pokeball-icon.py
"""

from pathlib import Path

from PIL import Image

N = 16
CENTER = (N - 1) / 2
RADIUS = 7
BUTTON_RADIUS = 2.2
BUTTON_HOLE_RADIUS = 1.1
BAND_HALF_HEIGHT = 1.1
RIM_THICKNESS = 1.1

BLACK = (11, 17, 25, 255)  # matches --border-dark in pokedex-home.module.css
RED = (191, 78, 70, 255)
WHITE = (230, 235, 240, 255)  # matches --text

OUTPUT_PATH = Path(__file__).resolve().parent.parent / "public" / "frames" / "pokeball.png"


def main() -> None:
    img = Image.new("RGBA", (N, N), (0, 0, 0, 0))
    px = img.load()

    for y in range(N):
        for x in range(N):
            dx, dy = x - CENTER, y - CENTER
            dist = (dx * dx + dy * dy) ** 0.5
            if dist > RADIUS:
                continue
            if dist > RADIUS - RIM_THICKNESS or abs(dy) < BAND_HALF_HEIGHT:
                px[x, y] = BLACK
            elif dy < 0:
                px[x, y] = RED
            else:
                px[x, y] = WHITE

    for y in range(N):
        for x in range(N):
            dx, dy = x - CENTER, y - CENTER
            dist = (dx * dx + dy * dy) ** 0.5
            if dist <= BUTTON_RADIUS:
                px[x, y] = WHITE if dist <= BUTTON_HOLE_RADIUS else BLACK

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUTPUT_PATH)
    print(f"saved {img.size} -> {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
