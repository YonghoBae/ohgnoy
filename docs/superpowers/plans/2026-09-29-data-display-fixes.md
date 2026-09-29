# Data display fixes — implementation plan

Follows a review (2026-09-29) of where the UI shows API data as-is, wrong, or
in a form a Korean user can't read. Findings were verified in the built app;
the numbers below are real.

## Global Constraints

- Verification: `npx tsc --noEmit` must pass. Do NOT run `npm run build`,
  `npm start` or any server — the controller builds and checks in a browser.
- No new npm dependencies. Do not prettier whole files; match formatting.
- Only touch the files a task lists (new files only where a task says so).
- Pixel theme on / and /pokemon/*: no border-radius / clip-path staircases;
  reuse `src/app/_components/ui/pixel/*`; `PixelSprite` for sprites.
- UI copy is Korean; `…` not `...`. Keep community proper nouns (OU, Ubers,
  VGC, Smogon, Showdown), HP/PP/Lv, and the home page's game chrome
  (TRAINER DATA, MAIN MENU, PARTNER) in English.
- Showdown export text must stay valid English Showdown syntax.
- Keep request shapes to external APIs unchanged unless the task says so.
- One commit per task, `<type>(<scope>): <summary>` + body, last line
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

### Task 1: Battle data correctness

Files: `src/types/pokemon/battle.ts`, `src/lib/battle/fetchers/fetchUsageStats.ts`,
`src/lib/battle/constants.ts`, `src/lib/battle/typeChart.ts`,
`src/app/pokemon/[id]/_components/BattleTab.tsx`.

1. Crash: the 실전 데이터 tab throws "object is not iterable" for every
   Pokémon with counters (e.g. /pokemon/445, /pokemon/149) because Smogon's
   chaos "Checks and Counters" values are now `{ n, p, d }` objects, not
   `[n, p, d]` arrays. Normalize in `loadUsageStats` to `{ n, p, d }`
   (accept both shapes), update the `counters` type, and in BattleTab rank
   counters by `p - 4 * d` (Smogon's score), show the top 5 with the bar and
   text as `p` in percent labelled so a user understands it (e.g.
   "상대 확률"), and an empty state "카운터 데이터가 없습니다." when there are
   none.
2. Percentages: moves/items/abilities/teraTypes/teammates/spreads are
   weighted counts but are shown with "%" (charizard ability "108.6%",
   others "56071.6%"). In `loadUsageStats`, convert each to a percent of the
   Pokémon's weighted total `sum(Abilities)` (charizard solarpower → 78.1%).
   Drop the empty/"nothing" item and "" move entries.
3. Usage rate is ~2× Smogon's: `rawCount / battles` counts one per battle
   but a battle has two teams (Great Tusk 60.20% vs published 33.92%). Use
   the chaos `usage` field × 100 (`raw.usage`), falling back to
   `rawCount / (2 * battles)` when absent.
4. Formats: at 2026-08 the cutoff 1695 is not published for gen9ubers,
   gen8ou, gen7ou (published: 0/1500/1630/1760) and gen9vgc2024regg no longer
   exists. Set those three to 1630 and replace the VGC entry with
   `gen9championsvgc2026regmb` (label "VGC 2026 (M-B)", gen 9, cutoff 1630).
5. `typeChart.ts`: several rows are wrong (the steel row mixes in steel's
   defensive chart, flying→ground 0, ghost→fighting 0, fairy→bug 0.5).
   Replace the table with the standard Gen 6+ attacking→defending chart
   (18 types). Keep the exported names/shapes.

### Task 2: Korean names for battle data

Files: new `scripts/build-ko-names.mjs`, new `src/lib/battle/koNames.json`,
new `src/lib/battle/koNames.ts`, `src/lib/battle/fetchers/fetchBattleData.ts`,
`src/types/pokemon/battle.ts`, `src/app/pokemon/[id]/_components/BattleTab.tsx`,
`src/app/pokemon/builder/_components/PokemonPicker.tsx`,
`src/app/pokemon/builder/_components/TeamBuilder.tsx`.

1. `scripts/build-ko-names.mjs` (plain Node ≥18, no deps): query
   `https://beta.pokeapi.co/graphql/v1beta` (language_id 3 = ko) for items,
   moves, abilities, natures, types, and every pokemon (slug + species ko
   name + form ko `form_names`/`names`), and write `src/lib/battle/koNames.json`:
   `{ items, moves, abilities, natures, types: { [toID]: ko }, pokemon:
   { [toID]: { slug, ko } } }` where `toID(s) = s.toLowerCase().replace(/[^a-z0-9]/g, "")`.
   Pokémon ko is the form's own name when it has one ("메가리자몽X"), else
   "{species ko} ({form ko})" when a form name exists, else the species ko.
   Add aliases so Smogon names resolve: Smogon uses e.g. "Ogerpon-Wellspring"
   (PokeAPI slug `ogerpon-wellspring-mask`) and base names like "Landorus"
   (slug `landorus-incarnate`) — also key each pokemon by its slug with one
   trailing form word removed when that key is otherwise unused, and key the
   default variety by its species name. Print how many of the current
   gen9ou chaos file's Pokémon names resolve. Run it and commit the JSON.
   Document the regeneration command at the top of the script.
2. `koNames.ts`: `toID`, and `koLabel(kind, nameOrId)` returning the Korean
   name or the input unchanged, plus `koPokemon(smogonName)` returning
   `{ slug, ko } | null`. Server-side only (don't import the JSON from client
   components).
3. `fetchBattleData.ts`: attach `labels: Record<string, string>` to
   `PokemonBattleData` — for every move/item/ability/tera/nature/teammate/
   counter name present in this Pokémon's usage and sets, map `toID(name)`
   → Korean. Keep the original English values in the data (the Showdown
   export needs them).
4. BattleTab: render `labels[toID(x)] ?? x` everywhere a move/item/ability/
   tera type/nature/Pokémon name is shown (TopList, spreads' nature, set
   cards, teammates, counters); remove `translate="no"` from translated
   text; render tera types as `TypeBadge`s where a type matches. Spread text
   "Jolly 공격 252 / …" → "{성격 ko} · 공격 252 / …".
5. Builder: PokemonPicker fetches sets from `/api/pokemon/battle?name=…&format=…`
   (not data.pkmn.cc in the browser), shows set moves/items in Korean via
   `labels`, and stores the English set for export plus the labels for
   display; TeamBuilder shows the Korean set move/item text. TeamExport stays
   English.

### Task 3: Pokémon form names everywhere

Files: `src/lib/pokemon/i18n.ts`, `src/app/pokemon/compare/page.tsx`,
`src/app/pokemon/[id]/_components/PokemonHeader.tsx`, `src/app/pokemon/[id]/page.tsx`,
`src/lib/pokemon/transformers/toPokemonDetail.ts`, `src/types/pokemon/domain.ts`,
`src/app/pokemon/meta/_components/UsageRankingTable.tsx`,
`src/app/pokemon/builder/_components/PokemonPicker.tsx`,
`src/app/pokemon/list/_components/PokemonGrid.tsx`,
`src/app/pokemon/list/_components/CompareTray.tsx`,
`src/app/pokemon/builder/_components/TeamBuilder.tsx`, new
`src/app/api/pokemon/names/route.ts` if needed.

1. Move the compare page's form-name logic into `i18n.ts` as a shared helper
   (species ko name, or the form's ko name for non-default varieties) and use
   it on the compare page.
2. Detail header: for forms show the form's Korean name ("메가리자몽X"), the
   English display name instead of an uppercased slug ("Charizard" /
   "Mega Charizard X" from PokeAPI en names, not "CHARIZARD-MEGA-X"), and the
   national dex number of the species ("#0006"), not the form id.
3. Meta ranking rows: resolve Smogon names through `koPokemon()` (Task 2) to
   the PokeAPI slug (fixes Ogerpon-Wellspring / Enamorus / Landorus rows with
   no sprite or link) and the Korean name (fixes "Slowking-Galar
   Slowking-Galar"); fetch species via `species.url`, never `pokemon.id`.
4. Builder picker: result rows show the Korean (form) name and the English
   display name, not the raw slug; sprite `alt=""`; TeamBuilder slot sprite
   alt = the Korean name.
5. List search results from other generations and forms, and the compare
   tray: show Korean names (e.g. via a small `GET /api/pokemon/names?slugs=`
   route backed by `koNames.json`, or another server-side lookup — don't ship
   the whole JSON to the client).

### Task 4: Evolution conditions and detail leftovers

Files: `src/app/pokemon/[id]/_components/EvolutionChain.tsx`,
`src/lib/pokemon/transformers/toEvolutionChain.ts`, `src/types/pokemon/domain.ts`,
`src/app/_components/TypeBadge.tsx`, `src/lib/pokemon/i18n.ts`,
`src/app/pokemon/compare/page.tsx`.

1. Evolution conditions: show every condition in `evolution_details` in
   Korean — item via `koNames` items ("천둥의돌", not "Thunder-Stone"),
   trigger (레벨업 / 통신교환 / 도구 사용 / …), min_level ("Lv.36"),
   min_happiness ("친밀도"), time_of_day ("낮"/"밤"), known_move_type
   ("{타입} 타입 기술을 배운 상태"), held_item, location/other conditions as a
   short generic phrase. Eevee's branches must each show a condition. Keep the
   layout; long conditions wrap under the sprite.
2. TypeBadge: add `stellar` ("스텔라", a neutral multi-tone color that passes
   contrast with the badge's white text + shadow style).
3. i18n: Korean fallbacks for missing flavor text/genus ("도감 설명이 없습니다.").
4. Compare page: use the same stat labels and number format as the detail
   page (특공/특방, "#0006").

### Task 5: Site-level polish

Files: new `src/app/not-found.tsx`, new `src/app/error.tsx`,
`src/lib/constants.ts`, `src/app/layout.tsx`, `src/app/pokemon/**/page.tsx`
(metadata only), `src/app/_components/SiteShell.tsx`,
`src/app/pokemon/meta/_components/FormatSelector.tsx`,
`src/app/pokemon/meta/page.tsx`, `src/app/studys/create/page.tsx`.

1. Korean 404 and error pages inside the site shell (pixel look, links to
   홈 and 포켓몬 도감; error page has a 다시 시도 button calling `reset()`).
2. Titles: `generateMetadata`/`metadata` per route — "포켓몬 도감 | Ohgnoy",
   "메타 분석 | Ohgnoy", "팀 빌더 | Ohgnoy", "포켓몬 비교 | Ohgnoy", and the
   detail page "{한국어 이름} | Ohgnoy".
3. OG image: `HOME_OG_IMAGE_URL` is the Next.js blog-starter template card —
   remove it from the metadata (no image beats a wrong one).
4. Sidebar sub-nav labels in Korean (도감 / 메타 / 빌더).
5. Meta: month buttons "2026년 8월" (Intl), "최신" shows the resolved month
   ("최신 (2026년 8월)"); "컷오프 1695+" → "레이팅 1695 이상".
6. `/studys/create`: a Korean "준비 중" page like /auth/forgot.

### Task 6: Robustness for backend data

Files: `src/app/_components/ChatWidget.tsx`, `src/app/chat/user/page.tsx`,
`src/lib/api/chat.ts`, `src/app/posts/create/page.tsx`.

1. Chat timestamps: guard `new Date(x)` — invalid dates render no time instead
   of throwing (`toISOString` on Invalid Date throws). Accept ISO strings,
   epoch numbers and Spring's array form `[y, m, d, h, min, s]`.
2. `chatApi.getHistory`: return `[]` when the response has no array `data`.
3. posts/create: map known backend codes to Korean messages with a next step
   (401/403-like → 다시 로그인; validation → 제목·요약 확인), generic Korean
   fallback — never show the English server message verbatim.
