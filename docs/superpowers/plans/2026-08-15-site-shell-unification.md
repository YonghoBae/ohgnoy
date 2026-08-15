# Site-Wide Sidebar Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the site's top horizontal header + footer with the home page's left sidebar as the persistent, dual-themed shell for every page except the auth pages and portfolio pages (which keep their own existing standalone layouts).

**Architecture:** A new `SiteShell` component (sidebar nav + main content slot, styled by a new `site-shell.module.css` extracted and generalized from the home page's CSS) is rendered once from the root layout, wrapping every page. Auth and portfolio pages stay technically wrapped by the same component tree (so global mounts like the theme-switcher's FOUC script keep working everywhere) but visually hide the sidebar via the same `body:has(#some-id) ...` CSS technique already used twice in this codebase for exactly this purpose — no Next.js route groups, no file-tree reorganization.

**Tech Stack:** Next.js App Router, React, CSS Modules (`composes` for cross-file class reuse), the existing `--px-*` dual-theme tokens and `panel-frame.png`/`panel-frame-light.png` border-image assets from the pixel-theme-unification and frame-bevel work.

## Global Constraints

- Excluded from the new shell (keep exactly as they are today): `/auth/login`, `/auth/forgot`, `/auth/regist`, `/portfolio`, `/portfolio-pdf`.
- The shell must work in both light and dark mode (unlike the home page's previous dark-only design).
- No page's internal content (pokemon tool pages, `/studys/list`, `/chat/user`, `/chat/bot`, `/posts/*`, the home page's own "TRAINER DATA"/"MAIN MENU" panels) is restyled in this plan — only the chrome around it changes. Pages may look narrower/cramped inside the new shell until their own follow-on reskin lands; that's expected.
- Reuse existing assets/tokens as-is: `--px-*` CSS variables and `.pixelFrame`/`.pixelFrameSmall`/`.pixelPanelBg` classes from `src/app/_components/ui/pixel/pixel-theme.module.css`; `panel-frame.png`/`panel-frame-light.png` border-image assets. Do not invent new colors or regenerate assets.
- The sidebar logo/nav use Press Start 2P (`var(--font-pixel)`, already self-hosted via `next/font/google` in `src/lib/fonts.ts`) — not NeoDunggeunmo, to avoid a site-wide dependency on the external NeoDunggeunmo CDN link (per `docs/design/pixel-theme-unification.md`'s existing rationale). The home page's own remaining content (panel headers, identity name, menu tile titles) keeps using NeoDunggeunmo unchanged — that's existing page content, out of scope here.
- No automated visual test suite exists for this repo's layout work — verification is `npm run build` plus real browser screenshots in both themes, per this project's established practice.

---

### Task 1: Extract and generalize `site-shell.module.css`

**Files:**
- Create: `src/app/_components/site-shell.module.css`

**Interfaces:**
- Consumes: `composes: pixelFrame pixelPanelBg from "./ui/pixel/pixel-theme.module.css";` (Task classes already exist from prior work — no changes needed to that file).
- Produces: CSS Module export with keys `pageBg`, `shellGrid`, `sidebar`, `logoRow`, `logoIcon`, `logo`, `nav`, `navItem`, `navItemActive`, `navCursor`, `subNav`, `subNavItem`, `subNavItemActive`, `iconRow`, `sidebarSprite`, `spriteFrame`, `spriteCaption`, `main`, `bootOverlay`, `bootOverlayFading`, `bootContent`, `bootLogoRow`, `bootLogo`, `bootBar`, `bootBarFill`, `encounterOverlay`, `encounterText`. Tasks 2 and 3 import this module.

- [ ] **Step 1: Create the file**

```css
.pageBg {
  min-height: 100dvh;
  padding: 10px;
  background: var(--px-panel-2);
  cursor: url("/frames/cursor-pikachu-arrow.png") 1 1, default;
}

:global(.dark) .pageBg {
  background:
    repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.16) 0px,
      rgba(0, 0, 0, 0.16) 1px,
      transparent 1px,
      transparent 3px
    ),
    var(--px-panel-2);
}

.shellGrid {
  composes: pixelFrame pixelPanelBg from "./ui/pixel/pixel-theme.module.css";
  display: grid;
  grid-template-columns: 176px 1fr;
  min-height: calc(100dvh - 20px);
  color: var(--px-text);
  font-family: "IBM Plex Mono", "Pretendard", monospace;
}

@media (max-width: 900px) {
  .shellGrid {
    grid-template-columns: 140px 1fr;
  }
}

@media (max-width: 640px) {
  .shellGrid {
    grid-template-columns: 1fr;
  }
}

.sidebar {
  border-right: 2px solid var(--px-border);
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow-y: auto;
}

@media (max-width: 640px) {
  .sidebar {
    border-right: none;
    border-bottom: 2px solid var(--px-border);
  }
}

.logoRow {
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
}

.logoIcon {
  image-rendering: pixelated;
  flex-shrink: 0;
}

.logo {
  font-family: var(--font-pixel), monospace;
  font-size: 12px;
  color: var(--px-text);
  letter-spacing: 0.02em;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.navItem {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 8px 10px 8px 16px;
  color: var(--px-text-muted);
  text-decoration: none;
  border-style: solid;
  border-width: 5px;
  border-color: transparent;
  border-image-source: none;
  cursor: url("/frames/cursor-pikachu-click.png") 1 1, pointer;
  font-size: 14px;
  transition: background-color 80ms linear, color 80ms linear;
  image-rendering: pixelated;
}

.navItem:hover,
.navItem:focus-visible,
.navItemActive {
  background: var(--px-active);
  color: var(--px-text);
  border-image-slice: 6;
  border-image-repeat: stretch;
  border-image-source: url("/frames/panel-frame-light.png");
}

:global(.dark) .navItem:hover,
:global(.dark) .navItem:focus-visible,
:global(.dark) .navItemActive {
  border-image-source: url("/frames/panel-frame.png");
}

.navItem:focus-visible {
  outline: 2px solid var(--px-border);
  outline-offset: 1px;
}

.navItem:active {
  background: var(--px-panel);
  transform: translateY(1px);
}

.navItem svg {
  flex-shrink: 0;
}

@keyframes pixelBlink {
  0%,
  49% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0;
  }
}

.navCursor {
  position: absolute;
  left: 4px;
  color: var(--px-accent-warm);
  opacity: 0;
}

.navItem:hover .navCursor,
.navItem:focus-visible .navCursor,
.navItemActive .navCursor {
  animation: pixelBlink 900ms steps(1) infinite;
}

.subNav {
  display: flex;
  flex-direction: column;
  padding: 2px 0 4px 32px;
  gap: 2px;
}

.subNavItem {
  padding: 4px 8px;
  font-size: 12px;
  color: var(--px-text-muted);
  text-decoration: none;
  cursor: url("/frames/cursor-pikachu-click.png") 1 1, pointer;
}

.subNavItem:hover,
.subNavItem:focus-visible,
.subNavItemActive {
  color: var(--px-text);
}

.iconRow {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.sidebarSprite {
  composes: pixelFrame pixelPanelBg from "./ui/pixel/pixel-theme.module.css";
  margin-top: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px;
}

.spriteFrame {
  composes: pixelFrameSmall pixelPanelBg from "./ui/pixel/pixel-theme.module.css";
  position: relative;
  width: 88px;
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spriteFrame img {
  image-rendering: pixelated;
}

.spriteCaption {
  font-size: 11px;
  color: var(--px-text-muted);
  letter-spacing: 0.04em;
}

.main {
  padding: 16px 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 1100px;
}

/* Boot screen (moved here from pokedex-home.module.css: now site-wide, not home-only) */

.bootOverlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--px-panel-2);
  opacity: 1;
  transition: opacity 300ms linear;
}

.bootOverlayFading {
  opacity: 0;
}

.bootContent {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.bootLogoRow {
  display: flex;
  align-items: center;
  gap: 2px;
}

.bootLogo {
  font-family: var(--font-pixel), monospace;
  font-size: 24px;
  color: var(--px-text);
  letter-spacing: -0.01em;
}

.bootBar {
  width: 200px;
  height: 12px;
  border: 2px solid var(--px-border);
  background: var(--px-panel);
  overflow: hidden;
}

.bootBarFill {
  height: 100%;
  width: 0%;
  background: var(--px-border);
  animation: bootFill 500ms steps(10) forwards;
}

@keyframes bootFill {
  to {
    width: 100%;
  }
}

/* Encounter transition overlay (moved here: now site-wide, not home-only) */

.encounterOverlay {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--px-panel-2);
}

.encounterText {
  font-family: var(--font-pixel), monospace;
  font-size: 14px;
  color: var(--px-text);
  display: flex;
  align-items: center;
  gap: 8px;
}
```

- [ ] **Step 2: Verify it builds**

Run: `npm run build`
Expected: succeeds (this file isn't imported by anything yet, so this only checks for CSS syntax errors — Next.js still processes unimported CSS Modules for type-checking purposes in some setups, but the main check here is just that the file itself is syntactically valid; a stray typo would otherwise surface once Task 2 imports it).

- [ ] **Step 3: Commit**

```bash
git add src/app/_components/site-shell.module.css
git commit -m "feat: extract site-shell.module.css from the home page's sidebar/boot/transition styles"
```

---

### Task 2: Build the `SiteShell` component

**Files:**
- Create: `src/app/_components/SiteShell.tsx`

**Interfaces:**
- Consumes: `site-shell.module.css` (Task 1), `PixelIconBox` (`src/app/_components/ui/pixel/PixelIconBox.tsx`, unchanged), `ThemeSwitcher` (`src/app/_components/theme-switcher.tsx`, unchanged — renders both the FOUC-avoidance script and the toggle button together), `EncounterLink`/`BootScreen` (Task 3 updates their CSS import but not their public signatures — `EncounterLink` still takes `{ href, className, children }`, `BootScreen` still takes no props).
- Produces: `export default function SiteShell({ children }: { children: ReactNode })`. Also applies two plain (non-CSS-Module) literal class names — `site-shell-grid` on the shell grid wrapper, `site-shell-sidebar` on the `<aside>`, `site-shell-main` on the `<main>` — used later by Tasks 5 and 6 to target these elements from `globals.css` (a global stylesheet can't reliably select CSS-Module-hashed class names, so stable literal classes are added alongside the module classes for that purpose — the same reason this codebase's existing `body:has(#portfolio-shell-root) .container` rule works: `.container`/`.content-wrapper` are plain literal classes, not CSS-Module ones).

- [ ] **Step 1: Create the component**

```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import {
  FaGithub,
  FaExternalLinkAlt,
  FaGamepad,
  FaBook,
  FaBlog,
  FaBriefcase,
  FaComments,
  FaRegUser,
} from "react-icons/fa";
import type { IconType } from "react-icons";
import { MdEmail } from "react-icons/md";
import { DIGITAL_GARDEN_URL, GITHUB_URL, EMAIL, BLOG_NAME } from "@/lib/constants";
import PixelIconBox from "@/app/_components/ui/pixel/PixelIconBox";
import { ThemeSwitcher } from "@/app/_components/theme-switcher";
import EncounterLink from "@/app/_components/EncounterLink";
import BootScreen from "@/app/_components/BootScreen";
import styles from "./site-shell.module.css";

const SIDEBAR_SPRITE_URL = "/pokemon/pikachu.png";

type NavItem = {
  href: string;
  label: string;
  icon: IconType;
  external?: boolean;
  matchPrefix?: string;
  subLinks?: { href: string; label: string }[];
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/pokemon/list",
    label: "포켓몬 도구",
    icon: FaGamepad,
    matchPrefix: "/pokemon",
    subLinks: [
      { href: "/pokemon/list", label: "List" },
      { href: "/pokemon/meta", label: "Meta" },
      { href: "/pokemon/builder", label: "Builder" },
    ],
  },
  { href: "/studys/list", label: "학습 노트", icon: FaBook, matchPrefix: "/studys" },
  { href: DIGITAL_GARDEN_URL, label: "블로그", icon: FaBlog, external: true },
  { href: "/portfolio", label: "포트폴리오", icon: FaBriefcase, matchPrefix: "/portfolio" },
  { href: "/chat/user", label: "채팅", icon: FaComments, matchPrefix: "/chat" },
];

export default function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className={styles.pageBg}>
      <BootScreen />
      <div className={`${styles.shellGrid} site-shell-grid`}>
        <aside className={`${styles.sidebar} site-shell-sidebar`}>
          <Link href="/" className={styles.logoRow}>
            <Image
              src="/frames/pokeball.png"
              alt=""
              width={18}
              height={18}
              className={styles.logoIcon}
            />
            <span className={styles.logo}>{BLOG_NAME.toUpperCase()}</span>
          </Link>

          <nav className={styles.nav} aria-label="주요 메뉴">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = item.matchPrefix ? pathname.startsWith(item.matchPrefix) : false;
              const inner = (
                <>
                  <span className={styles.navCursor}>▶</span>
                  <Icon size={14} />
                  {item.label}
                </>
              );

              if (item.external) {
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.navItem}
                  >
                    {inner}
                  </a>
                );
              }

              return (
                <div key={item.href}>
                  <EncounterLink
                    href={item.href}
                    className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
                  >
                    {inner}
                  </EncounterLink>
                  {item.subLinks && active && (
                    <div className={styles.subNav}>
                      {item.subLinks.map((sub) => (
                        <EncounterLink
                          key={sub.href}
                          href={sub.href}
                          className={`${styles.subNavItem} ${
                            pathname === sub.href ? styles.subNavItemActive : ""
                          }`}
                        >
                          {sub.label}
                        </EncounterLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className={styles.iconRow}>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <PixelIconBox>
                <FaGithub size={16} />
              </PixelIconBox>
            </a>
            <a
              href={DIGITAL_GARDEN_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="디지털가든"
            >
              <PixelIconBox>
                <FaExternalLinkAlt size={14} />
              </PixelIconBox>
            </a>
            <a href={`mailto:${EMAIL}`} aria-label="이메일">
              <PixelIconBox>
                <MdEmail size={16} />
              </PixelIconBox>
            </a>
            <Link href="/auth/login" aria-label="로그인">
              <PixelIconBox>
                <FaRegUser size={14} />
              </PixelIconBox>
            </Link>
            <ThemeSwitcher />
          </div>

          <div className={styles.sidebarSprite}>
            <div className={styles.spriteFrame}>
              <Image src={SIDEBAR_SPRITE_URL} alt="피카츄" width={72} height={72} />
            </div>
            <span className={styles.spriteCaption}>PARTNER</span>
          </div>
        </aside>

        <main className={`${styles.main} site-shell-main`}>{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it builds**

Run: `npm run build`
Expected: succeeds. `SiteShell` isn't imported anywhere yet (Task 4 wires it in), so this only checks the component compiles standalone.

- [ ] **Step 3: Commit**

```bash
git add src/app/_components/SiteShell.tsx
git commit -m "feat: add SiteShell component (sidebar nav + main slot)"
```

---

### Task 3: Move BootScreen/EncounterLink to the new shared stylesheet

**Files:**
- Modify: `src/app/_components/BootScreen.tsx`
- Modify: `src/app/_components/EncounterLink.tsx`

**Interfaces:**
- Consumes: `site-shell.module.css` (Task 1) — specifically `bootOverlay`, `bootOverlayFading`, `bootContent`, `bootLogoRow`, `bootLogo`, `bootBar`, `bootBarFill`, `encounterOverlay`, `encounterText`.
- Produces: no change to either component's public props or behavior (`BootScreen` still takes no props; `EncounterLink` still takes `{ href, className, children }`) — this task only changes which stylesheet they import from.

- [ ] **Step 1: Update `BootScreen.tsx`'s import**

In `src/app/_components/BootScreen.tsx`, change:
```tsx
import styles from "./pokedex-home.module.css";
```
to:
```tsx
import styles from "./site-shell.module.css";
```
No other changes to this file — its logic (session-gated, 500ms/200ms timing from the earlier UX fix) is unaffected; only the class names it reads (`bootOverlay`, `bootOverlayFading`, `bootContent`, `bootLogoRow`, `bootLogo`, `bootBar`, `bootBarFill`) now resolve from the new file, which defines them identically.

- [ ] **Step 2: Update `EncounterLink.tsx`'s import**

In `src/app/_components/EncounterLink.tsx`, change:
```tsx
import styles from "./pokedex-home.module.css";
```
to:
```tsx
import styles from "./site-shell.module.css";
```
No other changes — its `useTransition`-based logic from the earlier UX fix is unaffected; only `encounterOverlay`/`encounterText`/`dialogCursor` class references need to resolve correctly. Note: `dialogCursor` stays defined in `pokedex-home.module.css` (it's used by the home page's own "환영합니다" dialog bar, which is home-page content, not shell chrome) — `EncounterLink.tsx` does NOT reference `dialogCursor` itself (only `pokedex-home.module.css`'s `.dialog` markup in `page.tsx` does), so this is not a conflict; double check by reading `EncounterLink.tsx`'s current full contents before editing to confirm it only references `encounterOverlay`/`encounterText`, not `dialogCursor`.

- [ ] **Step 3: Verify it builds**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/app/_components/BootScreen.tsx src/app/_components/EncounterLink.tsx
git commit -m "refactor: point BootScreen/EncounterLink at the new shared site-shell stylesheet"
```

---

### Task 4: Wire `SiteShell` into the root layout, shrink the home page down to its own content, delete retired components

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css:85-99` (delete the `body:has(#home-shell-root)` block)
- Delete: `src/app/_components/intro.tsx`
- Delete: `src/app/_components/footer.tsx`
- Delete: `src/app/_components/PokemonDropdown.tsx`

**Interfaces:**
- Consumes: `SiteShell` (Task 2).
- Produces: the home route (`/`) renders only its own "TRAINER DATA"/"MAIN MENU"/dialog content — no more `id="home-shell-root"`, no more `.shell`/`.screen`/`.sidebar` markup of its own.

- [ ] **Step 1: Confirm nothing else depends on the files being deleted**

Run: `grep -rln "from ['\"].*intro['\"]\|from ['\"].*footer['\"]\|PokemonDropdown" src/app --include="*.tsx" -i`
Expected: only `src/app/layout.tsx` references `intro`/`footer`, and only `src/app/_components/intro.tsx`/`src/app/_components/PokemonDropdown.tsx` reference `PokemonDropdown` (i.e., no OTHER file depends on any of the three files being deleted). If any other file shows up, stop — something else needs updating first, don't delete blindly.

- [ ] **Step 2: Rewrite `src/app/layout.tsx`**

Read the current file first to confirm its shape still matches what's described in this plan's earlier investigation (the `<header><Intro/></header>` + `<Container>{children}</Container>` + `<Footer/>` + `<ChatWidget/>` structure). Replace the `<body>` contents with:

```tsx
      <body
        className={cn(
          inter.className,
          pressStart2P.variable,
          spaceMono.variable,
          'bg-[#ECEFF4] dark:bg-[#2E3440] text-[#2E3440] dark:text-[#ECEFF4]',
          pixelTheme.pixelTheme,
        )}
      >
          <SiteShell>{children}</SiteShell>
          <ChatWidget />
      </body>
```

Remove the now-unused imports (`Footer`, `Intro`, `Container`) and add:
```tsx
import SiteShell from '@/app/_components/SiteShell';
```

- [ ] **Step 3: Rewrite `src/app/page.tsx`**

Read the current file first (it's the file investigated earlier in this plan's design). Remove:
- The `id="home-shell-root"` wrapper `<div className={styles.shell}>` and the nested `<div className={styles.screen}>` — both retired, now provided by `SiteShell`.
- The `<aside className={styles.sidebar}>` block entirely (logo, nav, sidebar sprite) — now rendered by `SiteShell`.
- The `<BootScreen />` call and its import — now rendered by `SiteShell`.
- The `sections` array and the sidebar's `EncounterLink`/`<a>` nav rendering that used it for the sidebar — but KEEP the array (or an equivalent) for the "MAIN MENU" tile grid inside `<main>`, which still needs the same 4 entries (포켓몬 도구/학습 노트/블로그/포트폴리오) to render its own tiles. Since the sidebar no longer needs this array (it has its own `NAV_ITEMS` inside `SiteShell`), keep `sections` in `page.tsx` scoped to just the menu-tile-grid use.

The remaining `page.tsx` should be:

```tsx
import Image from "next/image";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { DIGITAL_GARDEN_URL, GITHUB_URL, EMAIL } from "@/lib/constants";
import styles from "@/app/_components/pokedex-home.module.css";
import EncounterLink from "@/app/_components/EncounterLink";

const SIDEBAR_SPRITE_URL = "/pokemon/pikachu.png";

// NOTE: no `icon` field here (unlike SiteShell's NAV_ITEMS) — the menu tile
// rendering below never displayed an icon; only the old sidebar nav (now
// retired, replaced by SiteShell) used `section.icon`. Keeping an unused
// icon field + its imports here would be dead code.
const sections = [
  {
    title: "포켓몬 도구",
    description: "포켓몬 도감, 메타 분석, 팀 빌더",
    href: "/pokemon/list",
    external: false,
  },
  {
    title: "학습 노트",
    description: "개발하며 공부한 내용들",
    href: "/studys/list",
    external: false,
  },
  {
    title: "블로그",
    description: "Obsidian으로 작성하는 디지털가든",
    href: DIGITAL_GARDEN_URL,
    external: true,
  },
  {
    title: "포트폴리오",
    description: "만들어온 것들과 기술 스택",
    href: "/portfolio",
    external: false,
  },
];

export default function Home() {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/gh/neodgm/neodgm-webfont@1.601/neodgm/style.css"
      />

      <section className={styles.panel}>
        <div className={styles.panelHeader}>TRAINER DATA</div>
        <div className={styles.panelBody}>
          <div className={styles.identityRow}>
            <div className={styles.avatarBox}>
              <Image src={SIDEBAR_SPRITE_URL} alt="Ohgnoy의 트레이너 아바타" width={48} height={48} />
            </div>
            <div>
              <p className={styles.identityNumber}>No. 0001</p>
              <h1 className={styles.identityName}>OHGNOY</h1>
              <p className={styles.identityTagline}>개발하며 기록하는 공간</p>
            </div>
          </div>
          <div className={styles.iconRow}>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className={styles.iconBox}
            >
              <FaGithub size={16} />
            </a>
            <a
              href={DIGITAL_GARDEN_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="디지털가든"
              className={styles.iconBox}
            >
              <FaExternalLinkAlt size={14} />
            </a>
            <a href={`mailto:${EMAIL}`} aria-label="이메일" className={styles.iconBox}>
              <MdEmail size={16} />
            </a>
          </div>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>MAIN MENU</div>
        <div className={styles.menuGrid}>
          {sections.map((section, index) => {
            const inner = (
              <>
                <span className={styles.menuTileIndex}>{String(index + 1).padStart(2, "0")}</span>
                <span className={styles.menuTileTitle}>{section.title}</span>
                <span className={styles.menuTileDesc}>{section.description}</span>
                <span className={styles.menuTileArrow}>▸</span>
              </>
            );

            return section.external ? (
              <a
                key={section.href}
                href={section.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.menuTile}
              >
                {inner}
              </a>
            ) : (
              <EncounterLink key={section.href} href={section.href} className={styles.menuTile}>
                {inner}
              </EncounterLink>
            );
          })}
        </div>
      </section>

      <div className={styles.dialog}>
        <span>Ohgnoy의 기록 공간에 오신 것을 환영합니다</span>
        <span className={styles.dialogCursor}>▼</span>
      </div>
    </>
  );
}
```

- [ ] **Step 4: Delete the retired `body:has(#home-shell-root)` rules**

Read `src/app/globals.css`, find the block at (roughly) lines 85-99:
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
```
Delete this entire block (through its closing brace — read the surrounding lines to find the exact end before deleting, don't guess the line count). The home page no longer has `id="home-shell-root"` (removed in Step 3) and no longer relies on hiding the header/footer, since there is no more global header/footer to hide.

Note: this also means the floating `ChatWidget` bubble (`.chat-widget-root`), previously hidden on the home page only, now shows on the home page too — an intentional, low-risk side effect of retiring home's special-casing (per this plan's investigation: keeping it hidden specifically on `/` would require reintroducing a bespoke exception, which contradicts the whole point of this plan; showing it everywhere consistently is simpler and was not something the spec required preserving byte-for-byte).

- [ ] **Step 5: Delete the three retired files**

```bash
git rm src/app/_components/intro.tsx src/app/_components/footer.tsx src/app/_components/PokemonDropdown.tsx
```

- [ ] **Step 6: Verify it builds**

Run: `npm run build`
Expected: succeeds, no errors about missing imports.

- [ ] **Step 7: Verify visually**

Run `npm run dev`, load `/` in both light and dark mode, using whichever browser tool is connected (ToolSearch "chrome devtools" or "browser-use" — Chrome DevTools MCP may fail with "Could not find Google Chrome executable," fall back to `browser-use`). Confirm: the sidebar renders with all 5 nav items, the home page's own TRAINER DATA/MAIN MENU panels render inside the main slot, clicking a sidebar nav item shows the "이동 중" transition and navigates correctly, the home-route nav item ("포켓몬 도구" wouldn't be active on `/` — no nav item should show as active on the home route itself, since none of the `matchPrefix` values match `/`, which is correct).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: wire SiteShell into the root layout, retire the old header/footer/home special-casing"
```

---

### Task 5: Auth pages opt out of the sidebar

**Files:**
- Modify: `src/app/auth/login/page.tsx`
- Modify: `src/app/auth/forgot/page.tsx`
- Modify: `src/app/auth/regist/page.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: the `site-shell-grid`/`site-shell-sidebar`/`site-shell-main` literal class names applied by `SiteShell` (Task 2).
- Produces: no change to any auth page's own form logic or styling — only the outer wrapper `div` in each gets an `id="auth-shell-root"` added, and `globals.css` gains a new rule block keyed off that id.

- [ ] **Step 1: Add `id="auth-shell-root"` to each auth page's outer wrapper**

In `src/app/auth/login/page.tsx`, change:
```tsx
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
```
to:
```tsx
    <div id="auth-shell-root" className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
```

In `src/app/auth/regist/page.tsx`, make the same change to its matching outer wrapper (confirmed identical className in this plan's investigation):
```tsx
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
```
to:
```tsx
    <div id="auth-shell-root" className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
```

In `src/app/auth/forgot/page.tsx` (currently just a placeholder stub), change:
```tsx
        <div>
            Password Forgot Page
```
to:
```tsx
        <div id="auth-shell-root">
            Password Forgot Page
```

- [ ] **Step 2: Add the hiding rule to `globals.css`**

Read the current `globals.css` around the (now-deleted, per Task 4) former home-page block to find a sensible insertion point, then add:

```css
body:has(#auth-shell-root) .site-shell-sidebar {
  display: none;
}

body:has(#auth-shell-root) .site-shell-grid {
  grid-template-columns: 1fr;
}

body:has(#auth-shell-root) .site-shell-main {
  max-width: none;
}
```

- [ ] **Step 3: Verify it builds**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 4: Verify visually**

Load `/auth/login` in the browser. Confirm: no sidebar is visible, the login form renders centered and full-width, and the form still functions (typing into fields works — don't need to actually submit/authenticate, just confirm the layout isn't broken).

- [ ] **Step 5: Commit**

```bash
git add src/app/auth/login/page.tsx src/app/auth/regist/page.tsx src/app/auth/forgot/page.tsx src/app/globals.css
git commit -m "feat: exclude auth pages from the site-wide sidebar shell"
```

---

### Task 6: Fix portfolio pages' shell-hiding CSS for the new component

**Files:**
- Modify: `src/app/globals.css:71-83`

**Interfaces:**
- Consumes: the `site-shell-sidebar`/`site-shell-grid`/`site-shell-main` literal class names (Task 2). No changes to `src/app/portfolio/page.tsx` or `src/app/portfolio-pdf/page.tsx` themselves — both already have `id="portfolio-shell-root"` on their outer wrapper (confirmed in this plan's investigation), which is all this task needs.

- [ ] **Step 1: Read the current rule block**

Read `src/app/globals.css` lines 71-83 (or wherever they've shifted to after Task 4/5's edits — search for `portfolio-shell-root`) to confirm the current content:
```css
body:has(#portfolio-shell-root) .switch,
body:has(#portfolio-shell-root) footer,
body:has(#portfolio-shell-root) .container > section:first-of-type {
  display: none !important;
}

body:has(#portfolio-shell-root) header {
  display: none !important;
}

body:has(#portfolio-shell-root) .container {
  padding-top: 0;
}
```

Note for context (do not act on this beyond what Step 2 says): the `.switch` selector here targets a CSS-Modules-scoped class (`switch.module.css`'s `.switch`), which Next.js hashes at build time — a global stylesheet selector like this cannot reliably match a hashed CSS-Module class name, so this specific line was almost certainly already non-functional before this plan touched anything. This plan does not need to "fix" that pre-existing issue directly — it's naturally resolved as a side effect of Step 2, since the theme switch button now lives inside `SiteShell`'s sidebar, which gets hidden as a whole.

- [ ] **Step 2: Replace the block**

Replace the entire block from Step 1 with:

```css
body:has(#portfolio-shell-root) .site-shell-sidebar {
  display: none;
}

body:has(#portfolio-shell-root) .site-shell-grid {
  grid-template-columns: 1fr;
}

body:has(#portfolio-shell-root) .site-shell-main {
  max-width: none;
  padding: 0;
}
```

This drops the `header`/`footer`/`.container > section:first-of-type` selectors (those elements no longer exist in the tree at all — `header`/`footer` were deleted in Task 4, and `.container > section:first-of-type` was presumably targeting old header/intro markup specific to the retired layout) and the `.switch` selector (superseded, per Step 1's note) in favor of hiding the one thing that actually needs hiding now: the new sidebar.

- [ ] **Step 3: Verify it builds**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 4: Verify visually**

Load `/portfolio` in the browser. Confirm it renders exactly as it did before this plan's work started (no sidebar, full-bleed layout) — compare against a screenshot taken before Task 4's changes if in doubt, or reason from the page's own content (it should look identical to how it looked when this plan began, since nothing in `/portfolio` itself changed, only what hides around it).

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "fix: update portfolio pages' shell-hiding CSS for the new SiteShell component"
```

---

### Task 7: Full verification sweep

**Files:**
- None modified — this task is verification-only. If it finds a real problem, the fix belongs in a follow-up task (see Step 5).

**Interfaces:**
- None produced.

- [ ] **Step 1: Build and lint check**

Run: `npm run build`
Expected: succeeds with no errors or new warnings beyond the pre-existing `images.domains` deprecation notice.

- [ ] **Step 2: Screenshot sweep across all shell-wrapped routes, both themes**

Using whichever browser tool is connected (ToolSearch "chrome devtools" or "browser-use"), visit each of the following in both light and dark mode, screenshotting each: `/` (home), `/pokemon/list`, `/pokemon/meta`, `/pokemon/builder`, `/studys/list`, `/chat/user`, `/chat/bot`. For each, confirm:
- The sidebar renders with the pixel-frame border (multi-step corners, harmonized color from the frame-bevel work) and correct panel background for the active theme.
- The active nav item is highlighted correctly (e.g. on `/pokemon/list`, "포켓몬 도구" is highlighted and its List/Meta/Builder sub-links are visible; on `/studys/list`, "학습 노트" is highlighted).
- The GitHub/digital-garden/email/login icons and the theme-switch button are present and clickable in the sidebar.
- No console errors related to `site-shell.module.css`, missing images, or missing modules.

- [ ] **Step 3: Screenshot sweep across excluded routes**

Visit `/auth/login` and `/portfolio`, confirm both show no sidebar and otherwise look unchanged from their pre-this-plan appearance.

- [ ] **Step 4: Confirm the boot screen and transition overlay work outside the home page**

Clear `sessionStorage` (or open a fresh incognito-equivalent context if the browser tool supports it), navigate directly to `/studys/list` first (not `/`), and confirm the boot screen plays once. Then click a sidebar nav link and confirm the "이동 중" transition overlay appears only if the navigation genuinely takes a moment (per the earlier `useTransition`-based fix) — this should work identically to how it works when starting from `/`, since the shell (and thus `BootScreen`/`EncounterLink`) is now mounted the same way regardless of which page is the initial entry point.

- [ ] **Step 5: If any step finds a real problem**

Stop and report it rather than silently patching — note which task's work is implicated so a fix can be scoped correctly, rather than papering over it here.

- [ ] **Step 6: Commit (only if Step 5 required a fix)**

If no fix was needed, skip this step. If a fix was made, commit it separately with a message describing what verification step caught it.

---

## Self-Review Notes

- **Spec coverage:** Spec's Section 1 (component extraction) → Tasks 1-2. Section 2 (layout wiring, auth/portfolio exclusion) → Tasks 4-6 (using CSS-based hiding, matching this codebase's existing convention twice-proven for home/portfolio, rather than the spec's literal mention of "Next.js route groups" — a deviation in mechanism only, not outcome; noted here since the spec text said route groups and this plan intentionally uses the pattern already established in this codebase instead, which achieves the identical excluded-routes outcome with less invasive file moving and is consistent with "in existing codebases, follow established patterns"). Section 3 (theming, `--px-*` reuse, Press Start 2P) → Task 1/2. Section 4 (no page content restyled) → honored by every task; no task touches `/pokemon/*`, `/studys/*`, `/chat/*`, `/posts/*` internals. BootScreen/EncounterLink going site-wide → Task 3-4. Chat nav item → Task 2's `NAV_ITEMS`. ChatWidget unaffected → Task 4 Step 4 explicitly notes the one behavior change (visible on home now) and why it's acceptable. Testing/Verification items 1-6 → Task 7 Steps 1-4 (plus Tasks 4-6's own Step "verify visually" for their specific routes).
- **Placeholder scan:** no TBD/TODO; every code step has complete, runnable content. Task 7's verification is deliberately open-ended in *what it might find* (that's the nature of a sweep) but concrete in *what to check* and *what to do if something's wrong* (stop and report, don't silently patch).
- **Type consistency:** `SiteShell`'s prop shape (`{ children: ReactNode }`) is used consistently in Task 2's definition and Task 4's `layout.tsx` usage. The `site-shell-grid`/`site-shell-sidebar`/`site-shell-main` literal class names are introduced once in Task 2 and referenced identically (exact same strings) in Tasks 5 and 6's CSS. `NavItem`'s `matchPrefix`/`subLinks` fields are defined once in Task 2 and used consistently within that same task (no other task touches this type).
