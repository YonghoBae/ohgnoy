# Spec: Unify the Pixel Design System (Phase 1 — Shared Tokens & Primitives)

Revised after an independent subagent review verified this spec's claims against the actual codebase (`grep`-checked consumer counts, confirmed `shadow-pixel` has no other consumers, caught a scope contradiction on `PixelIconBox`). Changes from the first draft are called out inline as **(revised)**.

## Background

This repo currently has **two incompatible "pixel" design languages**:

1. **`src/app/_components/ui/pixel/`** (`PixelCard`, `PixelButton`, `PixelIconBox`, `PixelSprite`, and `TypeBadge`) — built earlier via a subagent-driven-development pass. `PixelCard`/`PixelButton`/`PixelSprite`/`TypeBadge` are used across the pokemon section (`/pokemon/list`, `/pokemon/[id]`, `/pokemon/builder`, `/pokemon/meta`). **`PixelIconBox` is different: its only two consumers are `src/app/_components/intro.tsx` and `footer.tsx`, both rendered unconditionally in the root layout — i.e. on every page of the site, not the pokemon section.** This system uses the site's existing Nord CSS variables (`--color-primary`, `text-base`, etc.), Tailwind utility classes, `border-2 border-text-base` + `shadow-pixel` (a CSS box-shadow, not a border-image), and Press Start 2P for pixel text.
2. **`src/app/_components/pokedex-home.module.css`** — built after that, for the home page only (`src/app/page.tsx`). Uses its own separate CSS custom properties (`--border`, `--window-bg`, `--accent-warm`, etc.), a genuine pixel-art `border-image` PNG (`public/frames/panel-frame.png`) with `image-rendering: pixelated` for stepped corners, and NeoDunggeunmo for pixel text.

The home page's look is the one the project owner approved ("이대로 가자" — go with this). This spec covers **unifying the pokemon section, plus the two global-chrome icon-button spots, onto the home page's border-image design language**, done in two phases:

- **Phase 1 (this spec):** build the shared tokens and primitives.
- **Phase 2 (separate plan, not detailed here):** roll the new primitives out page by page — list → detail → builder → meta.

## Decisions already made (do not re-litigate)

- Direction: extend the home page style to the whole pokemon section, not the reverse.
- Rollout: staged — primitives first (this spec), then pages, so nothing is left half-migrated for long.
- Theme: the pokemon section **keeps the site's light/dark toggle** (unlike the home page, which is dark-only). Every pixel-themed color token and border-image asset needs both a light and a dark value/version.
- **(revised) `PixelIconBox` is in scope for Phase 1, and its token source mounts globally**, not scoped to pokemon routes only. Rationale: its only consumers are global header/footer chrome. Scoping the new `--px-*` tokens to pokemon routes only would leave `PixelIconBox` reading undefined CSS variables on every other page (blog, portfolio, studys, chat, auth) — a site-wide visual regression, not a contained one. Concretely: apply the `.pixelTheme` class (or just its custom-property declarations, unscoped) at the `<body>` level in `src/app/layout.tsx`, alongside the existing Nord token setup, so both `PixelIconBox` (global) and the pokemon-section primitives (route-scoped by virtue of only being imported there) can read the same `--px-*` variables everywhere. This does **not** mean redesigning any page outside the pokemon section — only the small header/footer icon buttons change appearance, everywhere, as a deliberate consequence of unifying the one shared primitive they use.
- **(revised) Font: Press Start 2P stays the pixel-headline font for the pokemon section** (not NeoDunggeunmo). Reason: Press Start 2P is already self-hosted via `next/font/google` (`src/lib/fonts.ts`) with no runtime network dependency, consistent with how every other font on the site loads. NeoDunggeunmo is currently loaded only on the home page via an external jsDelivr CDN `<link>` with no fallback/`font-display` strategy specified anywhere. Extending that CDN dependency to the whole pokemon section (or the root layout) would introduce a new site-wide external dependency and FOUC/latency risk that doesn't exist today. If the visual mismatch between the two pixel fonts becomes a real complaint once both are side by side, revisit — but default to Press Start 2P.
- **(revised) `pokeball.png` needs no light variant.** Verified by grep: it's referenced only in `src/app/page.tsx` and `src/app/_components/BootScreen.tsx`, both home-page-only. It is never used in `ui/pixel/` or any `/pokemon/*` route. No action needed for it in this spec.

## Why this is harder than copy-pasting the home page CSS: border-image can't be recolored by CSS

`panel-frame.png` is a real pixel-art bitmap with the border color baked into the pixels (`#4C7FC0`, chosen for the home page's dark screen). CSS cannot retint a `border-image` per theme — no `currentColor`, no CSS variable inside a raster PNG. The only reliable fix is to **generate a second, light-mode-colored version of the frame asset** and swap the `border-image-source` URL based on the `.dark` class, the same way the site already swaps CSS variable values for light vs. dark.

`scripts/generate-panel-frame.py` already takes color as a named constant (`BORDER_COLOR`) — producing a light variant is a parameter change and a second run with a different constant and output path, not a rewrite.

## Scope of this spec, split into two sub-phases

### Phase 1a — dark-mode port (mechanical, low-risk, do this first and ship it)

Everything needed to make `PixelCard`, `PixelButton`, `PixelIconBox`, and (unchanged) `PixelSprite`/`TypeBadge` render in the home page's **already-verified dark style**, reusing values and techniques that already shipped and were screenshotted:

1. **New file `src/app/_components/ui/pixel/pixel-theme.module.css`** exporting a `.pixelTheme` class. For Phase 1a, only populate the dark values (copied verbatim from `pokedex-home.module.css`'s `.shell` tokens) under `:global(.dark) .pixelTheme { ... }` — no light values yet, that's Phase 1b:
   ```css
   :global(.dark) .pixelTheme {
     --px-panel: #182432;
     --px-panel-2: #1e2e3d;
     --px-active: #2a4560;
     --px-border: #4c7fc0;   /* must match panel-frame.png */
     --px-border-dim: #0b1119;
     --px-text: #e6ebf0;
     --px-text-muted: #7e93a8;
     --px-accent-warm: #e0a458;
   }
   ```
   `--px-*` prefix (not `--border`, `--window-bg`, etc.) to avoid colliding with any CSS variable already in scope, since this mounts globally rather than scoped to one page's root.
2. **Mount `.pixelTheme` in `src/app/layout.tsx`** on `<body>` (or a wrapping element), unscoped by route, per the decision above.
3. **Rewrite `PixelCard`, `PixelButton`, `PixelIconBox`** to use `border-image-source: url("/frames/panel-frame.png")`, `border-image-slice: 6`, `image-rendering: pixelated`, and the `--px-*` background/text tokens, matching `pokedex-home.module.css`'s `.simpleFrame` (for Card/IconBox) as the reference implementation. Keep existing prop signatures — call sites elsewhere must not need to change how they use these components, only what happens visually. If a call site genuinely can't be satisfied unchanged, flag it explicitly rather than silently changing the signature.
   - `PixelButton` keeps its `variant` prop (primary/ghost) and existing `active:translate` press effect. Decide the primary variant's fill color as part of this task (the home page has no button primitive to copy from) — using the existing Nord `--color-primary` for the primary-button fill is a reasonable default consistent with the rest of the site, unless there's a reason to introduce a `--px-accent` instead.
   - `PixelIconBox` uses a smaller `border-image-width` than `PixelCard`, matching the home page's `.simpleFrameSmall`/`.iconBox`.
   - `PixelSprite`: no change expected — already just `<Image>` with `image-rendering: pixelated`. Confirm it still fits; don't rewrite without a concrete reason.
   - `TypeBadge`: keep the square/pixel treatment and the `TYPE_COLORS` map untouched (real Pokémon type colors, unrelated to which of the two systems is in use). Only touch its border/font tokens if they visibly clash once surrounding cards are migrated.
4. Since Nord's `.dark` class is already the active theme mechanism (`theme-switcher.tsx` toggles it on `document.documentElement`), Phase 1a's dark styling should work correctly as soon as dark mode is toggled — no new theme-detection logic needed.
5. **Verify** by toggling dark mode and screenshotting: a pokemon-section page (e.g. `/pokemon/list`) and, since `PixelIconBox` is now global, the header/footer on at least one page outside the pokemon section (e.g. the home... no — home hides global chrome; use `/pokemon/list` or `/studys/list` for the header/footer check instead).

### Phase 1b — light-mode tokens + asset (iterative, screenshot-gated — do not ship as a one-shot)

The dark-mode work above had a supplied reference image and explicit owner approval to iterate against. Light mode has neither. Per the lesson already documented in `docs/design/pixel-pokedex-home.md` ("every CSS fix made by reasoning... without checking a live render went in the wrong direction at least once"), do not treat light-mode color values as a single deliverable to pick once and ship:

1. Add `panel-frame-light.png` via a second run of `scripts/generate-panel-frame.py` (same shape parameters, different `BORDER_COLOR` and `OUTPUT_PATH` — add a `--light` flag or a second constant, implementer's call) using the existing Nord light primary (`--color-primary`, `#5E81AC`) as a starting point for the border color, since that's already the established light-mode accent elsewhere on the site.
2. Populate the light (default, non-`.dark`) block of `.pixelTheme` with values derived from the site's existing light Nord palette (`--color-bg #ECEFF4`, etc. in `globals.css`) rather than an invented palette.
3. Swap `border-image-source` based on `.dark` presence (light PNG when absent, dark PNG under `:global(.dark)`).
4. **Screenshot both themes side by side before calling this done.** Expect at least one revision round on the light border/background color once actually rendered — budget for it rather than treating the first attempt as final.

## Explicitly out of scope for this spec

- Actually migrating `/pokemon/list`, `/pokemon/[id]`, `/pokemon/builder`, `/pokemon/meta` to use the rewritten primitives (Phase 2).
- Redesigning `TypeBadge`'s color values.
- Any visual change to page content outside the pokemon section — the only site-wide effect in scope is `PixelIconBox`'s appearance in the shared header/footer.
- Adding a light-mode variant to the home page itself (it stays dark-only, per `docs/design/pixel-pokedex-home.md`).
- The dead `src/app/_components/pokemonCard.tsx` file (lowercase, unused, imports `TypeBadge`) — already noted in `docs/known-issues.md`, not touched by this spec.

## Small cleanup folded into Phase 1a, not a separate task

Once `PixelCard`/`PixelButton` no longer reference `shadow-pixel`, remove the now-orphaned `boxShadow.pixel` entry from `tailwind.config.ts` in the same commit (confirmed via grep to have no other consumers) — don't leave dead config behind.
