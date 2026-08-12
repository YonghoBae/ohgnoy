# Spec: Unify the Pixel Design System (Phase 1 — Shared Tokens & Primitives)

## Background

This repo currently has **two incompatible "pixel" design languages**:

1. **`src/app/_components/ui/pixel/`** (`PixelCard`, `PixelButton`, `PixelIconBox`, `PixelSprite`, and `TypeBadge`) — built earlier via a subagent-driven-development pass, used across the pokemon section (`/pokemon/list`, `/pokemon/[id]`, `/pokemon/builder`, `/pokemon/meta`). Uses the site's existing Nord CSS variables (`--color-primary`, `text-base`, etc.), Tailwind utility classes, `border-2 border-text-base` + `shadow-pixel` (a CSS box-shadow, not a border-image), and Press Start 2P for pixel text.
2. **`src/app/_components/pokedex-home.module.css`** — built after that, for the home page only (`src/app/page.tsx`). Uses its own separate CSS custom properties (`--border`, `--window-bg`, `--accent-warm`, etc.), a genuine pixel-art `border-image` PNG (`public/frames/panel-frame.png`) with `image-rendering: pixelated` for stepped corners, and NeoDunggeunmo for pixel text.

The home page's look is the one the project owner approved ("이대로 가자" — go with this). This spec covers **unifying the pokemon section onto the home page's design language**, done in two phases:

- **Phase 1 (this spec):** build the shared tokens and primitives.
- **Phase 2 (separate plan, not detailed here):** roll the new primitives out page by page — list → detail → builder → meta.

## Decisions already made (do not re-litigate)

- Direction: extend the home page style to the whole pokemon section, not the reverse.
- Rollout: staged — primitives first (this spec), then pages, so nothing is left half-migrated for long.
- Theme: the pokemon section **keeps the site's light/dark toggle** (unlike the home page, which is dark-only). This means every pixel-themed color token and border-image asset needs both a light and a dark value/version.

## Why this is harder than copy-pasting the home page CSS: border-image can't be recolored by CSS

`panel-frame.png` (and `pokeball.png`) are real pixel-art bitmaps with the border color baked into the pixels (`#4C7FC0`, chosen for the home page's dark screen). CSS cannot retint a `border-image` per theme — no `currentColor`, no CSS variable inside a raster PNG. The only reliable fix is to **generate a second, light-mode-colored version of each frame asset** and swap the `border-image-source` URL based on the `.dark` class, the same way the site already swaps CSS variable values for light vs. dark.

The asset generator scripts (`scripts/generate-panel-frame.py`, `scripts/generate-pokeball-icon.py`) already take color as a named constant — this is a parameter change and a second `python3 scripts/generate-panel-frame.py` run with a different `BORDER_COLOR` and a different `OUTPUT_PATH`, not a rewrite. Verify each regenerated asset the same way the originals were verified: diff the byte output isn't silently different from what's expected, and screenshot the actual rendered page in both themes before calling it done (see "Known limitations" in `docs/design/pixel-pokedex-home.md` — every purely-reasoned CSS judgment on this project's pixel work has been wrong at least once; only a real screenshot settled it).

## Scope of this spec (Phase 1 only)

### New file: `src/app/_components/ui/pixel/pixel-theme.module.css`

A single source of truth for color tokens, exported as one class other modules can `composes` from or that consuming components apply directly:

```css
.pixelTheme {
  /* light (default) values — pick colors consistent with the site's existing
     light Nord palette (--color-bg #ECEFF4, --color-primary #5E81AC, etc. in
     globals.css), not arbitrary new ones */
  --px-bg: ...;
  --px-panel: ...;
  --px-panel-2: ...;
  --px-active: ...;
  --px-border: ...;      /* must match whatever color panel-frame-light.png is baked with */
  --px-border-dim: ...;
  --px-text: ...;
  --px-text-muted: ...;
  --px-accent-warm: #e0a458; /* keep the single warm accent identical in both themes unless there's a reason not to */
}

:global(.dark) .pixelTheme {
  /* dark values — copy verbatim from pokedex-home.module.css's .shell tokens */
  --px-bg: #10161f;
  --px-panel: #182432;
  --px-panel-2: #1e2e3d;
  --px-active: #2a4560;
  --px-border: #4c7fc0;   /* must match panel-frame.png (the existing dark asset) */
  --px-border-dim: #0b1119;
  --px-text: #e6ebf0;
  --px-text-muted: #7e93a8;
  --px-accent-warm: #e0a458;
}
```

Naming note: prefix these `--px-*` (not `--border`, `--window-bg`, etc. as in the home page) since these tokens will be applied globally-ish across the pokemon section rather than scoped to one page's root — avoid colliding with any other CSS variable name already in scope.

Exact light-mode color values are not decided yet — pick them to read as "the same pixel-game screen, lit differently," matching the site's existing light Nord background (`#ECEFF4`) rather than inventing a new light palette from scratch. This is a judgment call for whoever implements it; screenshot both themes side by side before finalizing.

### New/changed border-image assets

- Keep `public/frames/panel-frame.png` as the dark-mode asset (already correct, do not regenerate with different parameters unless the shape itself is being redesigned).
- Add `public/frames/panel-frame-light.png` — same generator (`scripts/generate-panel-frame.py`), same shape (`CANVAS`, `THICKNESS`, `CORNER`, `STEP`, `THRESH` unchanged), different `BORDER_COLOR` matching whatever `--px-border` resolves to in light mode. Add a second generator invocation path (a `--light` flag, a second constant + second `OUTPUT_PATH`, or a sibling script — implementer's call) so both stay reproducible the way `docs/design/pixel-pokedex-home.md` documents for the dark one.
- Decide whether `pokeball.png` needs a light variant too (it's a colorful icon, not a monochrome UI border — it may not need retinting at all; check where it's actually used in the pokemon section before assuming it does).

### Primitive rewrites

All in `src/app/_components/ui/pixel/`, all keeping their existing prop signatures (call sites elsewhere must not need to change their usage, only what's imported/how the component is styled internally) unless a call site genuinely can't be satisfied — flag that explicitly rather than silently changing a signature.

- **`PixelCard`**: replace `border-2 border-text-base ... shadow-pixel` with `border-style: solid`, a `border-width`, `border-image-source: url(...)` that switches between the light/dark PNG via the `.pixelTheme`/`.dark` mechanism above, `image-rendering: pixelated`, background from `--px-panel`. Match the home page's `.simpleFrame` class as the reference implementation (`pokedex-home.module.css`) — same border-image-slice (6), same stepped-corner technique, just theme-aware.
- **`PixelButton`**: same border-image treatment; keep the existing `active:translate` press effect and `variant` prop (primary/ghost) — primary uses `--px-accent`-equivalent (decide whether buttons use the primary Nord blue or introduce their own token; the home page has no button primitive to copy from, so this needs a fresh call, not a straight port).
- **`PixelIconBox`**: same border-image treatment, sized like the home page's `.iconBox`/`.simpleFrameSmall` (smaller `border-image-width`).
- **`PixelSprite`**: no visual change needed — this component already just renders `<Image>` with `image-rendering: pixelated`; confirm it still fits the new visual system, don't rewrite it without a reason.
- **`TypeBadge`**: keep the square/pixel treatment and the `TYPE_COLORS` map (these are real Pokémon type colors, not part of the two competing systems — don't touch them). Only revisit its border/font tokens if they visibly clash once the surrounding cards are migrated.

### Font

Match the home page's rule exactly (from `docs/design/pixel-pokedex-home.md`): NeoDunggeunmo **only** at 16px or 32px, for headline-tier text (card headers, not body copy or stat numbers). The pokemon pages currently use Press Start 2P for this role — decide whether to keep Press Start 2P (already loaded via `src/lib/fonts.ts`, used across the site) or switch to NeoDunggeunmo (would need the same `<link>` used on the home page, loaded per-page or promoted to the root layout if every pixel-themed page needs it). This is a real decision, not a detail — flag it for the project owner rather than picking silently, since it affects every headline in the pokemon section.

## Explicitly out of scope for this spec

- Actually migrating `/pokemon/list`, `/pokemon/[id]`, `/pokemon/builder`, `/pokemon/meta` to use the rewritten primitives (Phase 2).
- Redesigning `TypeBadge`'s color values.
- Touching anything outside the pokemon section and the shared `ui/pixel/` primitives.
- Adding a light-mode variant to the home page itself (it stays dark-only, per existing spec).

## Risks / things a reviewer should specifically sanity-check

1. Is deriving `pixel-theme.module.css`'s light-mode values purely by inference (no reference image, no prior approval) going to produce the same trial-and-error cycle documented in `docs/design/pixel-pokedex-home.md`? If so, should this spec instead say "ship dark-mode-correct primitives first, screenshot light mode, iterate" rather than presenting light-mode values as a one-shot deliverable?
2. Are there other files under `ui/pixel/` or elsewhere importing `PixelCard`/`PixelButton`/`PixelIconBox`/`PixelSprite`/`TypeBadge` with assumptions (specific className overrides, specific DOM structure) that a border-image rewrite could break? (Known consumers as of this session: `src/app/_components/intro.tsx`, `footer.tsx`, and the pokemon list/detail/builder/meta component trees — verify against current `grep` results, not this list, since it may be stale by the time this is read.)
3. Is `shadow-pixel` (the Tailwind box-shadow token these primitives currently use) referenced anywhere else in the codebase such that removing it from these components has a visible side effect elsewhere?
4. Font decision (Press Start 2P vs NeoDunggeunmo for the pokemon section) is unresolved above — does the reviewer see a reason to default one way rather than surfacing it as an open question?
