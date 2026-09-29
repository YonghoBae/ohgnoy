# Known Issues / Follow-ups

Things discovered while working on this codebase that are real but out of scope for whatever task surfaced them. Check this file before assuming a data source or file is production-ready.

## `/posts` and `/studys` both render Next.js blog-starter demo content, not real posts

`src/lib/api.ts` (`getAllPosts()`, `getPostBySlug()`) reads markdown files from `_posts/`. Those files (`hello-world.md`, `dynamic-routing.md`, `preview.md`, `test.md`) are leftover **Next.js blog-starter template demo content** — Lorem Ipsum excerpts, a fake author ("Tim Neutkens"), not the site owner's real content. This isn't an orphaned/unused function — it's actively imported by four pages: `src/app/posts/[slug]/page.tsx`, `src/app/studys/list/page.tsx`, and `src/app/studys/[slug]/page.tsx` (the last two both use it despite `/studys` being conceptually a separate "study notes" section from `/posts` — they currently show the same demo data).

**Do not** wire any new feature (a homepage "recent posts" panel, a search index, anything) to `getAllPosts()`/`_posts/` without first checking whether this has been fixed — as of this writing it hasn't. A real fix means either replacing `_posts/*.md` with real content, or pointing `/studys` at a different real source (the external Obsidian digital garden linked via `DIGITAL_GARDEN_URL`, or a backend API — `/studys/create` exists as a route, implying a real backend was intended for studys specifically).

## `/portfolio` (web) content is now stale relative to `/portfolio-pdf`

`/portfolio-pdf` was rebuilt from the owner's Notion portfolio (2026-09-01) and
carries the current material: four projects (AJT, AgentHub, AI 기반 홈서버 장애
관제, Leafy) with measured results, ★-rated skills, SSAFY/몰입교육/우테코
education entries, and certifications.

`/portfolio` still reads `src/app/portfolio/data.ts`, which was **not** updated.
It holds the older set — three projects in STAR prose, category-grouped skills
with no ratings, `충북대학교 ... 2021.03 - Present`, no certifications — plus a
different email (`constants.ts` has `wolyong134@gmail.com`; the Notion source
and the deck use `dyddyd134@naver.com`).

The two data files are separate on purpose: the deck is metric-tile-led and the
web page is narrative, so a single shape would serve neither. But that means
**the web page is the one now carrying outdated facts.** Updating it was
deliberately left out of the deck task's scope; do it as its own change rather
than assuming `/portfolio` reflects current reality.

## AJT 조회·검증 경로 도판 2장이 덱에 없다

`llm-wiki/diagrams/query-path.html`(2110×1800)과 `verification-path.html`
(1430×1650)은 권한 적용 조회와 출처 검증 경로를 1/2·2/2로 나눠 그린 짝이다.
16:9 페이지에서 두 장 모두 라벨이 5~7pt로 떨어져 덱에서 빼 두었고, 미참조
사본은 `public/portfolio/diagrams/`에서 지웠다(vault에 원본이 있다).

AgentHub의 파이프라인·근거 판정 두 장처럼 슬라이드 비율(2360×~1450)로 다시
그리면 AJT에도 넣을 수 있다. 다만 AJT는 이미 5페이지이고 그러면 7페이지가 되므로,
넣을지는 덱 분량과 함께 판단해야 한다. 재작업 절차는
`projects/llm-wiki/docs/deployment-split-qa.md`와 AgentTrace 두 장의 커밋
(vault `cc01f1a`, `bcbf728`)에 남아 있다.

다시 그리기 전에 고쳐야 할 것: `verification-path.html`의 `grounding-gate`
카드는 내부 rule 박스가 카드 아래쪽을 23px 넘어 잘려 있다(같은 결함을
AgentTrace 두 장에서는 고쳤다). 이 파일은 좌표 블록이 두 벌 들어 있어 어느
쪽이 유효한지부터 확인해야 하므로, 덱에 다시 넣는 작업과 함께 처리한다.


## 덱의 「스캔 문서는 OCR로 분기」는 AJT 코드가 하는 일과 다르다

`portfolio-pdf/data.tsx` 네 곳이 AJT 문서 파싱을 «스캔 문서를 판정해 OCR로
분기»한다고 적는다 — 주요 기능(`features`), 담당 역할(`contribution`), Skills
note(`문서 파싱 · OCR`), 문제 해결(`스캔 PDF 텍스트 추출 — Gemini 비전 OCR`).

실제 코드(`~/workspace/AJT/ajt-llm-wiki`, `ai/src/document_parser/pdf_parser.py`
의 `needs_ocr`)는 **스캔 여부를 판정하지 않는다.** PDF를 페이지 단위로 돌면서
추출된 텍스트가 공백 제외 20자 미만이거나 `�` 비율이 10%를 넘으면 그
페이지만 OCR로 보낸다. 스캔본은 그 조건에 걸리는 대표 사례일 뿐이고, 폰트
인코딩이 깨진 일반 PDF도 같은 경로를 탄다. 넷 중 마지막(Gemini 비전 OCR)만
엔진을 정확히 말하고 있다.

고치는 방향 둘 중 하나이고, 아직 어느 쪽도 하지 않았다:

1. **문장을 실제 동작에 맞춘다** — 「페이지별 추출 품질(문자 수·깨짐 비율)로
   OCR 여부 판정」. 덱만 고치면 되고 코드는 그대로.
2. **코드를 문장에 맞춘다** — `needs_ocr`에 이미지 면적 신호를 넣어 스캔 여부를
   실제로 보게 한다. 해당 함수 위에 `ponytail:` 주석으로 올릴 길과 막히는
   지점(실제 샘플 PDF 부재)을 적어 뒀다.

소유자는 2번을 선호한다고 밝혔다(2026-09-18). 2번을 하면 1번은 필요 없어진다.

## /pokemon/list 검색은 영어 이름만 찾는다

목록 검색(`usePokemonSearch`)은 PokeAPI 영어 slug를 `startsWith`로만 맞춘다. 그래서
"피카츄"로는 찾을 수 없고, 검색창 안내 문구도 영어 예시("예: pikachu")로 바꿔 두었다.
빌더의 포켓몬 선택(`PokemonPicker`)은 `/api/pokemon/ko-names` 인덱스로 한국어 검색을
하므로, 같은 인덱스를 목록 검색에도 쓰면 된다(2026-09-29 기록).
결과 카드의 이름은 이제 한국어로 나오지만, 매칭은 여전히 영어 slug로만 한다.

## 회원가입 인증번호를 브라우저에서 비교한다

`POST /users/email` 응답의 `data`에 인증번호가 그대로 들어오고,
`/auth/regist`가 사용자가 입력한 값과 브라우저에서 비교한다. 개발자 도구로 번호를 볼 수
있다. 백엔드에 "번호 확인" 엔드포인트를 만들고 응답에서 번호를 빼야 고칠 수 있다
(2026-09-29 기록).

## 포켓몬 폼 이름 일부가 한국어로 겹친다

`koNames.json`에서 서로 다른 폼끼리 같은 한국어 이름을 쓰는 묶음이 64개 있다. 거다이맥스
(`venusaur-gmax` → 이상해꽃), 주인 포켓몬(`gumshoos-totem`), 피카츄 옷차림, 코라이돈·미라이돈
모드, 메테노 색, 시비꼬 깃털 같은 폼이다. PokeAPI가 이 폼들에 한국어 폼 이름을 주지 않는다
(GraphQL도 REST `pokemon-form`도 비어 있다). `scripts/build-ko-names.mjs`는 폼 이름이 없으면
종 이름을 그대로 쓴다. 고치려면 `REGION`처럼 `-gmax` → "(거다이맥스)" 등 접미사 표를 스크립트에
더하면 된다(2026-09-29 기록, 65 → 64: 다투곰 (붉은 달)만 풀렸다).

## VGC 2026 메가스톤·특성 일부에 한국어 이름이 없다

`gen9championsvgc2026regmb`(VGC 2026 M-B)의 새 메가진화 관련 데이터는 PokeAPI에 한국어가
없다. 2026-08 기준 도구 148개 중 34개(`staraptite`, `feraligite` 등 새
메가스톤), 특성 194개 중 6개(`megasol`, `dragonize`, `piercingdrill` 등), 포켓몬 35종
(`Staraptor-Mega` 등)이 `koNames.json`에 없다. 도구·특성은 영어로 나오고, 포켓몬은
`getPokemonNames`가 "메가{종 이름}"으로 만든다. PokeAPI가 채우면 스크립트 재생성으로 풀린다
(2026-09-29 기록).

## 세트 없는 팀원은 내보내기에 slug 대문자 이름이 들어간다

빌더에서 Smogon 세트가 없는 포켓몬을 넣으면 내보내기(`TeamExport`) 첫 줄이
PokeAPI slug를 대문자로 바꾼 이름("Staraptor-Mega", "Ogerpon-Wellspring-Mask")이 된다.
Showdown 종 이름과 다를 수 있어 가져오기에서 거부될 수 있다. Smogon 키를 모르는 폼에서만
생긴다(2026-09-29 기록). 싱글 랭크배틀 사용률에 있는 포켓몬은 사용률로 만든 세트가 들어가
Smogon 키를 쓴다.

## 빌더는 싱글 랭크배틀 세트만 쓴다

빌더의 포켓몬 선택(`PokemonPicker`)은 `DEFAULT_FORMAT`(싱글 랭크배틀, `gen9championsbssregmb`)
으로만 세트를 가져온다. 포맷을 고르는 곳이 없어서 더블 랭크배틀이나 Smogon 등급 세트로 팀을
짤 수 없다. 이 포맷에는 pkmn 세트가 없어 사용률 1위 값으로 만든 "가장 많이 쓰는 구성" 하나만
나오고, 기술·아이템·특성은 Smogon id(`focussash`)로 내보내진다. Showdown 가져오기는 id를
이름으로 바꿔 주지만 내보내기 글 자체는 id로 보인다(2026-09-29 기록).
