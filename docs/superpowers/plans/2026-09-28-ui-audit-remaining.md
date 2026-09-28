# Remaining UI audit fixes — implementation plan

Spec: `docs/audits/2026-09-28-web-interface-guidelines.md` (the audit). Every
item below points at a finding there; read the matching `file:line` entry for
the detail. Line numbers in the audit are from commit `c6622e6`, so re-locate
each spot in the current file before editing.

Already done on this branch (do not redo): global `:focus-visible` ring and
`prefers-reduced-motion` clamp in `globals.css`; IME-safe Enter in all three
chats; Gen 5 `TypeBadge`; `--color-on-primary` contrast token; menu tile focus;
select highlight; Smogon cache fix and `fetchBattleData.ts`; keyboard-usable
`PokemonCard`; native `<dialog>` builder modals (`ModalDialog.tsx`); builder
picker search fix.

## Global Constraints

- **Verification:** `npx tsc --noEmit` must pass before you commit. Do NOT run
  `npm run build`, `npm start`, `next dev` or any server — the controller builds
  and screenshots after each task (they share `.next/`). There is no test runner.
- **No new dependencies.** Prefer native platform features (`<dialog>`,
  `Intl.*`, `<time>`, CSS) over code.
- **Do not run prettier on whole files** — most files are not prettier-clean and
  a full reformat buries the diff. Match the surrounding formatting by hand.
- **Only touch the files your task lists.** If a fix needs another file, report
  it as a concern instead of editing it.
- **Pixel theme** (home page and `/pokemon/*`): never add `border-radius` or a
  `clip-path` staircase for pixel corners; reuse `src/app/_components/ui/pixel/*`.
  Removing an off-theme `rounded-*` there is allowed only where the task says so.
- **Focus:** rely on the global `:focus-visible` rule. Never add
  `outline-none`/`outline: none` without a visible replacement.
- **Copy:** UI text is Korean. Use `…` not `...`; loading text ends with `…`.
  Brand/code tokens get `translate="no"` only where the task says.
- **Decorative glyphs/icons** (`▶ ▸ ▼ ✓ ⚠ + →`, react-icons next to text):
  `aria-hidden`.
- **Backend is not running** (`localhost:8080`). Keep every API call and its
  request/response shape exactly as it is; improve only the UI around it.
- **Commit** once per task, message `<type>(<scope>): <summary>` with a short
  body, ending with the line
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Out of scope (rulings)

Left for a separate decision; do not implement:
- Light-mode primary buttons at 4.0:1 — needs a darker brand primary (design call).
- Compare button has no comparison view — build or remove is a product call.
- `/portfolio` missing video/architecture files and stale content — content.
- `/posts`, `/studys` demo content itself (`docs/known-issues.md`).
- Verification code checked in the browser (regist) — needs a backend endpoint.
- PokeAPI ↔ Smogon name mapping (`great-tusk`) — belongs to the planned backend.
- Team persistence in the builder, list virtualization, debounce beyond an
  abort/stale guard.

### Task 1: Remove dead code

Files: `src/app/_components/pokemonCard.tsx`, `src/app/_components/ui/profile.tsx`,
`ui/text-loop.tsx`, `ui/text-morph.tsx`, `ui/scroll-progress.tsx`,
`src/app/_components/hero-post.tsx`, `section-separator.tsx`, `alert.tsx`,
`header.tsx`, `src/app/posts/[slug]/page.tsx`, `src/app/studys/[slug]/page.tsx`,
`docs/known-issues.md`.

1. For each candidate file, `grep -rn` its module name across `src/` first. Delete
   it only if nothing imports it (or every import is unused). Expected dead:
   `pokemonCard.tsx` (lowercase), `ui/profile.tsx`, `ui/text-loop.tsx`,
   `ui/text-morph.tsx`, `ui/scroll-progress.tsx`, `hero-post.tsx`,
   `section-separator.tsx`.
2. In `posts/[slug]/page.tsx` and `studys/[slug]/page.tsx`, remove the unused
   imports (`Alert`, `Container`, `Header`) and the commented-out JSX that used
   them. Then delete `alert.tsx` and `header.tsx` if nothing else imports them.
   Keep `container.tsx` (used by `studys/list`).
3. Remove the `pokemonCard.tsx` section from `docs/known-issues.md`, and remove
   the matching bullet from `CLAUDE.md`'s "Things that are not what they look
   like" list (this task may edit `CLAUDE.md` for that one bullet only).
4. If a deleted file was the only user of a dependency, list it in the report;
   do not edit `package.json`.

### Task 2: Site shell, home, shared components

Files: `src/app/layout.tsx`, `src/app/globals.css`,
`src/app/_components/SiteShell.tsx`, `site-shell.module.css`, `src/app/page.tsx`,
`pokedex-home.module.css`, `BootScreen.tsx`, `EncounterLink.tsx`,
`theme-switcher.tsx`, `switch.module.css`, `formAlert.tsx`,
`src/app/_components/ui/pixel/PixelButton.tsx`, `PixelSprite.tsx`,
`src/hooks/useClickOutside.tsx`.

1. Skip link: first focusable element in `<body>` (`layout.tsx`) is a visually
   hidden "본문으로 건너뛰기" link to `#main`, visible on focus; give SiteShell's
   `<main>` `id="main"` (and `tabIndex={-1}` so it can take focus).
2. `color-scheme`: `color-scheme: light` on `:root`, `color-scheme: dark` on
   `.dark` in `globals.css`; `theme-switcher.tsx` `updateDOM` also sets
   `document.documentElement.style.colorScheme`.
3. `theme-color`: replace the hardcoded `#000` with two metas using
   `media="(prefers-color-scheme: light|dark)"` and the shell page background
   of each theme (`--px-panel-2`: `#D8DEE9` / `#1e2e3d`).
4. Fix the meta description typo "블로그그" → "블로그".
5. `SiteShell.tsx`: `aria-hidden` on the `▶` cursor and every react-icons icon;
   parent nav item uses `aria-current="true"` (not `"page"`) when only a child
   route matches; external links (블로그, GitHub, 디지털가든) get a visually
   hidden "(새 탭)" suffix; brand `OHGNOY` gets `translate="no"`; icon-box hover
   highlight also applies on the link's `:focus-visible` (see audit
   PixelIconBox:17 / SiteShell:131-155).
6. `site-shell.module.css`: `.subNavItem` at least 24px tall; `bootFill`
   animates `transform: scaleX()` with `transform-origin: left` instead of
   `width`; the boot fade and `BootScreen`'s unmount delay agree (audit :232).
7. `BootScreen.tsx`: wrap every `sessionStorage` access in try/catch (treat a
   throw as "already booted"); skip the overlay when
   `matchMedia('(prefers-reduced-motion: reduce)')` matches.
8. `page.tsx` (home): panel titles "TRAINER DATA"/"MAIN MENU" become `<h2>`
   with the `<section>` `aria-labelledby` them (keep the exact look — move the
   classes onto the h2); `aria-hidden` on tile index "01"…, `▸`, `▼`, icon SVGs;
   external 블로그 tile gets the same "(새 탭)" hidden suffix; `translate="no"`
   on the `OHGNOY` h1.
9. `pokedex-home.module.css`: `border-bottom: 1.5px` → `2px` (audit :7).
10. `EncounterLink.tsx`: keep the overlay behavior, but call
    `router.prefetch(href)` on mount/hover so navigation isn't slower than a
    `<Link>`; "이동 중" → "이동 중…".
11. `theme-switcher.tsx`: aria-label maps modes to 시스템/라이트/다크.
12. `switch.module.css`: replace `transition: all … !important` with the
    specific properties (`box-shadow, background-color, border-color, transform`).
13. `formAlert.tsx`: close button `type="button"`, `transition-colors` instead of
    `transition-all`; SVG `aria-hidden`; message `break-words`; the alert
    container gets `role="alert"` for `error` and `role="status"` otherwise.
14. `PixelButton.tsx`: default `type="button"` (caller can override); primary
    variant gets a hover state (`hover:bg-primary-hover`).
15. `PixelSprite.tsx`: pass a `sizes` value when using `fill` (derive from the
    container size prop if present, else `"96px"`); nothing else.
16. `useClickOutside.tsx`: use `pointerdown` instead of `mousedown`+`touchstart`.

### Task 3: Pokémon list, meta, builder

Files: `src/app/pokemon/list/**`, `src/app/pokemon/meta/**`,
`src/app/pokemon/builder/**`, `src/app/_components/select.tsx`, and
`src/app/_components/TypeBadge.tsx` (only to export `TYPE_KO`/`TYPE_COLORS`
for item 9).

1. `GenerationFilter.tsx`: the trigger shows the current value via
   `<SelectValue>` and has `aria-label="세대 선택"`; items read "1세대" … "9세대"
   (map the `generation-i…ix` slug to its number; keep the slug as the value).
2. `PokemonGrid.tsx`: page gets an `<h1>` "포켓몬 도감" (visually fine to be
   small; match the meta page heading style); search input: `type="search"`,
   `name="q"`, `aria-label="포켓몬 검색"`, `autoComplete="off"`,
   `spellCheck={false}`, Korean placeholder with an example ending in `…`;
   query kept in the URL as `?q=` (read on load, `router.replace` on change,
   keep `gen`); `aria-hidden` on the magnifier icon; a "검색 결과가 없습니다."
   empty state instead of silently showing the full list; guard the per-keystroke
   PokeAPI requests so a stale response can't overwrite a newer one (cancel flag
   or AbortController); `useTransition` around the `gen` change with a visible
   "불러오는 중…" indicator while pending; remove `rounded-full shadow-md` from
   the search bar (pixel spec), keeping it legible.
3. `PokemonCard.tsx`: the card title `<h1>` becomes `<h2>` (the page now has
   the h1).
4. `list/loading.tsx`, `meta/loading.tsx`: `aria-busy="true"` on the wrapper
   and a `sr-only` "불러오는 중…" text; `animate-pulse` → `motion-safe:animate-pulse`.
5. `meta/page.tsx`: "cutoff" label → "컷오프", number `tabular-nums`; the error
   text adds a next step ("다른 기간이나 포맷을 선택해 보세요."); skeleton
   `rounded-full`/`rounded` → `rounded-none`.
6. `FormatSelector.tsx`: toggles get `aria-pressed`; each group is
   `role="group"` with `aria-labelledby` its label; the URL-changing buttons run
   inside `useTransition` and show a pending state (e.g. `aria-busy` + reduced
   opacity on the group); make the pills square to match BattleTab
   (`rounded-none border-2`), keeping the current colors.
7. `UsageRankingTable.tsx`: the list is an `<ol>` of `<li>`; rank and percent
   `tabular-nums`; rank color passes 4.5:1 (use `text-text-muted`); name row
   `min-w-0` + `truncate` so long forms don't push into the bar; `alt=""` on the
   sprite (name is adjacent); row link `rounded-xl` → `rounded-none`. When the
   id lookup failed (the `nameEn` fallback), render the row without a link
   instead of linking to a likely 404.
8. `TeamBuilder.tsx`: `aria-hidden` on the `+`; slot name and set name
   `truncate`; verify from the classes whether the fixed `h-36` slot can fit
   sprite + name + badges + set name — if not, change it to `min-h-36` (report
   what you found).
9. `TypeCoverage.tsx`: reuse `TypeBadge` (export its `TYPE_KO` if needed)
   instead of the duplicated `TYPE_KO`/`TYPE_COLORS` maps so chips get the same
   contrast treatment; `aria-hidden` on `⚠`; one stable heading text.
10. `TeamExport.tsx`: `clipboard.writeText` in try/catch — on failure select the
    textarea text and show "복사하지 못했습니다. 직접 선택해서 복사하세요.";
    the copied/failed message lives in an `aria-live="polite"` element; clear
    the timeout on unmount; "복사됨 ✓" → "복사됨" with the ✓ `aria-hidden`.
11. `PokemonPicker.tsx`: loading/status lines use `…` and sit in one
    `aria-live="polite"` region; result and set buttons `type="button"`;
    `alt=""` on sprites next to their names.
12. `select.tsx`: base trigger class drops `rounded-full` → `rounded-none`.

### Task 4: Pokémon detail page

Files: `src/app/pokemon/[id]/**`.

1. `PokemonDetailTabs.tsx`: proper tabs — `role="tablist"` wrapper,
   `role="tab"` with `aria-selected`, `aria-controls`, roving `tabIndex`
   (active 0, others -1), ArrowLeft/ArrowRight/Home/End move and activate;
   each panel `role="tabpanel"` `aria-labelledby` its tab. Active tab is in the
   URL as `?tab=info|moves|battle` (read on load, `router.replace` with
   `scroll: false` on change).
2. `BattleTab.tsx`: inner tabs follow the same tablist pattern (no URL);
   format buttons get `aria-pressed`; the format fetch uses an AbortController
   (abort the previous request) and checks `r.ok` before using the body;
   loading/status text ends with `…` and sits in `aria-live="polite"`; show the
   format label, not the raw id (e.g. "Gen 9 OU"); when `usage` is null show a
   "이 포맷의 사용률 데이터가 없습니다." message in the usage-dependent panels
   instead of an empty panel; percent/score columns `tabular-nums`; `<h4>`
   directly under `<h2>` → `<h3>`; Smogon English names get `translate="no"`;
   `rounded-full` badge/bars → `rounded-none`.
3. `MoveList.tsx`: toggles `aria-pressed`; number columns right-aligned
   `tabular-nums`; missing values `—`; table gets an `sr-only` `<caption>`;
   empty state replaces the header row instead of sitting under it;
   `rounded` category badge → `rounded-none`.
4. `PokemonStats.tsx`: bars `rounded-full` → `rounded-none`;
   `transition-all` → `transition-[width]`; total `tabular-nums`.
5. `PokemonInfo.tsx`: `Intl.NumberFormat('ko-KR', { maximumFractionDigits: 1 })`
   for height/weight and a non-breaking space before the unit.
6. `PokemonHeader.tsx`: sprite `alt` uses the Korean name.
7. `EvolutionChain.tsx`: `transition-all` → `transition-colors`,
   `rounded-xl` → `rounded-none`; `alt=""` (label is adjacent); `→`
   `aria-hidden`; keep each arrow with its following stage on wrap
   (`whitespace-nowrap` group or flex pair).
8. `[id]/loading.tsx`: `role="status"` with `sr-only` "불러오는 중…";
   `animate-spin` → `motion-safe:animate-spin`; square spinner (no `rounded-full`).

### Task 5: Chat

Files: `src/app/_components/ChatWidget.tsx`, `src/app/chat/user/page.tsx`,
`src/app/chat/bot/page.tsx`, `src/lib/api/chat.ts` (read-only unless item 6
needs its exported signature — report instead of changing it).

1. All three message lists: `role="log"` + `aria-live="polite"`; empty state
   text ("아직 메시지가 없습니다." / bot: a one-line intro); ENTER/LEAVE rows with
   no message render nothing; stable keys (message id if present, else
   index+timestamp).
2. Bubbles: `max-w-[80%]` (or similar) + `break-words`; drop `w-max`.
3. Input: Korean placeholder ending `…` ("메시지를 입력하세요…"), `name`,
   `autoComplete="off"`, `maxLength={1000}`. Chat pages: wrap input+button in
   a `<form onSubmit>` (keep the existing IME guard) and drop the
   `buttonRef.click()` hack.
4. Send button: visible label "전송" and no overriding `aria-label` (pages);
   disabled while disconnected or the input is empty; `type="submit"` in forms.
5. Connection state: show "연결 중…"/"연결 끊김" text when not connected
   (widget header and chat/user), in `role="status"`.
6. `/chat/bot`: `sendMessage` must send the typed text and append both the
   user message and the reply, with a pending state and an inline error
   ("답변을 받지 못했습니다. 잠시 후 다시 시도하세요."). Read
   `src/lib/api/chat.ts` for the real function signature; if the bot API
   cannot carry the text without changing that file, report NEEDS_CONTEXT.
7. Headings: sender names `<h5>` → `<span>`; page gets an `sr-only` `<h1>`
   ("실시간 채팅" / "챗봇").
8. Timestamps: `Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit' })`
   inside `<time dateTime=…>`; the widget shows the date for messages not from
   today.
9. `ChatWidget.tsx`: popup is a labelled dialog (`role="dialog"`,
   `aria-labelledby` the header title), Escape closes it and returns focus to the
   toggle; toggle gets `aria-expanded`/`aria-controls` and the unread count in
   its label ("채팅 열기, 읽지 않은 메시지 3개"); panel size
   `w-80 max-w-[calc(100vw-2rem)]` and `max-h-[calc(100dvh-6rem)]`; toggle and
   panel offset include `env(safe-area-inset-bottom)`/`-right`; no autofocus on
   open for touch (`matchMedia('(pointer: coarse)')`); `transition-all` →
   specific properties; `aria-hidden` on SVGs; `animate-pulse` →
   `motion-safe:animate-pulse`.
10. Hide the global ChatWidget on `/chat/*` routes (the page already is a chat
    and would open a second STOMP session) — follow the existing
    `body:has(#id)` opt-out pattern: give the chat pages' roots an id and add the
    rule in `globals.css` (this task may edit `globals.css` for that rule only).
11. chat/user: `userInfo()` rejection shows an error and redirects to login like
    a missing token; the list scrolls inside a height-capped container so the
    input stays visible; `scrollIntoView` uses `behavior: 'auto'` under reduced
    motion.

### Task 6: Auth and post forms

Files: `src/app/auth/login/page.tsx`, `src/app/auth/regist/page.tsx`,
`src/app/auth/forgot/page.tsx`, `src/app/posts/create/page.tsx`.

1. All forms: submit button disabled while the request runs with text
   "로그인 중…" / "가입 중…" / "등록 중…"; network/server failures and unknown
   result codes show an inline error (use the existing `FormAlert`) with a next
   step; errors clear on resubmit and when the related field changes;
   `aria-invalid` + `aria-describedby` link each field to its message; focus the
   first invalid field on submit.
2. Inputs: email `type="email" autoComplete="email" spellCheck={false}`;
   passwords `autoComplete="current-password"` (login) /
   `"new-password"` (regist); nickname `autoComplete="nickname" spellCheck={false}`;
   verification code `type="text" inputMode="numeric" autoComplete="one-time-code"
   spellCheck={false} required` and stored as a string (fixes the "0" that
   can't be cleared) — convert only where the existing API call needs it.
3. Regist: compare password and password_confirm on submit (inline error
   "비밀번호가 일치하지 않습니다."); block submit until `authStatus === 'verified'`
   with an inline message; "인증번호 보내기" validates the email, is disabled while
   sending with "발송 중…", and has a 30s resend cooldown; a failed send shows
   "인증번호를 보내지 못했습니다. 이메일을 확인하고 다시 시도하세요." (not the
   wrong-code message); status messages in `aria-live="polite"`; "확인" →
   "인증번호 확인"; `✓` `aria-hidden`; a password hint line.
4. Copy: Korean labels on login matching regist ("이메일", "비밀번호",
   "비밀번호를 잊으셨나요?", "로그인"); remove "Start a 14 day free trial" and
   replace with "계정이 없으신가요? 회원가입" linking to `/auth/regist`; regist's
   "Sign in" → "로그인". Use `<Link>` for internal links.
5. Headings and escape hatch: page title `<h2>` → `<h1>` on login, regist,
   posts/create; login, regist and forgot get a "← 홈으로" `<Link href="/">`
   (the auth shell hides the sidebar).
6. `/auth/forgot`: a Korean `<h1>` "비밀번호 찾기", one sentence saying the
   feature is being prepared, and the links back to 로그인 and 홈.
7. posts/create: redirect to `/auth/login` when there is no token (same check
   other pages use); file input `accept="image/*"`; textarea `rows={6}`;
   `maxLength` on title (100) and excerpt (300); title `autoComplete="off"`;
   `beforeunload` warning while title/excerpt/file are dirty and not submitted;
   remove the never-set `titleErr`/`excerptErr` dead state or wire it to real
   validation — pick one and say which.

### Task 7: Portfolio and motion components

Files: `src/app/portfolio/page.tsx`, `src/app/_components/ui/morphing-dialog.tsx`,
`ui/magnetic.tsx`, `ui/spotlight.tsx`, `ui/animated-background.tsx`,
`ui/text-effect.tsx`, `src/app/resume-pdf/resume.tsx`,
`src/app/portfolio-pdf/deck.tsx`.

1. `morphing-dialog.tsx`: trigger `tabIndex={0}` so Enter/Space work; attach the
   context `triggerRef` so focus returns on close; content container
   `tabIndex={-1}` and focus it on open when nothing inside is focusable;
   render ids that `aria-labelledby`/`aria-describedby` point to (Title and
   Description) and make `aria-controls` match the content id; accept an
   `aria-label` prop on the trigger instead of `Open dialog ${id}`;
   `overscroll-behavior: contain` on the overlay; remove the body
   `overflow-hidden` in an effect cleanup; default close button gets a hover
   state.
2. `portfolio/page.tsx`: move the close button inside `MorphingDialogContent`
   (keep its position); pass a meaningful trigger `aria-label`
   ("{project} 미디어 크게 보기"); zoomed video gets `controls`; card video
   gets `poster` if a still exists, otherwise `preload="metadata"`, and pauses
   under reduced motion (`useReducedMotion` from `motion/react`); play icon
   `aria-hidden` and shown on `group-focus-within` too; `<img>` width/height;
   the name becomes the page `<h1>` (keep the look) and section headings step
   h2/h3 without skipping; `transition-all` on the underline → transform-based
   (`scale-x`, `origin-left`); `key={index}` → stable key.
3. `magnetic.tsx`, `spotlight.tsx`: do nothing when `useReducedMotion()` is true;
   spotlight animates `x`/`y` transforms instead of `left`/`top` and removes its
   listeners correctly (same function references).
4. `animated-background.tsx`: with `enableHover`, also follow `onFocus`/`onBlur`.
5. `text-effect.tsx`: no change needed beyond respecting `MotionConfig` (already
   wrapped by the page) — skip unless the audit item is still reproducible.
6. `resume.tsx`: `target="_blank"` only for http(s) links, not `mailto:`/`tel:`;
   cover-letter section titles `<h3>` → `<h2>`; `<img>` width/height.
7. `deck.tsx`: cover contacts (email, GitHub, blog) become links (reuse the
   pattern in `resume.tsx`); `project.repo` a link; star rating span
   `role="img"`; `<img>` width/height; drop deprecated `scrolling="no"` if CSS
   `overflow: hidden` already covers it. Do not change any wording.

### Task 8: Blog-starter pages

Files: `src/app/_components/markdown-styles.module.css`, `date-formatter.tsx`,
`avatar.tsx`, `post-header.tsx`, `post-title.tsx`, `post-preview.tsx`,
`cover-image.tsx`, `more-stories.tsx`, `src/app/studys/list/page.tsx`,
`src/app/posts/[slug]/page.tsx`, `src/app/studys/[slug]/page.tsx`.

1. `markdown-styles.module.css`: links visibly styled (underline + primary
   color, hover state); `ul`/`ol` list styles and padding; `pre` with
   `overflow-x-auto`; `img { max-width: 100%; height: auto }`; h4–h6 sizes;
   `text-wrap: balance` on headings; inline `code` styling.
2. `date-formatter.tsx`: `Intl.DateTimeFormat('ko-KR', { dateStyle: 'long' })`
   in `<time dateTime>`; an invalid date renders nothing instead of throwing.
3. `avatar.tsx`: `width`/`height` on the `<img>`, `loading="lazy"`, `alt=""`.
4. `post-header.tsx`: replace `sm:mx-96` with a max-width container so the cover
   isn't squeezed.
5. `post-title.tsx`: monotonic size scale (`text-4xl md:text-5xl lg:text-6xl`),
   `text-balance`, `break-words`.
6. `post-preview.tsx`, `cover-image.tsx`: accept a `basePath` prop (default
   `/posts`) so `studys/list` links to `/studys/<slug>`; `cover-image` link is
   `tabIndex={-1}` + `aria-hidden` when a title link sits next to it, `alt=""`,
   `sizes` on the image, a `focus-visible` equivalent of its hover shadow;
   long titles `line-clamp-2`/`break-words`.
7. `more-stories.tsx` + `studys/list/page.tsx`: page `<h1>` "학습 노트"
   (replacing the English "More Stories" heading); stop dropping the newest post
   (`slice(1)` was for a removed hero); empty state "아직 작성된 글이 없습니다.".
8. `[slug]` pages: metadata title drops "Next.js Blog Example" — use
   `${title} | ${BLOG_NAME}` (from `@/lib/constants`).

## Phase B — UI/UX gaps and missing features (added 2026-09-29)

The owner asked for the remaining UX gaps and obviously missing features to be
handled in the same refactor PR. Same Global Constraints as above, plus: a
feature task may add new files where it says so.

### Task 9: Deferred small fixes

Files: `src/app/_components/ChatWidget.tsx`, `src/app/chat/user/page.tsx`,
`src/app/auth/regist/page.tsx`, `src/lib/pokemon/hooks/usePokemonSearch.ts`,
`src/app/pokemon/meta/_components/FormatSelector.tsx`,
`src/app/_components/BootScreen.tsx`, `src/lib/utils.ts`,
`src/interfaces/user.ts`, `src/app/_components/ui/morphing-dialog.tsx`,
`src/app/_components/theme-switcher.tsx`, `src/app/posts/[slug]/page.tsx`,
`src/app/studys/[slug]/page.tsx`.

1. ChatWidget and chat/user: `onWebSocketClose` only sets the closed status when
   the closing client is still the current one (`stompClient.current === client`),
   so a StrictMode remount can't leave "연결 끊김" showing while connected.
2. ChatWidget: Escape does not close the panel while an IME composition is
   active (`!e.nativeEvent.isComposing`).
3. ChatWidget and chat/user: the Enter/IME guard also treats `e.keyCode === 229`
   as composing (Safari).
4. regist: capture the email when sending the code; if `user.email` changed
   before the response arrives, ignore the response. "인증번호 확인" before any
   code was sent shows "먼저 인증번호를 받으세요." instead of the wrong-code message.
5. usePokemonSearch: `clearSearch()` also resets `isSearching` to false.
6. FormatSelector: group labels "Gen 9" / "Gen 8" … → "9세대" / "8세대" …
   (labels only; format ids and the format button texts stay).
7. BootScreen: when the overlay is skipped for reduced motion, still set the
   session key so a later visit in the same session doesn't show it.
8. utils.ts `buttonPrimaryClass`: `text-white` → `text-on-primary`.
9. interfaces/user.ts: delete the unused `EmailAuth` type (grep first).
10. morphing-dialog.tsx: drop the no-op `overscroll-contain` on the overlay.
11. `/posts/[slug]` and `/studys/[slug]` crash ("This page couldn't load"):
    they read `params.slug` synchronously, but on Next 16 `params` is a
    Promise. Type `params` as `Promise<{ slug: string }>` and `await` it in
    the page and in `generateMetadata` (keep `generateStaticParams`).
12. theme-switcher.tsx: when the layout re-renders on the client (e.g. after a
    route error), the injected inline script doesn't run, `window.updateDOM`
    is undefined and the component throws "t is not a function", taking the
    whole page down. Guard the calls (skip when `window.updateDOM` is absent)
    so a missing script can't crash the app.

### Task 10: Light-mode primary contrast

Files: `src/app/globals.css`.

The light-mode primary `#5E81AC` gives white text 4.0:1 and is 3.5:1 as text on
the page background. Change only the light `:root` tokens:
`--color-primary: 74 109 151` (`#4A6D97`: white on it 5.35:1, it on `#ECEFF4`
4.64:1) and `--color-primary-hover` to a darker shade that keeps white text at
≥4.5:1 (pick one, state its ratio in the report — e.g. `63 95 135` `#3F5F87`).
Do not touch the dark tokens or the pixel theme's `--px-*` variables. Update
the comments next to the tokens.

### Task 11: Post create matches the backend contract

Files: `src/app/posts/create/page.tsx`, `src/lib/api/post.ts`.

The backend's `POST /posts` is `multipart/form-data` with a `data` part
(`application/json`: `{ title, excerpt }`) and an optional `coverImage` file
part, and returns the created Post entity (`{ postId, title, excerpt, … }`),
or `{ code, message }` on error. The page currently appends `title` and
`excerpt` as separate parts and checks `msg === 'Success'`, so every submit
fails. Send `data` as
`new Blob([JSON.stringify({ title, excerpt })], { type: 'application/json' })`,
keep `coverImage`, treat a response with `postId` as success, anything else as
an error with a next step; update `CreatePostResponse` in `post.ts` to match.
Keep the success navigation as it is.

### Task 12: Keep the builder team across reloads

Files: `src/app/pokemon/builder/_components/TeamBuilder.tsx`.

1. Save the team to `localStorage` under `ohgnoy.builder.team.v1` on every
   change; restore it on mount (try/catch; ignore data that doesn't match the
   `TeamMember` shape; render the empty team on the server and restore in an
   effect to avoid a hydration mismatch).
2. A "팀 비우기" button (shown when the team isn't empty) asks for inline
   confirmation — "팀을 모두 비울까요?" with "비우기" / "취소" buttons — never
   `window.confirm`. After clearing, show "팀을 비웠습니다." with a "되돌리기"
   button for 5 seconds that restores the previous team.

### Task 13: Compare two Pokémon

Files: new `src/app/pokemon/compare/page.tsx` (+ `_components/` as needed),
new `src/app/pokemon/list/_components/CompareTray.tsx`,
`src/app/pokemon/list/_components/PokemonGrid.tsx` (to render the tray),
`docs/architecture.md`.

The compare toggle on every card writes to `useCompareStore` (two slots,
`mon_1`/`mon_2`) but nothing shows a comparison.
1. `CompareTray`: a fixed bottom bar on /pokemon/list, shown while at least one
   Pokémon is selected. Each slot shows the pixel sprite (`PixelSprite`), the
   Korean name when known, and a remove button ("{name} 비교에서 빼기"). A
   "비교하기" `<Link>` to `/pokemon/compare?a={id}&b={id}` is enabled only with
   two selected; with one, a hint "한 마리 더 고르세요." Pixel theme
   (`PixelCard`/`PixelButton` look, no border-radius), safe-area bottom inset,
   and add bottom padding to the grid so the tray never covers the last row.
2. `/pokemon/compare` (server page): read `a` and `b`, fetch both with the
   existing fetchers in `src/lib/pokemon/fetchers/` and transformers (Korean
   names via `i18n.ts`), and show them side by side in `PixelCard`s: sprite,
   name, `TypeBadge`s, height/weight, and the six base stats as paired bars
   with the higher value emphasized (not by color alone — add "▲"/weight),
   plus the totals, numbers `tabular-nums`. Invalid/missing ids → a clear
   message and a link back to /pokemon/list. `<h1>` "포켓몬 비교"; each side
   links to its detail page. Stack the two columns on narrow screens.
3. Add the route to `docs/architecture.md`.

### Task 14: Collapsible sidebar on small screens

Files: `src/app/_components/SiteShell.tsx`, `src/app/_components/site-shell.module.css`.

At ≤640px the whole sidebar (logo, nav, icon row, 88px sprite panel) stacks
above `<main>`, pushing content about a screen down. On small screens show a
compact bar — logo plus a "메뉴" toggle (`aria-expanded`, `aria-controls`) —
and reveal the nav, icon row and theme switch when toggled; hide the partner
sprite panel on small screens. Close it on route change and on Escape (return
focus to the toggle). Desktop (>640px) must look exactly as now. Pixel rules
apply: reuse the existing frame/border-image styles, no border-radius.
