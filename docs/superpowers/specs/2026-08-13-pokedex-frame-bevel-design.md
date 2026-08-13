# Spec: Give the Pokédex Screen's Pixel Frame a Bevel and Harmonized Color

## Background

The home page's "Nord Pixel Pokédex" screen (`docs/design/pixel-pokedex-home.md`) uses a single pixel-art PNG (`public/frames/panel-frame.png`) as a `border-image` for its outer screen frame (`.screen`, 14px border) and inner panels (`.simpleFrame`/`.simpleFrameSmall`, 8px/5px borders). The same asset was intentionally reused for the pokemon section's dark-mode pixel primitives (`pixel-theme.module.css`'s `.pixelFrame`/`.pixelFrameSmall` under `:global(.dark)`), landed in the just-completed pixel-theme-unification work.

Looking at the live page again, three concrete problems were identified and confirmed by the project owner:

1. **No bevel/depth.** The frame is a completely flat single color (`#4C7FC0`, confirmed by inspecting `panel-frame.png` pixel-by-pixel — exactly two colors, transparent and `#4C7FC0`, no shading at all). It reads as a plain CSS border rather than a console/HUD bezel.
2. **Corner steps too subtle.** `scripts/generate-panel-frame.py` currently cuts a notch of only `STEP_COUNT=2` steps at `STEP=1` px each inside a 6px corner region — at the actual rendered border widths (14px/8px/5px), this shows as one shallow diagonal nick, not a readable staircase.
3. **Color feels disconnected from the rest of the screen.** Every other color on the page (`--screen-bg #10161f`, `--window-bg #182432`, `--window-bg-2 #1e2e3d`) is a near-black, low-saturation navy. The border's `#4C7FC0` is dramatically more saturated and bright than everything around it, with no derived/tonal relationship to the interior colors — it reads as a separate sticker laid over the screen rather than a bezel made of the same "material."

## Decision: scope

This is a shared-asset fix, not a home-page-only one. `panel-frame.png` is regenerated once and the improvement applies to both its consumers: the home page's `.screen`/`.simpleFrame`/`.simpleFrameSmall` (`pokedex-home.module.css`) and the pokemon section's dark-mode `.pixelFrame`/`.pixelFrameSmall` (`pixel-theme.module.css`). No CSS changes are needed at either consumer — both already reference the PNG via `border-image-source`/`border-image-slice`, so only the PNG's pixel content changes.

`panel-frame-light.png` (the pokemon section's light-mode asset, added in the pixel-theme-unification work) is regenerated with the same bevel/notch treatment, using its existing light border color (`#5E81AC`) as the base to derive highlight/shadow from — keeping light and dark mode visually consistent in *treatment*, even though their base hues differ.

## Design

### 1. Corner staircase

`scripts/generate-panel-frame.py`'s `notch_cut()` currently removes corner pixels where `(cx // STEP) + (cy // STEP) < STEP_COUNT`, with `STEP=1` and `STEP_COUNT=2` inside a `CORNER=6` region. Raise `STEP_COUNT` to `4` (keeping `STEP=1`, `CORNER=6` unchanged) — this cuts a proper multi-step staircase instead of a single shallow corner nick, while staying safely inside the existing 6px corner region (the script's own comment warns a prior `STEP=2, STEP_COUNT=3` combination cut so much that the frame looked like 4 disconnected segments; `STEP=1` step size is much finer-grained, so `STEP_COUNT=4` cuts a real staircase without that failure mode — confirmed by visual check in the Tasks section, not assumed).

### 2. Bevel (highlight/shadow split)

Instead of filling every border-region pixel with one flat `BORDER_COLOR`, the rim is split by position:
- Pixels on the **top edge** (`y < THICKNESS`) or **left edge** (`x < THICKNESS`) get a **highlight** color (lighter tint).
- Otherwise, pixels on the **bottom edge** (`y >= CANVAS - THICKNESS`) or **right edge** (`x >= CANVAS - THICKNESS`) get a **shadow** color (darker tint).
- Precedence is unambiguous and checked in that order: top/left wins first. This means the top-left corner is highlight (both rules agree), the bottom-right corner is shadow (neither top/left rule applies), and the top-right and bottom-left corners — where one light rule and one dark rule could both apply — resolve to highlight, since top/left is checked first. This is a simple, deterministic tie-break, not a per-pixel judgment call.

This requires each of `THICKNESS`, `CORNER`, and the notch logic to stay as-is; only the single flat `BORDER_COLOR` fill in `main()`'s inner loop becomes a highlight/shadow choice based on which edge(s) a pixel belongs to.

### 3. Harmonized base color

The new base tone is derived by blending the current border color with the interior panel color, not invented from scratch:

- **Dark asset** (`panel-frame.png`, feeds both the home page and pokemon dark mode): blend old border `#4C7FC0` with `--window-bg-2` `#1e2e3d` at 50% → **base `#36587E`**. Highlight: blend that base with the existing `--border-light` `#7fa6d9` at 50% → **`#5D7FAE`**. Shadow: blend that base with `--border-dark` `#0b1119` at 50% → **`#20344B`**.
- **Light asset** (`panel-frame-light.png`, pokemon section light mode only): the same blend ratios applied around light mode's existing border color `#5E81AC` and its neighboring light Nord tokens (`--color-surface-2` `#D8DEE9` for the "interior" blend partner, and `--color-text-muted`/white-ish tones for highlight, a darker desaturated blue for shadow) — exact values worked out during implementation and screenshot-verified, since (per the project's established practice) light-mode color decisions are not treated as get-it-right-in-one-shot.

All three (base/highlight/shadow) replace the single `BORDER_COLOR` constant; `PANEL_FRAME_COLOR` env var becomes the base color input that highlight/shadow are derived from, preserving Task 6's existing override mechanism rather than replacing it.

## Testing / Verification

No automated visual test suite exists for this (consistent with the rest of this project's pixel-art work). Verification is:
1. Regenerate both PNGs, inspect pixel data directly (PIL) to confirm exactly 3 non-transparent colors each (base/highlight/shadow — or however many the implementation actually produces) and confirm the corner notch is no longer a single shallow cut (multiple distinct step depths present in the alpha channel).
2. Real browser screenshots (Chrome DevTools MCP if available, `browser-use` otherwise, per this session's established fallback) of the home page and a pokemon-section page in dark mode, zoomed into a corner (as was done during this diagnosis), confirming: (a) a visible multi-step staircase, not a single diagonal nick; (b) a visible highlight/shadow split, not a flat single-tone band; (c) the border no longer reads as a saturated "sticker" against the near-black interior.
3. Budget at least one revision round on the exact color values — this project's own documented history (`docs/design/pixel-pokedex-home.md`) is that color/visual judgment calls on this page were never right on the first unexamined attempt.

## Explicitly out of scope

- Any change to `--window-bg`, `--window-bg-2`, `--window-active`, `--accent-warm`, or any other token besides the border/highlight/shadow trio.
- Any change to `pokedex-home.module.css` or `pixel-theme.module.css` beyond what's automatically inherited from the new PNG (no new CSS classes, no new border-image-slice values).
- Applying this bevel treatment to any pokemon-section page's actual layout (that's the separate, not-yet-started Phase 2 migration work).
- Re-opening any other part of the home page's design that was already approved ("이대로 가자").
