# Spec: Site-Wide Sidebar Shell (Sub-Project 1 of the Site Unification Work)

## Background

The site currently has three incompatible top-level layout patterns:

1. **The default layout** (`src/app/layout.tsx`): a sticky light-Nord `<header>` (`<Intro/>`) + `{children}` + `<Footer/>`, used by every page unless special-cased.
2. **The home page** (`src/app/page.tsx`, `id="home-shell-root"`): a full-bleed dark "Pokédex screen" with its own left sidebar nav, entirely replacing the default header/footer via `body:has(#home-shell-root) header, footer, .chat-widget-root { display: none !important }` in `globals.css:85-89` plus container/padding overrides at `globals.css:91-99`.
3. **The portfolio pages** (`src/app/portfolio/page.tsx`, `src/app/portfolio-pdf/page.tsx`, both `id="portfolio-shell-root"`): a print/resume-style full-bleed layout, similarly hiding header/footer/switch via `globals.css:71-83`.

This produced the "teleporting to a different site" feeling raised in conversation: clicking from the home page's immersive dark Pokédex screen into any other page (pokemon tools, study notes, chat) drops the user into the plain light-Nord header/footer chrome with zero visual continuity.

The project owner decided (after reviewing the actual site and reasoning through what's real vs. dead content on it): `/studys` and `/posts` currently serve demo/Lorem-Ipsum content (`docs/known-issues.md`), and the on-site `/portfolio` is no longer used (portfolio content now lives in Notion) — so there isn't real "calm blog content" on this site that needs protecting with a separate, quieter visual language. The pixel/Pokédex identity should become the whole site's identity, not just the home page's.

This sub-project is step 1 of that: **replace the default header/footer with the home page's sidebar as the site-wide shell.** It does NOT restyle what each page renders inside that shell (pokemon tool internals, chat UI, study notes list) — that's individual follow-on work, page by page, same pattern as the pokemon-section primitive rollout.

## Decisions already made (do not re-litigate)

- The home page's left-sidebar-nav structure becomes the persistent site-wide shell, replacing the top horizontal header + footer, for every route except `/auth/*` and `/portfolio`, `/portfolio-pdf`.
- **Auth pages excluded**: `/auth/login`, `/auth/forgot`, `/auth/regist` keep their own minimal standalone layout (no sidebar) — these are simple form pages, not navigation destinations.
- **Portfolio pages excluded**: `/portfolio` and `/portfolio-pdf` already have their own special full-bleed print/resume layout (`body:has(#portfolio-shell-root)` rules in `globals.css:71-83`) predating this work. Leave that layout and its hiding rules untouched — the project owner is unsure whether `/portfolio` will even stay, per conversation ("포트폴리오는 모르겠는데").
- **Light/dark supported in the shell.** Unlike the home page (dark-only by design per `docs/design/pixel-pokedex-home.md`), the site-wide shell must work in both themes, since the pages it now wraps (pokemon tools, chat, studys) already support the light/dark toggle and that toggle is not being removed.
- **Chat added as a sidebar nav item** (currently absent from the home page's 4-item menu: 포켓몬 도구, 학습 노트, 블로그, 포트폴리오). The chat nav item links to `/chat/user`.
- **The floating `ChatWidget` bubble is unaffected** by this work. It's a separate always-on anonymous chat overlay (distinct from the `/chat/user`/`/chat/bot` pages), currently hidden only on the home page via `globals.css:87`. It keeps working exactly as it does today on every non-home page; no new decision needed since nothing about it changes.
- **`BootScreen` and `EncounterLink`'s transition overlay become site-wide**, not home-only: the boot screen plays once per session on first load of any page (not just `/`), and the "이동 중" transition overlay applies to sidebar nav clicks from any page, not just from the home page's menu.

## Design

### 1. Component extraction

`src/app/_components/pokedex-home.module.css`'s `.screen`/`.sidebar`/`.logoRow`/`.logo`/`.nav`/`.navItem`/`.navCursor`/`.sidebarSprite`/`.spriteFrame`/`.main` classes are the source material for a new shared shell. They move into a new file, `src/app/_components/site-shell.module.css`, generalized to no longer assume the home page's specific "TRAINER DATA"/"MAIN MENU" content — the shell only owns the sidebar and the `<main>` slot's outer frame (padding, max-width, background), not what's rendered inside `<main>`.

A new component, `src/app/_components/SiteShell.tsx`, renders:
- The sidebar: logo, the 5-item nav list (포켓몬 도구 → `/pokemon/list`, 학습 노트 → `/studys/list`, 블로그 → `DIGITAL_GARDEN_URL` external, 포트폴리오 → `/portfolio`, 채팅 → `/chat/user`), each using `EncounterLink` for internal links (external stays a plain `<a target="_blank">`, matching the home page's existing pattern) — except the 포트폴리오 item, whose destination is a page excluded from this shell (see below).
- Active-route highlighting on the current nav item (the home page today has no active-state styling since it never navigates to itself; this is new — use Next.js `usePathname()` to compare against each item's `href`).
- The bottom sidebar sprite box ("PARTNER", Pikachu image) — kept as-is, site-wide, since it's decorative branding rather than home-specific content.
- A `<main>` slot (`{children}`) using the generalized `.main` class for consistent padding/max-width.

`src/app/page.tsx` (the home route) stops rendering its own `.screen`/`.sidebar` markup — its "TRAINER DATA"/"MAIN MENU" panels become the content passed as `{children}` into `SiteShell`, exactly like any other page's content.

**Portfolio nav item caveat:** since `/portfolio` keeps its own separate full-bleed layout (excluded from this shell per the Decisions section), clicking "포트폴리오" from the sidebar navigates *out* of the shell into that standalone layout — same behavior as today's home page menu tile for portfolio, unchanged.

### 2. Layout wiring

`src/app/layout.tsx` changes from unconditionally rendering `<header><Intro/></header>` + `{children}` + `<Footer/>` to rendering `<SiteShell>{children}</SiteShell>` for the default case. Since `/auth/*` and `/portfolio*` need to opt out entirely (no sidebar, no shell), this is done with Next.js route groups: move the auth routes into a route group with their own minimal `layout.tsx` (just `{children}`, no `SiteShell`), and keep `/portfolio`/`/portfolio-pdf`'s existing self-contained full-bleed markup working exactly as it does today (their pages already render outside of any assumption about the shell, relying on the `body:has()` CSS hiding — that mechanism stays for these two routes only).

`globals.css:85-99`'s `body:has(#home-shell-root)` rules are deleted entirely — the home page is no longer a special case once its content lives inside the shared `SiteShell`. `globals.css:71-83`'s `body:has(#portfolio-shell-root)` rules are left untouched (out of scope, per Decisions).

`Intro`/`footer.tsx`'s `PixelIconBox`-based content (GitHub/external-link/mail icons) that currently lives inside the old header/footer needs a new home — fold it into `SiteShell`'s sidebar as a small icon row placed directly below the nav list and above the bottom sprite box, matching the icon row's visual treatment on the home page's own identity panel (`PixelIconBox`, same three links: GitHub, digital garden, email) rather than deleting it, since those are real links users rely on.

### 3. Theming

The shell's CSS drops the home-page-specific `--window-bg`/`--border`/`--accent-warm`/etc. token family (`pokedex-home.module.css`'s `.shell` block) in favor of the already-dual-themed `--px-*` tokens from `src/app/_components/ui/pixel/pixel-theme.module.css` (built in the earlier pixel-theme-unification work, already mounted globally on `<body>`). This retires a redundant token system rather than maintaining two. The shell's outer frame reuses the same border-image technique and assets (`panel-frame.png`/`panel-frame-light.png`, both just improved with a bevel in the prior frame-bevel work) via the existing `.pixelFrame` border-image mechanism, swapped by `.dark` the same way `pixel-theme.module.css` already does.

Font: the sidebar's logo/nav currently use NeoDunggeunmo (loaded via a page-scoped `<link>` in `page.tsx`, per the CDN-dependency caveat already documented in `docs/design/pixel-theme-unification.md`). Since the sidebar is now site-wide, Press Start 2P (already self-hosted via `next/font/google`, no new CDN dependency) is used instead — consistent with the earlier decision to standardize on Press Start 2P for the pokemon-section primitives, and avoiding site-wide dependence on the external NeoDunggeunmo CDN link.

### 4. What does NOT change in this sub-project

- No page's internal content is restyled. `/studys/list`, `/chat/user`, `/chat/bot`, `/pokemon/*` all keep rendering exactly the JSX/CSS they render today — they simply now render inside `SiteShell`'s narrower `<main>` slot instead of under the old full-width header. Pages may look visually cramped or awkward against the new narrower main column until their own follow-on reskin lands; that's expected and out of scope here.
- `/portfolio`, `/portfolio-pdf`, `/auth/*` are functionally and visually untouched.
- The floating `ChatWidget` bubble's behavior is untouched (see Decisions).
- No change to `_posts`/`/posts` data source (that's sub-project 2, tracked separately).

## Testing / Verification

No automated test suite exists for this repo's layout/visual work (consistent with all prior pixel-theme work in this project). Verification is:
1. `npm run build` succeeds.
2. Real browser screenshots (per this project's established practice) of: the home page (`/`, now rendering inside the shell instead of its old special-cased full-bleed layout), a pokemon page (`/pokemon/list`), `/studys/list`, `/chat/user`, in both light and dark mode — confirming the sidebar renders consistently, nav highlighting works, and no page is visually broken (missing content, overlapping elements, unreadable text).
3. Confirm `/auth/login` (or any one auth page) still renders as a standalone page with no sidebar.
4. Confirm `/portfolio` still renders exactly as it does today (unchanged), including its own header/footer/switch hiding.
5. Confirm the GitHub/digital-garden/email icon links (previously in the old header/footer) are still reachable somewhere in the new sidebar.
6. Click through at least one internal sidebar nav link from a non-home page (e.g. from `/studys/list` to `/pokemon/list`) and confirm the "이동 중" transition overlay and active-route highlighting both work outside of the home page.

## Explicitly out of scope

- Restyling the actual content of `/studys/list`, `/chat/user`, `/chat/bot`, `/pokemon/*` to fit the pixel aesthetic (individual follow-on sub-projects, one page at a time).
- `/portfolio` and `/portfolio-pdf` (excluded entirely, per Decisions).
- `/posts` data-source restructuring (sub-project 2, separate spec).
- Any change to the floating `ChatWidget` bubble's own behavior or styling.
- Any change to `PixelCard`/`PixelButton`/`PixelIconBox`/`pixel-theme.module.css`'s existing token values (only their consumption point changes — `SiteShell` starts using them; the earlier pixel-theme-unification work's values and both frame assets are reused as-is).
