# Architecture

Personal site/portfolio built on Next.js App Router. Started from the Next.js blog-starter template (some of that scaffolding is still visible, see `docs/known-issues.md`) and grew a Pokémon toolset, a study-notes section, live chat, and a portfolio on top.

## Tech stack

- **Framework**: Next.js (App Router), React 18, TypeScript.
- **Styling**: Tailwind CSS v3 with Nord-palette CSS custom properties (`src/app/globals.css`) driving light/dark mode via a `.dark` class toggle (`src/app/_components/theme-switcher.tsx`). A few pages that intentionally break from the site-wide theme use plain CSS Modules instead (`markdown-styles.module.css`, `switch.module.css`, `pokedex-home.module.css` — see below).
- **State**: Zustand, but only for one store — `src/app/_components/compareMons.tsx` (the pokemon-compare feature: card toggles fill two slots, `CompareTray` on `/pokemon/list` shows them and links to `/pokemon/compare?a={id}&b={id}`, a server page that refetches both by id — the store is not read there). Don't assume Zustand is used broadly; most pages just use local `useState`/server data.
- **Auth**: `next-auth` is a dependency but is **not actually wired up** — it's referenced only as a type import in `src/interfaces/pokemon.ts`. Real auth is a custom flow: a token in `localStorage`, checked manually per-page (e.g. `PokemonGrid` redirects to `/auth/login` if no token is present). Don't assume `next-auth` session APIs work anywhere in this codebase.
- **Chat**: STOMP over SockJS (`@stomp/stompjs` + `sockjs-client`, see `src/lib/socket.ts`, `src/app/_components/ChatWidget.tsx`, `src/app/chat/user/page.tsx`) is the real, live transport. `socket.io-client` is in `package.json` but is **dead — not imported anywhere in `src/`**, a leftover from before the STOMP migration.
- **Pokémon data**: `pokenode-ts` wraps PokeAPI. Fetchers live in `src/lib/pokemon/fetchers/` (pokemon, species, generation, evolution chain, move), shaped by `src/lib/pokemon/transformers/` (`toPokemonDetail.ts`, `toEvolutionChain.ts`, `toMoveList.ts`) into the domain types in `src/types/pokemon/domain.ts`. Korean name/flavor-text extraction lives in `src/lib/pokemon/i18n.ts`. Sprite URL resolution (prefer the small pixel sprite, fall back to official artwork) is centralized in `src/lib/pokemon/spriteUrl.ts` — always use `getPixelSpriteUrl()`/`PixelSprite` rather than reading `pokemon.sprites.*` directly in a component.
- **Battle/meta data**: `src/lib/battle/fetchers/` pulls competitive usage stats and sets (Pokémon Showdown / pkmn.cc-style data) for the `/pokemon/meta` and team-builder pages. Pages read it only through `fetchBattleData.ts` (`fetchUsageRanking`, `fetchPokemonBattleData`), which caches small slices and never caches a failure; that file is the swap point for the planned Pokémon backend API. `fetchPokemonSets` is the sets-only variant for the builder's picker. Formats in `src/lib/battle/constants.ts` carry a `group`: `official` (싱글 랭크배틀 = `gen9championsbssregmb`, the `DEFAULT_FORMAT` at cutoff 1500, and 더블 랭크배틀 = VGC 2026 reg M-B) shown first, and `smogon` fan tiers folded in a `<details>` in both pickers (meta `FormatSelector`, detail `BattleTab`); each has a Korean `label` and a one-line `desc`. The official formats have no pkmn.cc sets, so when a Pokémon has no pkmn set but has usage, `deriveSet()` (`fetchSets.ts`) builds one "가장 많이 쓰는 구성" from the top 4 moves, top item/ability and top spread (usage gives Smogon ids like `focussash`; `enLabel()` turns them into English display names from `koNames.json`'s `en` map, like pkmn sets carry). The builder picker only loads usage in that case, through the same cached slice (`loadPokemonUsage`) the detail page uses. Korean names come from `src/lib/battle/koNames.json` + `koNames.ts` (items, moves, abilities, natures, types and Pokémon, Korean/English from PokeAPI; regenerate with `node scripts/build-ko-names.mjs`). It is **server-only** (about 300KB): battle data carries a `labels` map (`labelKey(kind, englishName)` → Korean) and components render through `labelOf()`, keeping the English values for Showdown export.
- **Blog/posts**: `src/lib/api.ts` + `gray-matter` parse markdown from `_posts/`. Currently demo content only — see `docs/known-issues.md` before building anything on top of it.

## Directory map

```
src/
  app/
    _components/          shared UI: SiteShell (persistent sidebar + main slot),
                           EncounterLink, BootScreen, ChatWidget,
                           theme-switcher, TypeBadge, compareMons (zustand store)
      ui/pixel/            shared pixel-styled primitives used across the pokemon
                           section: PixelCard, PixelButton, PixelIconBox, PixelSprite
                           (+ getPixelSpriteUrl). See docs/design/ if a page needs
                           the pixel look.
    api/                   route handlers: like/[postId], pokemon/battle,
                           pokemon/battle/sets (sets only, for the builder picker),
                           pokemon/names (?slugs= → Korean/English names, reads
                           koNames.json server-side), pokemon/ko-names,
                           users/[userId]/likedMons
    auth/                  login, regist (register), forgot — custom localStorage-token auth
    chat/                  user, bot — STOMP/SockJS chat UI
    pokemon/               list, [id] (detail), builder (team builder), meta (usage stats),
                           compare (?a=&b= side-by-side; fed by the list's CompareTray)
    posts/                 create, [slug] — blog-starter leftover, see known-issues.md
    studys/                list, create, [slug] — "study notes"; currently backed by the
                           same demo _posts data as posts/, see known-issues.md
    portfolio/              portfolio/-pdf   self-contained pages that opt out of the
                           global header/footer/chat widget (see "Shell escape hatch" below)
    not-found.tsx, error.tsx  Korean 404 / error pages, rendered inside SiteShell
    page.tsx               home — the pixel Pokédex screen, see docs/design/pixel-pokedex-home.md
    layout.tsx             root layout: renders `<SiteShell>{children}</SiteShell>` (persistent
                           left sidebar + main content slot) plus the floating ChatWidget
                           (which renders nothing on /chat/*)
    globals.css            Nord theme tokens + the shell-escape-hatch CSS rules
  lib/
    api.ts, api/            blog-starter post fetching (post.ts), user API
    pokemon/                fetchers/ transformers/ i18n.ts spriteUrl.ts hooks/
    battle/                 fetchers/ constants.ts — competitive usage/sets data;
                            koNames.json + koNames.ts — server-only Korean names
    user/                   token.ts — localStorage auth token helpers
    socket.ts               STOMP/SockJS client setup
    utils.ts                cn() (clsx + tailwind-merge), shared input/button classes
    constants.ts            BLOG_NAME, GITHUB_URL, DIGITAL_GARDEN_URL, EMAIL, etc.
  interfaces/               Post, UserInfo, Author types
  types/pokemon/            domain.ts (PokemonDetail, PokemonStats, PokemonTypeName),
                            battle.ts
  hooks/                    shared custom hooks
```

## Shell escape hatch (opting a page out of the sidebar shell)

`layout.tsx` renders `<SiteShell>{children}</SiteShell>` — a persistent left sidebar (nav, socials, theme switcher, partner sprite) plus a `<main>` content slot — around every route's page content, in addition to the floating `ChatWidget` (not mounted on `/chat/*`, which has its own chat UI — `ChatWidget` returns `null` there). This replaced the old header/footer/Container chrome; `Intro`, `Footer`, `Container`, and `PokemonDropdown` no longer exist in the codebase.

Two route groups keep their own standalone, full-bleed layouts instead of the sidebar shell:

- `/auth/*` (login, regist, forgot) — opts out via `body:has(#auth-shell-root)` CSS rules in `globals.css`
- `/portfolio` and `/portfolio-pdf` — opt out via `body:has(#portfolio-shell-root)` CSS rules in `globals.css`
  - `/portfolio-pdf` is a **print-first 16:9 slide deck**: fixed `338.7×190.5mm` `.deck-page`
    sections (PowerPoint's default widescreen size), `@page { size: 338.7mm 190.5mm; margin: 0 }`,
    one page per section, so the screen render is byte-for-byte the print render. That size is
    deliberate — this deck is read on a screen, not printed.
  - **The `AI 활용` page is sourced, not written, and it is about *operating* coding agents —
    not about the agents inside the products.** That second line matters: the repos hold a lot
    of product AI engineering that reads as if it belonged here — `AJT/ai/experiments/` (a
    666-line measurement catalogue: model A/B, MCP-subprocess vs in-process transport,
    idempotency), AgentHub's `AI_활용_보고서` (prompt engineering, PageRank context
    compression, the mermaid quality gate), monitoring's `06-에이전트-성능-평가` (why PPL was
    rejected, the G-Eval rubric). All of that belongs on the project pages, which is where it
    is. What qualifies here is only how a coding agent is bounded, dispatched and checked
    while working in these repos.

    **Written for a first-time reader, and the line width is part of that.** One fact per
    bullet, no term the reader has to already know, and numbers on a line of their own instead
    of in a parenthesis mid-sentence. This page is also the one page that does **not** use the
    52mm label gutter: it is read as sentences, so characters-per-line is the whole game — the
    label and the lead sit on one rule-underlined header row and the two columns take the full
    page width, which is what makes almost every bullet fit on one line. `spread` is off so the
    blocks stack from the top instead of being pushed apart.

    **No small type on this page.** The first version put a 12pt grey citation after each
    block's `why`, and the run-on grey line was harder to read than the citation was worth —
    the owner's reaction was that it only hurt legibility. Every line on the page is now 15pt:
    the `why` is 15pt grey, the points 15pt black, and the numbers that carried the
    credibility (2,036/3,307 lines, 15 runs, 27~285-line rule files, 14 scripts) moved inside
    the points where they are readable. Provenance now lives here instead:
    `AgentHub/agenttrace/AGENTS.md` (285), `AJT/ajt-llm-wiki/ai/CLAUDE.md` (128 — the AI
    server's own scope rules, the strongest authority material), the GETIT team repo's root
    `CLAUDE.md` (128), `AgentHub/docs/AGENTS.md` (64) plus that harness's own code, and
    `AJT/ajt-llm-wiki/CLAUDE.md` (37). Leafy's 228-line `CLAUDE.md` and the GETIT module files
    are codebase orientation (structure, commands, stack), not agent constraints, which is why
    they are not quoted.

    **Each block reads why-first, in plain Korean.** The first version quoted the rule files
    verbatim and compressed the quotes to fit, which produced insider shorthand — `packet`,
    `fail-closed`, `매니페스트 ID↔인수조건`, `우회 구현` — that the owner could not parse either.
    Every block now carries a `why` (what goes wrong without the constraint) before its points,
    and the points say what was done in words that need no repo context; the file citation is
    folded onto the end of the `why` line so it costs no extra line. If a point cannot be said
    without a term from inside the repos, it does not belong on this page.

    **The sections are named capabilities, not a list of rules** (the owner's call): 하네스
    엔지니어링 · 컨텍스트창 관리 · 에이전트 지침 · 스킬·플러그인. Four of them, two per column.
    A rule that is not one of those four does not go on the page — that is how `직접 구현 전에
    공식 구현을 조사한다` came off: it is a coding principle, not agent operation.

    The harness section is the strongest one (`AgentHub/docs/harness/`: runner 2,036 lines,
    tests 3,307, review criteria versioned v0.1→v1.1 with a changelog, 15 immutable runs, a
    hash-gated fail-closed `validate-run`), and it used to be a single bullet. The skills
    section cites only skills the owner wrote — the harness-operation skill and the
    handwritten-journal pipeline (SKILL.md plus 14 scripts). `design-taste-frontend` in the
    GETIT repo is 1,206 lines of third-party-looking skill text with no provenance note, so it
    is **not** claimed; check before adding it. Do not add a claim that cannot be pointed at a file — the page's whole value is that a recruiter can ask
    to see the file. Project codenames the deck does not otherwise introduce stay out of the
    source lines.
  - **The screen view is zoomed, the print view is not.** The page box is fixed in mm because
    the print render must equal the screen render — which means on a wide monitor the page fills
    only half the viewport and everything looks smaller than the printed size. A screen-only
    `zoom` ladder in the route's `<style>` scales the whole deck to the viewport width (`zoom`
    is a layout-affecting scale, so scroll height and the diagram iframes follow). The steps are
    computed from the paper's px width plus the deck's own padding so no horizontal scrollbar
    appears, and they live in `@media screen` so printing is untouched. It is a step ladder
    rather than a formula because `zoom` takes a `<number>` while `100vw` is a `<length>`, and
    this route ships no client JS.
  - **Paper size is a parameter, and there are two routes.** `portfolio-pdf/deck.tsx` holds the
    deck and takes `paper`; `PAPER` carries both the mm (for `@page` and the `--page-w`/`--page-h`
    CSS variables the `.deck-page` box reads) and the px at 96dpi (for the diagram fit math).
    `/portfolio-pdf` renders `ppt`; `/portfolio-pdf/a4` renders the same deck at `297×210mm` for
    printing on paper. Adding a size means one entry in `PAPER` plus a three-line route — do not
    hardcode mm anywhere else. A4 is narrower (1123px vs 1280px), so the width-bound diagrams lose
    ~12% of their scale there: measured minimums are 8.9-10.2pt on A4 against 9.0-10.8pt on 16:9. Its content comes from `portfolio-pdf/data.tsx`, which mirrors the owner's Notion
    portfolio and is a **separate copy** from the web page's `portfolio/data.ts` (different
    shapes: the deck is metric-tile-led, the web page is narrative). Editing one does not update
    the other. It also hides `.chat-widget-root` from its own `<style>` — the floating widget
    otherwise prints onto page 1.
  - **Diagrams are embedded as HTML in an `<iframe>`, not as PNG.** A PNG of a diagram prints as
    raster pixels and its small labels break up; the HTML prints as vector text. `page.tsx` scales
    the iframe with `transform: scale(k)` inside an `overflow-hidden` box of `w*k × h*k`. It has to
    be an iframe, not inline: the ten diagrams each define their own generic `.box`/`.card`/`.group`
    classes and would collide. `image.src` (the PNG) stays as the fallback for entries with no
    `vector`.
  - **`k` is the whole legibility story.** A label's printed size is
    `font-size × k × 0.75pt`, and `k = min(availWidth/canvasWidth, availHeight/canvasHeight)`.
    So page padding and header height convert directly into label points — that is why a
    single-diagram page bleeds to the left, right and bottom edges and carries a one-line
    header. The floor held here is **9pt minimum inside diagrams, 12pt for deck captions,
    15pt for deck body**. Verify by measuring the rendered page (`getComputedStyle` font-size
    × the iframe's transform scale × 0.75), not by reading source values.
  - **Canvas size is never written down twice.** `page.tsx`'s `vectorSize()` reads
    `width`/`height` off the diagram's own `<canvas>` at build time. Do not reintroduce
    `w`/`h` fields in `data.tsx` — cropping a diagram then silently desyncs the deck.
  - **The deck body is written 개조식, not in full polite sentences.** The Notion source is
    개조식 and the same column holds roughly twice as much of it; rewriting it as 존댓말
    prose is what made the pages run out of room, which in turn is what got content deleted
    (the user's words: 가독성을 챙기라했지 내용을 없애라고한건 아니었는데). One fact per line,
    noun-stop or 한다체. The only prose left is `whatItDoes`, which is the Notion callout
    verbatim. A line starting with `—` or `→` is a continuation of the one above it and
    renders without a second bullet glyph (`isContinuation` in `deck.tsx`).
  - **`핵심 성과` is a story, not a resume line.** Each item is a bold one-line claim plus
    **three** 개조식 lines that say what went wrong, what the cause turned out to be, and what
    the number became — `bullets` is `{title, lines: string[]}[]` for exactly that. Three is a
    page-budget, not a style choice: four lines overflows the 담당·성과 page in both formats
    (measured). The
    single-sentence version that preceded it (`판정 기준이 두 곳 중 한 곳에만 있던 것을 찾아
    제거 — 4회 연속 실패하던 16,846자 문서를 3분 54초에 성공`) was unreadable to anyone who had
    not done the work, and it left the bottom 40% of the page empty. Source material for the
    detail lines lives in the projects' own docs, not in the deck: `ajt-llm-wiki/ai/docs/findings/`
    and `ai/experiments/INDEX.md`, `monitoring-agent/docs/05-트러블슈팅.md` and
    `06-에이전트-성능-평가.md`, AgentHub's harness plans. Section labels on this page are 15pt,
    not 12pt — they sit above text that has to be read, so they are not captions.
  - **The deck reads like a web document, not like a Notion export — and deliberately keeps
    what Notion gets wrong.** Notion's fixed ~708px column and 16px body are the two reasons the
    author moved off it, so they are not copied: the measure stays wide and the body stays 20px
    (15pt). What carries over is only the surface — warm neutrals (`#37352F` ink, `#787774`
    secondary, `#E9E9E7` rules, `#F7F6F3` tint) instead of the cool zinc ramp, a soft tinted
    callout instead of a heavy black quote bar, round bullets instead of dashes, and inline code
    chips. Identifiers are wrapped in backticks in `data.tsx` and rendered by `Rich` in
    `deck.tsx` — never hand-style a `<code>` at a call site.
  - **The deck declares its own fonts, and that is a correctness fix, not a taste one.**
    The site's Inter is Latin-only and its Next-generated fallback is Latin-only too, so the
    Korean that makes up most of this deck had **no declared font at all**: macOS drew it in
    Apple SD Gothic Neo, Windows would draw it in 맑은 고딕, and different metrics move the line
    breaks that 44 pages of overflow-checking depend on. The exported PDF confirmed it, carrying
    ArialMT and Menlo and no Inter at all. `fonts.ts` now loads Pretendard (one variable file,
    400-700, covers Korean and Latin) and JetBrains Mono for the code chips, scoped to this
    route so the rest of the site is untouched. Verify with `d.fonts` and by grepping the PDF
    for the family name; `/BaseFont` alone misses fonts inside compressed object streams.
    - The twelve figures carry the same font. Each declares an `@font-face` for
      `/fonts/PretendardVariable.woff2` and puts it first in its own stack, so they match the
      deck when served and fall back to the old system stack when a file is opened directly.
      Their PNG exports are now rendered over `http://localhost:3000/portfolio/diagrams/...`
      (`DEXP_BASE`), because a `file://` render cannot fetch an absolute font URL and would
      bake the system font into the PNG while the page showed Pretendard.
    - Changing figure metrics means re-running the bordered-child overflow check **against the
      previous version**, not just against zero: these figures have long-standing overflows, so
      an absolute count proves nothing. Before and after were identical here (3/0/11/4/0/0/0/1/1),
      which is what made the swap safe.
  - **Surface conventions, settled once so they stop drifting.**
    - One accent: `#11845e` in the figures (a second green `#16875f` had crept into five of
      them). The deck body itself carries no accent.
    - Numbers are `tabular-nums`. Inter's proportional figures make `0.33 → 0.60` and
      `1954 → 1601ms` misalign across the arrow.
    - Headings get `text-balance`, body gets `text-pretty`.
    - No all-caps micro-labels. The figures' `01 · COLLECT & INDEX` numbering carried no
      information and is gone, and the phase labels are sentence case.
    - The cover's contact labels came back, in sentence case and inline before the value rather
      than in caps above it. Removing them entirely was too far: three bare strings in a row
      lose their boundaries, and `ohgnoy-digitalgarden.vercel.app` does not announce that it is
      a blog. The label was never the problem; setting it in caps, above the value, where it
      outranked the value, was.
    - The middle dot separates **like things** (`Prometheus · Loki · Grafana`) or joins a Korean
      compound (`조회·수정·병합·삭제`). Chaining unlike things with it
      (`개인 프로젝트 · 1인 · 풀스택 · DevOps`) is what reads as filler.
    - The em dash stays where it introduces an explanation mid-sentence, which is its job in
      Korean. As a `label — value` separator at the head of a line it became a colon.
    - `/portfolio-pdf` and `/a4` export `metadata` (title, description, `og:image` pointing at
      `public/portfolio/og-cover.png`, which is page 1 at 1280x720). This is a link that gets
      sent to people.
  - **Page count is never the constraint.** Fitting a target number of pages is what made the
    deck unreadable twice — once by shrinking type, once by deleting content. Content decides
    how many pages it takes; the only hard limits are the legibility floor (body 15pt) and
    zero overflow.
  - **Every project runs 개요 → 아키텍처 → 주요 업무 → 문제 해결 ①② → 사용 기술 · 구현 · 한계.**
    사용 기술 used to be its own page; once each reason was cut to one line the table was five
    rows and the page was half empty, so it moved to the head of the 구현·한계 page — all three
    answer 「무엇으로 만들었나」. `ProjectTechPage` is gone; `pageOf` counts 2 per project
    (개요 + 주요 업무) plus problems, detail pages and figures. Change that constant with the
    layout or the 목차 numbers drift, which they did.
    - **개요 introduces the service, not the author.** A one-line definition (`oneLiner`,
      from the project's own 시스템정의서 / 요구사항정의서), then 프로젝트 목적 (`purpose`),
      **주요 기능** (`features`, what the service does) and 기간 · 인원 (`teamMakeup`). No
      metrics and **no 담당**: the earlier version put 담당 역할 here and the page stopped being
      a project introduction and became a self-introduction, which is exactly the complaint it
      drew. 「주요 업무 및 담당 역할」 has its own page after the architecture figure.
    - **It is a flat list of things built, one line each**, in the plain form a portfolio uses:
      「vLLM 기반 고성능 모델 서빙 시스템 구축」. Not name-plus-description in two columns. That
      shape was tried and it failed twice over: the description column has to be filled with
      something, and what it got filled with was sentences lifted out of 문제 해결, so the page
      became a second achievements summary. One line per item leaves no room for that, and ten
      short items fill the page better than five long ones.
    - It is **not** redundant with the architecture figure. The figure marks *which blocks* and
      nothing else: not how far each block was built, and not the documents, reviews, tests,
      deployment or team decisions that have no block to draw. The figure is this page's
      illustration; the page is the text.
    - The 주요 기능 block is the one block with no label gutter. Giving 38mm to a label wraps
      almost every description to two lines on A4, and those five extra lines ate the entire
      bottom margin (measured: 34px).
    - **`purpose` comes from the project's own planning document and nowhere else**, recorded in
      `purposeSource` — a field that is **never printed**. A reader of the deck cannot open an
      internal spec, so the citation is clutter on the page; it exists only as the rule that if
      you cannot fill it in, you do not write the `purpose`. Same for `problems[].source`.
      A plausible problem statement is
      trivially inventable and one was in fact invented here before being caught — the deck is
      the one place where a made-up sentence survives into an interview. The sources are
      AJT `docs/requirements/요구사항정의서.md` 「1. 문서 목적」·「2. 프로젝트 개요」,
      AgentHub `agenthub-backend/docs/시스템정의서.md` 「2. 배경과 문제 정의」,
      and for `features`, the same documents' 「범위 포함」·「핵심 기능」·「주요 기능」 lists.
      **Take that list as it stands.** 근거 각주 was promoted to a top-level 주요 기능 here
      once; it is a property of 위키 자동 생성, not a feature, and it got promoted only because
      the deck's argument happens to be about evidence. The 개요 lists what the service does for
      its users, in the order and shape its own definition document uses.
      Other sources:
      관제 `monitoring-agent/docs/01-프로젝트-개요.md` 「배경 및 문제 인식」, and
      Leafy `API/readme.md` 「Project Overview (HCI Perspective)」. If a project has no such
      document, leave `purpose` empty rather than filling it.
    - **사용 기술 is one line per row, under 40 Korean characters, with the rejected
      alternative in parentheses** — 「권한·트랜잭션을 프레임워크가 강제 (Node는 직접 조립)」.
      Three-line arguments with cost and caveat were written and thrown away: a portfolio is
      read to decide whether to interview, not to withstand the interview. The long version
      belongs in interview prep.
    - **Argue from the design moment, not from the result.** 「부서 권한 집행과 트랜잭션을
      한곳에 모음」 is not a reason to pick Spring — that is the design that followed the pick,
      and Express would do it too. What was knowable when choosing is the reason. Same trap:
      「10단계 파이프라인이라 LangGraph」 — the step count is only known after the design.
    - **Never argue against your own choice on the page.** 「그만큼은 함수 나열로도 됐을
      구조」 was written into the LangGraph row. 한계 is about results, not about second-guessing
      a pick.
    - 대안 없는 행 is a smell. Half the rows had no rejected alternative and read as a report
      rather than a judgement. Every reason
      must be traceable to a project document or to the author himself — 관제 has
      `monitoring-agent/docs/02-기술-스택-선택-근거.md`, AgentHub has `agenttrace/docs/algorithm.md`
      plus its 의사결정 기록, and AJT's MySQL line comes out of `docs/db/erd.sql` (the ngram
      parser comment with its R@5 measurements) and the `JSON_TABLE` rejection in
      `docs/superpowers/specs/2026-07-30-wiki-space-relations-design.md`. AJT and Leafy have no
      stack-decision document at all; their reasons were dictated by the author and should not
      be reworded into something that sounds better than what he said.
      **Do not write a reason you cannot source.** Metric tiles and the
      stack/repo footer close this page, because by then the numbers have something to attach to.
    - `PROJECTS[].summary` no longer appears in the deck body — 담당 역할 says the same thing.
      The separate 담당 범위 page is gone too: its list and `contribution` were nearly the same
      words, so they are merged into the 개요 page's 담당 역할 block.
  - **On every page after 개요, the project name is a label and the section is the heading**
    (`SectionHeader`). A 40px project name with the section set 21px grey underneath it buries
    the one line that says what the page is, and the name repeats on every page anyway. The
    project's own title page — 개요 — is the single place that keeps the big `ProjectHeader`.
  - **문제 해결 is one problem per page** (`PROJECTS[].problems`, `ProjectProblemPage`), with the
    four headings 문제 / 원인 / 해결 / 결과 fixed. There is no
    line budget — that is the point of the format. The previous two-column
    「담당 범위 | 핵심 성과」 page held three problems at once, which capped each at three lines
    and is why it read like a résumé. If a page fills up, add a page.
  - **`scrollHeight` alone cannot see a full page.** `.deck-page` is `overflow-hidden`, so a
    page whose content runs into (or past) its bottom padding often reports zero. Check for
    **bleed** as well: any element whose bottom sits more than ~8px below the page's padding
    box. Adding that check immediately found the Skills page had been running to the paper's
    edge with no bottom margin, unnoticed for the whole life of the deck, plus three 개요 pages.
    Every "overflow 0" claim made before this check existed was measured with an instrument
    that could not see this class of fault.
  - **Never put `flex-1` on a page's content container** unless the bleed check is in place. A flex item absorbs its own overflow:
    the content silently draws on top of whatever follows (the 근거 footer, the metric tiles)
    and `scrollHeight` does not grow, so `deckcheck.sh` reports zero overflow on a visibly
    broken page. Let content take its natural height and push trailing elements down with
    `mt-auto`; then real overflow is both visible and detectable.
  - **Superseded ordering note —** A reader who does not
    yet know what the system is cannot use a metric or an achievement, so the first page is a
    callout of what it does — labelled 「프로젝트 개요」 on the page, from `whatItDoes`, whose
    text is the Notion 「시스템이 하는 일」 callout — with
    the metric tiles under it; the second is the architecture diagram full-page; the third names
    which blocks of that diagram are his (`ownership`, from the Notion 「주요 업무」) beside the
    outcomes. `PROJECTS[].summary` leads that third page — it is the paragraph that says what he
    owned, and it is easy to orphan when these pages get rearranged.
  - **구현 is 「무엇을 무슨 기술로」 — nothing else.** 「문서 파싱은 한 곳으로 모으고, 실패해도
    예외 대신 오류·품질 점수를 반환」 says neither what was built nor what it was built with.
    「문서 파싱 — PDF는 PyMuPDF, DOCX는 python-docx, XLSX는 openpyxl」 does. A line that names
    no technology is either already in 주요 업무 or belongs nowhere. Verify the dependency —
    `ai/pyproject.toml`, `vision_ocr_provider`, Leafy `API/readme.md` — rather than recalling it.
  - **The skill stars stay — a portfolio consultant asked for them.** Not a style call, and not
    up for re-litigation: the consultant reviewed this deck and wanted the ranking readable at a
    glance. This doc said the opposite for one day (`4b5690d` removed the stars, `ad2c24e` wrote
    the rule, `ff0581b` reverted the code 40 minutes later and left the rule behind) — that was
    the doc being wrong, not the code.
    Junior-portfolio guides do argue the other way, and the argument is real, so keep it on file
    rather than rediscovering it: a self-score cannot be checked by the reader, the tier
    definitions blur (4 「직접 구현하고 문제 원인까지 찾아 고쳐봄」 vs 5 「설계와 트러블슈팅을
    주도해봄」 are the same act in a one-person project), and every high mark is a place the
    interviewer will ask 「왜 4점인가」 — where the answer is just the `note` already printed
    beside it. Sources: velog @yoosion030 「신입 개발자의 포트폴리오 작성법」, velog @yukina1418
    「주니어 개발자 이력서 쓰는 법」, hiration.com/blog/skill-bars-resume. The ATS objection in
    those guides does *not* apply here — `Stars` prints `★`/`☆` characters with an
    `aria-label`, not a drawn bar. A claim that a 2022 ResumeGo experiment measured this is
    uncheckable; no such study is in their research index. Do not cite it.
    The consultant's goal is what to protect when editing this page: the levels must stay
    visibly apart. Right now only 4 and 3 are in use, so every row reads ★★★★☆ or ★★★☆☆ and
    the contrast is one star out of five. If that gets thinner, fix the contrast — do not
    inflate a level to manufacture it, which is what `ff0581b` did before the scores were put
    back. `SKILL_LEVEL_LEGEND` (in `data.tsx`) derives the legend from the levels actually
    used, so an unused tier no longer prints a line that explains nothing; `SKILL_LEVELS` keeps
    the 5-tier definition so raising a skill back to 5 needs no other edit.
  - **The cover lead is a claim about the work, not about character.** 「약점을 숨기지 않고
    정면으로 부딪힙니다」 sat in the first slot a recruiter reads. Attitude is asked about in
    the interview; the cover gets the strongest verifiable thing.
  - **Each project carries 「구현 상세 · 의사결정 · 한계」 pages** (`PROJECTS[].detail`, whose
    outer array is *pages* and inner array is sections; `ProjectDetailPage` renders one).
    AgentHub needs two. The source is the Notion project's own 「그 외 구현」·「의사결정
    기록」·「측정과 한계」 sections — the first thing a summary cuts and the last thing that
    should go, because the judgement calls and the stated limits are what separate this from a
    résumé. Two columns, no 52mm label gutter, for the same reason as the AI 활용 page: a
    narrower measure doubles the wraps.
    - **A4 bounds the layout; 16:9 is what you report.** `page.tsx` says it plainly — the deck
      is PowerPoint 16:9 and screen reading is its purpose. A4 is checked only to prove nothing
      overflows (it is the shorter column, so passing there passes both). Quoting A4 numbers as
      the result is a mistake that has already produced one wrong conclusion: the diagram
      legibility work looked worthless on A4, where the figures are width-bound, while on 16:9
      seven of nine are height-bound and gained directly.
    - **A4 is the binding format for fitting text, not 16:9** — it is ~12% shorter per column, so a page that
      fits the PPT deck can still spill. Budget is **~5 sections / 20 items of ≤ 45 characters**
      per page there.
    - Overflow here is **horizontal**: a section that does not fit starts a third column and
      runs off the right edge. Check `scrollWidth`, not just `scrollHeight`. `break-inside-avoid`
      means a tall section cannot split, so `column-fill: balance` gives up and spills it whole.
    - The page uses a **one-line header**, not `ProjectHeader`. Repeating the 40px project title
      on a continuation page cost about five rows per column, which is what forced the body to
      19px (14.25pt) — under the 15pt bar. Buy the space from the header, never from the type.
  - The architecture pages are chosen by `isArchitecture` on the image, not by matching
    '아키텍처' in the caption, and a project can have more than one (AgentHub's pipeline is
    1/2 + 2/2, and the halves reference each other as 앞 장/다음 장 — they have to stay
    adjacent and ahead of the 담당 page). Table-of-contents page numbers are computed while
    the deck is assembled (`3 + problems.length + detail.length + imagePages.length` per project) — never write them into the
    data.
  - **Diagram and capture pages follow the same header order as the rest, compressed to one
    line.** Project name small on the left, the caption as the page's title at 20px (15pt, the
    body floor), the note and period trailing. They do **not** get the 30px `SectionHeader`
    title: header height is subtracted from the space the figure gets, and the figure's height
    is literally the point size of the figure's own labels. `IMAGE_HEADER_H` is that subtraction
    (30 → 39 when the caption went to 20px) and it is measured, not guessed — after changing it,
    re-run `deckcheck.sh` and read `diagram_min_pt`, which sits at ~8.9pt with no headroom.
  - **Shortening a diagram is how its labels get bigger.** The figure is scaled by
    `min(availW/canvasW, availH/canvasH)` and that scale multiplies the figure's own font sizes.
    On 16:9 seven of the nine figures are height-bound, so removing a title band and lifting the
    content raises their point size one-for-one. Three are done (ajt-architecture 8.90 → 9.71pt,
    agenthub-analysis-pipeline and -evidence-verification 8.90 → 9.56pt). The two width-bound
    ones (ajt-deployment-pipeline, homeserver-infrastructure) cannot be helped this way and are
    already the largest at 10.58pt. All seven are done; the deck's diagram floor is now 9.56pt.
    - **Look at the render, every time.** Two of these edits broke something the vault tests
      happily passed: the arrowhead vector table `[[-14,-7],[0,0],[-14,7]]` got shifted along
      with the connector coordinates (arrows then pointed 140px off), and an export silently
      came out at the 1000x576 default window size. Neither is visible in a diff or a test
      result; both are obvious in the PNG.
    - **Do not guess which rules are top-level.** `.request { top: 92px }` is a coordinate
      inside a group, not on the canvas; shifting it along with its group doubles the move.
      Name the selectors to shift explicitly.
    - **Coordinates may live in more than one place.** llm-wiki/system-architecture caches
      absolute geometry in `data-box` / `data-rect` for its tests, and its connectors are
      hard-coded points. agenttrace's two compute connectors from the DOM, so those follow by
      themselves. Check which kind you have before lifting anything.
    - Re-export at **2x** and read the canvas size from the `.diagram` rule, not from
      `<canvas>` — some files use `class="connectors"` and others `id="connectors"`, and
      guessing wrong silently exports at the 1000x576 default window size.
    - The vault's own tests are the gate: `node --test tooling/tests/<diagram>.test.mjs`.
  - **Screenshot pages are framed, not bled.** A diagram can run to the page edge because its
    canvas carries internal margins; an app capture ends at a viewport boundary, so bleeding it
    makes that boundary read as a page that got cut off. Captures keep the page padding and
    their border. Their own UI text is the same `k` problem in raster form — a 1440-CSS-px
    capture only reaches ~9pt when it spans the full page width, which needs an aspect of
    ~1.9:1, so `agenthub-screen-trending.png` is cropped at a **card gap** (verified as
    background rows across the full width — cutting inside a card slices it visibly).
    `ajt-screen-wiki-detail.png` sits in a 50/50 split page, where the prose is the substance
    and the capture is context; it is cropped to the one card its caption is about so its UI
    text reaches ~8pt, and it cannot be enlarged without taking width back from the prose.
    Two of its graph node labels are clipped in the capture — that clip is the app's own, not
    the crop's, and no crop can recover them.
  - **A capture page's bottom margin is enforced, not incidental.** `object-contain` alone
    leaves no visible margin when a capture's aspect happens to match the page's, and the
    capture then reads as clipped by the page rather than by its own scroll. The non-vector
    branch carries `pb-[3mm]` for that.
  - **The image page header must stay one line.** `fitScale` subtracts a constant
    `IMAGE_HEADER_H`, so a header that wraps pushes the diagram past the page bottom. The
    note therefore renders with `truncate` (an ellipsis is a visible defect; a bled diagram is
    an invisible one) — but the real fix is a shorter `note`, not the ellipsis.
  - **Diagram content overflowing its box is invisible in review and easy to check.** A box that
    centres text with `word-break: keep-all` overflows symmetrically and never scrolls, so
    `scrollWidth` does not catch it. Two passes, run with headless Chrome + `--dump-dom`:
    a `Range` over each box's own text nodes against the box's content edges catches
    *horizontal* overflow (vertically it has a 6-8px noise floor, because glyph rects overshoot
    their line box); and each **bordered or filled child's** border box against its parent
    card's content box catches the vertical case with no noise at all — that is what found the
    clipped rule box and the three `.measured` chips. The only legitimate hits are the corner
    `.tag` badges, which sit on the border by design. When a card has to grow, the space comes
    out of the same group (an over-tall neighbour, or a footnote the figure already says
    elsewhere) — never out of the canvas height, which is pinned by the 9pt floor.
  - **Where its images come from.** `public/portfolio/*.png` are copies at their original
    export resolution, cropped only at the bottom where noted above (do **not** resize them — downscaling made the labels blurrier *and* the
    files bigger, because anti-aliased edges compress worse than flat colour). The canonical
    originals live **outside this repo**, in the owner's Obsidian vault at
    `Applications/_base/portfolio-diagrams/`: `projects/<project>/exports/<name>.png` for
    diagrams (per that workspace's README, `exports/` is the canonical set and `references/`
    is a do-not-overwrite baseline) and `projects/<project>/screens/` for app captures.
    Diagram edit sources are the sibling `diagrams/<name>.html`, so text baked into a diagram
    is changed there and re-exported — not by editing the PNG. Do **not** re-download these
    from Notion: Notion holds only part of the set, and two diagrams are 1/2+2/2 pairs whose
    halves were uploaded separately. Project → file mapping is in the vault README's
    "Asset mapping" table.
  - **`public/portfolio/diagrams/*.html` is a second consumer of those vault sources.** It is a
    plain copy of `projects/<project>/diagrams/<name>.html`, kept here because the iframe needs
    a same-origin URL. Changing a diagram means three steps, in order: edit the vault source,
    re-run `node --test tooling/tests/*.test.mjs` there (67 geometry/content regressions,
    including that the `<canvas>` bitmap matches its layout box), re-export the
    `exports/<name>.png`, then copy the HTML here. A copy that drifts from the vault shows up
    as a deck page that disagrees with the Notion embed.

A page opts out by giving its root element a unique `id` and adding rules to `globals.css` targeting `body:has(#that-id)` that hide `SiteShell`'s sidebar/frame chrome (see `.site-shell-sidebar`, `.site-shell-grid`, `.site-shell-main`, `.site-shell-pagebg` rules in `globals.css`) and let the page's own layout take over the full page. If a new page needs the same treatment, follow this pattern — don't invent a different mechanism.

The home page (`src/app/page.tsx`) does NOT opt out — it renders inside `SiteShell` like any other route, contributing only its own TRAINER DATA/MAIN MENU/dialog panel content; the pixel-art frame/sidebar/boot-screen chrome around it is `SiteShell`'s, not the home page's own.

## Design docs

- `docs/design/pixel-pokedex-home.md` — the home page's dedicated dark pixel-art design system (colors, the border-image pixel-frame technique, typography rules). Read this before touching `src/app/page.tsx` or `pokedex-home.module.css`.
- `docs/known-issues.md` — things discovered to be broken/incomplete that aren't fixed yet; check before building on top of `_posts` or `/studys`.
