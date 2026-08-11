# Architecture

Personal site/portfolio built on Next.js App Router. Started from the Next.js blog-starter template (some of that scaffolding is still visible, see `docs/known-issues.md`) and grew a Pokémon toolset, a study-notes section, live chat, and a portfolio on top.

## Tech stack

- **Framework**: Next.js (App Router), React 18, TypeScript.
- **Styling**: Tailwind CSS v3 with Nord-palette CSS custom properties (`src/app/globals.css`) driving light/dark mode via a `.dark` class toggle (`src/app/_components/theme-switcher.tsx`). A few pages that intentionally break from the site-wide theme use plain CSS Modules instead (`markdown-styles.module.css`, `switch.module.css`, `pokedex-home.module.css` — see below).
- **State**: Zustand, but only for one store — `src/app/_components/compareMons.tsx` (the pokemon-compare feature). Don't assume Zustand is used broadly; most pages just use local `useState`/server data.
- **Auth**: `next-auth` is a dependency but is **not actually wired up** — it's referenced only as a type import in `src/interfaces/pokemon.ts`. Real auth is a custom flow: a token in `localStorage`, checked manually per-page (e.g. `PokemonGrid` redirects to `/auth/login` if no token is present). Don't assume `next-auth` session APIs work anywhere in this codebase.
- **Chat**: STOMP over SockJS (`@stomp/stompjs` + `sockjs-client`, see `src/lib/socket.ts`, `src/app/_components/ChatWidget.tsx`, `src/app/chat/user/page.tsx`) is the real, live transport. `socket.io-client` is in `package.json` but is **dead — not imported anywhere in `src/`**, a leftover from before the STOMP migration.
- **Pokémon data**: `pokenode-ts` wraps PokeAPI. Fetchers live in `src/lib/pokemon/fetchers/` (pokemon, species, generation, evolution chain, move), shaped by `src/lib/pokemon/transformers/` (`toPokemonDetail.ts`, `toEvolutionChain.ts`, `toMoveList.ts`) into the domain types in `src/types/pokemon/domain.ts`. Korean name/flavor-text extraction lives in `src/lib/pokemon/i18n.ts`. Sprite URL resolution (prefer the small pixel sprite, fall back to official artwork) is centralized in `src/lib/pokemon/spriteUrl.ts` — always use `getPixelSpriteUrl()`/`PixelSprite` rather than reading `pokemon.sprites.*` directly in a component.
- **Battle/meta data**: `src/lib/battle/fetchers/` pulls competitive usage stats and sets (Pokémon Showdown / pkmn.cc-style data) for the `/pokemon/meta` and team-builder pages.
- **Blog/posts**: `src/lib/api.ts` + `gray-matter` parse markdown from `_posts/`. Currently demo content only — see `docs/known-issues.md` before building anything on top of it.

## Directory map

```
src/
  app/
    _components/          shared UI: header (Intro), Footer, ChatWidget, Container,
                           theme-switcher, TypeBadge, compareMons (zustand store)
      ui/pixel/            shared pixel-styled primitives used across the pokemon
                           section: PixelCard, PixelButton, PixelIconBox, PixelSprite
                           (+ getPixelSpriteUrl). See docs/design/ if a page needs
                           the pixel look.
    api/                   route handlers: like/[postId], pokemon/battle,
                           pokemon/ko-names, users/[userId]/likedMons
    auth/                  login, regist (register), forgot — custom localStorage-token auth
    chat/                  user, bot — STOMP/SockJS chat UI
    pokemon/               list, [id] (detail), builder (team builder), meta (usage stats)
    posts/                 create, [slug] — blog-starter leftover, see known-issues.md
    studys/                list, create, [slug] — "study notes"; currently backed by the
                           same demo _posts data as posts/, see known-issues.md
    portfolio/              portfolio/-pdf   self-contained pages that opt out of the
                           global header/footer/chat widget (see "Shell escape hatch" below)
    page.tsx               home — the pixel Pokédex screen, see docs/design/pixel-pokedex-home.md
    layout.tsx             root layout: global header, Container, footer, ChatWidget
    globals.css            Nord theme tokens + the shell-escape-hatch CSS rules
  lib/
    api.ts, api/            blog-starter post fetching (post.ts), user API
    pokemon/                fetchers/ transformers/ i18n.ts spriteUrl.ts hooks/
    battle/                 fetchers/ constants.ts — competitive usage/sets data
    user/                   token.ts — localStorage auth token helpers
    socket.ts               STOMP/SockJS client setup
    utils.ts                cn() (clsx + tailwind-merge), shared input/button classes
    constants.ts            BLOG_NAME, GITHUB_URL, DIGITAL_GARDEN_URL, EMAIL, etc.
  interfaces/               Post, UserInfo, Author types
  types/pokemon/            domain.ts (PokemonDetail, PokemonStats, PokemonTypeName),
                            battle.ts
  hooks/                    shared custom hooks
```

## Shell escape hatch (opting a page out of global chrome)

`layout.tsx` always renders a sticky header (`Intro`), a `Container`-wrapped content area, `Footer`, and a floating `ChatWidget`. A page that needs to be visually self-contained (its own full-bleed layout, no global nav) gives its root element a unique `id` and adds rules to `globals.css` targeting `body:has(#that-id)`. Two pages do this today:

- `#portfolio-shell-root` (`src/app/portfolio/page.tsx`, `portfolio-pdf/page.tsx`)
- `#home-shell-root` (`src/app/page.tsx`)

If a new page needs the same treatment, follow this pattern — don't invent a different mechanism. See `globals.css` for the exact rules (hiding `header`/`footer`/`.chat-widget-root`, resetting `.container` max-width/padding, resetting `.content-wrapper` padding-top).

## Design docs

- `docs/design/pixel-pokedex-home.md` — the home page's dedicated dark pixel-art design system (colors, the border-image pixel-frame technique, typography rules). Read this before touching `src/app/page.tsx` or `pokedex-home.module.css`.
- `docs/known-issues.md` — things discovered to be broken/incomplete that aren't fixed yet; check before building on top of `_posts`, `/studys`, or `pokemonCard.tsx`.
