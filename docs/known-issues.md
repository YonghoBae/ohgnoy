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

## 이름에 하이픈이 있는 포켓몬은 상세 페이지에 실전 데이터가 안 나온다

`fetchPokemonBattleData(pokemon.name, ...)`는 PokeAPI 이름(`great-tusk`)으로
Smogon 데이터를 찾는데, Smogon 키는 `Great Tusk`다. `getPokemonUsage`와
`getPokemonSets`는 대소문자만 무시하고 비교하므로 하이픈과 공백 차이로
못 찾는다(`/api/pokemon/battle?name=great-tusk` → usage 없음, `name=Great%20Tusk`
→ usage와 세트 4개). 폼 이름(`landorus-therian` ↔ `Landorus-Therian`)처럼
하이픈이 원래 있는 경우는 맞는다. 이름 변환 규칙은 포켓몬 백엔드 API로 옮길 때
그쪽에서 정하는 편이 낫다(2026-09-28 발견).
