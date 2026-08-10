# 픽셀 + 포켓몬 리디자인 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 홈 페이지와 포켓몬 섹션(도감 리스트/상세/팀빌더/메타)을 기존 Nord Tailwind 테마 위에 "픽셀 + 포켓몬" 톤(각진 테두리, 픽셀 폰트 제목, 하드 오프셋 섀도우, 게임보이 스프라이트)으로 리디자인한다.

**Architecture:** `src/app/_components/ui/pixel/`에 공용 프리미티브(`PixelCard`, `PixelButton`, `PixelBadge`, `PixelIconBox`, `PixelSprite`)를 먼저 만들고, 기존 컴포넌트들의 마크업을 프리미티브로 교체한다. 색상은 Nord CSS 변수를 그대로 참조하므로 다크모드가 자동으로 유지된다. 비즈니스 로직(좋아요/비교/팀빌더 상태 등)은 건드리지 않는다.

**Tech Stack:** Next.js App Router, Tailwind CSS v3, `next/font/google`, `pokenode-ts`.

## Global Constraints

- 스펙 문서: `docs/superpowers/specs/2026-08-10-pixel-pokemon-redesign-design.md`
- Nord 컬러 팔레트 유지 — 새 액션 컬러(포켓덱스 레드 등) 도입 금지.
- 픽셀 폰트(Press Start 2P)는 제목·라벨에만 적용, 본문/수치는 모노스페이스(Space Mono).
- 새 SVG 아이콘 세트 제작 금지 — 기존 `react-icons`를 `PixelIconBox`로 감싸서 재사용.
- 이 프로젝트는 자동화 테스트 프레임워크가 없음(`package.json`에 jest/vitest 등 미설치). 스펙의 테스트 계획도 수동 브라우저 검증으로 명시되어 있으므로, 각 태스크의 검증 단계는 `npm run dev` 기반 수동 확인으로 진행한다.
- 범위 밖(건드리지 않음): 블로그/스터디/채팅/포트폴리오/인증 페이지의 본문 콘텐츠, `PokemonPicker`의 검색 입력창·세트 목록 버튼 세부 스타일, `TeamExport`/`FormatSelector`의 내부 스타일 — 이번 플랜은 카드·뱃지·이미지·주요 액션 버튼만 교체한다.
- `src/app/_components/pokemonCard.tsx` (소문자, 최상위)는 어디서도 import되지 않는 미사용 파일이다. 실제 리스트에서 쓰이는 카드는 `src/app/pokemon/list/_components/PokemonCard.tsx`다. 이 플랜은 후자만 수정한다.

---

### Task 1: 픽셀 폰트 로딩 + Tailwind 토큰 추가

**Files:**
- Create: `src/lib/fonts.ts`
- Modify: `src/app/layout.tsx`
- Modify: `tailwind.config.ts`

**Interfaces:**
- Produces: `pressStart2P` (CSS 변수 `--font-pixel`), `spaceMono` (CSS 변수 `--font-mono-pixel`) — 이후 모든 태스크가 `font-pixel`, `font-mono-pixel` Tailwind 클래스로 사용.
- Produces: `boxShadow.pixel`, `borderColor`용 기존 `text-base` 토큰 재사용(`border-text-base`).

- [ ] **Step 1: `src/lib/fonts.ts` 작성**

```ts
import { Press_Start_2P, Space_Mono } from "next/font/google";

export const pressStart2P = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pixel",
  display: "swap",
});

export const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono-pixel",
  display: "swap",
});
```

- [ ] **Step 2: `tailwind.config.ts`에 폰트/섀도우 토큰 추가**

`theme.extend`에 다음을 추가한다 (기존 `boxShadow: { sm: ..., md: ... }` 객체에 `pixel` 키를 추가하고, `fontFamily`는 새로 추가):

```ts
      fontFamily: {
        pixel: ["var(--font-pixel)", "cursive"],
        "mono-pixel": ["var(--font-mono-pixel)", "monospace"],
      },
      boxShadow: {
        sm: "0 5px 10px rgba(0, 0, 0, 0.12)",
        md: "0 8px 30px rgba(0, 0, 0, 0.12)",
        pixel: "2px 2px 0 0 rgb(var(--color-text) / 1)",
      },
```

- [ ] **Step 3: `src/app/layout.tsx`에 폰트 변수 적용**

`import { Inter } from 'next/font/google';` 아래에 추가:

```ts
import { pressStart2P, spaceMono } from '@/lib/fonts';
```

`body`의 `className` 인자에 폰트 변수를 추가한다 (기존 `cn(inter.className, 'bg-[#ECEFF4] ...')`를):

```tsx
        className={cn(
          inter.className,
          pressStart2P.variable,
          spaceMono.variable,
          'bg-[#ECEFF4] dark:bg-[#2E3440] text-[#2E3440] dark:text-[#ECEFF4]',
        )}
```

- [ ] **Step 4: 수동 확인**

`npm run dev` 실행 후 아무 페이지에서 브라우저 devtools로 `<body>`에 `--font-pixel`, `--font-mono-pixel` CSS 변수가 잡혀 있는지 확인. 콘솔에 폰트 로딩 에러가 없는지 확인.

- [ ] **Step 5: 커밋**

```bash
git add src/lib/fonts.ts src/app/layout.tsx tailwind.config.ts
git commit -m "feat: add pixel/mono-pixel font tokens for pixel-pokemon redesign"
```

---

### Task 2: `PixelCard`, `PixelIconBox` 프리미티브 생성

**Files:**
- Create: `src/app/_components/ui/pixel/PixelCard.tsx`
- Create: `src/app/_components/ui/pixel/PixelIconBox.tsx`

**Interfaces:**
- Consumes: `cn` from `@/lib/utils` (기존 유틸, 이미 존재).
- Produces: `export default function PixelCard(props: React.HTMLAttributes<HTMLDivElement>)`, `export default function PixelIconBox({ children, className }: { children: React.ReactNode; className?: string })`.

- [ ] **Step 1: `PixelCard.tsx` 작성**

```tsx
import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export default function PixelCard({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-none border-2 border-text-base bg-surface shadow-pixel",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: `PixelIconBox.tsx` 작성**

```tsx
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function PixelIconBox({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-none border-2 border-text-base bg-surface text-text-muted transition-colors hover:border-primary hover:text-primary",
        className,
      )}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 3: 수동 확인**

이 태스크는 아직 어디에도 쓰이지 않으므로 `npm run build`(타입체크 목적)만 실행해 컴파일 에러가 없는지 확인.

Run: `npm run build`
Expected: 빌드 성공 (기존 페이지에 영향 없음, 새 파일 2개만 추가된 상태)

- [ ] **Step 4: 커밋**

```bash
git add src/app/_components/ui/pixel/PixelCard.tsx src/app/_components/ui/pixel/PixelIconBox.tsx
git commit -m "feat: add PixelCard and PixelIconBox primitives"
```

---

### Task 3: `PixelButton` 프리미티브 생성

**Files:**
- Create: `src/app/_components/ui/pixel/PixelButton.tsx`

**Interfaces:**
- Consumes: `cn` from `@/lib/utils`.
- Produces: `export default function PixelButton(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" })` — 이후 Task 8, 9에서 사용.

- [ ] **Step 1: `PixelButton.tsx` 작성**

```tsx
import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
}

export default function PixelButton({
  variant = "primary",
  className,
  children,
  ...props
}: PixelButtonProps) {
  return (
    <button
      className={cn(
        "rounded-none border-2 border-text-base px-4 py-2 text-sm font-semibold shadow-pixel transition-transform",
        "active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        variant === "primary"
          ? "bg-primary text-white"
          : "bg-surface text-text-base hover:border-primary hover:text-primary",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 2: 수동 확인**

Run: `npm run build`
Expected: 빌드 성공.

- [ ] **Step 3: 커밋**

```bash
git add src/app/_components/ui/pixel/PixelButton.tsx
git commit -m "feat: add PixelButton primitive"
```

---

### Task 4: `PixelSprite` 프리미티브 생성 (스프라이트 이미지 + URL 폴백 공용화)

**Files:**
- Create: `src/app/_components/ui/pixel/PixelSprite.tsx`

**Interfaces:**
- Consumes: `Pokemon` type from `pokenode-ts`.
- Produces:
  - `export function getPixelSpriteUrl(pokemon: Pick<Pokemon, "sprites">): string` — 이후 Task 9, 10에서 직접 사용 (Task 8, 11은 `PixelSprite`의 `pokemon` prop을 통해 간접 사용).
  - `export default function PixelSprite(props: { pokemon?: Pick<Pokemon, "sprites">; spriteUrl?: string; alt: string; size?: number; fill?: boolean; priority?: boolean; className?: string })`.

이 컴포넌트는 두 가지 사용처를 모두 지원해야 한다: (1) `Pokemon` 객체를 바로 받는 곳(리스트 카드, 진화 체인, 메타 랭킹), (2) 이미 문자열로 저장된 `spriteUrl`만 있는 곳(`PokemonDetail.spriteUrl`, `TeamMember.spriteUrl`).

- [ ] **Step 1: `PixelSprite.tsx` 작성**

```tsx
import Image from "next/image";
import { Pokemon } from "pokenode-ts";
import { cn } from "@/lib/utils";

export function getPixelSpriteUrl(pokemon: Pick<Pokemon, "sprites">): string {
  return (
    pokemon.sprites.front_default ??
    pokemon.sprites.other?.["official-artwork"].front_default ??
    ""
  );
}

interface PixelSpriteProps {
  pokemon?: Pick<Pokemon, "sprites">;
  spriteUrl?: string;
  alt: string;
  size?: number;
  fill?: boolean;
  priority?: boolean;
  className?: string;
}

export default function PixelSprite({
  pokemon,
  spriteUrl,
  alt,
  size = 96,
  fill = false,
  priority,
  className,
}: PixelSpriteProps) {
  const src = spriteUrl ?? (pokemon ? getPixelSpriteUrl(pokemon) : "");
  if (!src) return null;

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        style={{ imageRendering: "pixelated" }}
        className={cn("object-contain", className)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      priority={priority}
      style={{ imageRendering: "pixelated" }}
      className={cn("object-contain", className)}
    />
  );
}
```

- [ ] **Step 2: 수동 확인**

Run: `npm run build`
Expected: 빌드 성공.

- [ ] **Step 3: 커밋**

```bash
git add src/app/_components/ui/pixel/PixelSprite.tsx
git commit -m "feat: add PixelSprite primitive with pixel-art sprite fallback"
```

---

### Task 5: `TypeBadge` → `PixelBadge` 스타일 교체

**Files:**
- Modify: `src/app/_components/TypeBadge.tsx`

**Interfaces:**
- Consumes: 없음 (기존 `TYPE_COLORS`, `TYPE_KO` 재사용).
- Produces: `TypeBadge` 컴포넌트의 외부 시그니처(`{ type, size }`)는 변경 없음 — 이 컴포넌트를 쓰는 모든 곳(리스트 카드, 상세 헤더, 팀빌더, 메타 랭킹)이 자동으로 새 스타일을 받는다.

- [ ] **Step 1: `rounded-full` → 각진 뱃지로 교체**

`src/app/_components/TypeBadge.tsx`의 `sizeClass`와 `return` 블록을 다음으로 교체 (라인 52-59):

```tsx
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs";
  return (
    <span
      className={`rounded-none border border-text-base font-mono-pixel font-bold uppercase tracking-wide ${sizeClass} ${TYPE_COLORS[type]}`}
    >
      {TYPE_KO[type]}
    </span>
  );
```

- [ ] **Step 2: 수동 확인**

`npm run dev` → `/pokemon/list` 접속, 카드 하단 타입 뱃지가 각진 모서리 + 얇은 테두리 + 모노스페이스 폰트로 보이는지 확인. 라이트/다크 모드 전환해서 대비 확인.

- [ ] **Step 3: 커밋**

```bash
git add src/app/_components/TypeBadge.tsx
git commit -m "style: pixelate TypeBadge (square corners, mono-pixel font)"
```

---

### Task 6: 전역 헤더/푸터 픽셀화

**Files:**
- Modify: `src/app/_components/intro.tsx`
- Modify: `src/app/_components/footer.tsx`

**Interfaces:**
- Consumes: `PixelIconBox` from `@/app/_components/ui/pixel/PixelIconBox` (Task 2).

- [ ] **Step 1: `intro.tsx` 로고를 픽셀 폰트로**

`src/app/_components/intro.tsx`의 로고 `<Link>` (라인 15-20)를:

```tsx
      <Link
        href="/"
        className="font-pixel text-sm tracking-tight hover:opacity-70 transition-opacity whitespace-nowrap"
      >
        {BLOG_NAME}.
      </Link>
```

- [ ] **Step 2: 로그인 아이콘을 `PixelIconBox`로**

`src/app/_components/intro.tsx` 상단에 import 추가:

```tsx
import PixelIconBox from './ui/pixel/PixelIconBox';
```

로그인 `<Link>` (라인 35-41)를:

```tsx
        <Link href="/auth/login" aria-label="로그인" className="flex-shrink-0">
          <PixelIconBox>
            <FaRegUser size={14} />
          </PixelIconBox>
        </Link>
```

- [ ] **Step 3: `footer.tsx` 소셜 아이콘을 `PixelIconBox`로**

`src/app/_components/footer.tsx` 상단에 import 추가:

```tsx
import PixelIconBox from "@/app/_components/ui/pixel/PixelIconBox";
```

소셜 아이콘 3개 블록(라인 11-37)을:

```tsx
          <div className="flex items-center gap-3">
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <PixelIconBox>
                <FaGithub size={16} />
              </PixelIconBox>
            </a>
            <a
              href={DIGITAL_GARDEN_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="디지털가든"
            >
              <PixelIconBox>
                <FaExternalLinkAlt size={14} />
              </PixelIconBox>
            </a>
            <a href={`mailto:${EMAIL}`} aria-label="이메일">
              <PixelIconBox>
                <MdEmail size={16} />
              </PixelIconBox>
            </a>
          </div>
```

- [ ] **Step 4: 수동 확인**

`npm run dev` → 아무 페이지(홈, 블로그, 채팅 등)에서 헤더 로고가 픽셀 폰트로, 로그인 아이콘/푸터 소셜 아이콘이 각진 박스로 보이는지 확인. 헤더 네비게이션 링크 클릭 동작(Study/Portfolio 이동)이 그대로인지 확인.

- [ ] **Step 5: 커밋**

```bash
git add src/app/_components/intro.tsx src/app/_components/footer.tsx
git commit -m "style: pixelate global header/footer icons and logo font"
```

---

### Task 7: 홈 페이지 리디자인

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `PixelCard`, `PixelIconBox` from `@/app/_components/ui/pixel/*`.

- [ ] **Step 1: import 추가**

`src/app/page.tsx` 상단에 추가:

```tsx
import PixelCard from "@/app/_components/ui/pixel/PixelCard";
import PixelIconBox from "@/app/_components/ui/pixel/PixelIconBox";
```

- [ ] **Step 2: `h1`을 픽셀 폰트로, 소셜 아이콘을 `PixelIconBox`로**

`export default function Home()` 내부 첫 `<section>` (라인 40-70)을:

```tsx
      <section className="space-y-4">
        <h1 className="font-pixel text-xl tracking-tight sm:text-2xl">Ohgnoy.</h1>
        <p className="text-text-muted text-lg">개발하며 기록하는 공간</p>
        <div className="flex items-center gap-3 pt-1">
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <PixelIconBox>
              <FaGithub size={16} />
            </PixelIconBox>
          </a>
          <a
            href={DIGITAL_GARDEN_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="디지털가든"
          >
            <PixelIconBox>
              <FaExternalLinkAlt size={14} />
            </PixelIconBox>
          </a>
          <a href={`mailto:${EMAIL}`} aria-label="이메일">
            <PixelIconBox>
              <MdEmail size={16} />
            </PixelIconBox>
          </a>
        </div>
      </section>
```

- [ ] **Step 3: 섹션 카드를 `PixelCard`로 교체**

두 번째 `<section>` (라인 72-103)의 `cardClass` 변수와 렌더링 부분을 교체:

```tsx
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sections.map((section) => {
            const cardClass =
              "flex flex-col gap-2 px-6 py-5 transition-transform hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[4px_4px_0_0_rgb(var(--color-text)/1)]";

            const inner = (
              <>
                <span className="text-2xl">{section.icon}</span>
                <h2 className="font-pixel text-xs">{section.title}</h2>
                <p className="text-sm text-text-muted font-mono-pixel">{section.description}</p>
              </>
            );

            const linkClass =
              "rounded-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

            return section.external ? (
              <a
                key={section.href}
                href={section.href}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                <PixelCard className={cardClass}>{inner}</PixelCard>
              </a>
            ) : (
              <Link key={section.href} href={section.href} className={linkClass}>
                <PixelCard className={cardClass}>{inner}</PixelCard>
              </Link>
            );
          })}
        </div>
      </section>
```

- [ ] **Step 4: 수동 확인**

`npm run dev` → `/` 접속. 라이트/다크 모드 각각에서: `h1`이 픽셀 폰트로 보이는지, 카드 4개가 각진 테두리+하드 그림자로 보이는지, hover 시 그림자가 살짝 눌리는 방향으로 움직이는지, 카드 클릭 시 각 경로(`/pokemon/list`, `/studys/list`, 디지털가든 외부링크, `/portfolio`)로 이동하는지 확인.

- [ ] **Step 5: 커밋**

```bash
git add src/app/page.tsx
git commit -m "style: redesign home page with pixel cards and icons"
```

---

### Task 8: 포켓몬 도감 리스트 카드 픽셀화 + 스프라이트 교체

**Files:**
- Modify: `src/app/pokemon/list/_components/PokemonCard.tsx`

**Interfaces:**
- Consumes: `PixelCard`, `PixelSprite` from `@/app/_components/ui/pixel/*`.

- [ ] **Step 1: import 추가 및 이미지 교체**

`src/app/pokemon/list/_components/PokemonCard.tsx` 상단에서 `Image` import를 제거하고 대신:

```tsx
import PixelCard from "@/app/_components/ui/pixel/PixelCard";
import PixelSprite from "@/app/_components/ui/pixel/PixelSprite";
```

를 추가한다.

- [ ] **Step 2: 최상위 컨테이너를 `PixelCard`로, 이미지를 `PixelSprite`로 교체**

`return (...)` 블록 (라인 31-83)을:

```tsx
  return (
    <PixelCard className="flex h-fit w-full flex-col items-center justify-center px-3 py-2">
      <div className="mb-1 flex w-full flex-row justify-between">
        {Boolean(userInfo?.userId) &&
          (liked ? (
            <FaTrashCan
              role="button"
              tabIndex={0}
              aria-label="좋아요 취소"
              className="h-5 w-5 transform cursor-pointer text-red-500 transition-all duration-300 ease-in-out hover:scale-125"
              onClick={() => toggle(pokemon.id)}
            />
          ) : (
            <FaPlus
              role="button"
              tabIndex={0}
              aria-label="좋아요 추가"
              className="h-5 w-5 transform cursor-pointer text-green-600 transition-all duration-300 ease-in-out hover:scale-125"
              onClick={() => toggle(pokemon.id)}
            />
          ))}
        <BiGitCompare
          role="button"
          tabIndex={0}
          aria-label={comparing ? "비교 취소" : "비교에 추가"}
          onClick={() => toggleCompare(pokemon)}
          className={`h-5 w-5 transform cursor-pointer transition-all duration-300 ease-in-out hover:scale-125 ml-auto ${
            comparing ? "text-red-600" : "text-primary"
          }`}
        />
      </div>
      <h1 className="font-mono-pixel w-11/12 truncate text-center text-sm font-bold">
        {koName ?? pokemon.name.toUpperCase()}
      </h1>
      <button
        className="cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        onClick={() => router.push(`/pokemon/${pokemon.id}`)}
        aria-label={`${koName ?? pokemon.name} 상세 보기`}
      >
        <PixelSprite pokemon={pokemon} alt={pokemon.name} size={130} />
      </button>
      <div className="mt-1 flex flex-row items-center justify-center gap-2">
        {pokemon.types.map(({ type: { name } }) => (
          <TypeBadge key={name} type={name as PokemonTypeName} size="sm" />
        ))}
      </div>
    </PixelCard>
  );
```

- [ ] **Step 3: 수동 확인**

`npm run dev` → `/pokemon/list` 접속. 카드가 각진 테두리로 보이는지, 이미지가 게임보이 픽셀 스프라이트(96x96을 130px로 확대해도 또렷한 계단현상)로 바뀌었는지, 좋아요/비교 토글과 상세 페이지 이동이 그대로 동작하는지 확인.

- [ ] **Step 4: 커밋**

```bash
git add src/app/pokemon/list/_components/PokemonCard.tsx
git commit -m "style: pixelate pokemon list card and switch to pixel sprites"
```

---

### Task 9: 포켓몬 상세 페이지 (`PokemonHeader`, `PokemonInfo`, `PokemonStats`, `EvolutionChain`) 픽셀화

**Files:**
- Modify: `src/lib/pokemon/transformers/toPokemonDetail.ts`
- Modify: `src/app/pokemon/[id]/_components/PokemonHeader.tsx`
- Modify: `src/app/pokemon/[id]/_components/PokemonInfo.tsx`
- Modify: `src/app/pokemon/[id]/_components/PokemonStats.tsx`
- Modify: `src/app/pokemon/[id]/_components/EvolutionChain.tsx`

**Interfaces:**
- Consumes: `getPixelSpriteUrl`, `PixelSprite`, `PixelCard` from Task 2/4.

- [ ] **Step 1: `toPokemonDetail.ts`에서 스프라이트 URL을 픽셀 스프라이트로**

`src/lib/pokemon/transformers/toPokemonDetail.ts` 상단에 import 추가:

```ts
import { getPixelSpriteUrl } from "@/app/_components/ui/pixel/PixelSprite";
```

`spriteUrl: pokemon.sprites.other?.["official-artwork"].front_default ?? "",` 줄을:

```ts
    spriteUrl: getPixelSpriteUrl(pokemon),
```

로 교체.

- [ ] **Step 2: `PokemonHeader.tsx`를 `PixelSprite`/`PixelCard` 기반으로**

`src/app/pokemon/[id]/_components/PokemonHeader.tsx` 전체를:

```tsx
import PixelSprite from "@/app/_components/ui/pixel/PixelSprite";
import { PokemonDetail } from "@/types/pokemon/domain";
import TypeBadge from "@/app/_components/TypeBadge";

export default function PokemonHeader({ pokemon }: { pokemon: PokemonDetail }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="font-mono-pixel text-sm font-semibold text-text-muted">
        #{String(pokemon.id).padStart(4, "0")}
      </span>
      <h1 className="font-pixel text-lg tracking-tight">
        {pokemon.nameKo || pokemon.nameEn.toUpperCase()}
      </h1>
      <p className="text-sm text-text-muted">{pokemon.nameEn.toUpperCase()}</p>
      <div className="relative h-56 w-56">
        <PixelSprite spriteUrl={pokemon.spriteUrl} alt={pokemon.nameEn} fill priority />
      </div>
      <div className="flex flex-row gap-2">
        {pokemon.types.map((type) => (
          <TypeBadge key={type} type={type} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: `PokemonInfo.tsx` 컨테이너를 `PixelCard`로**

`src/app/pokemon/[id]/_components/PokemonInfo.tsx` 상단에 import 추가:

```tsx
import PixelCard from "@/app/_components/ui/pixel/PixelCard";
```

바깥 `<div className="flex flex-col gap-4 rounded-2xl bg-neutral-200 bg-opacity-50 p-5 dark:bg-neutral-700 dark:bg-opacity-50">`를:

```tsx
    <PixelCard className="flex flex-col gap-4 p-5">
```

로, 닫는 `</div>`를 `</PixelCard>`로 교체하고 `<h2>`에 `font-pixel text-xs` 클래스를 추가한다 (`<h2 className="font-pixel text-xs">기본 정보</h2>`).

- [ ] **Step 4: `PokemonStats.tsx` 컨테이너를 `PixelCard`로**

`src/app/pokemon/[id]/_components/PokemonStats.tsx` 상단에 import 추가:

```tsx
import PixelCard from "@/app/_components/ui/pixel/PixelCard";
```

바깥 `<div className="flex flex-col gap-3 rounded-2xl bg-neutral-200 bg-opacity-50 p-5 dark:bg-neutral-700 dark:bg-opacity-50">`를:

```tsx
    <PixelCard className="flex flex-col gap-3 p-5">
```

로, 닫는 `</div>`를 `</PixelCard>`로 교체하고 `<h2>`에 `font-pixel text-xs` 클래스를 추가한다. `StatBar`, 숫자 표시는 로직/색상 그대로 두되 수치 `<span>`(라인 28)에 `font-mono-pixel` 클래스를 추가해 탭 정렬된 느낌을 준다.

- [ ] **Step 5: `EvolutionChain.tsx` 이미지와 컨테이너 교체**

`src/app/pokemon/[id]/_components/EvolutionChain.tsx`에서 `Image` import를 제거하고 추가:

```tsx
import PixelCard from "@/app/_components/ui/pixel/PixelCard";
import PixelSprite, { getPixelSpriteUrl } from "@/app/_components/ui/pixel/PixelSprite";
```

`EvolutionNodeCard` 내부 `spriteUrl` 계산 줄을:

```tsx
    spriteUrl = getPixelSpriteUrl(pokemon);
```

로, 이미지 렌더링 부분을:

```tsx
      {spriteUrl && (
        <div className="relative h-20 w-20">
          <PixelSprite spriteUrl={spriteUrl} alt={koName} fill />
        </div>
      )}
```

로 교체. 최하단 `EvolutionChainSection`의 바깥 `<div className="flex flex-col gap-3 rounded-2xl bg-neutral-200 bg-opacity-50 p-5 dark:bg-neutral-700 dark:bg-opacity-50">`를 `<PixelCard className="flex flex-col gap-3 p-5">` (닫는 태그도 `</PixelCard>`)로, `<h2>`에 `font-pixel text-xs`를 추가한다.

- [ ] **Step 6: 수동 확인**

`npm run dev` → `/pokemon/25`(피카츄) 등 임의 상세 페이지 접속. 헤더 스프라이트가 픽셀 이미지인지, 정보/스탯/진화 카드가 각진 테두리로 통일되어 보이는지, 진화 체인 클릭 시 다른 포켓몬 상세로 이동하는지, 라이트/다크 모드 대비 확인.

- [ ] **Step 7: 커밋**

```bash
git add src/lib/pokemon/transformers/toPokemonDetail.ts src/app/pokemon/\[id\]/_components/PokemonHeader.tsx src/app/pokemon/\[id\]/_components/PokemonInfo.tsx src/app/pokemon/\[id\]/_components/PokemonStats.tsx src/app/pokemon/\[id\]/_components/EvolutionChain.tsx
git commit -m "style: pixelate pokemon detail page cards and switch to pixel sprites"
```

---

### Task 10: 팀 빌더 (`TeamBuilder`, `PokemonPicker`) 카드/스프라이트 픽셀화

**Files:**
- Modify: `src/app/pokemon/builder/_components/TeamBuilder.tsx`
- Modify: `src/app/pokemon/builder/_components/PokemonPicker.tsx`

**Interfaces:**
- Consumes: `PixelCard`, `PixelButton`, `PixelSprite`, `getPixelSpriteUrl` from Task 2/3/4.

- [ ] **Step 1: `TeamBuilder.tsx`의 `EmptySlot`/`FilledSlot`을 픽셀 스타일로**

상단에 import 추가:

```tsx
import PixelCard from "@/app/_components/ui/pixel/PixelCard";
import PixelButton from "@/app/_components/ui/pixel/PixelButton";
import PixelSprite from "@/app/_components/ui/pixel/PixelSprite";
```

`EmptySlot`을 (라인 23-33):

```tsx
function EmptySlot({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex h-36 flex-col items-center justify-center gap-2 rounded-none border-2 border-dashed border-text-muted text-text-muted transition-colors hover:border-primary hover:text-primary"
    >
      <span className="text-3xl">+</span>
      <span className="font-mono-pixel text-xs">포켓몬 추가</span>
    </button>
  );
}
```

`FilledSlot`을 (라인 35-66):

```tsx
function FilledSlot({
  member,
  onRemove,
  onSetChange: _onSetChange,
}: {
  member: TeamMember;
  onRemove: () => void;
  onSetChange: (set: BattleSet | null) => void;
}) {
  return (
    <PixelCard className="relative flex h-36 flex-col items-center justify-center gap-1 px-2 py-2">
      <button
        onClick={onRemove}
        aria-label="팀에서 제거"
        className="absolute right-2 top-2 text-xs text-text-muted hover:text-red-500"
      >
        ✕
      </button>
      <div className="relative h-16 w-16">
        <PixelSprite spriteUrl={member.spriteUrl} alt={member.nameEn} fill />
      </div>
      <span className="font-mono-pixel text-xs font-bold">{member.nameKo}</span>
      <div className="flex gap-1">
        {member.types.map((t) => (
          <TypeBadge key={t} type={t} size="sm" />
        ))}
      </div>
      {member.set && (
        <span className="text-xs text-primary">{member.set.name}</span>
      )}
    </PixelCard>
  );
}
```

(`onSetChange`는 기존에도 미사용 prop이었으므로 `_onSetChange`로 이름만 바꿔 lint 경고를 피한다. 실제 호출부 `handleSetChange` 전달은 그대로 유지.)

내보내기 버튼 (라인 127-133)을:

```tsx
        <PixelButton
          variant="primary"
          onClick={() => setShowExport(true)}
          className="self-end"
        >
          Pokémon Showdown 내보내기
        </PixelButton>
```

- [ ] **Step 2: `PokemonPicker.tsx` 모달 컨테이너와 확인 버튼, 스프라이트 교체**

상단에 import 추가:

```tsx
import PixelCard from "@/app/_components/ui/pixel/PixelCard";
import PixelButton from "@/app/_components/ui/pixel/PixelButton";
import PixelSprite, { getPixelSpriteUrl } from "@/app/_components/ui/pixel/PixelSprite";
```

모달 바깥 컨테이너 (라인 150-151)를:

```tsx
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <PixelCard className="flex w-full max-w-md flex-col gap-4 bg-surface p-5">
```

(닫는 태그 두 개, 라인 261-262 부근의 `</div></div>` 마지막 바깥 div를 `</PixelCard></div>`로 교체.)

검색 결과 리스트의 아이콘 (라인 179-186)을:

```tsx
                  <div className="relative h-10 w-10 flex-shrink-0">
                    <PixelSprite pokemon={r.pokemon} alt={r.pokemon.name} fill />
                  </div>
```

로, 선택 확인 패널 이미지 (라인 204-211)를:

```tsx
              <div className="relative h-14 w-14">
                <PixelSprite pokemon={selectedPokemon.pokemon} alt={selectedPokemon.nameKo} fill />
              </div>
```

로 교체. `handleConfirm` 내부 (라인 143):

```tsx
      spriteUrl: getPixelSpriteUrl(pokemon),
```

로 교체. "세트 없이 추가" 버튼 (라인 253-258)을:

```tsx
            <PixelButton variant="primary" onClick={() => handleConfirm(null)}>
              세트 없이 추가
            </PixelButton>
```

로 교체.

- [ ] **Step 3: 수동 확인**

`npm run dev` → `/pokemon/builder` 접속. 빈 슬롯/채워진 슬롯이 각진 스타일로 보이는지, "포켓몬 추가" 클릭 시 모달이 각진 카드로 뜨는지, 검색 결과와 선택 확인 화면의 이미지가 픽셀 스프라이트인지, 세트 선택/제거/내보내기 흐름이 그대로 동작하는지 확인.

- [ ] **Step 4: 커밋**

```bash
git add src/app/pokemon/builder/_components/TeamBuilder.tsx src/app/pokemon/builder/_components/PokemonPicker.tsx
git commit -m "style: pixelate team builder slots and picker modal"
```

---

### Task 11: 메타 랭킹 테이블 스프라이트 교체

**Files:**
- Modify: `src/app/pokemon/meta/_components/UsageRankingTable.tsx`

**Interfaces:**
- Consumes: `PixelSprite` from Task 4.

- [ ] **Step 1: import 추가, `pokemon` 변수를 함수 스코프로 승격, 이미지 교체**

상단에서 `Image` import를 제거하고 추가:

```tsx
import { Pokemon } from "pokenode-ts";
import PixelSprite from "@/app/_components/ui/pixel/PixelSprite";
```

`RankRow` 함수 내부 변수 선언부(라인 17-20)를:

```tsx
  let pokemon: Pokemon | null = null;
  let nameKo = entry.nameEn;
  let types: PokemonTypeName[] = [];
  let id: number | string = entry.nameEn;
```

로 교체 (기존 `spriteUrl` 지역 변수는 제거한다). `try` 블록 내부(라인 22-27)의 `pokemon` 대입과 `spriteUrl` 계산 줄에서 `spriteUrl = ...` 줄을 삭제한다:

```tsx
  try {
    const slug = entry.nameEn.toLowerCase().replace(/ /g, "-");
    pokemon = await fetchPokemon(slug);
    id = pokemon.id;
    types = pokemon.types.map((t) => t.type.name as PokemonTypeName);

    const species = await fetchSpecies(pokemon.id);
    nameKo = getKoreanName(species);
  } catch {
    // 데이터 없으면 영어 이름으로 폴백
  }
```

이미지 렌더링 부분(라인 45-49)을:

```tsx
      <div className="relative h-12 w-12 flex-shrink-0">
        {pokemon && <PixelSprite pokemon={pokemon} alt={entry.nameEn} fill />}
      </div>
```

로 교체한다.

- [ ] **Step 2: 수동 확인**

`npm run dev` → `/pokemon/meta` 접속. 랭킹 리스트의 포켓몬 이미지가 픽셀 스프라이트로 보이는지, 데이터 로딩 실패 시(이미지 없는 항목) 레이아웃이 깨지지 않는지 확인.

- [ ] **Step 3: 커밋**

```bash
git add src/app/pokemon/meta/_components/UsageRankingTable.tsx
git commit -m "style: switch meta ranking table to pixel sprites"
```

---

### Task 12: 최종 회귀 확인

**Files:** 없음 (코드 변경 없음, 수동 QA만)

- [ ] **Step 1: 라이트/다크 모드로 아래 페이지를 각각 방문해 육안 확인**

Run: `npm run dev`

체크리스트:
- `/` — 헤더/푸터, 픽셀 카드 4개, 소셜 아이콘
- `/pokemon/list` — 검색, 세대 필터, 카드 그리드, 좋아요/비교 토글
- `/pokemon/[id]` (예: `/pokemon/1`, `/pokemon/25`, `/pokemon/150`) — 헤더/정보/스탯/진화 카드, 탭 전환
- `/pokemon/builder` — 슬롯 추가/제거, 검색 모달, 세트 선택, 내보내기
- `/pokemon/meta` — 포맷 선택, 랭킹 테이블
- `/posts/list`(또는 블로그 진입 경로), `/chat/user`, `/auth/login` — 헤더/푸터만 바뀌고 본문은 회귀 없는지

- [ ] **Step 2: 키보드 접근성 확인**

Tab 키로 홈 페이지와 포켓몬 리스트 페이지의 모든 인터랙티브 요소를 순회하며 포커스 링(`focus-visible:outline`)이 보이는지 확인.

- [ ] **Step 3: 빌드 확인**

Run: `npm run build`
Expected: 타입 에러/빌드 에러 없이 성공.

- [ ] **Step 4: 완료 보고**

이상 없으면 이 태스크는 커밋 없이 완료 처리한다(코드 변경이 없으므로).
