# Design System — Pixel Pokédex Home Screen

Scope: the home page's own panel content (`src/app/page.tsx` + `src/app/_components/pokedex-home.module.css`) — TRAINER DATA / MAIN MENU / dialog. The surrounding pixel-art frame, sidebar nav, and boot-screen chrome are no longer home-page-specific: they live in the shared `SiteShell` component (`src/app/_components/SiteShell.tsx` + `src/app/_components/site-shell.module.css`), mounted globally in `layout.tsx` for every route (see `docs/architecture.md`). Other pages keep the site's normal light/dark Nord theme inside their own content area — the home page is the one route that renders dark pixel-art panel content inside that shared shell.

Reference: a ChatGPT-generated Pokédex mockup image the project owner supplied directly (not committed to the repo). Values below are the tokens/techniques actually implemented and verified in a browser — not the reference re-described from memory.

## Why this page looks different from the rest of the site

The dark pixel-art "Pokédex screen" look — the outer frame, the left sidebar, the boot-screen transition — is now the site-wide shell: `SiteShell` (`src/app/_components/SiteShell.tsx` + `site-shell.module.css`) wraps every route's content, mounted once in `layout.tsx`. The home page does not opt out of it and does not carry its own `#home-shell-root`/`body:has(...)` escape hatch — that mechanism no longer exists for this page. `page.tsx` just renders its TRAINER DATA / MAIN MENU / dialog panels as `SiteShell`'s `children`, styled by `pokedex-home.module.css`, which pulls its color tokens from the shared `pixel-theme.module.css` (`--px-*` custom properties) so it stays visually consistent with the shell around it.

Two route groups still use the CSS escape hatch to opt entirely out of `SiteShell`'s sidebar/frame (their own standalone layouts): `/auth/*` (`#auth-shell-root`) and `/portfolio`/`/portfolio-pdf` (`#portfolio-shell-root`). See `docs/architecture.md` for that mechanism — it's unrelated to this page now.

## The one hard rule: no `border-radius`, no `clip-path` corners

Every early attempt at "pixel" corners using `border-radius` or a CSS `clip-path` staircase polygon failed once actually viewed in a browser — `clip-path` and `border-radius` both draw **vector geometry**, which the browser always anti-aliases. No amount of tuning step-count or corner size fixes that; it will always read as a clean, modern, "SaaS" shape rather than pixel art, no matter the color or spacing choices around it.

**The fix that actually worked**: a real pixel-art PNG used as a `border-image`, combined with `image-rendering: pixelated`. A bitmap scaled with nearest-neighbor stays genuinely blocky.

## The frame asset

`public/frames/panel-frame.png` — a hand-authored 24×24 RGBA PNG (generated once via a small Pillow script, not upscaled/interpolated from anything). It's a picture-frame outline: a 3px-thick rim with a highlight/shadow bevel (top/left edges lighter, bottom/right edges darker, both derived from a base color #36587E), with a multi-step staircase notch cut out of all four corners. Transparent everywhere else.

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
| Outer screen frame (the one big HUD border around sidebar+main) | `SiteShell`'s `.shellGrid` (`site-shell.module.css`) | 14px |
| Standard panel (trainer card, menu container, dialogue bar, sidebar partner box) | `.pixelFrame` (`ui/pixel/pixel-theme.module.css`, via `composes:`) | 8px |
| Small square (avatar, icon buttons, sprite frame) | `.pixelFrameSmall` (`ui/pixel/pixel-theme.module.css`, via `composes:`) | 5px |
| Sidebar nav item, hover/focus only | `.navItem:hover/:focus-visible` (`site-shell.module.css`) | 5px |

`pokedex-home.module.css`'s panel/avatar/dialog classes no longer draw their own frame — they `composes: pixelFrame`/`pixelFrameSmall` (plus `pixelPanelBg`) from the shared `pixel-theme.module.css`, the same pattern `site-shell.module.css` uses for the sidebar frame.

To regenerate or resize the notch: `python3 scripts/generate-panel-frame.py` (requires `pip install pillow`; not part of the build, run manually and commit the resulting PNG). The parameters that matter are `CANVAS=24`, `THICKNESS=3`, `CORNER=6` (must match `border-image-slice` at every call site), and the staircase `STEP=1`/`STEP_COUNT=4` — a four-step staircase cuts a deeper notch (approximately 2px/3px/4px) that's more visible at real border widths than earlier shallow versions. An earlier iteration used `STEP_COUNT=2` (barely visible nick at the corner tip), and an even older attempt used `STEP_COUNT=3` with `STEP=2` (cut so deeply it disconnected the frame into four segments). The current four-step cut achieves visibility without overextending.

**Toggling a border-image on/off** (used for `.navItem`, which has no visible border at rest and shows the frame only on hover): set `border-image-source: none` plus an explicit `border-color: transparent` in the resting state. Forgetting the explicit transparent `border-color` leaves the browser's default (`currentColor`), which silently draws a visible border in whatever the text color is — this was a real bug caught only by screenshotting the actual page, not by reading the CSS.

## Color tokens

Defined as CSS custom properties (`--px-*`) on `.pixelTheme` in `src/app/_components/ui/pixel/pixel-theme.module.css`, mounted globally on `<body>` in `layout.tsx` — shared by this page, `SiteShell`, and the rest of the pixel-styled Pokémon UI, not scoped to this page anymore. Each token has both a light and a `:global(.dark) .pixelTheme` dark value, so the shell (and this page's panels) now follow the site's normal light/dark toggle instead of being dark-only:

```css
--px-panel:       /* light #E5E9F0 / dark #182432 — base panel/frame fill */
--px-panel-2:     /* light #D8DEE9 / dark #1e2e3d — panel header strips, menu tile fill */
--px-active:      /* light #D8DEE9 / dark #2a4560 — hover/selected fill */
--px-border:      /* light #5E81AC / dark #4c7fc0 — the one border/accent color (dividers, focus outline) */
--px-border-dim:  /* light #C5CDDA / dark #0b1119 — menu-grid gutter lines, pressed state */
--px-text:        /* light #2E3440 / dark #e6ebf0 */
--px-text-muted:  /* light #4C566A / dark #7e93a8 */
--px-accent-warm: /* light #D08770 / dark #e0a458 — the ONE warm color, reserved for the nav "▶" cursor, hover arrows, and the dialogue "▼" cursor. Never use it for anything else. */
```

If this page's content ever needs a token the shared set doesn't have, add it to `pixel-theme.module.css` (with both light and dark values) rather than reintroducing a page-local, dark-only token set — the whole point of the migration was one shared token source for the shell and this page.

## Typography

- `NeoDunggeunmo` (a bitmap-style Korean pixel font) is loaded via `<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/neodgm/neodgm-webfont@1.601/neodgm/style.css">` directly in `page.tsx` — Next.js App Router hoists `<link>` tags rendered anywhere in the component tree into `<head>` automatically, so this doesn't need to live in the root layout.
- **Only use `NeoDunggeunmo` at 16px or 32px** (its native pixel grid). It was used at 12-20px in earlier iterations and looked blurry — bitmap fonts only render crisply at their native size or clean multiples of it. Currently only two elements use it: `.logo` (16px) and `.identityName` (32px). Everything else — including small labels like `.panelHeader` — deliberately stays in the body monospace instead; the avatar box shows the Pikachu sprite image, not text, so it has no font size at all.
- Body/data text: `"IBM Plex Mono", "Pretendard", monospace` (set on `.shell`).

## Texture

A very subtle scanline texture, now on `SiteShell`'s outer `.pageBg` background (`site-shell.module.css`, dark mode only) rather than anything in this page's own CSS — individual panels have their own solid `--px-panel-2` fill that would hide it anyway.

## Spacing

Tight, game-menu density, not marketing-page whitespace: `SiteShell`'s `.main` gap 10px, panel body padding 14px, menu tile padding ~12-16px, sidebar nav row gap 2px (rows are still ≥36px tall for tap targets — density comes from padding, not cramped rows).

## Layout

`SiteShell`'s `.shellGrid` (`site-shell.module.css`) is a CSS grid, `176px` sidebar + `1fr` main (`140px` under 900px, single column under 640px) — the outer frame/sidebar/main structure lives there now, not in this page's own markup. The sidebar's Pikachu "PARTNER" sprite sits at the bottom via `margin-top: auto` inside a flex column, filling what was originally dead space at the bottom of the sidebar.

## Known limitations / things not to re-litigate

- **Content is intentionally thin** (identity blurb + 4 nav links) — the reference image is a data-rich Pokémon detail screen (stats, moves, badges), and this home page is a landing page, not a data screen. Don't try to fix the "sparse compared to reference" feeling by adding more decorative chrome; it needs actual content (see below) or a smaller layout ambition, not more borders.
- **No "recent post" panel.** `/studys/list` currently renders demo Lorem Ipsum content from the Next.js blog-starter template (`_posts/*.md`), not real posts — see `docs/known-issues.md`. Do not wire a homepage panel to that data source until it's replaced with real content; it would reintroduce the exact fake-content problem this redesign was trying to remove.
- **Real screenshots, not guesses.** Every CSS "fix" made by reasoning about the reference image from memory, without checking a live render, went in the wrong direction at least once (chamfer-everywhere → too uniform, then removed entirely → not pixel enough, then double-border → looked like a rendering bug). Once Chrome DevTools MCP / browser-use was connected and screenshots were taken, fixes converged in one or two tries. If browser tooling is available, use it before making another visual judgment call on this page.
