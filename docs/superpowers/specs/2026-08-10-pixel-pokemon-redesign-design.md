# 픽셀 + 포켓몬 리디자인 (홈 + 포켓몬 섹션)

## 배경

`stitch_retro_8_bit_design_system` 레퍼런스(Google Stitch로 생성된 화면들)를 참고해 "진짜 픽셀 + 포켓몬" 느낌으로 프로젝트를 리디자인하려 했으나, 레퍼런스 자체가 다음 문제로 목표에서 벗어나 있었다:

1. 화면마다 서로 다른 디자인 시스템(8bit_retro_system vs pocket_adventure)이 폰트·색·모서리 규칙 없이 혼재.
2. 아이콘이 전 화면에서 Material Symbols Outlined(구글 모던 아이콘)로 통일되어 있어 픽셀 감성을 깨뜨림.
3. 색상이 포켓몬이 아니라 Material Design 3 자동 생성 팔레트.
4. 포켓몬 이미지가 사실적 AI 렌더링이라 각진 UI 크롬과 톤이 안 맞음.

이 프로젝트(Next.js App Router + Tailwind, Nord 다크/라이트 테마)에는 레퍼런스를 그대로 가져오지 않고, 위 교훈을 반영해 **일관된 픽셀 UI 톤**을 기존 Nord 팔레트 위에 얹는 방식으로 적용한다.

## 범위

- **포함**: 홈(`src/app/page.tsx`), 포켓몬 섹션(도감 리스트/상세/팀빌더/메타, `src/app/pokemon/**`), 전역 헤더(`Intro`)·푸터(`Footer`)의 테두리·폰트·아이콘 프레이밍.
- **제외**: 블로그/스터디/채팅/포트폴리오/인증 페이지의 본문 콘텐츠 스타일(헤더·푸터 경미한 변경은 전역이라 자동 반영되지만, 페이지 자체 리디자인은 별도 스펙에서 다룬다).

## 결정된 방향 (사용자 확정)

- 컬러 팔레트: **기존 Nord 유지**, 별도 포켓덱스 레드 도입 안 함. 포켓몬 정체성은 색이 아니라 UI 크롬(테두리·픽셀폰트·이미지·타입뱃지)으로 표현.
- 픽셀 폰트(Press Start 2P) 적용 범위: **제목·라벨에만** 적용. 본문/수치는 모노스페이스(Space Mono)로 통일.
- 아이콘: 새 SVG 세트를 그리지 않고, 기존 `react-icons`를 굵은 테두리 각진 박스(`PixelIconBox`)에 담아 통일감 확보.
- 포켓몬 이미지: 공식 일러스트(`official-artwork`) → 게임보이 픽셀 스프라이트(`sprites.front_default`)로 교체, `image-rendering: pixelated` 적용.
- 헤더/푸터: 전역이므로 구조·로직 변경 없이 테두리·폰트·아이콘 프레임만 가볍게 픽셀화하여 다른 페이지와의 이질감을 최소화.

## 아키텍처

### 1. 디자인 토큰 (Tailwind 확장)

`tailwind.config.ts`에 추가:
- `fontFamily.pixel` → Press Start 2P (`next/font/google`로 로드, CSS 변수로 노출)
- `fontFamily.mono-pixel` → Space Mono
- `boxShadow.pixel` → `2px 2px 0 rgb(var(--color-text))` (블러 없는 하드 오프셋, Nord 변수 참조라 다크모드 자동 대응)
- 테두리는 별도 유틸 클래스 없이 `border-2 border-text-base rounded-none` 조합을 그대로 사용 (기존 `text-base` 토큰이 이미 존재)

버튼 눌림 효과는 Tailwind 화이트리스트 유틸 조합으로 처리:
`active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-transform`

### 2. 공용 프리미티브: `src/app/_components/ui/pixel/`

| 파일 | 컴포넌트 | 역할 |
|---|---|---|
| `PixelCard.tsx` | `PixelCard` | `border-2 border-text-base shadow-pixel rounded-none bg-surface`, children을 감싸는 컨테이너. `className` prop으로 확장 허용 |
| `PixelButton.tsx` | `PixelButton` | `variant: "primary" \| "ghost"`, 눌림 효과 내장. 기존 `<button>`/`<Link>` 스타일 대체 |
| `PixelBadge.tsx` | `PixelBadge` | `TypeBadge`의 시각 스타일만 대체(각짐 + 1px 테두리). 타입별 색상 매핑(`TYPE_COLORS`)은 기존 값 재사용, 로직 변경 없음 |
| `PixelIconBox.tsx` | `PixelIconBox` | `children`(아이콘 엘리먼트)을 2px 테두리 정사각 박스로 감싸는 wrapper. 기존 `react-icons` 컴포넌트를 그대로 전달받아 사용 |

각 프리미티브는 스타일만 담당하며 비즈니스 로직(좋아요 토글, 비교하기 등)은 건드리지 않는다. 기존 컴포넌트(`PokemonCard`, `TypeBadge`, `Intro`, `Footer`, 홈 `page.tsx`)는 내부 마크업의 클래스/래퍼만 프리미티브로 교체한다.

### 3. 적용 대상별 변경

- **`src/app/page.tsx`**: `h1` → `font-pixel text-2xl`(픽셀 폰트는 넓은 자간을 가지므로 4xl 대신 축소), 섹션 카드 4개 → `PixelCard`로 감싼 `<Link>`/`<a>`, 소셜 아이콘 3개 → `PixelIconBox`.
- **`src/app/_components/intro.tsx`**: 로고 텍스트 → `font-pixel text-sm`, 로그인 아이콘 → `PixelIconBox`.
- **`src/app/_components/footer.tsx`**: 소셜 아이콘 3개 → `PixelIconBox`.
- **`src/app/_components/pokemonCard.tsx`**: 최상위 컨테이너 `rounded-2xl bg-neutral-300 ... shadow-xl` → `PixelCard`. 좋아요/비교 아이콘 로직은 그대로, 시각 스타일만 각지게. 이미지 소스를 `official-artwork.front_default` → `sprites.front_default`로 변경하고 `style={{ imageRendering: 'pixelated' }}` 추가, 스프라이트가 `null`이면 기존 official-artwork로 폴백.
- **`src/app/_components/TypeBadge.tsx`**: `PixelBadge` 렌더링으로 교체 (색상표 `TYPE_COLORS`는 그대로 유지).
- **포켓몬 상세/빌더/메타 페이지 하위 `_components/`**: `PokemonCard`/`TypeBadge`를 재사용하는 곳은 자동으로 반영됨. 페이지별로 자체 카드 마크업이 있는 경우(`PokemonHeader`, `PokemonStatsSection` 등) 톤 통일을 위해 `PixelCard`/`PixelBadge`로 교체 — 구현 단계에서 실제 파일을 읽고 확인.

### 4. 다크모드 / 접근성

- 테두리·그림자 색이 `--color-text` CSS 변수를 참조하므로 라이트/다크 전환 시 자동으로 대비 유지 (별도 다크 variant 클래스 불필요).
- 인터랙티브 요소에 `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary` 추가 — 기존에 없던 키보드 포커스 링을 이번에 함께 보강.

## 에러/엣지 케이스

- 스프라이트 이미지가 없는 포켓몬(일부 폼/메가진화 등): `sprites.front_default ?? sprites.other?.['official-artwork'].front_default`로 폴백.
- Press Start 2P는 자간이 넓어 좁은 화면에서 줄바꿈이 어색할 수 있음 → 홈 `h1`, 헤더 로고는 `whitespace-nowrap` + 반응형 축소(`text-lg sm:text-xl`) 적용.
- 기존 `dark:` variant 클래스가 많이 박혀 있는 컴포넌트(`pokemonCard.tsx`)는 프리미티브로 교체하면서 다크 전용 클래스를 제거하고 CSS 변수 기반으로 통합 — 실수로 다크모드 대비가 깨지지 않도록 교체 후 라이트/다크 각각 육안 확인 필수.

## 테스트 계획

- `npm run dev`로 다음을 라이트/다크 모드 각각 확인:
  - 홈 페이지 카드 4개, 소셜 아이콘, 헤더/푸터
  - 포켓몬 리스트 그리드 카드, 타입 뱃지, 좋아요/비교 토글 동작
  - 포켓몬 상세 페이지 헤더/스탯/진화 체인
  - 팀빌더, 메타 페이지 진입 시 카드 스타일 회귀 없는지
  - 블로그/스터디/채팅/인증 페이지는 헤더·푸터만 바뀌고 본문 레이아웃은 그대로인지
- 키보드 탭 이동으로 포커스 링이 모든 인터랙티브 요소에 보이는지 확인.

## 비범위 (명시적으로 하지 않는 것)

- 포켓덱스 레드 등 새 액션 컬러 도입 안 함 (Nord 유지 확정).
- 커스텀 픽셀 아이콘 SVG 신규 제작 안 함 (기존 react-icons 재사용).
- 블로그/스터디/채팅/포트폴리오/인증 페이지의 콘텐츠 영역 리디자인 안 함.
