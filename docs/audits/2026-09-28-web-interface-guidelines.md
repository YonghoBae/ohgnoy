# Web Interface Guidelines 감사 — 2026-09-28

- 기준: [Vercel Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md) (2026-09-28에 받은 버전)
- 대상 커밋: `c6622e6`
- 방법: 코드 정적 리뷰 (영역별 4갈래 병렬). 화면 스크린샷 검증은 하지 않았다.
- 범위: `src/app/**`, `src/hooks/**`, `tailwind.config.ts`. 알려진 죽은 코드 `src/app/_components/pokemonCard.tsx`는 제외.
- 프로젝트 예외: 픽셀 테마의 각진 모서리·`image-rendering: pixelated`·border-image 프레임, `body:has(#id)` 레이아웃 opt-out은 의도된 것이라 지적하지 않았다. UI 문구가 한국어라 Title Case 등 영어 문구 규칙은 적용하지 않았다.
- 심각도: **[H]** 실제로 막히거나 깨짐 · **[M]** 중간 · **[L]** 다듬기
- ✔ 표시는 요약 작성 시 코드를 직접 열어 재확인한 항목.

## 요약

### 🔴 High

1. **키보드로 못 쓰는 컨트롤**
   - 포켓몬 카드 좋아요·비교가 `<svg role="button">` — 포커스는 가지만 Enter/Space 무반응 ✔ (`PokemonCard.tsx:37-61`)
   - 카드 상세 이동이 `router.push` 버튼이라 Cmd+클릭 불가 ✔ (`PokemonCard.tsx:66-72`)
   - 포트폴리오 미디어 확대 트리거에 `tabIndex` 없음 ✔ (`morphing-dialog.tsx:117`)
   - 빌더 모달(`PokemonPicker`, `TeamExport`)에 dialog role·Escape·포커스 트랩 없음, ✕ 버튼 라벨 없음
2. **포커스 링 없음**
   - 테마 토글 `all: unset` ✔ (`switch.module.css:2`)
   - 세대 필터 `outline-none ring-0`, 현재 값·접근성 이름도 없음 ✔ (`GenerationFilter.tsx:24`)
   - 포켓몬 섹션 토글·탭·링크 대부분, 채팅 입력
   - 근본 원인: tailwind에 공용 포커스 스타일이 없어 컴포넌트마다 제각각
3. **한글 IME Enter 버그** — `isComposing` 체크가 코드베이스에 0건 ✔. ChatWidget, `/chat/user`, `/chat/bot`에서 조합 중 Enter 시 중복 전송 또는 마지막 글자 잔류.
4. **명도 대비 부족** (계산값, 실측 필요)
   - 다크 모드 `bg-primary`(#88C0D0) + 흰 글씨 ≈ 2.0:1 — PixelButton, ChatWidget 헤더·말풍선
   - TypeBadge 풀·페어리·벌레·노말 등 흰 글씨 2.1~2.6:1
5. **조용히 실패하는 기능**
   - 빌더 검색: 폼 slug 하나가 404 → `Promise.all` 전체 실패 → "charizard"/"pika" 결과 0건 ✔ (`PokemonPicker.tsx:79`)
   - `/chat/bot`: 입력 텍스트를 버리고 빈 요청 전송 ✔ (`bot/page.tsx:34`)
   - 회원가입: 비밀번호 확인 비교 안 함 ✔, 인증 없이 가입 가능, 인증번호를 브라우저에서 비교
   - 로그인·가입·글쓰기: pending 상태 없음, 실패가 `console.error`로만

### 🟡 Medium (공통 패턴)

- `prefers-reduced-motion` 대응 0건 ✔. 활성 메뉴 커서·홈 대화창 커서가 모든 페이지에서 무한 깜빡임, 포트폴리오 blur 진입·자동재생 영상.
- 스킵 링크 없음. auth·portfolio·studys에 h1 없음, 포켓몬 목록은 카드마다 h1(150개 이상).
- URL에 상태 없음: 목록 검색어, 상세 탭, 배틀 포맷. 빌더 팀은 새로고침 시 소실.
- 검색 디바운스·abort 없음(목록·빌더), 결과 없음 안내 없음.
- 다크 모드 `color-scheme` 없음, `theme-color` `#000` 고정.
- 모바일: 640px 이하에서 사이드바 전체가 본문 위에 쌓임. ChatWidget이 320px·낮은 화면에서 잘림.
- 채팅 3곳 모두 `aria-live` 없음.
- `/portfolio` 영상 1개·아키텍처 이미지 3개가 `public/`에 없음(404).

### ⚪ 참고

- 죽은 코드: `ui/profile.tsx`(964줄), `ui/text-loop.tsx`, `ui/text-morph.tsx`, `ui/scroll-progress.tsx`, `hero-post.tsx`, `section-separator.tsx`, `alert.tsx`(import만 있고 렌더 안 함), `header.tsx`(동일)
- 동작하지 않는 기능: 비교 버튼(비교 화면이 없음), `/auth/forgot`, `/studys/create`(빈 페이지)
- 템플릿 문구 잔재: 로그인 "Start a 14 day free trial", 게시글 제목 "Next.js Blog Example"
- 포켓몬 섹션 곳곳의 `rounded-full`/`rounded-xl` — 픽셀 스펙 위반

### 미검증

- 명도 대비 수치와 빌더 슬롯 높이 넘침(`TeamBuilder.tsx:47`)은 코드·산술 추정. 고치기 전에 스크린샷/실측으로 확인할 것.

### 권장 순서

1. 공용 포커스 스타일 + 전역 reduced-motion — 몇 줄로 전체 사이트에 효과
2. IME 버그 3곳
3. 대비 (TypeBadge, primary 버튼)
4. PokemonCard·빌더 모달 키보드 접근성
5. 폼 피드백, Picker 검색 버그

---

## 파일별 지적

### 셸 · 홈 · 공통

#### src/app/layout.tsx

- src/app/layout.tsx:39 [M] - `<html>` has no `color-scheme`. Theme is a `.dark` class toggle, so scrollbars and native controls stay light. Add `color-scheme: dark` under `.dark` (globals.css:24)
- src/app/layout.tsx:74 [L] - `theme-color` hardcoded `#000`; real bg is `--px-panel-2` (#D8DEE9 light / #1e2e3d dark). Use two metas with `media="(prefers-color-scheme: …)"`
- src/app/layout.tsx:87 [M] - no skip link. About 13 focusable sidebar items come before `<main>` on every page; `<main>` (SiteShell.tsx:167) has no `id` to target
- src/app/layout.tsx:17 [L] - Inter loaded latin-only while copy is Korean; the shell then overrides with fonts that are never loaded (site-shell.module.css:26)
- src/app/layout.tsx:22 [L] - typo "블로그그" in meta description

#### src/app/globals.css

- src/app/globals.css:24 [M] - `.dark` missing `color-scheme: dark`
- src/app/globals.css:1 [M] - no global `@media (prefers-reduced-motion: reduce)`. All infinite loops run: nav cursor, dialog cursor, unread-badge pulse, theme-switch rotate, boot bar
- src/app/globals.css:1 [L] - no `touch-action: manipulation` / intentional `-webkit-tap-highlight-color`

#### src/app/_components/SiteShell.tsx

- src/app/_components/SiteShell.tsx:80 [M] - `▶` cursor glyph not `aria-hidden`; every nav link reads "black right-pointing triangle 포켓몬 도구"
- src/app/_components/SiteShell.tsx:81 [L] - react-icons `<Icon>` not `aria-hidden` (also :133, :143, :148, :153)
- src/app/_components/SiteShell.tsx:62 [M] - at ≤640px the whole sidebar (logo, 5 nav items, icon row, 88px sprite panel) stacks full-width above `<main>`; no collapse or drawer, so content starts about a screen down on phones
- src/app/_components/SiteShell.tsx:131-155 [M] - hover highlight is on the inner `PixelIconBox` span, not the focused `<a>`; keyboard focus gets only the UA outline
- src/app/_components/SiteShell.tsx:105,118 [L] - on /pokemon/meta both parent and sub-link have `aria-current="page"`; use `aria-current="true"` (or none) on the parent
- src/app/_components/SiteShell.tsx:44-46 [L] - sub-nav labels "List/Meta/Builder" are English; parents are Korean
- src/app/_components/SiteShell.tsx:88-96,131,136 [L] - new-tab links (블로그, GitHub, 디지털가든) have no visual/SR cue
- src/app/_components/SiteShell.tsx:71 [L] - brand `OHGNOY` needs `translate="no"` (also page.tsx:58)
- src/app/_components/SiteShell.tsx:151 [L] - "로그인" link shows regardless of auth state

#### src/app/_components/site-shell.module.css

- src/app/_components/site-shell.module.css:151-153 [M] - `.navItemActive .navCursor` blinks forever; an active item exists on every non-home page, with no pause or reduced-motion variant (WCAG 2.2.2)
- src/app/_components/site-shell.module.css:303 [M] - `.dialogCursor` (encounter overlay) infinite, no reduced-motion
- src/app/_components/site-shell.module.css:162-168 [M] - `.subNavItem` 12px text + 4px padding ≈ 20px tall, below the 24px target minimum (WCAG 2.5.8)
- src/app/_components/site-shell.module.css:26 [L] - `"IBM Plex Mono", "Pretendard"` are not loaded anywhere; Korean falls back to system monospace
- src/app/_components/site-shell.module.css:267-271 [L] - `bootFill` animates `width` → `transform: scaleX()` + `transform-origin: left`
- src/app/_components/site-shell.module.css:232 [L] - 300ms fade, but BootScreen unmounts at 200ms (BootScreen.tsx:8), so the fade is cut off

#### src/app/page.tsx

- src/app/page.tsx:44-47 [M] - NeoDunggeunmo stylesheet is a raw `<link>` in body: no preconnect/preload, not hoisted to `<head>`, `/` only → FOUT/CLS on headings. Move to `next/font/local`, or at least preconnect cdn.jsdelivr.net
- src/app/page.tsx:50,89 [M] - panel titles "TRAINER DATA"/"MAIN MENU" are `<div>`s; one h1 with nothing below it, and the `<section>`s are unnamed → `<h2>` + `aria-labelledby`
- src/app/page.tsx:94,97 [M] - tile index "01" and `▸` not `aria-hidden`; link name becomes "01 포켓몬 도구 포켓몬 도감, 메타 분석, 팀 빌더 ▸"
- src/app/page.tsx:122 [L] - `▼` dialog cursor not `aria-hidden`
- src/app/page.tsx:70,79,82 [L] - icon SVGs not `aria-hidden`
- src/app/page.tsx:101-110 [L] - external "블로그" tile looks identical to the internal ones, no new-tab cue

#### src/app/_components/pokedex-home.module.css

- src/app/_components/pokedex-home.module.css:184-187 [M] - `.dialogCursor` blinks infinitely, no reduced-motion
- src/app/_components/pokedex-home.module.css:124-127 [M] - dark mode tile focus outline (#4c7fc0, inset) on `--px-active` #2a4560 ≈ 2.4:1; focus indicators need ≥ 3:1
- src/app/_components/pokedex-home.module.css:7 [L] - `border-bottom: 1.5px` sub-pixel border anti-aliases at 1x → 1px or 2px
- src/app/_components/pokedex-home.module.css:9,49,139 [L] - NeoDunggeunmo has no metric-matched fallback (`size-adjust`), so text reflows on swap

#### src/app/_components/BootScreen.tsx

- src/app/_components/BootScreen.tsx:14,32 [L] - initial `"pending"` phase renders null, so SSR content paints and is then covered by the overlay (reads as a flash)
- src/app/_components/BootScreen.tsx:17,21 [L] - unguarded `sessionStorage`; throws when storage is blocked, and it sits in the root layout client tree → wrap in try/catch
- src/app/_components/BootScreen.tsx:24 [L] - 700ms full-screen overlay has no reduced-motion skip

#### src/app/_components/ChatWidget.tsx

- src/app/_components/ChatWidget.tsx:211 [H] - Enter sends during IME composition ✔ → `if (e.nativeEvent.isComposing) return;`
- src/app/_components/ChatWidget.tsx:147,190,219,232 [H] - dark mode `bg-primary` #88C0D0 + `text-white` ≈ 2.0:1 (header, own bubbles, button icons). Light mode (#5E81AC) ≈ 4.0:1, still < 4.5 for text-sm
- src/app/_components/ChatWidget.tsx:144-145 [M] - fixed `w-80` + `right-4` overflows at 320px; 28rem + `bottom-20` = 528px cuts off header/close on short or landscape viewports → `max-w-[calc(100vw-2rem)]`, `max-h-[calc(100dvh-6rem)]`
- src/app/_components/ChatWidget.tsx:143 [M] - popup has no `role="dialog"`/`aria-label`, no Escape, no focus return to the toggle
- src/app/_components/ChatWidget.tsx:230-231 [M] - toggle has no `aria-expanded`/`aria-controls`; unread count (:243-246) is not in the label and not live
- src/app/_components/ChatWidget.tsx:165 [M] - message list has no `role="log"`/`aria-live="polite"`
- src/app/_components/ChatWidget.tsx:122,216 [M] - Send stays enabled while disconnected and silently does nothing; no connection status; history fetch error swallowed (:49)
- src/app/_components/ChatWidget.tsx:165-203 [L] - no empty state
- src/app/_components/ChatWidget.tsx:212 [L] - `"메시지 입력..."` → `"메시지 입력…"`; input lacks `name`, `autoComplete="off"`
- src/app/_components/ChatWidget.tsx:157,219 [L] - close and send buttons have no focus-visible style (input's `focus:ring-2` is tolerable)
- src/app/_components/ChatWidget.tsx:197 [L] - hardcoded date-fns `"HH:mm"`; history from earlier days shows only a time → `Intl.DateTimeFormat`
- src/app/_components/ChatWidget.tsx:232 [L] - `transition-all`; `hover:scale-110` and `animate-pulse` (:244) have no reduced-motion variant
- src/app/_components/ChatWidget.tsx:149,159,221,235,239 [L] - SVGs not `aria-hidden`
- src/app/_components/ChatWidget.tsx:229-232 [L] - fixed FAB ignores `env(safe-area-inset-*)`, can cover focused content bottom-right
- src/app/_components/ChatWidget.tsx:41 [L] - auto-focuses input on open (pops the mobile keyboard)
- src/app/_components/ChatWidget.tsx:144 [L] - rounded Nord styling floating over pixel pages (visual inconsistency)

#### src/app/_components/ui/pixel/

- src/app/_components/ui/pixel/pixel-theme.module.css:19 [M] - dark `--px-text-muted` #7e93a8 on `--px-panel-2` #1e2e3d ≈ 4.4:1, under 4.5 for the 12–14px text using it (menuTileDesc, panelHeader, subNavItem)
- src/app/_components/ui/pixel/PixelButton.tsx:23 [H] - `bg-primary text-white` ≈ 2.0:1 dark / 4.0:1 light for text-sm
- src/app/_components/ui/pixel/PixelButton.tsx:22-23 [L] - primary variant has no hover state; `active:translate` has no reduced-motion variant
- src/app/_components/ui/pixel/PixelButton.tsx:16 [L] - no `type="button"` default; submits when inside a `<form>`
- src/app/_components/ui/pixel/PixelIconBox.tsx:17 [M] - hover-only styles; focus lands on the parent `<a>` → `group-focus-visible:` equivalents
- src/app/_components/ui/pixel/PixelSprite.tsx:28 [L] - returns null without a sprite URL; slot collapses, grids jump
- src/app/_components/ui/pixel/PixelSprite.tsx:32-39 [M] - `fill` without `sizes` → next/image assumes 100vw and serves viewport-wide variants for 40–224px boxes (meta rows, picker results, evolution nodes)
- src/app/_components/ui/pixel/PixelCard.tsx - ✓ pass

#### src/app/_components/TypeBadge.tsx

- src/app/_components/TypeBadge.tsx:25-42 [H] - white 10–12px text fails contrast: grass #78C850 2.1:1, fairy #EE99AC 2.1:1, bug ~2.2:1, normal ~2.4:1, fire/rock/flying ~2.6:1, water/psychic ~3:1 → `text-neutral-900` as electric/ice/ground/steel already use
- src/app/_components/TypeBadge.tsx:55 [L] - `uppercase`, `tracking-wide`, `font-mono-pixel` (Space Mono, latin-only) do nothing or harm on Korean labels

#### src/app/_components/EncounterLink.tsx

- src/app/_components/EncounterLink.tsx:59-61,66 [M] - raw `<a>` + `router.push` loses `next/link` prefetch, so every navigation is slower (which is why the overlay shows) → wrap `<Link>` or `router.prefetch`
- src/app/_components/EncounterLink.tsx:72 [L] - "이동 중" → "이동 중…"
- src/app/_components/EncounterLink.tsx:57 [L] - a `target` passed via `...rest` is silently ignored because of `preventDefault`

#### src/app/_components/theme-switcher.tsx / switch.module.css

- src/app/_components/switch.module.css:2 [H] - `all: unset` removes the focus outline and there is no `:focus-visible` rule ✔
- src/app/_components/switch.module.css:15 [M] - `transition: all … !important` → list properties, drop `!important`
- src/app/_components/switch.module.css:43 [L] - rotate animation has no reduced-motion variant
- src/app/_components/switch.module.css:9,33 [L] - round dashed circle + 50px yellow glow in the square pixel sidebar (breaks pixel spec)
- src/app/_components/theme-switcher.tsx:91 [L] - aria-label "테마 전환 (현재: system)" → map to 시스템/다크/라이트
- src/app/_components/theme-switcher.tsx:96-102,110 [L] - no-FOUC script renders inside the sidebar in `<body>`, not `<head>`, so earlier markup can paint with the wrong theme
- src/app/_components/theme-switcher.tsx:44-47 [L] - `updateDOM` doesn't set `document.documentElement.style.colorScheme`

#### src/app/_components/select.tsx

- src/app/_components/select.tsx:19-30 [H] - with consumer GenerationFilter.tsx:24: trigger has no `<SelectValue>` and no `aria-label` → no visible value, no accessible name
- src/app/_components/select.tsx:22 [M] - base trigger class has no `focus-visible:ring-*`
- src/app/_components/select.tsx:77 [M] - keyboard-highlighted item `focus:bg-accent` is #E5E9F0 on #ECEFF4 (~1.07:1) light, #434C5E on #3B4252 dark → highlight effectively invisible
- src/app/_components/select.tsx:42 [L] - `animate-in`/`fade-*`/`zoom-*`/`slide-*` need `tailwindcss-animate`, which isn't installed (no-ops)
- src/app/_components/select.tsx:22 [L] - `rounded-full` in the pixel section

#### src/app/_components/formAlert.tsx

- src/app/_components/formAlert.tsx:11 [M] - `bg-green-600` + white text-base ≈ 3.3:1 → green-700
- src/app/_components/formAlert.tsx:27 [M] - close button: no focus-visible ring, `transition-all`
- src/app/_components/formAlert.tsx:31-37 [L] - SVG not `aria-hidden`
- src/app/_components/formAlert.tsx:22 [L] - message has no `break-words`; long server errors/URLs overflow

#### src/hooks/useClickOutside.tsx

- src/hooks/useClickOutside.tsx:16-17 [L] - `mousedown` + `touchstart` both fire on touch → handler can run twice; use `pointerdown`
- src/hooks/useClickOutside.tsx:23 [L] - `handler` in deps re-binds listeners every render when callers pass inline functions

#### tailwind.config.ts

- tailwind.config.ts:10-59 [L] - no focus-ring token (`ringColor`/`outlineColor`), so every component hand-rolls focus or skips it. Consider a shared `focus-visible:outline-[var(--px-border)]` utility

### 포켓몬

#### src/app/pokemon/list/

- src/app/pokemon/list/page.tsx - ✓ pass (gen in URL as `?gen=`, clamped)
- src/app/pokemon/list/loading.tsx:3 [L] - skeleton has no `aria-busy` / sr-only "불러오는 중…"
- src/app/pokemon/list/loading.tsx:5 [L] - `animate-pulse` has no `motion-safe:` variant (same in the other two loading files)
- src/app/pokemon/list/_components/GenerationFilter.tsx:24 [H] - `SelectTrigger` has no `<SelectValue>`/`aria-label`: only a chevron, no accessible name, current gen never shown ✔
- src/app/pokemon/list/_components/GenerationFilter.tsx:24 [H] - `outline-none ring-0` with no focus-visible replacement ✔
- src/app/pokemon/list/_components/GenerationFilter.tsx:32 [M] - raw API slug "GENERATION-IX" → "9세대"
- src/app/pokemon/list/_components/PokemonGrid.tsx:29-36 [M] - login gate runs after mount: grid renders, then redirects (content flash)
- src/app/pokemon/list/_components/PokemonGrid.tsx:57 [L] - reads `searchBarRef.current.value` during render → controlled state
- src/app/pokemon/list/_components/PokemonGrid.tsx:57-59 [M] - 0 matches silently falls back to the full list (looks like search did nothing); no empty state
- src/app/pokemon/list/_components/PokemonGrid.tsx:63 [L] - sticky z-40 bar with no `scroll-padding-top`; can cover cards focused on backward tab
- src/app/pokemon/list/_components/PokemonGrid.tsx:64,70 [L] - `rounded-full shadow-md` search bar breaks pixel spec
- src/app/pokemon/list/_components/PokemonGrid.tsx:65 [L] - decorative `FaMagnifyingGlass` not `aria-hidden`
- src/app/pokemon/list/_components/PokemonGrid.tsx:66-73 [M] - query not in URL (`?q=`); lost on back/refresh
- src/app/pokemon/list/_components/PokemonGrid.tsx:68 [M] - no debounce; up to 10 PokeAPI fetches per keystroke with no abort → out-of-order results; `isSearching` never shown
- src/app/pokemon/list/_components/PokemonGrid.tsx:70 [L] - `pr-5` while the Select trigger sits at `right-0`; long text runs under the chevron
- src/app/pokemon/list/_components/PokemonGrid.tsx:71 [L] - `type="text"` → `type="search"`; add `name`, `autoComplete="off"`, `spellCheck={false}`
- src/app/pokemon/list/_components/PokemonGrid.tsx:72 [M] - English placeholder "Search for a Pokemon"; cards show Korean names but search matches English slugs only. End with "…", give an example
- src/app/pokemon/list/_components/PokemonGrid.tsx:53 [M] - gen change via `router.push` with no `useTransition` pending indicator; old grid stays with no feedback during ~150 fetches
- src/app/pokemon/list/_components/PokemonGrid.tsx:82-87 [L] - 150+ cards (sorted every render) with no virtualization / `content-visibility: auto`
- src/app/pokemon/list/_components/PokemonCard.tsx:37-61 [H] - like/unlike/compare are `<svg role="button" tabIndex={0} onClick>` with no `onKeyDown` → `<button>` ✔
- src/app/pokemon/list/_components/PokemonCard.tsx:37-61 [H] - those icon buttons have no focus-visible style
- src/app/pokemon/list/_components/PokemonCard.tsx:37-61 [M] - 20×20px hit targets
- src/app/pokemon/list/_components/PokemonCard.tsx:53-57 [M] - toggles have no `aria-pressed`
- src/app/pokemon/list/_components/PokemonCard.tsx:53-57 [M] - compare writes `useCompareStore` but nothing renders a comparison (dead-end control)
- src/app/pokemon/list/_components/PokemonCard.tsx:37 [L] - trash icon for "좋아요 취소" reads as delete
- src/app/pokemon/list/_components/PokemonCard.tsx:41,49,58 [L] - `transition-all` → `transition-transform`; `hover:scale-125` no reduced-motion
- src/app/pokemon/list/_components/PokemonCard.tsx:63 [M] - `<h1>` per card (150+ h1s, no real page h1) → h2/h3 + one page h1
- src/app/pokemon/list/_components/PokemonCard.tsx:66-72 [H] - navigation is `<button onClick={router.push}>` → `<Link href>`; only the sprite is clickable, not the name ✔
- src/app/pokemon/list/_components/PokemonCard.tsx:71 [L] - `alt={pokemon.name}` inside a labelled button → `alt=""`

#### src/app/pokemon/meta/

- src/app/pokemon/meta/page.tsx:33 [L] - `Suspense fallback={null}` around FormatSelector → layout shift
- src/app/pokemon/meta/page.tsx:42 [L] - lowercase English "cutoff" label; number needs `tabular-nums`
- src/app/pokemon/meta/page.tsx:48-50 [L] - error message has no next step
- src/app/pokemon/meta/page.tsx:52-54 [M] - one Suspense around 50 async `RankRow`s (~100 PokeAPI calls); table waits for the slowest row → per-row Suspense or batch
- src/app/pokemon/meta/page.tsx:67 [L] - skeleton `rounded-full` vs loading.tsx:18 `rounded-none`
- src/app/pokemon/meta/loading.tsx:3 [L] - no `aria-busy` / sr-only "불러오는 중…"
- src/app/pokemon/meta/_components/FormatSelector.tsx:6-14,19 [L] - `new Date()` in an SSR'd client component → hydration mismatch risk at month/timezone edges; hardcoded `YYYY-MM`
- src/app/pokemon/meta/_components/FormatSelector.tsx:24 [M] - no `useTransition` pending state
- src/app/pokemon/meta/_components/FormatSelector.tsx:41-43,65 [L] - group labels are plain spans (no `role="group"` + `aria-labelledby`); "Gen 9" English
- src/app/pokemon/meta/_components/FormatSelector.tsx:46-88 [H] - toggle buttons have no focus-visible style
- src/app/pokemon/meta/_components/FormatSelector.tsx:46-88 [M] - no `aria-pressed`; selection is color-only
- src/app/pokemon/meta/_components/FormatSelector.tsx:46-88 [L] - `rounded-full bg-blue-600` pills off-theme; BattleTab uses square `border-2` toggles for the same concept
- src/app/pokemon/meta/_components/FormatSelector.tsx:46,78 [L] - URL-changing buttons could be `<Link>`
- src/app/pokemon/meta/_components/UsageRankingTable.tsx:21,39 [M] - on fetch failure `id` falls back to `entry.nameEn` (e.g. "Landorus-Therian") → link to a likely 404
- src/app/pokemon/meta/_components/UsageRankingTable.tsx:40 [H] - row `<Link>` has no focus-visible style
- src/app/pokemon/meta/_components/UsageRankingTable.tsx:40 [L] - `rounded-xl` off-theme
- src/app/pokemon/meta/_components/UsageRankingTable.tsx:42 [M] - rank column missing `tabular-nums`; `text-neutral-400` low contrast on light panel
- src/app/pokemon/meta/_components/UsageRankingTable.tsx:46 [L] - `alt={entry.nameEn}` duplicates the visible name → `alt=""`
- src/app/pokemon/meta/_components/UsageRankingTable.tsx:49-51 [M] - name row has no `truncate`/`flex-wrap`; long forms ("Urshifu-Rapid-Strike") overflow into the `w-32` bar column on mobile
- src/app/pokemon/meta/_components/UsageRankingTable.tsx:66-67 [M] - percent missing `tabular-nums`; `toFixed` → `Intl.NumberFormat`
- src/app/pokemon/meta/_components/UsageRankingTable.tsx:86 [L] - ranking should be `<ol>` or a table

#### src/app/pokemon/[id]/

- src/app/pokemon/[id]/page.tsx - ✓ pass
- src/app/pokemon/[id]/loading.tsx:4 [L] - `rounded-full` spinner in pixel section; `animate-spin` no reduced-motion; no `role="status"` text
- src/app/pokemon/[id]/_components/PokemonDetailTabs.tsx:26 [M] - active tab not in URL (`?tab=battle`)
- src/app/pokemon/[id]/_components/PokemonDetailTabs.tsx:36 [M] - `role="tab"` without `tablist`, `aria-controls`, `tabpanel`, or arrow-key roving (half-applied ARIA)
- src/app/pokemon/[id]/_components/PokemonDetailTabs.tsx:38-48 [H] - tabs have no focus-visible style
- src/app/pokemon/[id]/_components/BattleTab.tsx:154-155 [M] - inner tab and format in `useState` only
- src/app/pokemon/[id]/_components/BattleTab.tsx:167-171 [M] - no AbortController (rapid clicks show another format's data); no `r.ok` check (error body becomes `battleData`)
- src/app/pokemon/[id]/_components/BattleTab.tsx:189 [L] - `rounded-full` badge
- src/app/pokemon/[id]/_components/BattleTab.tsx:190 [L] - shows raw id "GEN9OU" instead of `f.label`
- src/app/pokemon/[id]/_components/BattleTab.tsx:188-195 [L] - status swap not `aria-live`
- src/app/pokemon/[id]/_components/BattleTab.tsx:194 [M] - "로딩 중..." → "로딩 중…"
- src/app/pokemon/[id]/_components/BattleTab.tsx:200-210,223-233 [H] - format/inner-tab buttons have no focus-visible style
- src/app/pokemon/[id]/_components/BattleTab.tsx:200-210,223-233 [M] - no `aria-pressed`/tab semantics
- src/app/pokemon/[id]/_components/BattleTab.tsx:247,280,284 [M] - when `sets` exist but `usage` is null, 사용 통계/같이 쓰는/카운터 tabs render an empty panel
- src/app/pokemon/[id]/_components/BattleTab.tsx:40,256,286 [L] - `<h4>` directly under `<h2>`
- src/app/pokemon/[id]/_components/BattleTab.tsx:55,270,304 [M] - percent/score columns missing `tabular-nums`
- src/app/pokemon/[id]/_components/BattleTab.tsx:46,136,295 [L] - `rounded-full` bars off-theme
- src/app/pokemon/[id]/_components/BattleTab.tsx:103,111,117,123 [L] - Smogon English move/item/ability names → `translate="no"`
- src/app/pokemon/[id]/_components/MoveList.tsx:49 [L] - level-up/TM tab not in URL
- src/app/pokemon/[id]/_components/MoveList.tsx:57-67 [H] - toggles have no focus-visible style
- src/app/pokemon/[id]/_components/MoveList.tsx:57-67 [M] - no `aria-pressed`
- src/app/pokemon/[id]/_components/MoveList.tsx:18,33-35 [M] - number columns centered without `tabular-nums` → right-align + tabular-nums
- src/app/pokemon/[id]/_components/MoveList.tsx:19,33-35 [L] - "-" for missing values → "—"
- src/app/pokemon/[id]/_components/MoveList.tsx:29 [L] - `rounded` category badge off-theme
- src/app/pokemon/[id]/_components/MoveList.tsx:71 [L] - table has no `<caption>`
- src/app/pokemon/[id]/_components/MoveList.tsx:84 [L] - TM tab can be 100+ rows; no `content-visibility: auto`
- src/app/pokemon/[id]/_components/MoveList.tsx:89 [L] - empty state still renders the header row
- src/app/pokemon/[id]/_components/PokemonStats.tsx:30,32 [L] - `rounded-full` bars
- src/app/pokemon/[id]/_components/PokemonStats.tsx:32 [L] - `transition-all` → `transition-[width]`; no reduced-motion
- src/app/pokemon/[id]/_components/PokemonStats.tsx:54 [L] - total not `tabular-nums`/`font-mono-pixel` unlike the values above
- src/app/pokemon/[id]/_components/PokemonInfo.tsx:21,25 [L] - `{heightM} m`/`{weightKg} kg` → `&nbsp;`; `toFixed` → `Intl.NumberFormat`
- src/app/pokemon/[id]/_components/PokemonHeader.tsx:16 [L] - `alt` is the English slug; use `nameKo`
- src/app/pokemon/[id]/_components/EvolutionChain.tsx:26 [H] - `<Link>` has no focus-visible style
- src/app/pokemon/[id]/_components/EvolutionChain.tsx:26 [L] - `transition-all`; `rounded-xl` off-theme
- src/app/pokemon/[id]/_components/EvolutionChain.tsx:30 [L] - `alt={koName}` duplicates visible label → `alt=""`
- src/app/pokemon/[id]/_components/EvolutionChain.tsx:46 [L] - "→" not `aria-hidden`
- src/app/pokemon/[id]/_components/EvolutionChain.tsx:57 [L] - `flex-wrap` on branching chains (Eevee) can wrap the arrow to its own line

#### src/app/pokemon/builder/

- src/app/pokemon/builder/page.tsx - ✓ pass
- src/app/pokemon/builder/_components/TeamBuilder.tsx:72 [M] - team not persisted or in URL, no `beforeunload` guard
- src/app/pokemon/builder/_components/TeamBuilder.tsx:27-33 [H] - EmptySlot button has no focus-visible style
- src/app/pokemon/builder/_components/TeamBuilder.tsx:31 [L] - decorative "+" not `aria-hidden`
- src/app/pokemon/builder/_components/TeamBuilder.tsx:40 [L] - `onSetChange` unused; changing a set requires remove + re-add
- src/app/pokemon/builder/_components/TeamBuilder.tsx:47,65 [H, 미검증] - fixed `h-36` minus frame and padding leaves ~112px; sprite 64 + name 16 + badge ~21 + set 16 + gaps 12 ≈ 129px → every slot with a set overflows. Confirm with a screenshot
- src/app/pokemon/builder/_components/TeamBuilder.tsx:48-54 [M] - "✕" is a tiny target with no focus-visible style; all six share one label → `${nameKo} 팀에서 제거`
- src/app/pokemon/builder/_components/TeamBuilder.tsx:58,65 [L] - name/set name have no `truncate`/`line-clamp`
- src/app/pokemon/builder/_components/PokemonPicker.tsx:152 [H] - modal: no `role="dialog"`/`aria-modal`/`aria-labelledby`, no Escape, no focus trap, background not `inert`, no backdrop close, no `overscroll-behavior: contain` or scroll lock
- src/app/pokemon/builder/_components/PokemonPicker.tsx:156 [H] - close "✕" has no `aria-label`, no focus-visible
- src/app/pokemon/builder/_components/PokemonPicker.tsx:161-167 [H] - search input has no label (placeholder only)
- src/app/pokemon/builder/_components/PokemonPicker.tsx:161-167 [L] - missing `type="search"`, `name`, `autoComplete="off"`, `spellCheck={false}`; placeholder "…"; `outline-none` leaves only a faint border change
- src/app/pokemon/builder/_components/PokemonPicker.tsx:79-93 [H] - `allNames` includes form slugs (e.g. charizard-mega-x); `pokemon-species/<form>` 404s, `.json()` throws, `Promise.all` rejects, `setResults([])` → "charizard"/"pika" show nothing. Check `r.ok`, use `pokemon.species.url`, or `Promise.allSettled` ✔
- src/app/pokemon/builder/_components/PokemonPicker.tsx:53-94 [M] - no debounce/abort; up to 16 requests per keystroke, stale responses win
- src/app/pokemon/builder/_components/PokemonPicker.tsx:168-173 [M] - "로딩 중..."/"검색 중..." → "…"; not `aria-live`
- src/app/pokemon/builder/_components/PokemonPicker.tsx:174-195 [M] - no "검색 결과 없음" empty state
- src/app/pokemon/builder/_components/PokemonPicker.tsx:176-193 [H] - result buttons have no focus-visible style
- src/app/pokemon/builder/_components/PokemonPicker.tsx:176-193 [L] - no arrow-key listbox navigation; `rounded-xl` off-theme
- src/app/pokemon/builder/_components/PokemonPicker.tsx:182,202 [L] - `alt` duplicates visible text → `alt=""`
- src/app/pokemon/builder/_components/PokemonPicker.tsx:214,234 [L] - `text-neutral-400` low contrast; no focus-visible
- src/app/pokemon/builder/_components/PokemonPicker.tsx:224 [L] - "세트 불러오는 중..." → "…"
- src/app/pokemon/builder/_components/TeamExport.tsx:69 [H] - same dialog gaps as the picker
- src/app/pokemon/builder/_components/TeamExport.tsx:70 [L] - `rounded-2xl bg-white shadow-2xl` off-theme; the picker uses `PixelCard`
- src/app/pokemon/builder/_components/TeamExport.tsx:73 [H] - "✕" has no `aria-label`
- src/app/pokemon/builder/_components/TeamExport.tsx:62-66 [M] - `clipboard.writeText` has no try/catch; "복사됨 ✓" not `aria-live`; timeout not cleared on unmount
- src/app/pokemon/builder/_components/TeamExport.tsx:78-82 [M] - textarea has no label; `outline-none` with no focus style
- src/app/pokemon/builder/_components/TeamExport.tsx:78-82 [L] - add `spellCheck={false}`, `translate="no"`
- src/app/pokemon/builder/_components/TeamExport.tsx:84-95 [H] - buttons have no focus-visible style
- src/app/pokemon/builder/_components/TeamExport.tsx:84-95 [L] - `rounded-xl` off-theme
- src/app/pokemon/builder/_components/TypeCoverage.tsx:53 [M] - `text-white` on every chip fails on electric/ice/ground/steel; duplicates `TYPE_KO`/`TYPE_COLORS` (7-22) without TypeBadge's fix → reuse TypeBadge maps
- src/app/pokemon/builder/_components/TypeCoverage.tsx:53,56 [L] - `rounded-full` chips off-theme
- src/app/pokemon/builder/_components/TypeCoverage.tsx:34,42 [L] - heading switches between "타입 상성" and "팀 약점 분석" by state
- src/app/pokemon/builder/_components/TypeCoverage.tsx:65 [L] - "⚠" not `aria-hidden`

#### src/app/_components/compareMons.tsx

- src/app/_components/compareMons.tsx:14-17 [M] - store written (via `useCompare`) but nothing renders a comparison → build the view or remove the button

### auth · chat · posts · studys

#### src/app/auth/login/page.tsx

- src/app/auth/login/page.tsx:25-42 [H] - no pending state: button never disabled, no spinner / "로그인 중…" → double submit
- src/app/auth/login/page.tsx:39-41 [H] - network/server failures only `console.error`; result codes other than 2000/NotExitEmail/InCorrectPassword fail silently
- src/app/auth/login/page.tsx:59-68,90-99 [M] - no `aria-invalid`/`aria-describedby` to the FormAlert; first errored field not focused
- src/app/auth/login/page.tsx:34-37 [M] - errors never cleared on resubmit/typing; stale emailErr stays next to a new passwordErr
- src/app/auth/login/page.tsx:59-68 [M] - email missing `spellCheck={false}`
- src/app/auth/login/page.tsx:72 [L] - "존재하지 않는 이메일입니다." has no next step (e.g. link to 회원가입); separate messages also reveal account existence
- src/app/auth/login/page.tsx:47 [M] - title is `<h2>`, no `<h1>`
- src/app/auth/login/page.tsx:45 [M] - `#auth-shell-root` hides the sidebar and nothing links back home (dead end)
- src/app/auth/login/page.tsx:56,81,85,111 [M] - English labels ("Email address", "Password", "Forgot password?", "Sign in") in a Korean UI, inconsistent with regist
- src/app/auth/login/page.tsx:117-119 [M] - "Not a member? Start a 14 day free trial" is leftover Tailwind UI template copy
- src/app/auth/login/page.tsx:84 [M] - links to `/auth/forgot`, a stub
- src/app/auth/login/page.tsx:84,118 [L] - `<a href>` instead of `<Link>` (full reload)

#### src/app/auth/regist/page.tsx

- src/app/auth/regist/page.tsx:111-117 [H] - "인증번호 보내기" has no pending/disabled state, no "발송 중…", no cooldown (spammable); no empty-email check
- src/app/auth/regist/page.tsx:40-43,150-154 [H] - failed mail send sets `'error'`, which renders "잘못된 인증번호입니다"
- src/app/auth/regist/page.tsx:119-123,145-154 [H] - async status messages not in `aria-live`/`role="status"`
- src/app/auth/regist/page.tsx:178-190 [H] - password_confirm is uncontrolled and never compared to password ✔
- src/app/auth/regist/page.tsx:54-66 [H] - submit has no loading/disabled state; failures and non-200 codes (duplicate email/nickname) only to console
- src/app/auth/regist/page.tsx:54-66 [M] - submit doesn't require `authStatus === 'verified'`
- src/app/auth/regist/page.tsx:129-136 [M] - code input `type="number"` (spinners, drops leading zeros, accepts e/+/-) → `type="text" inputMode="numeric" autoComplete="one-time-code" spellCheck={false}`; no `required`
- src/app/auth/regist/page.tsx:32,133 [M] - `Number('')` is 0 and `0 ?? ''` shows "0", so the field can't be cleared
- src/app/auth/regist/page.tsx:38,47 [M] - verification code is sent to the client and compared in the browser (readable in devtools) → verify server-side
- src/app/auth/regist/page.tsx:101-110 [M] - email missing `spellCheck={false}` (nickname 83-92 too, [L])
- src/app/auth/regist/page.tsx:71 [M] - title is `<h2>`, no `<h1>`
- src/app/auth/regist/page.tsx:142 [L] - "확인" is vague → "인증번호 확인"
- src/app/auth/regist/page.tsx:147 [L] - "✓" read aloud → `aria-hidden`
- src/app/auth/regist/page.tsx:164-173 [L] - no password requirements hint
- src/app/auth/regist/page.tsx:202-204 [L] - `<a>` instead of `<Link>`; English "Sign in"
- src/app/auth/regist/page.tsx:69 [M] - same dead end as login (shell hidden, no way home)

#### src/app/auth/forgot/page.tsx

- src/app/auth/forgot/page.tsx:3-5 [M] - stub with English "Password Forgot Page", no heading, no way back; login links here

#### src/app/chat/user/page.tsx

- src/app/chat/user/page.tsx:118-172 [H] - message list has no `role="log"`/`aria-live="polite"`
- src/app/chat/user/page.tsx:179 [H] - input `focus:outline-none` with no replacement; pill container has no `focus-within` ring
- src/app/chat/user/page.tsx:191 [H] - send button has no focus-visible ring
- src/app/chat/user/page.tsx:110-114 [H] - Enter handler has no `e.nativeEvent.isComposing` guard (Korean IME double send / leftover syllable). Better: `<form onSubmit>` instead of the `buttonRef.click()` hack
- src/app/chat/user/page.tsx:90-91 [H] - send silently no-ops while disconnected; no connection indicator; button never disabled when disconnected or empty
- src/app/chat/user/page.tsx:36 [M] - `userInfo()` rejection (expired token) unhandled; no error UI or redirect
- src/app/chat/user/page.tsx:28-65 [M] - no history loaded (`chatApi.getHistory` exists; ChatWidget uses it)
- src/app/chat/user/page.tsx:117 [M] - global ChatWidget also mounts here: two chat UIs, two STOMP sessions in the same room (likely duplicate ENTER/LEAVE)
- src/app/chat/user/page.tsx:180 [M] - placeholder "Type here..." → "메시지를 입력하세요…"
- src/app/chat/user/page.tsx:177-184 [L] - input missing `name`, `autoComplete="off"`, `maxLength`
- src/app/chat/user/page.tsx:190,194 [M] - `aria-label="메시지 전송"` overrides visible "Send" (WCAG 2.5.3) → visible "전송", drop aria-label
- src/app/chat/user/page.tsx:136-140,156-160 [M] - bubbles have no `max-w-*`/`break-words`; other user's bubble is `w-max` → long word/URL overflows
- src/app/chat/user/page.tsx:132,152 [M] - sender names are `<h5>` with no h1–h4 on the page → `<span>`/`<p>`
- src/app/chat/user/page.tsx:143,164 [L] - hardcoded `format(..., 'HH:mm')` → `Intl.DateTimeFormat('ko-KR', {timeStyle:'short'})`; no `<time dateTime>`
- src/app/chat/user/page.tsx:87 [L] - smooth `scrollIntoView` ignores reduced motion
- src/app/chat/user/page.tsx:117-118 [L] - `min-h-screen` inside shell `<main>` + uncapped `flex-grow overflow-y-auto`: the page scrolls, not the list; input scrolls away
- src/app/chat/user/page.tsx:119 [L] - no empty state; `key={index}`; ENTER/LEAVE rows with `message: null` render an empty div
- src/app/chat/user/page.tsx:31-33 [L] - missing token redirects with no "로그인이 필요합니다" message

#### src/app/chat/bot/page.tsx

- src/app/chat/bot/page.tsx:34-37 [H] - `sendMessage()` posts `{}` ignoring the typed text, appends nothing, clears the input → user input lost ✔; no pending/error handling
- src/app/chat/bot/page.tsx:23-27 [M] - missing token redirects but still calls `getUserInfo(null!)`; unhandled rejection
- src/app/chat/bot/page.tsx:49-97 [H] - no `role="log"`/`aria-live`
- src/app/chat/bot/page.tsx:103 [H] - `focus:outline-none` with no replacement
- src/app/chat/bot/page.tsx:115 [H] - send button has no focus-visible ring
- src/app/chat/bot/page.tsx:41-45 [H] - no `isComposing` guard
- src/app/chat/bot/page.tsx:104 [M] - "Type here..." → Korean + "…"
- src/app/chat/bot/page.tsx:114,118 [M] - aria-label doesn't match visible "Send"
- src/app/chat/bot/page.tsx:60-63,80-84 [M] - no bubble `max-w`/`break-words`; `w-max` overflows
- src/app/chat/bot/page.tsx:56,76 [M] - `<h5>` for sender names
- src/app/chat/bot/page.tsx:67,88 [L] - hardcoded HH:mm
- src/app/chat/bot/page.tsx:31 [L] - smooth scroll ignores reduced motion
- src/app/chat/bot/page.tsx:50 [L] - no empty state / bot intro (blank screen)
- src/app/chat/bot/page.tsx:101-108 [L] - input missing `name`, `autoComplete="off"`, `maxLength`

#### src/app/posts/create/page.tsx

Posts to the real backend (not demo content). There is no /posts index route.

- src/app/posts/create/page.tsx:35-58 [H] - submit has no loading/disabled state; errors only `console.error` → no feedback, double submit
- src/app/posts/create/page.tsx:23-24,89,109 [M] - `titleErr`/`excerptErr` never set true; inline-error UI is dead code
- src/app/posts/create/page.tsx:46 [M] - no auth check; sends an empty token instead of redirecting to /auth/login
- src/app/posts/create/page.tsx:121-127 [M] - file input has no `accept="image/*"`, no preview; `inputClass` ring styling looks off on a file input [L]
- src/app/posts/create/page.tsx:26-33 [M] - no `beforeunload` guard for unsaved title/excerpt
- src/app/posts/create/page.tsx:65 [M] - title is `<h2>`, no `<h1>`
- src/app/posts/create/page.tsx:80-88 [L] - title input missing `autoComplete="off"`, `maxLength`
- src/app/posts/create/page.tsx:101-108 [L] - textarea has no `rows`, no `maxLength`
- src/app/posts/create/page.tsx:50 [L] - success goes to `/` without confirmation instead of to the new post

#### src/app/posts/[slug], src/app/studys/**

Both render Next.js blog-starter demo content (see `docs/known-issues.md`).

- src/app/posts/[slug]/page.tsx:50 [M] - tab/OG title "… | Next.js Blog Example with …"
- src/app/posts/[slug]/page.tsx:6-8 [L] - `Alert`, `Container`, `Header` imported but not rendered
- src/app/studys/[slug]/page.tsx:50 [M] - same "Next.js Blog Example" title
- src/app/studys/[slug]/page.tsx:6-8 [L] - same unused imports
- src/app/studys/list/page.tsx:7 [M] - `slice(1)` drops the newest post (the HeroPost that showed it was removed)
- src/app/studys/list/page.tsx:10 [M] - 0 or 1 posts → empty container, no empty state
- src/app/studys/list/page.tsx:9-11 [M] - no `<h1>`; only heading is MoreStories' English "More Stories" `<h2>`
- src/app/studys/list/page.tsx:10 [M] - cards link to `/posts/<slug>` (post-preview.tsx:30, cover-image.tsx:26), leaving the section; sidebar `/studys` loses its active state
- src/app/studys/create/page.tsx:3-5 [L] - stub "Study Create", no heading

#### Blog-starter components

- src/app/_components/header.tsx - effectively DEAD (imported by the two [slug] pages but never rendered). :6 [L] `<h2>` as site brand
- src/app/_components/hero-post.tsx - DEAD
- src/app/_components/section-separator.tsx - DEAD
- src/app/_components/container.tsx - ✓ pass
- src/app/_components/post-title.tsx:9 [L] - inverted size scale (`md:text-7xl` > `lg:text-5xl`); no `text-balance`/`break-words`
- src/app/_components/post-body.tsx:12 [L] - `dangerouslySetInnerHTML` of remark-html output; safe for local `_posts`, not if the source changes
- src/app/_components/post-header.tsx:21 [M] - `sm:mx-96` (384px each side from 640px) squeezes the cover image to ~0 on small/medium widths, especially inside the shell
- src/app/_components/post-preview.tsx:30 [M] - hardcoded `/posts/` path
- src/app/_components/post-preview.tsx:30 [L] - only `hover:underline`, no focus-visible style
- src/app/_components/post-preview.tsx:29 [L] - long titles have no `line-clamp`/`break-words`
- src/app/_components/post-preview.tsx:37-38 [L] - excerpt/avatar commented out; `excerpt`/`author` props unused
- src/app/_components/more-stories.tsx:12 [M] - English "More Stories" is the page's only heading → Korean `<h1>` like "학습 노트"
- src/app/_components/cover-image.tsx:26 [M] - hardcoded `/posts/` path
- src/app/_components/cover-image.tsx:17,26 [M] - hover shadow with no focus-visible equivalent
- src/app/_components/cover-image.tsx:26 [L] - duplicates the title link (two tab stops) → `tabIndex={-1}` + `aria-hidden`
- src/app/_components/cover-image.tsx:15 [L] - English, redundant alt "Cover Image for …" → `alt=""`
- src/app/_components/cover-image.tsx:13-21 [L] - no `sizes` (1300px image for 1/3-width cards); no `priority` on the detail-page cover
- src/app/_components/avatar.tsx:9 [M] - raw `<img>` with no `width`/`height`, no `loading="lazy"`
- src/app/_components/avatar.tsx:9 [L] - `alt={name}` repeats the adjacent name → `alt=""`
- src/app/_components/date-formatter.tsx:9 [M] - date-fns `"LLLL\td, yyyy"`: English month and a literal TAB → `Intl.DateTimeFormat('ko-KR', {dateStyle:'long'})`
- src/app/_components/date-formatter.tsx:8 [L] - bad date string → `format` throws RangeError, page crashes
- src/app/_components/markdown-styles.module.css:1-18 [M] - no `a` styles (preflight strips them; links indistinguishable, WCAG 1.4.1); `ul`/`ol` have no `list-style`; `pre`/`code` no `overflow-x-auto`; no `img { max-width:100% }`; no h4–h6 / code-block styles
- src/app/_components/markdown-styles.module.css:12-18 [L] - h2/h3 no `text-wrap: balance`

### portfolio · 모션 컴포넌트 · PDF

#### src/app/portfolio/page.tsx

- src/app/portfolio/page.tsx:46-49 [H] - section entrance animates `y` + `filter: blur(8px)` with no reduced-motion variant; `filter` isn't compositor-only. `<MotionConfig reducedMotion="user">` at the page root would cover every motion component here
- src/app/portfolio/page.tsx:292-298 [H] - whole-page stagger on load, runs under reduced motion
- src/app/portfolio/page.tsx:101-107 [H] - card `<video autoPlay loop muted>` has no pause control, no poster, no reduced-motion stop. `/videos/leafy-demo.mp4` doesn't exist in `public/` → empty 16:9 box
- src/app/portfolio/page.tsx:135-141 [M] - zoomed video in the dialog also autoplays/loops with no `controls`
- src/app/portfolio/page.tsx:109-113 [L] - play-icon overlay on an already-playing video; `group-hover` only, never on focus; `PlayIcon` not `aria-hidden`
- src/app/portfolio/page.tsx:117-122 [M] - `<img>` has no `width`/`height`
- src/app/portfolio/page.tsx:153-155 [H] - close button sits outside `MorphingDialogContent`, so the dialog's focus logic never finds it (see morphing-dialog.tsx:185-194)
- src/app/portfolio/page.tsx:153 [M] - close button: no focus-visible ring, no hover state; `fixed right-6 top-6` ignores safe-area insets
- src/app/portfolio/page.tsx:163 [M] - `Magnetic` pointer-follow motion has no reduced-motion opt-out
- src/app/portfolio/page.tsx:166 [L] - pill links (also 187, 214, 238, 347, 433) rely on the UA outline, which gets cropped by `rounded-full`/`overflow-hidden` parents (347)
- src/app/portfolio/page.tsx:193 [M] - `transition-all` on `width` → `transition-transform` + `scale-x-0 → scale-x-100`, `origin-left`
- src/app/portfolio/page.tsx:209-217 [M] - "Architecture" links 404: `/images/leafy-architecture.png`, `/images/home-server-architecture.svg`, `/images/apollo-monitoring-architecture.png` not in `public/`
- src/app/portfolio/page.tsx:265 [L] - `<h5>` skips a level (h3 → h5); project name at 186 isn't a heading
- src/app/portfolio/page.tsx:302 [M] - no `<h1>`; the name is a plain `<Link>`, sections start at `<h3>` (328, 338, 407, 421, 449)
- src/app/portfolio/page.tsx:305-313 [L] - `TextEffect` per-char fade runs under reduced motion (its SR handling is correct)
- src/app/portfolio/page.tsx:408 [L] - `key={index}`
- src/app/portfolio/page.tsx:423-443 [M] - `AnimatedBackground` highlight on hover only; keyboard focus gets no equivalent

#### src/app/_components/ui/morphing-dialog.tsx

- src/app/_components/ui/morphing-dialog.tsx:117-129 [H] - trigger is `motion.div role="button"` with no `tabIndex={0}` → unreachable by keyboard; the Enter/Space handler (106-114) can never fire ✔
- src/app/_components/ui/morphing-dialog.tsx:128 [M] - `aria-label={`Open dialog ${uniqueId}`}` reads "Open dialog :r0:" and hides the child `<img alt>` → accept a label prop
- src/app/_components/ui/morphing-dialog.tsx:98,118 [H] - trigger attaches the `triggerRef` prop (undefined here) instead of the context's `triggerRef` (55), so focus is never returned on close (197)
- src/app/_components/ui/morphing-dialog.tsx:185-194 [H] - focus moves in only if something focusable is inside `containerRef`; with this page's usage (img/video without controls, close button outside) nothing is, so focus stays behind the modal and the Tab trap (158-172) never engages → content node `tabIndex={-1}` + focus it, or move the close button inside
- src/app/_components/ui/morphing-dialog.tsx:155-157 - ✓ Escape closes
- src/app/_components/ui/morphing-dialog.tsx:215-216 [M] - `aria-labelledby`/`aria-describedby` point at ids never rendered (Title sets no id; Description uses `dialog-description-${id}` at 342) → dialog has no accessible name
- src/app/_components/ui/morphing-dialog.tsx:127 [L] - `aria-controls` points at a nonexistent id
- src/app/_components/ui/morphing-dialog.tsx:251 [M] - overlay has no `overscroll-behavior: contain`; body `overflow-hidden` doesn't lock iOS scroll
- src/app/_components/ui/morphing-dialog.tsx:182-199 [L] - no effect cleanup; unmount while open leaves `overflow-hidden` on body
- src/app/_components/ui/morphing-dialog.tsx:69,82,208-219,244-250 [H] - `layoutId` morph and backdrop fade have no reduced-motion handling → `reducedMotion="user"` on the `MotionConfig` it already renders
- src/app/_components/ui/morphing-dialog.tsx:397-409 [L] - default close button has no focus-visible style

#### src/app/_components/ui/ (other)

- src/app/_components/ui/spotlight.tsx:24-25,74-75 [M] - animates `left`/`top` on every mousemove → `x`/`y` transforms
- src/app/_components/ui/spotlight.tsx:52-58 [L] - `removeEventListener` gets new arrow functions, so listeners are never removed
- src/app/_components/ui/spotlight.tsx:41 [L] - `getBoundingClientRect` on every mousemove
- src/app/_components/ui/magnetic.tsx:100-107 [M] - pointer-follow transform with no reduced-motion opt-out
- src/app/_components/ui/magnetic.tsx:59 [L] - each instance adds a document mousemove listener calling `getBoundingClientRect` (3 instances on the page)
- src/app/_components/ui/animated-background.tsx:52-59 [M] - `enableHover` wires mouse only → add `onFocus`/`onBlur`
- src/app/_components/ui/animated-background.tsx:72-83 [L] - `layoutId` slide has no reduced-motion handling
- src/app/_components/ui/text-effect.tsx:264-287 [L] - no reduced-motion path (`blur` presets animate `filter`, but only `fade` is used). ✓ sr-only full text + `aria-hidden` segments
- src/app/_components/ui/profile.tsx - DEAD
- src/app/_components/ui/text-loop.tsx - DEAD
- src/app/_components/ui/text-morph.tsx - DEAD
- src/app/_components/ui/scroll-progress.tsx - DEAD

#### src/app/portfolio-pdf/ (print deck)

- src/app/portfolio-pdf/deck.tsx:748-763 [M] - cover contacts (email, GitHub, blog) are plain text → no clickable links in the exported PDF (`resume.tsx:250` already has a `Link` for this)
- src/app/portfolio-pdf/deck.tsx:318-321 [L] - `project.repo` is plain text, not a link
- src/app/portfolio-pdf/deck.tsx:657-661 [L] - figure `<img>` has no `width`/`height` (alt ✓)
- src/app/portfolio-pdf/deck.tsx:715-719 [L] - profile `<img>` has no `width`/`height` (sized in mm, so no CLS)
- src/app/portfolio-pdf/deck.tsx:641-652 [L] - deprecated `scrolling="no"`; diagram iframes `tabIndex={-1}`; `title` ✓
- src/app/portfolio-pdf/deck.tsx:189 [L] - `aria-label` on a role-less `<span>` is ignored; "★★★★☆" read glyph by glyph → `role="img"`
- src/app/portfolio-pdf/deck.tsx:252,604 [L] - `truncate` on subtitle/note silently clips printed text
- src/app/portfolio-pdf/deck.tsx:262,279,721 [L] - heading outline inconsistent: one `<h1>` per slide, `<h3>` directly under `<h1>` (345, 403), `ImagePage` uses `<h2>` (600) with no `<h1>`
- src/app/portfolio-pdf/deck.tsx:792,811 - ✓ `tabular-nums` on periods and page numbers
- src/app/portfolio-pdf/page.tsx, a4/page.tsx, data.tsx - ✓ pass

#### src/app/resume-pdf/

- src/app/resume-pdf/resume.tsx:106-111 [L] - `<img>` has no `width`/`height` (alt ✓)
- src/app/resume-pdf/resume.tsx:252-255 [L] - `target="_blank"` also applies to `tel:`/`mailto:` (136, 140), which opens an empty tab on screen; links have no hover/focus-visible state
- src/app/resume-pdf/resume.tsx:395 [L] - cover-letter section titles are `<h3>` but belong at `<h2>`; they nest under "프로젝트 경험" in the outline
- src/app/resume-pdf/page.tsx, data.tsx - ✓ pass
