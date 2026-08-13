# Pokédex Frame Bevel & Color Harmonization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the shared pixel-art frame asset (`public/frames/panel-frame.png` / `panel-frame-light.png`) a real highlight/shadow bevel and a harder, more readable corner staircase, with a base color that's derived from — not disconnected from — the screen's existing dark/light palettes; explore three color candidates via real screenshots before committing to one.

**Architecture:** One script, `scripts/generate-panel-frame.py`, is extended to paint each border-region pixel as either a highlight or shadow tint (both derived from a single base color via a 50% blend toward configurable "highlight target" / "shadow target" colors) instead of one flat color, and to cut a deeper corner staircase. No CSS changes anywhere — both consumers (`pokedex-home.module.css`, `pixel-theme.module.css`) already reference the PNGs via `border-image-source`/`border-image-slice`, so only pixel content changes. Three pre-computed base-color candidates are rendered into the live page (temporarily overwriting the committed PNGs, then restored via `git checkout`) and screenshotted for the project owner to pick from before the final asset is committed.

**Tech Stack:** Python 3 + Pillow (`scripts/generate-panel-frame.py`), Next.js dev server for live rendering, browser automation (Chrome DevTools MCP or `browser-use` plugin, whichever is connected) for real screenshots.

## Global Constraints

- No changes to `src/app/_components/pokedex-home.module.css` or `src/app/_components/ui/pixel/pixel-theme.module.css` — only `scripts/generate-panel-frame.py` and the two PNG assets it produces change.
- Corner notch geometry: `STEP=1` and `CORNER=6` stay fixed; only `STEP_COUNT` changes from `2` to `4`.
- Bevel precedence is fixed and deterministic: a border pixel is **highlight** if `x < THICKNESS or y < THICKNESS` (checked first), otherwise **shadow** if `x >= CANVAS - THICKNESS or y >= CANVAS - THICKNESS`. No other tie-break logic.
- No change to `--window-bg`, `--window-bg-2`, `--window-active`, `--accent-warm`, or any other CSS custom property — only the border/highlight/shadow PNG pixel colors.
- No change to any pokemon-section page's actual layout (Phase 2 migration is separate, not started).
- Candidate exploration (Task 2) must never leave the repo's committed `public/frames/panel-frame.png`/`panel-frame-light.png` modified on disk after the task ends — always restore via `git checkout -- <path>` after screenshotting each candidate.
- No automated visual test suite exists for this repo's pixel-art work — verification is `python3` + PIL pixel inspection, plus real browser screenshots (never reason about the rendered result from memory).

---

### Task 1: Extend the frame generator with bevel + deeper corner staircase

**Files:**
- Modify: `scripts/generate-panel-frame.py`

**Interfaces:**
- Produces: the script now reads four env vars — `PANEL_FRAME_COLOR` (base color, hex, default `#4C7FC0` — unchanged default), `PANEL_FRAME_HIGHLIGHT_TARGET` (hex, default `#7FA6D9`, matches the existing `--border-light` token), `PANEL_FRAME_SHADOW_TARGET` (hex, default `#0B1119`, matches the existing `--border-dark` token), `PANEL_FRAME_OUTPUT` (unchanged). Every border-region pixel is painted either `HIGHLIGHT_COLOR` (blend of base and highlight target at 50%) or `SHADOW_COLOR` (blend of base and shadow target at 50%) — there is no longer a flat single-color fill.
- Consumes: nothing from other tasks (this is the first task).

- [ ] **Step 1: Read the current script in full**

Read `scripts/generate-panel-frame.py` to confirm its current shape matches what this task modifies (it should have `CANVAS=24`, `THICKNESS=3`, `CORNER=6`, `STEP=1`, `STEP_COUNT=2`, a `hex_to_rgba` helper, `is_border`/`in_corner`/`notch_cut` functions, and a `main()` that paints `BORDER_COLOR` flat). If it differs meaningfully from this, stop and flag it — don't silently rewrite around an unexpected structure.

- [ ] **Step 2: Replace the full script contents**

```python
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
```

- [ ] **Step 3: Run with all defaults and inspect pixel content**

```bash
PANEL_FRAME_OUTPUT=/tmp/panel-frame-check.png python3 scripts/generate-panel-frame.py
python3 -c "
from PIL import Image
img = Image.open('/tmp/panel-frame-check.png').convert('RGBA')
colors = img.getcolors(maxcolors=100000)
colors.sort(key=lambda c: -c[0])
for count, color in colors:
    print(count, '#%02X%02X%02X%02X' % color)
"
```
Expected: exactly 3 distinct colors printed — one fully-transparent (`#00000000`, the non-border area), and two opaque colors (the highlight and shadow tints derived from the default `#4C7FC0` base). If a third opaque color appears, or only one opaque color appears, stop — the bevel split isn't working and must be fixed before continuing.

- [ ] **Step 4: Verify the corner staircase is deeper than before**

```bash
python3 -c "
from PIL import Image
img = Image.open('/tmp/panel-frame-check.png').convert('RGBA')
# Print the alpha channel of the top-left 6x6 corner as a grid: '#' = opaque, '.' = transparent
for y in range(6):
    row = ''
    for x in range(6):
        row += '#' if img.getpixel((x, y))[3] > 0 else '.'
    print(row)
"
```
Expected output is a staircase pattern (roughly ascending from bottom-left toward top-right of this 6x6 corner sample, with more filled cells the further from the exact corner pixel), NOT a pattern where only the single (0,0) pixel is empty and everything else is filled (that would indicate `STEP_COUNT` didn't actually take effect). If the grid looks nearly all `#` with only 1-2 `.` near the corner, stop — the staircase change didn't apply.

- [ ] **Step 5: Confirm the CORNER=6 docstring warning is still accurate**

Read `pokedex-home.module.css` and `src/app/_components/ui/pixel/pixel-theme.module.css` and confirm both still use `border-image-slice: 6` (unchanged by this task, but re-verify since the docstring promises this must stay in sync — if either file was changed by unrelated work since the last check, flag it, don't silently proceed).

- [ ] **Step 6: Commit**

```bash
git add scripts/generate-panel-frame.py
git commit -m "feat: add highlight/shadow bevel and deeper corner staircase to panel-frame generator"
```

---

### Task 2: Generate three color candidates per theme and screenshot-compare them

**Files:**
- None committed by this task — all outputs are scratch artifacts. `public/frames/panel-frame.png` and `public/frames/panel-frame-light.png` are temporarily overwritten during the task and MUST be restored via `git checkout` before the task ends.

**Interfaces:**
- Consumes: `scripts/generate-panel-frame.py`'s env vars from Task 1 (`PANEL_FRAME_COLOR`, `PANEL_FRAME_HIGHLIGHT_TARGET`, `PANEL_FRAME_SHADOW_TARGET`, `PANEL_FRAME_OUTPUT`).
- Produces: a written report (path given at dispatch time) describing each candidate and pointing to its saved screenshot files. No code or asset changes persist past this task.

The three dark candidates (base colors, computed by blending the old border `#4C7FC0` toward `--window-bg-2` `#1e2e3d` at 35%/50%/65% — already computed, use these literal hex values, do not recompute):

| Candidate | Base (`PANEL_FRAME_COLOR`) |
|---|---|
| dark-A | `#3C6392` |
| dark-B | `#36587E` |
| dark-C | `#2E4A6B` |

The three light candidates (base colors, computed by blending light mode's existing border `#5E81AC` toward `--color-surface-2` `#D8DEE9` at 35%/50%/65%), plus light-specific highlight/shadow targets (`--color-bg` `#ECEFF4` as the highlight target, and `#4C566A` — Nord's nord3 — as the shadow target, both chosen since they're existing light-mode-appropriate tones rather than the dark-mode defaults):

| Candidate | Base (`PANEL_FRAME_COLOR`) |
|---|---|
| light-A | `#89A2C1` |
| light-B | `#9BB0CB` |
| light-C | `#ADBDD4` |

- [ ] **Step 1: Confirm a dev server is reachable**

Run `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` — expected `200`. If not, start one with `npm run dev` (background it) and wait for it to report ready before continuing.

- [ ] **Step 2: Generate and screenshot each dark candidate**

For each of `dark-A`, `dark-B`, `dark-C` in turn:

```bash
PANEL_FRAME_COLOR="<candidate base hex>" PANEL_FRAME_OUTPUT="public/frames/panel-frame.png" python3 scripts/generate-panel-frame.py
```

Then, using whichever browser tool is connected (search for it via ToolSearch, query "chrome devtools" or "browser-use" — Chrome DevTools MCP requires a local Chrome.app binary which may not be present, in which case fall back to `browser-use`):
1. Navigate to `http://localhost:3000/` (the home page defaults to dark — no toggle needed).
2. Take a full-page screenshot; save it to the scratchpad directory as `pokedex-frame-<candidate-name>-home-full.png`.
3. Take a zoomed screenshot of one corner (e.g., top-left of the outer `.screen` frame) at high zoom (as was done during the original diagnosis — a CDP `Page.captureScreenshot` with a small `clip` region and `scale: 6` or higher works well) and save it as `pokedex-frame-<candidate-name>-home-corner.png`.
4. Navigate to `http://localhost:3000/pokemon/list`, ensure dark mode is active (`document.documentElement.classList.contains('dark')` should be true — the pokemon section defaults based on the theme switcher's stored preference, so explicitly run `document.documentElement.classList.add('dark')` via the browser tool's JS-eval capability if it isn't already active), take a corner-zoomed screenshot of a `PixelCard`, save as `pokedex-frame-<candidate-name>-pokemon-corner.png`.

- [ ] **Step 3: Restore the dark asset**

```bash
git checkout -- public/frames/panel-frame.png
```
Verify: `git status --porcelain public/frames/panel-frame.png` prints nothing.

- [ ] **Step 4: Generate and screenshot each light candidate**

For each of `light-A`, `light-B`, `light-C` in turn:

```bash
PANEL_FRAME_COLOR="<candidate base hex>" PANEL_FRAME_HIGHLIGHT_TARGET="#ECEFF4" PANEL_FRAME_SHADOW_TARGET="#4C566A" PANEL_FRAME_OUTPUT="public/frames/panel-frame-light.png" python3 scripts/generate-panel-frame.py
```

Then navigate to `http://localhost:3000/pokemon/list`, force light mode (`document.documentElement.classList.remove('dark')`), take a full-page screenshot (`pokedex-frame-<candidate-name>-pokemon-full.png`) and a corner-zoomed screenshot (`pokedex-frame-<candidate-name>-pokemon-corner.png`), both to the scratchpad directory. The home page has no light mode (dark-only by design, per `docs/design/pixel-pokedex-home.md`), so only the pokemon-section page is screenshotted for light candidates.

- [ ] **Step 5: Restore the light asset**

```bash
git checkout -- public/frames/panel-frame-light.png
```
Verify: `git status --porcelain public/frames/panel-frame-light.png` prints nothing, and `git status --porcelain` overall shows no uncommitted changes from this task.

- [ ] **Step 6: Write the comparison report**

Write a report (path given at dispatch time) listing, for each of the 6 candidates: its exact hex base color, the two screenshot file paths produced for it, and a plain description of what's visually distinct about it (e.g., "dark-A is the brightest/most saturated of the three, closest to the original color; dark-C is the most muted, closest to blending into the interior background"). Do not pick a winner — that decision belongs to the project owner, not this task.

- [ ] **Step 7: Do NOT commit anything**

This task produces no commits — the working tree must be clean (`git status --porcelain` empty) at the end, with only scratch screenshot files existing outside the repo.

---

### Task 3: Finalize the chosen candidate and verify across all consumers

**Files:**
- Modify (regenerate, then commit): `public/frames/panel-frame.png`, `public/frames/panel-frame-light.png`

**Interfaces:**
- Consumes: a decision file at a path given at dispatch time (e.g., `<workspace>/chosen-candidate.md`), written by the controller after the project owner reviewed Task 2's screenshots and picked a candidate (or gave refinement feedback that the controller resolved into final hex values). This file contains the exact final `PANEL_FRAME_COLOR` (and, for the light asset, `PANEL_FRAME_HIGHLIGHT_TARGET`/`PANEL_FRAME_SHADOW_TARGET` if they differ from Task 2's `#ECEFF4`/`#4C566A`) to use for each of the two final assets. Read this file for the real values — do not reuse Task 2's candidate hexes without checking it, since the owner may have asked for a refinement not identical to any single candidate.

- [ ] **Step 1: Read the decision file**

Read the path given at dispatch time. It must specify: the final dark base hex, the final light base hex, and (if applicable) any non-default highlight/shadow target overrides for either asset. If the file is missing or incomplete, stop and request it — do not guess a final color.

- [ ] **Step 2: Regenerate the final dark asset**

```bash
PANEL_FRAME_COLOR="<final dark base hex from decision file>" PANEL_FRAME_OUTPUT="public/frames/panel-frame.png" python3 scripts/generate-panel-frame.py
```

- [ ] **Step 3: Regenerate the final light asset**

```bash
PANEL_FRAME_COLOR="<final light base hex from decision file>" PANEL_FRAME_HIGHLIGHT_TARGET="<final light highlight target, default #ECEFF4>" PANEL_FRAME_SHADOW_TARGET="<final light shadow target, default #4C566A>" PANEL_FRAME_OUTPUT="public/frames/panel-frame-light.png" python3 scripts/generate-panel-frame.py
```

- [ ] **Step 4: Verify pixel dimensions match the previous assets**

```bash
python3 -c "
from PIL import Image
print(Image.open('public/frames/panel-frame.png').size)
print(Image.open('public/frames/panel-frame-light.png').size)
"
```
Expected: both `(24, 24)` (unchanged from before this plan's work).

- [ ] **Step 5: Full verification screenshot sweep**

Using whichever browser tool is connected: screenshot the home page (dark, full page + one corner zoom), `/pokemon/list` in dark mode (full page + corner zoom), and `/pokemon/list` in light mode (full page + corner zoom). Confirm in each: a visible multi-step staircase at the corner (not a single shallow nick), a visible highlight/shadow split across the rim (not a flat single tone), and the border reading as tonally related to its surroundings rather than a disconnected saturated sticker (matching the diagnosis that started this plan).

- [ ] **Step 6: Run the project build**

```bash
npm run build
```
Expected: succeeds — this change is asset-only, so a build failure would indicate something unrelated broke, worth flagging rather than assuming is pre-existing.

- [ ] **Step 7: Commit**

```bash
git add public/frames/panel-frame.png public/frames/panel-frame-light.png
git commit -m "feat: finalize Pokedex frame bevel and harmonized border color"
```

---

## Self-Review Notes

- **Spec coverage:** Spec's Section 1 (corner staircase) → Task 1. Section 2 (bevel) → Task 1. Section 3 (color candidates, both dark and light) → Task 2 generates candidates, Task 3 finalizes the pick. Section 4 (staircase strength, one settled value unless feedback says otherwise) → Task 1 sets `STEP_COUNT=4` directly per the spec's reasoning; no separate task needed since the spec explicitly says only revisit this "if feedback also flags the staircase" — not a guaranteed task, so it's not force-fit into the plan as one. Testing/Verification items 1-2 → Task 1 Steps 3-4 (pixel/structure checks) and Task 2 (screenshots). Item 3 → Task 3 (final commit only after a candidate is picked, matching "regenerate the final... once a candidate is chosen"). Item 4 (budget a feedback round) → handled at the controller level between Task 2 and Task 3, not a plan task (a live human decision point, not a scripted step). Out-of-scope items (no CSS changes, no other token changes, no Phase 2 page migration, no re-opening approved home page decisions) are all honored — no task touches any of them.
- **Placeholder scan:** Task 3's exact hex values are deliberately deferred to a decision file rather than hardcoded, since the spec's own design requires a live human pick between Task 2's candidates (or a refinement of one) — this is a documented cross-task interface (the decision file), not a vague "TBD add color later." Every other step has concrete, runnable code or commands.
- **Type consistency:** `PANEL_FRAME_COLOR`/`PANEL_FRAME_HIGHLIGHT_TARGET`/`PANEL_FRAME_SHADOW_TARGET`/`PANEL_FRAME_OUTPUT` env var names are used identically across Tasks 1, 2, and 3. The six candidate hex values in Task 2's tables match the spec's candidate table (Task 2's dark-A/B/C equal the spec's Candidate A/B/C; light-A/B/C are newly computed here using the same 35%/50%/65% blend ratios against `--color-surface-2`, consistent with the spec's stated approach for the light asset).
