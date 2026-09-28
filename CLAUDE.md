# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"Ohgnoy" — personal site on Next.js App Router (React 18, TypeScript, Tailwind v3):
a Pokémon toolset (list/detail/team builder/meta stats), study notes, a blog, a
portfolio, and live chat. Deployed on Vercel; a Spring backend supplies the
dynamic parts (auth, likes, comments, chat).

**Read `docs/architecture.md` first** — it is the maintained deep dive on the
module layout, data flow, and per-feature conventions. `docs/known-issues.md`
lists what is broken or dead; check it before building on top of anything.

## Commands

```bash
npm install
npm run dev        # dev server on :3000
npm run build      # production build — this is the only real CI-style check
npm start          # serve a production build
npx tsc --noEmit   # typecheck (strict: true)
docker compose up  # dev server in a container (needs Dockerfile.dev, absent from the repo)
```

There is **no test suite, no lint script, and no test runner installed.** Verify
changes with `npx tsc --noEmit` plus `npm run build`, and for anything visual,
with an actual screenshot of the running page. Formatting follows `.prettierrc`
(2-space, single quotes, semicolons, 80 cols) but no npm script runs it — use
`npx prettier --write <files>`.

## Backend / environment

The backend base URL is **hardcoded** as `Ohgnoy_BackendAPI = "http://localhost:8080"`
in `src/lib/constants.ts`, not read from the environment — the `.env.local` /
`Ohgnoy_BackendAPI` env var in README.md is stale. Change it there if you need to
point at a deployed backend. All backend calls should go through `apiClient`
(`src/lib/api/client.ts`), which handles JSON/FormData bodies and the
`Authorization: Bearer <token>` header.

## Things that are not what they look like

- **`next-auth` is a dependency but is not wired up.** Auth is a custom flow: a
  token in `localStorage`, checked per-page (e.g. `PokemonGrid` redirects to
  `/auth/login` when absent). Do not reach for `useSession`/`getServerSession`.
- **`socket.io-client` is dead code.** Chat is STOMP over SockJS
  (`src/lib/socket.ts`).
- **Zustand is used for exactly one store** (`_components/compareMons.tsx`).
  Everything else is local `useState` or server data.
- **`/posts` and `/studys` render Next.js blog-starter Lorem Ipsum** from
  `_posts/`. Do not wire new features to `getAllPosts()` — see
  `docs/known-issues.md`.

## Layout shell

`app/layout.tsx` wraps every route in `<SiteShell>` (persistent left sidebar +
`<main>` slot) plus a floating `ChatWidget` (skipped on `/chat/*`). A page opts out by giving its root a
unique `id` and adding `body:has(#that-id)` rules in `globals.css` that hide the
shell chrome — that is how `/auth/*` and `/portfolio*` get full-bleed layouts.
Follow that pattern; don't invent a second mechanism.

## Pixel-art styling rules

The home page (`src/app/page.tsx`) and the Pokémon section deliberately break the
site's Nord theme for a dark pixel-art Pokédex look. Full spec:
`docs/design/pixel-pokedex-home.md` — read it before touching that page or
`pokedex-home.module.css`. Two rules that get broken first:

- **Never use `border-radius` or a `clip-path` staircase for "pixel" corners.**
  The browser anti-aliases both. Corners come from the pixel-art PNG
  `public/frames/panel-frame.png` used as a `border-image` with
  `image-rendering: pixelated`; vary `border-image-width` instead of drawing new
  corners in CSS.
- **Verify visual changes by screenshotting the live page**, not by reasoning
  from a reference image. Every purely-reasoned CSS fix here went the wrong way
  at least once. Use Chrome DevTools MCP / browser-use if connected.

Reuse the shared pixel primitives in `src/app/_components/ui/pixel/`
(`PixelCard`, `PixelButton`, `PixelIconBox`, `PixelSprite`) rather than
hand-rolling the look on a new page. For sprites always use
`getPixelSpriteUrl()` / `<PixelSprite>` instead of reading `pokemon.sprites.*`
directly.

## Pokémon data pipeline

`pokenode-ts` → `src/lib/pokemon/fetchers/` → `src/lib/pokemon/transformers/` →
domain types in `src/types/pokemon/domain.ts`. Korean names and flavor text come
out of `src/lib/pokemon/i18n.ts`. Competitive usage/sets data has its own path:
`src/lib/battle/fetchers/`.

## Docs conventions

Design specs and implementation plans for larger changes live in
`docs/superpowers/specs/` and `docs/superpowers/plans/`, named
`YYYY-MM-DD-<slug>.md`. Keep `docs/architecture.md` and `docs/known-issues.md`
current when a change invalidates them.
