# Design System — Pixel Pokédex Home Screen

Scope: the home page only (`src/app/page.tsx` + `src/app/_components/pokedex-home.module.css`). Other pages keep the site's normal light/dark Nord theme and top nav — this is a deliberately different, self-contained "screen" that opts out of the global chrome.

Reference: a ChatGPT-generated Pokédex mockup image the project owner supplied directly (not committed to the repo). Values below are the tokens/techniques actually implemented and verified in a browser — not the reference re-described from memory.

## Why this page looks different from the rest of the site

`page.tsx` renders `<div id="home-shell-root">` and `globals.css` has:

```css
body:has(#home-shell-root) header,
body:has(#home-shell-root) footer,
body:has(#home-shell-root) .chat-widget-root {
  display: none !important;
}
body:has(#home-shell-root) .container {
  max-width: none;
  padding-left: 0;
  padding-right: 0;
}
body:has(#home-shell-root) .content-wrapper {
  padding-top: 0;
  min-height: 0;
}
```

This is the same escape-hatch pattern `portfolio-shell-root` already used for the portfolio page — reuse it, don't invent a new one, if another page ever needs to opt out of the global header/footer/chat widget.

## The one hard rule: no `border-radius`, no `clip-path` corners

Every early attempt at "pixel" corners using `border-radius` or a CSS `clip-path` staircase polygon failed once actually viewed in a browser — `clip-path` and `border-radius` both draw **vector geometry**, which the browser always anti-aliases. No amount of tuning step-count or corner size fixes that; it will always read as a clean, modern, "SaaS" shape rather than pixel art, no matter the color or spacing choices around it.

**The fix that actually worked**: a real pixel-art PNG used as a `border-image`, combined with `image-rendering: pixelated`. A bitmap scaled with nearest-neighbor stays genuinely blocky.

## The frame asset

`public/frames/panel-frame.png` — a hand-authored 24×24 RGBA PNG (generated once via a small Pillow script, not upscaled/interpolated from anything). It's a picture-frame outline: a 3px-thick solid rim in `#4C7FC0`, with a small staircase notch cut out of all four corners. Transparent everywhere else.

Applied via:

```css
border-style: solid;
border-width: <see table below>;
border-image-source: url("/frames/panel-frame.png");
border-image-slice: 6;
border-image-repeat: stretch;
image-rendering: pixelated;
```

One asset, reused at different `border-image-width` values for visual hierarchy — do not generate a second image for a different size; just change the width.

| Use | Class | `border-width` |
|---|---|---|
| Outer screen frame (the one big HUD border around sidebar+main) | `.screen` | 14px |
| Standard panel (trainer card, menu container, dialogue bar, sidebar partner box) | `.simpleFrame` | 8px |
| Small square (avatar, icon buttons, sprite frame) | `.simpleFrameSmall` | 5px |
| Sidebar nav item, hover/focus only | `.navItem:hover/:focus-visible` | 5px |

To regenerate or resize the notch: `python3 scripts/generate-panel-frame.py` (requires `pip install pillow`; not part of the build, run manually and commit the resulting PNG). The parameters that matter are `CANVAS=24`, `THICKNESS=3`, `CORNER=6` (must match `border-image-slice` at every call site), and the staircase `STEP=1`/`STEP_COUNT=2` — keep the notch small. An earlier version used a bigger cut (`STEP=2`/`STEP_COUNT=3`) and it removed so much of each corner that the frame looked broken into four disconnected segments instead of a continuous outline with a small nick.

**Toggling a border-image on/off** (used for `.navItem`, which has no visible border at rest and shows the frame only on hover): set `border-image-source: none` plus an explicit `border-color: transparent` in the resting state. Forgetting the explicit transparent `border-color` leaves the browser's default (`currentColor`), which silently draws a visible border in whatever the text color is — this was a real bug caught only by screenshotting the actual page, not by reading the CSS.

## Color tokens

Defined as CSS custom properties on `.shell` (the page root), not in `globals.css` / `tailwind.config.ts` — these are intentionally scoped to this one page, not part of the site-wide Nord theme.

```css
--screen-bg:     #10161f;  /* void behind the frame, near-black navy */
--window-bg:     #182432;  /* .screen's own fill */
--window-bg-2:   #1e2e3d;  /* panel fill, header strips */
--window-active: #2a4560;  /* hover/selected fill */
--border-dark:   #0b1119;  /* pressed state, menu-grid gutter lines */
--border:        #4c7fc0;  /* the one border/accent color, baked into the PNG too */
--border-light:  #7fa6d9;  /* focus outline only */
--text:          #e6ebf0;
--text-muted:    #7e93a8;
--accent-warm:   #e0a458;  /* the ONE warm color — reserved for the nav "▶" cursor, hover arrows, and the dialogue "▼" cursor. Never use it for anything else. */
```

This is dark-only by design (no light variant), matching the reference. If a light mode is ever needed for this page specifically, it needs a second full token set — don't try to derive one from the existing Nord light theme, the palettes are unrelated.

## Typography

- `NeoDunggeunmo` (a bitmap-style Korean pixel font) is loaded via `<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/neodgm/neodgm-webfont@1.601/neodgm/style.css">` directly in `page.tsx` — Next.js App Router hoists `<link>` tags rendered anywhere in the component tree into `<head>` automatically, so this doesn't need to live in the root layout.
- **Only use `NeoDunggeunmo` at 16px or 32px** (its native pixel grid). It was used at 12-20px in earlier iterations and looked blurry — bitmap fonts only render crisply at their native size or clean multiples of it. Currently only two elements use it: `.logo` (16px) and `.identityName` (32px). Everything else — including small labels like `.panelHeader` — deliberately stays in the body monospace instead; the avatar box shows the Pikachu sprite image, not text, so it has no font size at all.
- Body/data text: `"IBM Plex Mono", "Pretendard", monospace` (set on `.shell`).

## Texture

A very subtle scanline texture on the outer `.shell` background only (not on individual panels, which have their own solid `--window-bg-2` fill that would hide it anyway):

```css
background:
  repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 1px, transparent 1px, transparent 3px),
  var(--screen-bg);
```

## Spacing

Tight, game-menu density, not marketing-page whitespace: `.main` gap 10px, panel body padding 14px, menu tile padding ~12-16px, sidebar nav row gap 2px (rows are still ≥36px tall for tap targets — density comes from padding, not cramped rows).

## Layout

`.screen` is a CSS grid, `176px` sidebar + `1fr` main (`140px` under 900px, single column under 640px). The sidebar's Pikachu "PARTNER" sprite sits at the bottom via `margin-top: auto` inside a flex column, filling what was originally dead space at the bottom of the sidebar.

## Known limitations / things not to re-litigate

- **Content is intentionally thin** (identity blurb + 4 nav links) — the reference image is a data-rich Pokémon detail screen (stats, moves, badges), and this home page is a landing page, not a data screen. Don't try to fix the "sparse compared to reference" feeling by adding more decorative chrome; it needs actual content (see below) or a smaller layout ambition, not more borders.
- **No "recent post" panel.** `/studys/list` currently renders demo Lorem Ipsum content from the Next.js blog-starter template (`_posts/*.md`), not real posts — see `docs/known-issues.md`. Do not wire a homepage panel to that data source until it's replaced with real content; it would reintroduce the exact fake-content problem this redesign was trying to remove.
- **Real screenshots, not guesses.** Every CSS "fix" made by reasoning about the reference image from memory, without checking a live render, went in the wrong direction at least once (chamfer-everywhere → too uniform, then removed entirely → not pixel enough, then double-border → looked like a rendering bug). Once Chrome DevTools MCP / browser-use was connected and screenshots were taken, fixes converged in one or two tries. If browser tooling is available, use it before making another visual judgment call on this page.
