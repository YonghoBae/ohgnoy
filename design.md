# Design Spec — Nord Pixel Pokédex (visual reference match)

Source of truth: `ChatGPT Image 2026년 8월 11일 오전 10_33_44.png` (Pokédex status-screen mockup). Values below are read off that image by eye, not pixel-sampled — treat as a strong starting point, not exact hex truth.

## Brand & Style

This is a **game window**, not a web dashboard. Every section is a HUD panel with an angular cut-corner frame, sitting on a near-black background. No soft shadows, no generous SaaS whitespace, no rounded "card" language. Reference vocabulary is: **menu / selected / disabled / dialogue / stat window** — not hover/elevated/primary-action.

## Colors

```css
--screen-bg:      #10161f;  /* near-black navy, NOT a lighter Nord dark */
--window-bg:      #182432;  /* panel fill, one step up from screen-bg */
--window-bg-2:    #1e2e3d;  /* header strips, nested inner blocks */
--window-active:  #2a4560;  /* selected menu item fill */

--border-dark:    #0b1119;  /* outer hairline, panel drop edge */
--border:         #4c7fc0;  /* primary panel border — this IS the accent, not a muted gray */
--border-light:   #7fa6d9;  /* inner highlight line, hover border */

--text:           #e6ebf0;
--text-muted:     #7e93a8;

--accent-warm:    #e0a458;  /* the ONE warm color in the whole system — cursor / "you are here" marker only */

--type-fire:      #e0682f;
--type-flying:    #4c8fd6;
--type-dragon:    #6a4fb0;
--type-normal:    #6b7686;
```

Everything is blue-gray except the single warm cursor accent and the (situational, Pokémon-type-only) badge colors. No Nord-pastel "pretty" tones — desaturate anything that reads as decorative.

## Panel Frame (the signature element)

Every panel — sidebar, trainer card, content sections, dialogue bar — shares this frame:

- Background `--window-bg`, border `1.5px solid var(--border)`.
- **Chamfered corners**: top-left and bottom-right corners are cut at 45°, ~10-12px, via `clip-path`:
  ```css
  clip-path: polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px);
  ```
- A second, lighter 1px inner line (`--border-light`) inset ~2px reads as a "double border" — approximate with `box-shadow: inset 0 0 0 1px var(--border-light)` at low opacity, or skip if it muddies the frame.
- No corner radius anywhere else. No blurred shadow — if depth is needed, use a 1-2px hard offset in `--border-dark`, not blur.

## Spacing

Tighter than a marketing page — this is a game menu, not a landing page.

```
--gap-tight:  6px;
--gap-sm:     10px;
--gap-md:     14px;
--gap-lg:     20px;
```

Panel internal padding ~14px (not 20+). Gaps between sibling panels ~10px (not 20). Sidebar nav rows sit close together (~2px gap), each row still ≥36px tall for tap targets — density comes from padding, not from cramming row height.

## Sidebar

- Wordmark top, pixel font, small warm-colored accent on one glyph is optional flavor, not required.
- Each nav row: **icon + label**, not label alone. Icons are simple, one stroke weight, monochrome `--text-muted` at rest.
- Hover/"selected" state: solid `--window-active` fill + `--border` outline (a real filled box, not just a background tint) + a `▶` cursor in `--accent-warm` appearing at the row's left edge. The warm cursor is the single moment of temperature contrast in an otherwise all-cool-blue UI — do not reuse this color anywhere else.
- Bottom of sidebar: a self-contained mini panel (own chamfered frame), not just floating text.

## Content Panels

- Header strip: `--window-bg-2` background, `--border` bottom line, small-caps or plain uppercase label, NOT the pixel display font at small sizes (bitmap fonts blur below their native grid — keep pixel font for the identity/hero name only, per earlier finding).
- Body content in the fallback monospace, tabular numbers where relevant.
- Type-style chips (only where genuinely relevant — this app doesn't have Pokémon types on the homepage) use a filled rounded-rect with the type's own color, white text — this is the one place a small corner radius is acceptable, because it's mimicking an in-game chip, not a web pill.

## Explicitly avoid

- Soft/blurred box-shadow.
- More than one non-warm accent hue doing decorative duty (blue does everything; cyan/purple are reserved for genuine categorical distinctions, not decoration).
- Rounded rectangle panels — the chamfer is the signature shape, plain `border-radius` reads as generic SaaS.
- Light background anywhere on this screen — it's a committed dark screen, not a dark *mode*.
