# Pixel Theme Unification (Phase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the two incompatible pixel design systems (`ui/pixel/*` Tailwind+shadow primitives vs. `pokedex-home.module.css` border-image technique) with one shared token/primitive layer, in two shippable sub-phases: dark-mode port first, then screenshot-gated light-mode.

**Architecture:** A single new CSS Module, `src/app/_components/ui/pixel/pixel-theme.module.css`, defines `--px-*` custom properties (dark values now, light values in Phase 1b) plus two reusable border-image mixin classes (`.pixelFrame`, `.pixelFrameSmall`) and a background helper (`.pixelPanelBg`). It is mounted once, globally, on `<body>` in `src/app/layout.tsx`. `PixelCard`, `PixelButton`, and `PixelIconBox` are rewritten to compose these classes instead of `border-2 border-text-base shadow-pixel`. `PixelSprite` and `TypeBadge` are left untouched. Full spec: `docs/design/pixel-theme-unification.md`.

**Tech Stack:** Next.js App Router, React 18, TypeScript, Tailwind CSS v3, CSS Modules (`:global()` selector for `.dark` scoping), existing `cn()` helper (`src/lib/utils.ts`), Python + Pillow (`scripts/generate-panel-frame.py`) for the Phase 1b asset.

## Global Constraints

- Keep `PixelCard`, `PixelButton`, `PixelIconBox` prop signatures unchanged. If a call site genuinely can't be satisfied unchanged, stop and flag it — do not silently change a signature.
- `PixelSprite` and `TypeBadge` are not modified in this plan (unless a task explicitly says otherwise). `TypeBadge`'s `TYPE_COLORS`/`TYPE_KO` maps and `size` prop stay exactly as-is.
- `--px-*` is the only new CSS variable prefix. Do not reuse `--border`, `--window-bg`, etc. from `pokedex-home.module.css` — those stay scoped to the home page.
- No `border-radius` or `clip-path` for pixel corners anywhere in this work — border-image is the only technique, per `docs/design/pixel-pokedex-home.md`.
- `.pixelTheme` mounts globally on `<body>` in `src/app/layout.tsx`, not scoped to pokemon routes — `PixelIconBox` is used site-wide (header/footer).
- Dark-mode `--px-*` values must be copied verbatim from `pokedex-home.module.css`'s `.shell` token block — do not invent new values for Phase 1a.
- No page under `/pokemon/*` is migrated to the new primitives in this plan — that's Phase 2, a separate future plan.
- No automated test suite exists for visual/CSS output in this repo. Verification is: `npm run build` (typecheck/build correctness) + manual browser check via `npm run dev` and a real screenshot (Chrome DevTools MCP `take_screenshot`, or the `browser-use` plugin if DevTools MCP isn't connected) for every step that says "Verify visually."

---

### Task 1: Shared pixel-theme CSS module (dark tokens + frame mixins) + global mount

**Files:**
- Create: `src/app/_components/ui/pixel/pixel-theme.module.css`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Produces: CSS Module export with keys `pixelTheme`, `pixelFrame`, `pixelFrameSmall`, `pixelPanelBg` (accessed as `styles.pixelTheme` etc. after `import styles from "./pixel-theme.module.css"`). Tasks 2-4 import this module.
- Produces: global availability of `--px-panel`, `--px-panel-2`, `--px-active`, `--px-border`, `--px-border-dim`, `--px-text`, `--px-text-muted`, `--px-accent-warm` on `<body>` whenever `.dark` is present on an ancestor (i.e. `<html>`).

- [ ] **Step 1: Read the reference implementation**

Open `src/app/_components/pokedex-home.module.css` and confirm the `.shell` token block matches these exact values (they're copied verbatim below — this step is a sanity check, not a transcription task):
```
--border: #4c7fc0
--window-bg: #182432
```
(Exact property names in that file may differ — what matters is confirming the color values `#182432`, `#1e2e3d`, `#2a4560`, `#4c7fc0`, `#0b1119`, `#e6ebf0`, `#7e93a8`, `#e0a458` appear somewhere in that file's dark palette. If any value doesn't match, stop and flag it — do not silently use a different value.)

- [ ] **Step 2: Create `src/app/_components/ui/pixel/pixel-theme.module.css`**

```css
.pixelTheme {
}

:global(.dark) .pixelTheme {
  --px-panel: #182432;
  --px-panel-2: #1e2e3d;
  --px-active: #2a4560;
  --px-border: #4c7fc0;
  --px-border-dim: #0b1119;
  --px-text: #e6ebf0;
  --px-text-muted: #7e93a8;
  --px-accent-warm: #e0a458;
}

.pixelFrame {
  border-style: solid;
  border-width: 8px;
  border-image-source: url("/frames/panel-frame.png");
  border-image-slice: 6;
  border-image-repeat: stretch;
  image-rendering: pixelated;
}

.pixelFrameSmall {
  border-style: solid;
  border-width: 5px;
  border-image-source: url("/frames/panel-frame.png");
  border-image-slice: 6;
  border-image-repeat: stretch;
  image-rendering: pixelated;
}

.pixelPanelBg {
  background: var(--px-panel);
}
```

`.pixelFrame`/`.pixelFrameSmall` deliberately do not set `background` — `PixelButton`'s primary variant needs to set its own solid fill via Tailwind (`bg-primary`) without fighting a CSS Module declaration of the same property. Only components that want the shared panel background (`PixelCard`, `PixelIconBox`, `PixelButton`'s ghost variant) add `.pixelPanelBg` separately.

- [ ] **Step 3: Confirm `public/frames/panel-frame.png` exists**

Run: `ls public/frames/panel-frame.png`
Expected: file exists (already shipped with the home page work). If missing, stop — this task cannot proceed without it.

- [ ] **Step 4: Mount `.pixelTheme` globally in `src/app/layout.tsx`**

Read the current `<body className={cn(...)}>` call in `src/app/layout.tsx` first — it currently combines `inter.className`, `pressStart2P.variable`, `spaceMono.variable`, and a Nord background/text utility string. Add the import:

```tsx
import pixelTheme from "@/app/_components/ui/pixel/pixel-theme.module.css";
```

Add `pixelTheme.pixelTheme` as one more argument inside the existing `cn(...)` call on `<body>`, alongside the existing classes — do not remove or reorder any existing argument.

- [ ] **Step 5: Verify — build**

Run: `npm run build`
Expected: succeeds with no CSS Module or TypeScript errors.

- [ ] **Step 6: Verify — dark-mode variable resolution**

Run `npm run dev`, open the site in a browser, toggle to dark mode via the existing theme switcher, and use DevTools (or `evaluate_script` via the Chrome DevTools MCP tool) to run:
```js
getComputedStyle(document.body).getPropertyValue('--px-border')
```
Expected: returns ` #4c7fc0` (or with surrounding whitespace stripped, `#4c7fc0`). In light mode (toggle back), expected: empty string (Phase 1b hasn't defined light values yet).

- [ ] **Step 7: Commit**

```bash
git add src/app/_components/ui/pixel/pixel-theme.module.css src/app/layout.tsx
git commit -m "feat: add shared pixel-theme CSS module with dark tokens, mount globally"
```

---

### Task 2: Rewrite `PixelCard` to use border-image frame

**Files:**
- Modify: `src/app/_components/ui/pixel/PixelCard.tsx`

**Interfaces:**
- Consumes: `styles.pixelFrame`, `styles.pixelPanelBg` from Task 1's `pixel-theme.module.css`.
- Produces: `PixelCard` keeps its existing signature — `HTMLAttributes<HTMLDivElement>` (`className`, `children`, plus any other div attribute passed through).

- [ ] **Step 1: Rewrite the component**

Replace the full contents of `src/app/_components/ui/pixel/PixelCard.tsx` with:

```tsx
import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import styles from "./pixel-theme.module.css";

export default function PixelCard({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(styles.pixelFrame, styles.pixelPanelBg, className)}
      {...props}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Verify — build**

Run: `npm run build`
Expected: succeeds, no type errors (signature is unchanged so all existing call sites still compile).

- [ ] **Step 3: Verify visually**

Run `npm run dev`, navigate to a page that renders `PixelCard` (grep `PixelCard` usages first: `grep -rl "PixelCard" src/app/pokemon`), toggle dark mode on, and take a screenshot. Expected: the card shows a stepped pixel-art border (not a flat 2px line) and the `#182432`-family panel background. Note any visual issue but do not attempt to fix pokemon-page-level layout issues — only the primitive's own rendering is in scope here.

- [ ] **Step 4: Commit**

```bash
git add src/app/_components/ui/pixel/PixelCard.tsx
git commit -m "feat: rewrite PixelCard to use border-image pixel frame"
```

---

### Task 3: Rewrite `PixelButton` to use border-image frame

**Files:**
- Modify: `src/app/_components/ui/pixel/PixelButton.tsx`

**Interfaces:**
- Consumes: `styles.pixelFrameSmall`, `styles.pixelPanelBg` from Task 1's `pixel-theme.module.css`.
- Produces: `PixelButton` keeps its existing signature — `variant?: "primary" | "ghost"` plus `ButtonHTMLAttributes<HTMLButtonElement>`.

- [ ] **Step 1: Rewrite the component**

Replace the full contents of `src/app/_components/ui/pixel/PixelButton.tsx` with:

```tsx
import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import styles from "./pixel-theme.module.css";

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
}

export default function PixelButton({
  variant = "primary",
  className,
  children,
  ...props
}: PixelButtonProps) {
  return (
    <button
      className={cn(
        styles.pixelFrameSmall,
        "px-4 py-2 text-sm font-semibold transition-transform",
        "active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        variant === "primary"
          ? "bg-primary text-white"
          : cn(styles.pixelPanelBg, "text-text-base hover:text-primary"),
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

Note the `active:shadow-none` and the `shadow-pixel` class it used to cancel are both gone — `shadow-pixel` is no longer applied anywhere in this file, so `active:shadow-none` is dead and can be dropped. Remove it:

```tsx
        "active:translate-x-[2px] active:translate-y-[2px]",
```
(replacing the line above that still says `active:translate-x-[2px] active:translate-y-[2px] active:shadow-none`).

- [ ] **Step 2: Verify — build**

Run: `npm run build`
Expected: succeeds, no type errors.

- [ ] **Step 3: Verify visually**

Run `npm run dev`, find a page rendering `PixelButton` (`grep -rl "PixelButton" src/app/pokemon`), toggle dark mode, screenshot both variants (`primary` and `ghost`) in default and pressed (`:active`, simulate via DevTools) states. Expected: pixel border-image frame visible on both variants; primary keeps its solid Nord-primary fill; press-down translate effect still works.

- [ ] **Step 4: Commit**

```bash
git add src/app/_components/ui/pixel/PixelButton.tsx
git commit -m "feat: rewrite PixelButton to use border-image pixel frame"
```

---

### Task 4: Rewrite `PixelIconBox`, remove orphaned `shadow-pixel` Tailwind config

**Files:**
- Modify: `src/app/_components/ui/pixel/PixelIconBox.tsx`
- Modify: `tailwind.config.ts`

**Interfaces:**
- Consumes: `styles.pixelFrameSmall`, `styles.pixelPanelBg` from Task 1's `pixel-theme.module.css`.
- Produces: `PixelIconBox` keeps its existing signature — `{ children: ReactNode; className?: string }`.

- [ ] **Step 1: Read the current file**

Read `src/app/_components/ui/pixel/PixelIconBox.tsx` to confirm its current shape matches:
```tsx
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function PixelIconBox({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-none border-2 border-text-base bg-surface text-text-muted transition-colors hover:border-primary hover:text-primary",
        className,
      )}
    >
      {children}
    </span>
  );
}
```
If it differs, note the difference and preserve any behavior not covered by Step 2's rewrite (e.g. extra props) rather than silently dropping it.

- [ ] **Step 2: Rewrite the component**

Replace the full contents with:

```tsx
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./pixel-theme.module.css";

export default function PixelIconBox({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        styles.pixelFrameSmall,
        styles.pixelPanelBg,
        "inline-flex h-8 w-8 items-center justify-center text-text-muted transition-colors hover:bg-[var(--px-active)] hover:text-[var(--px-text)]",
        className,
      )}
    >
      {children}
    </span>
  );
}
```

`hover:border-primary` is dropped — with `border-image` active, `border-color` has no visual effect, so it was already becoming a no-op. Hover feedback now comes from swapping to `--px-active` background and `--px-text` foreground, matching how `pokedex-home.module.css`'s icon-box hover state works.

- [ ] **Step 3: Remove orphaned `shadow-pixel` from `tailwind.config.ts`**

Run: `grep -rn "shadow-pixel\|boxShadow" tailwind.config.ts src/app` to confirm `shadow-pixel`/`boxShadow.pixel` has no remaining consumers (Tasks 2-4 already removed the only three usages). If any usage remains outside this plan's touched files, stop and flag it.

Open `tailwind.config.ts`, find the `boxShadow` key containing the `pixel` entry, and delete that `pixel` entry. If `boxShadow` has no other entries after removing `pixel`, delete the whole `boxShadow` key.

- [ ] **Step 4: Verify — build**

Run: `npm run build`
Expected: succeeds, no type errors, no Tailwind config errors.

- [ ] **Step 5: Verify visually**

Run `npm run dev`, visit a non-pokemon page (e.g. `/studys/list`) since `PixelIconBox` is global header/footer chrome, toggle dark mode, and screenshot the header/footer icon buttons in default and hover state. Expected: pixel border-image frame, hover swaps to the darker active-panel color with brighter text — no leftover flat `border-2` line, no missing background.

- [ ] **Step 6: Commit**

```bash
git add src/app/_components/ui/pixel/PixelIconBox.tsx tailwind.config.ts
git commit -m "feat: rewrite PixelIconBox to use border-image pixel frame, drop orphaned shadow-pixel config"
```

---

### Task 5: Phase 1a wrap-up verification (`PixelSprite`, `TypeBadge` untouched, full dark-mode sweep)

**Files:**
- None modified — this task is verification-only. If it finds a real problem, the fix belongs in a follow-up task (see Step 4).

**Interfaces:**
- None produced.

- [ ] **Step 1: Confirm `PixelSprite` and `TypeBadge` are unchanged**

Run: `git diff main -- src/app/_components/ui/pixel/PixelSprite.tsx src/app/_components/TypeBadge.tsx`
Expected: no output (these files are untouched by Tasks 1-4, per Global Constraints).

- [ ] **Step 2: Full-page dark-mode screenshot sweep**

Run `npm run dev`, toggle dark mode, and screenshot each of: `/pokemon/list`, `/pokemon/[id]` for any existing id, `/pokemon/builder`, `/pokemon/meta`, plus one non-pokemon page for the header/footer (`/studys/list`). For each, confirm: `PixelCard`/`PixelButton` instances show the pixel border-image frame with no rendering errors (missing image icon, `alt` text showing instead of the frame, obviously wrong colors), and no console errors related to `pixel-theme.module.css` or `panel-frame.png` (check via `list_console_messages` if using Chrome DevTools MCP).

- [ ] **Step 3: Confirm light mode doesn't visibly break (even though Phase 1b hasn't styled it yet)**

Toggle light mode on the same pages. Expected: since `--px-*` variables are undefined in light mode until Phase 1b, the `border-image-source` will fail to apply useful bordering and elements may show default/no border and no background — this is an **expected, temporary regression** that Phase 1b fixes, not a bug to chase down here. Confirm nothing crashes (no React error boundary, no blank page) — that's the only bar for this step.

- [ ] **Step 4: If Step 2 finds a real rendering problem**

Stop and report it rather than silently patching — it means Task 1-4's dark-token values or frame classes don't match what a live page actually needs, which may require revisiting Task 1's copied values. Do not proceed to Task 6 with a known-broken dark mode.

- [ ] **Step 5: Commit (only if Step 4 required a fix)**

If no fix was needed, skip this step — Phase 1a is done as of Task 4's commit. If a fix was made, commit it separately:

```bash
git add -A
git commit -m "fix: correct pixel-theme dark-mode rendering issue found in verification sweep"
```

---

### Task 6: Phase 1b — light-mode `panel-frame-light.png` asset

**Files:**
- Modify: `scripts/generate-panel-frame.py`
- Create: `public/frames/panel-frame-light.png`

**Interfaces:**
- Produces: `public/frames/panel-frame-light.png`, a same-dimensions sibling of `public/frames/panel-frame.png` with the border color baked in as `#5E81AC` (Nord's existing light-mode primary) instead of `#4C7FC0`.

- [ ] **Step 1: Read the existing script**

Read `scripts/generate-panel-frame.py` in full. Confirm it has a `BORDER_COLOR` constant (or equivalently named single source of the border color) and an output path constant. If the color/output path are hardcoded inline in multiple places instead of one constant each, note every location that needs to change in Step 2 — don't miss one and silently produce a two-tone asset.

- [ ] **Step 2: Parameterize color and output path**

Modify the script so it accepts the border color and output path as either CLI arguments or named constants that can be overridden without duplicating the whole script. Minimal viable approach — add two module-level constants read at the top of the generation logic:

```python
BORDER_COLOR = os.environ.get("PANEL_FRAME_COLOR", "#4C7FC0")
OUTPUT_PATH = os.environ.get("PANEL_FRAME_OUTPUT", "public/frames/panel-frame.png")
```

(Adjust variable names to match whatever the script already calls them — the point is env-var overrides with the current values as defaults, not a rewrite of the generation logic itself.) Everywhere the script currently references a hardcoded color literal or output path literal, replace with these constants.

- [ ] **Step 3: Regenerate the existing dark asset to confirm no regression**

Run: `python3 scripts/generate-panel-frame.py` (no env vars set, using defaults)
Then: `diff public/frames/panel-frame.png <(python3 scripts/generate-panel-frame.py --stdout 2>/dev/null || echo MISMATCH)` — if the script has no stdout mode, instead run it to a temp path and `diff` the two files byte-for-byte:
```bash
PANEL_FRAME_OUTPUT=/tmp/panel-frame-check.png python3 scripts/generate-panel-frame.py
diff public/frames/panel-frame.png /tmp/panel-frame-check.png
```
Expected: no diff output (byte-identical) — confirms the parameterization in Step 2 didn't change default behavior.

- [ ] **Step 4: Generate the light variant**

```bash
PANEL_FRAME_COLOR="#5E81AC" PANEL_FRAME_OUTPUT="public/frames/panel-frame-light.png" python3 scripts/generate-panel-frame.py
```
Expected: `public/frames/panel-frame-light.png` created, same pixel dimensions as `panel-frame.png` (verify with `python3 -c "from PIL import Image; print(Image.open('public/frames/panel-frame.png').size, Image.open('public/frames/panel-frame-light.png').size)"` — both tuples must match).

- [ ] **Step 5: Commit**

```bash
git add scripts/generate-panel-frame.py public/frames/panel-frame-light.png
git commit -m "feat: parameterize panel-frame generator, add light-mode variant"
```

---

### Task 7: Phase 1b — light-mode tokens + theme-aware border-image swap

**Files:**
- Modify: `src/app/_components/ui/pixel/pixel-theme.module.css`

**Interfaces:**
- Consumes: `public/frames/panel-frame-light.png` from Task 6.
- Produces: `--px-*` variables now resolve in both light and dark mode; `.pixelFrame`/`.pixelFrameSmall` now swap `border-image-source` based on `.dark` presence.

- [ ] **Step 1: Read the existing light Nord palette**

Read `src/app/globals.css` and find the light-mode (non-`.dark`) values for `--color-bg`, `--color-surface` (or equivalent), `--color-text-base`, `--color-text-muted`, `--color-primary`. Note the exact hex values — Step 2 must reuse these, not invent new ones (per the spec: "derived from the site's existing light Nord palette rather than an invented palette").

- [ ] **Step 2: Add light-mode tokens to `.pixelTheme`**

In `src/app/_components/ui/pixel/pixel-theme.module.css`, add a default (non-`.dark`) block for `.pixelTheme` using the values read in Step 1. Example shape (replace the right-hand values with whatever Step 1 actually found in `globals.css` — do not guess; if `globals.css`'s light `--color-bg` is `#ECEFF4` as referenced in the spec, use that, but always confirm against the live file):

```css
.pixelTheme {
  --px-panel: #ECEFF4;
  --px-panel-2: #E5E9F0;
  --px-active: #D8DEE9;
  --px-border: #5E81AC;
  --px-border-dim: #C5CDDA;
  --px-text: #2E3440;
  --px-text-muted: #4C566A;
  --px-accent-warm: #D08770;
}
```

Leave the existing `:global(.dark) .pixelTheme { ... }` block exactly as-is below this.

- [ ] **Step 3: Make border-image source theme-aware**

Update `.pixelFrame` and `.pixelFrameSmall` to default to the light asset and override under `.dark`:

```css
.pixelFrame {
  border-style: solid;
  border-width: 8px;
  border-image-source: url("/frames/panel-frame-light.png");
  border-image-slice: 6;
  border-image-repeat: stretch;
  image-rendering: pixelated;
}

:global(.dark) .pixelFrame {
  border-image-source: url("/frames/panel-frame.png");
}

.pixelFrameSmall {
  border-style: solid;
  border-width: 5px;
  border-image-source: url("/frames/panel-frame-light.png");
  border-image-slice: 6;
  border-image-repeat: stretch;
  image-rendering: pixelated;
}

:global(.dark) .pixelFrameSmall {
  border-image-source: url("/frames/panel-frame.png");
}
```

- [ ] **Step 4: Verify — build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 5: Verify visually — this is the iterative, screenshot-gated step; budget for at least one revision**

Run `npm run dev`, screenshot `/pokemon/list` and `/studys/list` (for the header/footer icon boxes) in **both** light and dark mode, side by side. Check specifically:
- Border-image renders with visibly stepped pixel corners in light mode (not smoothed/anti-aliased — if it looks smooth, the PNG or `image-rendering` isn't applying, stop and investigate rather than shipping it).
- Text remains readable against the light panel background (contrast check — `--px-text: #2E3440` on `--px-panel: #ECEFF4` should be high-contrast; if Step 1 pulled different values, sanity-check contrast manually).
- The light and dark versions read as "the same component, different theme," not two unrelated designs.

If any of these fail, adjust the Step 2 token values or Step 6's `BORDER_COLOR` (regenerating the asset via Task 6's Step 4 command) and re-screenshot. Do not consider this task done on the first render — the spec explicitly calls this out as a "budget for at least one revision round" step.

- [ ] **Step 6: Commit**

```bash
git add src/app/_components/ui/pixel/pixel-theme.module.css
git commit -m "feat: add light-mode pixel-theme tokens and theme-aware border-image swap"
```

---

## Self-Review Notes

- **Spec coverage:** Phase 1a items 1-4 (spec section) → Tasks 1-4. Phase 1a item 5 (verify) → Task 5. Phase 1b items 1-4 (spec section) → Tasks 6-7. "Small cleanup folded into Phase 1a" (drop `boxShadow.pixel`) → Task 4 Step 3. `PixelSprite`/`TypeBadge` no-change confirmation → Task 5 Step 1. Out-of-scope items (page migration, `TypeBadge` redesign, home-page light mode, dead `pokemonCard.tsx`) are not referenced by any task — correctly excluded.
- **Placeholder scan:** no TBD/TODO; Task 6 Step 2's parameterization approach is deliberately left flexible ("adjust variable names to match whatever the script already calls them") because the plan author has not read the live script contents — this is a judgment call for the implementer bounded by an explicit constraint (env-var override, default-preserving), not an open-ended placeholder.
- **Type consistency:** `styles.pixelFrame` / `styles.pixelFrameSmall` / `styles.pixelPanelBg` / `styles.pixelTheme` are the same four export names used consistently across Tasks 1-4 and 7.
