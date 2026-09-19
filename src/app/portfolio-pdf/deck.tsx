import { pretendard, deckMono } from './fonts';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { Fragment } from 'react';

import {
  PROFILE,
  EXPERIENCE_HEADLINE,
  TIMELINE,
  PROJECTS,
  SKILL_LEVELS,
  SKILL_LEVEL_LEGEND,
  SKILL_GROUPS,
  SKILLS_FOOTNOTE,
  AI_PRACTICE,
  EDUCATION,
  CERTIFICATIONS,
  type DeckProject,
  type DeckImage,
} from './data';

/**
 * 화면에 보이는 것이 그대로 인쇄물이 되도록 페이지 크기를 mm로 고정하고, 인쇄 시에는
 * @page 여백을 0으로 두고 페이지 내부 패딩만 씁니다.
 *
 * 기본은 PowerPoint 16:9입니다 — 이 덱은 화면으로 읽히고, 화면에서는 16:9가 여백 없이
 * 꽉 찹니다. A4는 종이로 출력할 때만 쓰는 대체 규격이라 `/portfolio-pdf/a4`로 분리했습니다.
 * px 값은 96dpi 환산치이고, 다이어그램 축소 배율 계산에 씁니다 (1px = 0.75pt).
 */
export const PAPER = {
  ppt: { label: 'PowerPoint 16:9', mm: { w: 338.7, h: 190.5 }, px: { w: 1280, h: 720 } },
  a4: { label: 'A4 가로', mm: { w: 297, h: 210 }, px: { w: 1122.5, h: 793.7 } },
  // /resume-pdf 전용 — 이력서는 인쇄용 A4 세로 관례를 따릅니다.
  resume: { label: 'A4 세로', mm: { w: 210, h: 297 }, px: { w: 793.7, h: 1122.5 } },
} as const;

export type PaperName = keyof typeof PAPER;

export const printCss = (paper: PaperName) => `
@page { size: ${PAPER[paper].mm.w}mm ${PAPER[paper].mm.h}mm; margin: 0; }

/* 이 <style>은 덱 라우트에만 존재하므로 다른 페이지의 위젯에는 영향이 없습니다. */
.chat-widget-root { display: none !important; }

/*
 * 페이지 상자는 인쇄물 크기로 고정돼 있습니다. 그래서 넓은 모니터에서 브라우저로 열면
 * 페이지가 화면의 절반만 차지하고 글자가 실제 인쇄 크기보다 작게 보입니다. 화면에서만
 * 통째로 확대해 폭을 채웁니다 — zoom은 레이아웃 단위로 동작하므로 높이·스크롤이 함께
 * 맞고 페이지 내부 비율은 그대로입니다. 인쇄에는 적용되지 않습니다(@media screen).
 *
 * 뷰포트에 비례하는 값을 CSS로 계산할 수 없어(zoom은 <number>, 100vw는 <length>) 폭
 * 구간으로 나눕니다 — 이 라우트는 client JS가 없는 정적 페이지입니다. 배율은 덱 좌우
 * 패딩(8mm씩)까지 같이 확대되는 것과 스크롤바 폭을 빼고 잡아, 가로 스크롤이 생기지
 * 않게 합니다.
 */
${[1500, 1700, 1950, 2250, 2500, 3000, 3700]
  .map((bp) => {
    const zoom = Math.floor(((bp - 32) / (PAPER[paper].px.w + 60)) * 100) / 100;
    return `@media screen and (min-width: ${bp}px) { .deck { zoom: ${zoom}; } }`;
  })
  .join('\n')}

@media print {
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background: #fff !important;
  }
  .deck { gap: 0 !important; padding: 0 !important; background: #fff !important; }
  .deck-page {
    box-shadow: none !important;
    outline: none !important;
    break-after: page;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .deck-page:last-child { break-after: auto; }
}
`;

/**
 * 한 장의 가로 페이지. 크기는 덱이 넘겨주는 CSS 변수(--page-w/--page-h)에서
 * 오므로 규격을 바꿔도 이 컴포넌트는 그대로입니다. 내부는 flex column +
 * justify-between이라 남는 세로
 * 공간이 섹션 사이로 균등하게 퍼집니다 — 프로젝트별 불릿 개수가 달라도
 * 아래쪽에 빈 덩어리가 생기지 않습니다.
 */
export function Page({
  children,
  /**
   * 이미지 페이지는 여백을 좁힙니다. 다이어그램이 페이지 높이에 걸려 가로가
   * 남는 구조이므로, 세로 여백을 줄이면 그만큼 이미지가 커집니다.
   */
  tight = false,
  spread = true,
}: {
  children: React.ReactNode;
  tight?: boolean;
  spread?: boolean;
}) {
  return (
    <section
      className={`deck-page h-[var(--page-h)] w-[var(--page-w)] shrink-0 overflow-hidden bg-white text-black shadow-[0_1px_12px_rgba(0,0,0,0.14)] ${
        tight ? 'px-[6mm] py-[5mm]' : 'px-[14mm] py-[12mm]'
      }`}
    >
      <div
        className={`flex h-full flex-col ${spread ? 'justify-between' : ''}`}
      >
        {children}
      </div>
    </section>
  );
}

/** 16:9 슬라이드 기하(CSS px). 벡터 다이어그램 축소 배율 계산에 씁니다. */

const TIGHT_PAD = { x: 22.7, y: 18.9 };
/**
 * 메타 1줄 + 구분선 + 상단 여백. 실측으로 맞춘 값 — 캡션을 20px(15pt)로 올리면서
 * 30 → 39 가 됐습니다. 이 상수가 곧 도판이 쓸 수 있는 높이를 정하고, 도판 높이가
 * 곧 도판 글자의 pt 입니다. 헤더를 키우면 반드시 도판 최소 pt를 다시 재야 합니다.
 */
const IMAGE_HEADER_H = 39;

/**
 * 다이어그램은 렌더 크기가 곧 글자 크기입니다 — 축소율 k에 글꼴이 그대로 곱해지므로
 * 페이지 여백 1mm가 라벨의 pt로 돌아옵니다. 그래서 단독 다이어그램 페이지는
 * 좌·우·아래를 페이지 끝까지 흘립니다 (다이어그램이 자체 여백을 갖고 있어 안전).
 */
/**
 * 도판의 캔버스 크기는 HTML이 유일한 출처입니다. 여기서 빌드 시에 읽어 오므로
 * 도판을 잘라내도 덱과 어긋나지 않습니다 (정적 서버 컴포넌트라 런타임 I/O 아님).
 */
function vectorSize(src: string) {
  const html = readFileSync(path.join(process.cwd(), 'public', src), 'utf8');
  const size = html.match(/<canvas[^>]*width="(\d+)"[^>]*height="(\d+)"/);
  if (!size) throw new Error(`${src}: <canvas>에 width/height가 없습니다`);
  return { w: Number(size[1]), h: Number(size[2]) };
}

function fitScale(
  canvas: { w: number; h: number },
  split: boolean,
  paper: PaperName,
) {
  const page = PAPER[paper].px;
  const availW = split ? (page.w - 2 * TIGHT_PAD.x) * 0.5 : page.w;
  const availH = split
    ? page.h - 2 * TIGHT_PAD.y - IMAGE_HEADER_H
    : page.h - TIGHT_PAD.y - IMAGE_HEADER_H;
  return Math.min(availW / canvas.w, availH / canvas.h);
}

/** 왼쪽 라벨 거터 + 오른쪽 본문. 노션의 25/75 컬럼 구조를 그대로 옮긴 것. */
/** 「— …」·「→ …」로 시작하는 항목은 앞 줄의 연속입니다. 글머리 기호를 또 찍으면
 *  새 항목으로 읽히므로 자리만 비웁니다. */
export function isContinuation(text: string) {
  return text.startsWith('—') || text.startsWith('→');
}

export function Row({
  label,
  sub,
  children,
  className = '',
}: {
  label: string;
  sub: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex gap-[10mm] ${className}`}>
      <div className="w-[52mm] shrink-0">
        <h2 className="whitespace-pre-line text-[20px] font-medium italic leading-tight text-[#787774]">
          {label}
        </h2>
        <p className="mt-1 text-[16px] text-[#9B9A97]">{sub}</p>
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function Stars({ level }: { level: number }) {
  return (
    <span className="tracking-[0.08em] text-[#37352F]" aria-label={`${level}점`}>
      {'★'.repeat(level)}
      <span className="text-[#C6C5C1]">{'☆'.repeat(5 - level)}</span>
    </span>
  );
}

/** 프로젝트 페이지 공통 머리. 이름·부제·기간·팀·역할. */
/**
 * 이어지는 장의 머리. 프로젝트 이름은 매 장 반복되는 라벨일 뿐이라 작게 두고,
 * 「이 장이 무엇인가」를 제목 크기로 올립니다 — 40px 프로젝트 이름 아래 21px 회색으로
 * 장 이름이 붙어 있으면, 정작 읽어야 할 쪽이 안 보입니다. 프로젝트 표제를 크게 쓰는
 * 장은 그 프로젝트의 첫 장(개요) 하나뿐입니다.
 */
/**
 * 본문 안의 `백틱` 토막을 코드 칩으로 그립니다. 식별자(FOR UPDATE SKIP LOCKED,
 * JdbcTypeCode …)가 산문과 같은 활자로 붙어 있으면 어디까지가 코드인지 매번
 * 판단해야 합니다. 칩 하나면 그 판단이 사라집니다.
 */
export function Rich({ text }: { text: string }) {
  if (!text.includes('`') && !text.includes('**')) return <>{text}</>;
  return (
    <>
      {text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((part, i) => {
        if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
          return (
            <code
              key={i}
              className="rounded-[1mm] bg-[#F1F0EE] px-[1mm] py-[0.3mm] font-[family-name:var(--font-deck-mono)] text-[0.88em] text-[#9F2F2D]"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          return (
            <strong key={i} className="font-semibold text-[#37352F]">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function SectionHeader({
  project,
  label,
  title,
}: {
  project: DeckProject;
  /** 머리줄의 오른쪽 꼬리표. 문제 해결처럼 번호가 붙는 장에만 씁니다. */
  label?: string;
  title: string;
}) {
  return (
    <>
      <header className="flex items-baseline gap-[5mm] border-b border-[#DFDEDA] pb-[2mm]">
        <span className="shrink-0 text-[20px] font-semibold tracking-tight text-[#37352F]">
          {project.name}
        </span>
        <span className="min-w-0 flex-1 truncate text-[16px] text-[#9B9A97]">
          {project.subtitle}
        </span>
        {label && (
          <span className="shrink-0 text-[16px] text-[#787774]">{label}</span>
        )}
        <span className="shrink-0 text-[16px] text-[#9B9A97]">
          {project.period}
        </span>
      </header>
      <h1 className="mt-[3.5mm] text-balance text-[30px] font-bold leading-tight tracking-tight">
        {title}
      </h1>
    </>
  );
}

function ProjectHeader({
  project,
  kicker,
}: {
  project: DeckProject;
  kicker?: string;
}) {
  return (
    <header className="flex items-end justify-between border-b border-[#37352F] pb-[4mm]">
      <div>
        <h1 className="text-[40px] font-bold leading-none tracking-tight">
          {project.name}
          {kicker && (
            <span className="ml-[5mm] align-middle text-[21px] font-normal text-[#787774]">
              {kicker}
            </span>
          )}
        </h1>
        <p className="mt-[3.5mm] text-[21px] text-[#65635E]">{project.subtitle}</p>
      </div>
      <div className="pb-[1mm] text-right text-[16px] leading-relaxed text-[#65635E]">
        <div className="font-medium text-[#37352F]">{project.period}</div>
        <div>
          {project.team} · {project.role}
        </div>
      </div>
    </header>
  );
}

/** 스택과 저장소. 프로젝트 첫 장 아래에 한 줄로 둡니다. */
function ProjectFooter({
  project,
  className = '',
}: {
  project: DeckProject;
  className?: string;
}) {
  return (
    <footer
      className={`flex items-end justify-between border-t border-[#E9E9E7] pt-[4mm] ${className}`}
    >
      <div className="flex flex-wrap gap-x-[3mm] gap-y-[2mm] text-[16px] text-[#787774]">
        {project.stack.map((tech) => (
          <span key={tech} className="border border-[#DFDEDA] px-[2mm] py-[1mm]">
            {tech}
          </span>
        ))}
      </div>
      {project.repo && (
        <div className="shrink-0 pl-[6mm] text-[16px] text-[#787774]">
          {project.repo}
        </div>
      )}
    </footer>
  );
}

/**
 * 프로젝트 1장 — 무슨 프로젝트인가.
 *
 * 요약 박스가 먼저 오고 그 다음이 숫자입니다. 순서가 반대면 독자는 무엇에 대한
 * 숫자인지 모르는 상태로 지표를 먼저 보게 됩니다.
 */
/** 개요 페이지의 소제목 한 덩어리. 라벨은 왼쪽 거터, 본문은 개조식 목록. */
function OverviewBlock({
  label,
  items,
  className = '',
}: {
  label: string;
  items: string[];
  className?: string;
}) {
  return (
    <div className={`flex gap-[8mm] ${className}`}>
      <h3 className="w-[38mm] shrink-0 text-[20px] font-semibold leading-snug text-[#787774]">
        {label}
      </h3>
      <ul className="min-w-0 flex-1 space-y-[1.2mm]">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-[2mm] text-[20px] leading-[1.4] text-[#37352F]"
          >
            <span aria-hidden className="shrink-0 text-[#C6C5C1]">
              {isContinuation(item) ? '\u00a0' : '•'}
            </span>
            <span className="min-w-0 text-pretty">
          <Rich text={item} />
        </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * 프로젝트 1장 — 개요. **서비스 소개**이지 내 소개가 아닙니다.
 *
 * 한 줄 정의 → 프로젝트 목적 → 주요 기능 → 기간·인원. 담당 역할은 여기 두지
 * 않습니다: 개요에 «내가 해결한 것»이 섞이면 프로젝트가 뭔지 모르는 사람이 그걸
 * 읽을 재료가 없고, 페이지가 프로젝트 소개가 아니라 자기 소개가 됩니다. 담당은
 * 아키텍처 도판 다음 장(`ProjectOwnershipPage`)으로 갑니다 — 도판의 어느 블록이
 * 본인 것인지 짚는 자리가 원래 거기입니다. 숫자와 성과도 여기 두지 않습니다.
 */
function ProjectSummaryPage({ project }: { project: DeckProject }) {
  return (
    <Page spread={false}>
      <ProjectHeader project={project} kicker="프로젝트 개요" />

      <div className="mt-[3.4mm] rounded-[2mm] bg-[#F7F6F3] px-[6mm] py-[3mm]">
        <p className="text-balance text-[22px] font-semibold leading-[1.45] text-[#37352F]">
          {project.oneLiner}
        </p>
      </div>

      <div className="mt-[4mm] flex flex-col gap-[3.5mm]">
        <OverviewBlock label="프로젝트 목적" items={project.purpose} />

        <OverviewBlock
          label="기간 · 인원"
          items={project.teamMakeup}
          className="border-t border-[#E9E9E7] pt-[3.5mm]"
        />
        {/* 이 블록만 라벨 거터를 쓰지 않고 전체 폭을 씁니다. 다른 블록처럼 38mm 를
            라벨에 내주면 설명이 A4 에서 거의 전부 두 줄로 접히고, 그 다섯 줄이
            페이지 아래 여백을 통째로 먹습니다(실측 34px). 제목을 위로 올리면
            설명 한 줄에 20자 가까이가 더 들어갑니다. */}
        {/* 라벨은 목적·기간과 같은 거터(38mm·20px)를 씁니다. 한때 이 블록만 전폭에
            16px 상단 라벨이었는데, 한 장에 라벨 문법이 둘이라 이질감이 났습니다.
            내용만 표로 둡니다 — 이름 칸이 없으면 기능명과 설명이 안 묶입니다. */}
        <div className="flex gap-[8mm] border-t border-[#E9E9E7] pt-[3.5mm]">
          <h3 className="w-[38mm] shrink-0 text-[20px] font-semibold leading-snug text-[#787774]">
            주요 기능
          </h3>
          <div className="min-w-0 flex-1 border-t border-[#37352F]">
            {project.features.map((feature) => (
              <div
                key={feature.name}
                className="flex gap-[5mm] border-b border-[#E9E9E7] py-[0.9mm] text-[20px] last:border-b-0"
              >
                <span className="w-[42mm] shrink-0 font-semibold leading-[1.4] text-[#37352F]">
                  {feature.name}
                </span>
                <span className="min-w-0 flex-1 text-pretty leading-[1.4] text-[#4A4843]">
                  <Rich text={feature.detail} />
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Page>
  );
}

/**
 * 아키텍처 도판 바로 다음 장 — 「주요 업무 및 담당 역할」.
 *
 * 여기 쓰는 것은 «무엇을 맡았나»와 «어디까지가 내 몫인가»입니다. «어떻게 풀었나»는
 * 문제 해결·구현 상세의 몫이라 되풀이하지 않습니다 — 한때 이 페이지의 설명이 문제
 * 해결에서 그대로 옮겨온 문장이어서, 담당 범위가 아니라 성과 요약처럼 읽혔습니다.
 *
 * 도판과 중복이 아니냐는 물음에 대한 답: 도판은 «어느 블록»을 시각적으로 표시할 뿐,
 * 그 블록을 어디까지 만들었는지도, 문서·리뷰·배포처럼 그림에 없는 일도 말하지
 * 못합니다. 도판은 이 페이지의 그림 판이고, 이 페이지가 본문입니다.
 */
function ProjectOwnershipPage({ project }: { project: DeckProject }) {
  return (
    <Page spread={false}>
      <SectionHeader
        project={project}
        title={inlineTech(project) ? '기술 선택 · 주요 업무' : '주요 업무 및 담당 역할'}
      />
      {inlineTech(project) && <TechTable project={project} />}

      {/* 항목만 나열하면 4~5줄에 그쳐 페이지 절반이 빕니다. 범위마다 «그게 무엇까지인지»를
          한 줄 붙이면 그제야 담당 범위 페이지가 됩니다. */}
      {/* 한 항목이 한 줄. «무엇을 만들었나»를 그대로 적으면 되고, 이름과 설명으로
          쪼개 두 칸으로 벌리면 그때부터 설명이 문제 해결에서 옮겨온 문장으로 채워집니다. */}
      <ul className="mt-[6mm] space-y-[4.6mm]">
        {project.contribution.map((item) => (
          <li
            key={item}
            className="flex gap-[3mm] text-[20px] leading-[1.45] text-[#37352F]"
          >
            <span aria-hidden className="shrink-0 text-[#C6C5C1]">
              •
            </span>
            <span className="min-w-0 text-pretty">
              <Rich text={item} />
            </span>
          </li>
        ))}
      </ul>

    </Page>
  );
}

const CIRCLED = ['①', '②', '③', '④', '⑤', '⑥'];

/**
 * 프로젝트 3장부터 — 문제 해결. 한 건이 한 페이지입니다.
 *
 * 소제목은 문제 → 원인 → 해결 → 결과로 고정합니다. 이 넷이 다 있어야 «무엇을 했나»가
 * 아니라 «왜 그렇게 판단했나»가 읽히고, 넷을 한 페이지에 두 칸으로 욱여넣으면 건당
 * 세 줄로 잘립니다(그렇게 해봤고 그게 이력서처럼 읽힌 이유였습니다). 줄 수 제한은
 * 두지 않고, 넘치면 페이지를 늘립니다.
 */
function ProjectProblemPage({
  project,
  problem,
  index,
}: {
  project: DeckProject;
  problem: DeckProject['problems'][number];
  index: number;
}) {
  return (
    <Page spread={false}>
      <SectionHeader
        project={project}
        label={`문제 해결 ${CIRCLED[index] ?? index + 1}`}
        title={problem.title}
      />

      <div className="mt-[5mm] flex flex-col gap-[4mm]">
        <OverviewBlock label="문제" items={problem.problem} />
        <OverviewBlock
          label="원인"
          items={problem.cause}
          className="border-t border-[#E9E9E7] pt-[4mm]"
        />
        <OverviewBlock
          label="해결"
          items={problem.solution}
          className="border-t border-[#E9E9E7] pt-[4mm]"
        />
        <OverviewBlock
          label="결과"
          items={problem.result}
          className="border-t border-[#E9E9E7] pt-[4mm]"
        />
      </div>

    </Page>
  );
}

/**
 * 프로젝트 4장 — 「그 외 구현 · 의사결정 · 한계」.
 *
 * 출처는 노션 각 프로젝트의 동명 절입니다. 요약할 때 가장 먼저 잘려 나가는
 * 대목이지만 판단 근거는 대부분 여기에 있어, 2단 조판으로 한 장에 담습니다.
 * AI 활용 페이지와 같은 이유로 52mm 라벨 거터를 쓰지 않습니다 — 본문 폭을
 * 줄이면 한 줄에 들어가는 글자가 줄어 같은 내용이 두 배로 접힙니다.
 */
/**
 * 기술 선택 한 장. ad7cf63 이 「구현·한계」 와 합쳤던 것을 되돌립니다 — 그때 합친
 * 이유는 «한 줄로 깎으니 표 다섯 줄에 한 장을 쓰게 된다» 였는데, 이유를 읽고
 * 이해할 수 있게 쓰면 표가 250px 를 넘고 그만큼 구현·한계가 세 번째 단으로
 * 흘러 페이지 밖으로 나갑니다(AJT 4행 실측 295px). 둘 중에는 «읽히는 이유» 가
 * 남아야 합니다.
 */
/** 기술 행이 두 줄뿐이면 한 장을 쓰지 않고 담당 역할 장에 같이 싣습니다. */
export function inlineTech(project: DeckProject) {
  return project.techChoices.length <= 2;
}

function TechTable({ project }: { project: DeckProject }) {
  return (
    <div className="mt-[5mm]">
        <div className="flex gap-[8mm] border-b border-[#37352F] pb-[1.6mm] text-[16px] font-semibold tracking-[0.06em] text-[#9B9A97]">
          <span className="w-[50mm] shrink-0">기술</span>
          <span className="flex-1">고른 이유</span>
        </div>
        {project.techChoices.map((choice) => (
          <div
            key={choice.name}
            className="flex gap-[8mm] border-b border-[#E9E9E7] py-[3.4mm]"
          >
            <span className="w-[50mm] shrink-0 text-[20px] font-semibold leading-snug text-[#37352F]">
              {choice.name}
            </span>
            <span className="min-w-0 flex-1 text-pretty text-[20px] leading-[1.45] text-[#4A4843]">
              <Rich text={choice.why} />
            </span>
          </div>
        ))}
    </div>
  );
}

function ProjectTechPage({ project }: { project: DeckProject }) {
  return (
    <Page spread={false}>
      <SectionHeader project={project} title="기술 선택" />
      <TechTable project={project} />
    </Page>
  );
}


/**
 * 이미지 한 장이 한 페이지. object-contain으로 폭·높이를 동시에 제한하므로
 * 가로형(1.35)이든 정사각에 가까운 것(1.13)이든 잘리지 않고 들어갑니다.
 */
function ImagePage({
  project,
  image,
  paper,
}: {
  project: DeckProject;
  image: DeckImage;
  paper: PaperName;
}) {
  const split = image.layout === 'split';
  return (
    <Page tight spread={false}>
      {/* 다른 장과 같은 차례 — 프로젝트 이름은 왼쪽 작은 라벨, 그 장이 무엇인지가
          제목. 다만 여기서만 한 줄로 눌러 둡니다: 헤더가 커지면 그만큼 도판이 작아지고
          도판이 작아지면 도판 «글자»가 작아집니다. 30px 제목을 얹으면 A4에서 라벨이
          8pt 아래로 떨어집니다. 그래서 캡션을 20px(본문과 같은 15pt)까지만 올립니다. */}
      <header className="flex shrink-0 items-baseline gap-[4mm] border-b border-[#DFDEDA] pb-[1.5mm]">
        <span className="shrink-0 text-[16px] font-semibold tracking-tight text-[#37352F]">
          {project.name}
        </span>
        <h2 className="shrink-0 text-[20px] font-semibold tracking-tight text-[#37352F]">
          {image.caption}
        </h2>
        {image.note && (
          <p className="min-w-0 flex-1 truncate text-[16px] text-[#787774]">
            {image.note}
          </p>
        )}
        <span className="shrink-0 text-[16px] text-[#9B9A97]">
          {project.period}
        </span>
      </header>

      <div
        className={
          split
            ? 'flex min-h-0 flex-1 gap-[6mm] pt-[2mm]'
            : image.vector
              ? // 도판만 좌·우·아래 풀블리드로 흘립니다 (Page의 px-[6mm] py-[5mm]를 되돌림).
                // 도판은 캔버스 안에 자체 여백이 있어 페이지 끝에 닿아도 잘려 보이지 않습니다.
                'flex min-h-0 flex-1 flex-col -mx-[6mm] -mb-[5mm] pt-[1mm]'
              : // 실행 화면 캡처는 뷰포트 경계에서 끝나므로, 페이지 끝까지 흘리면
                // 그 경계가 페이지에서 잘린 것처럼 보입니다. 여백과 테두리로 액자를
                // 둡니다 — pb는 캡처 비율이 페이지와 같아도 아래 여백을 보장합니다.
                'flex min-h-0 flex-1 flex-col pt-[2mm] pb-[3mm]'
        }
      >
        <figure
          className={`flex min-h-0 items-center justify-center ${
            split ? 'w-1/2 shrink-0' : 'flex-1'
          }`}
        >
          {image.vector ? (
            (() => {
              const canvas = vectorSize(image.vector.src);
              const k = fitScale(canvas, split, paper);
              return (
                <div
                  style={{ width: canvas.w * k, height: canvas.h * k }}
                  className="overflow-hidden border border-[#E9E9E7]"
                >
                  <iframe
                    src={image.vector.src}
                    title={image.caption}
                    scrolling="no"
                    style={{
                      width: canvas.w,
                      height: canvas.h,
                      border: 0,
                      transform: `scale(${k})`,
                      transformOrigin: 'top left',
                    }}
                  />
                </div>
              );
            })()
          ) : (
            <img
              src={image.src}
              alt={image.caption}
              className="max-h-full min-h-0 w-auto max-w-full border border-[#E9E9E7] object-contain"
            />
          )}
        </figure>

        {split && image.details && (
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-[4mm]">
            {image.details.map((section) => (
              <section key={section.heading}>
                <h3 className="border-b border-[#E9E9E7] pb-[1mm] text-[20px] font-semibold text-[#787774]">
                  {section.heading}
                </h3>
                <ul className="mt-[1.5mm] space-y-[1.5mm]">
                  {section.points.map((point) => (
                    <li
                      key={point}
                      className="flex gap-[2mm] text-[20px] leading-[1.45] text-[#4A4843]"
                    >
                      <span aria-hidden className="shrink-0 text-[#C6C5C1]">
                        {isContinuation(point) ? '\u00a0' : '•'}
                      </span>
                      <span className="min-w-0">
                        <Rich text={point} />
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}

function ProfilePage() {
  return (
    <Page>
      {/* 표지. 세 층을 페이지 높이에 펼칩니다 — 이름은 위, 자기소개는 가운데,
          연락처는 아래. 한 덩어리로 몰아 두면 아래 절반이 비어 잘린 페이지처럼
          보입니다. */}
      <>
        {/* 이름 · 직무 · 연락처를 한 덩어리로 두지 않고 세 층으로 나눕니다:
            누구인가 → 무엇을 하는 사람인가(콜아웃) → 어디로 연락하는가(스트립).
            연락처를 이름 옆에 흘려 두면 라벨과 값의 열이 맞지 않아 대충 놓인 것처럼
            보입니다. */}
        {/* 사진과 전화번호는 인적사항이라 저장소에 없습니다 — 사진 파일은 `.gitignore`,
            번호는 `.env.local`. 공개 배포본에서 `<img>` 만 남으면 깨진 이미지가 뜨므로
            같은 조건(`NEXT_PUBLIC_RESUME_PHONE`)으로 함께 감춥니다. 로컬에서 PDF 를
            뽑을 때만 둘 다 나옵니다. 사진을 넣는 이유는 디자인이 아니라 「문서 말고
            사진으로 기억되게」로, 신입 포트폴리오 가이드가 공통으로 꼽는 항목입니다. */}
        <header className="flex items-end justify-between gap-[10mm] border-b border-[#37352F] pb-[3mm]">
          <div className="flex items-end gap-[7mm]">
            {process.env.NEXT_PUBLIC_RESUME_PHONE && (
              <img
                src="/resume/profile.jpeg"
                alt={`${PROFILE.name} 사진`}
                className="h-[42mm] w-[32mm] shrink-0 border border-[#E9E9E7] object-cover"
              />
            )}
            <h1 className="pb-[1mm] text-[56px] font-bold leading-none tracking-tight">
              {PROFILE.name}
              <span className="ml-[5mm] align-middle text-[26px] font-normal text-[#787774]">
                {PROFILE.nameEn}
              </span>
            </h1>
          </div>
          <p className="pb-[1mm] text-right text-[20px] font-medium text-[#65635E]">
            {PROFILE.roleKo}
          </p>
        </header>

        {/* 자기소개는 본문과 섞이면 눌립니다. 왼쪽 굵은 선 + 연한 배경으로 한 덩어리로
            묶어, 페이지에서 먼저 읽히게 합니다 (노션 원본의 인용 블록과 같은 역할). */}
        <div className="mt-[5mm] rounded-[2mm] bg-[#F7F6F3] px-[7mm] py-[5mm]">
          <p className="text-balance text-[22px] font-semibold text-[#37352F]">
            {PROFILE.lead}
          </p>
          <p className="mt-[2.5mm] text-pretty text-[20px] leading-[1.55] text-[#4A4843]">
            {PROFILE.summary}
          </p>
        </div>

        {/* 연락처. 라벨을 값 «위에» 대문자로 얹던 것을 앞에 붙는 작은 문장식 라벨로
            바꿨습니다. 아주 없애 보니 값 세 개가 한 줄에 붙어 경계가 사라졌고,
            `ohgnoy-digitalgarden.vercel.app` 은 그것만 봐서는 블로그인 줄 모릅니다.
            라벨이 필요한 건 맞고, 대문자로 값보다 눈에 띄게 둘 이유가 없었을 뿐입니다. */}
        <ul className="mt-[4mm] flex flex-wrap gap-x-[9mm] gap-y-[2mm] border-t border-[#E9E9E7] pt-[3mm]">
          {[
            // 전화번호는 `.env.local` 에 값이 있을 때만 — 덱은 공개 URL 이라
            // 배포본에는 빠지고, 로컬에서 PDF 를 뽑을 때만 실립니다.
            ...(process.env.NEXT_PUBLIC_RESUME_PHONE
              ? [['연락처', process.env.NEXT_PUBLIC_RESUME_PHONE]]
              : []),
            ['이메일', PROFILE.email],
            ['GitHub', PROFILE.github],
            ['블로그', PROFILE.blog],
          ].map(([label, value]) => (
            <li key={value} className="flex items-baseline gap-[2.5mm] whitespace-nowrap">
              <span className="shrink-0 text-[16px] text-[#9B9A97]">{label}</span>
              <span className="text-[20px] text-[#37352F]">{value}</span>
            </li>
          ))}
        </ul>
      </>

    </Page>
  );
}

/**
 * 프로젝트 이력을 연대기 겸 목차로 두는 페이지. 표지에 붙여 두면 자기소개·연락처와
 * 뒤섞여 어디까지가 이력인지 안 읽혀서 페이지를 분리했습니다.
 *
 * 상세 페이지 번호(`pageOf`)는 덱을 조립하는 쪽에서 계산해 넘깁니다 — 데이터에 적으면
 * 페이지를 넣거나 뺄 때마다 어긋납니다.
 */
function TimelinePage({ pageOf }: { pageOf: Map<string, number> }) {
  return (
    <Page>
      <Row label={'Professional\nExperience'} sub="프로젝트 이력">
        <p className="text-[20px] font-semibold text-[#11845e]">
          {EXPERIENCE_HEADLINE}
        </p>
        {/* 왼쪽 기간 열 + 세로 레일 + 본문. 기간이 한 열에 모여 있어야 연대기로
            읽히고, 오른쪽 페이지 번호가 목차 역할을 합니다. */}
        <ol className="mt-[5mm]">
          {TIMELINE.map((entry, i) => {
            const page = entry.project ? pageOf.get(entry.project) : undefined;
            return (
              <li key={entry.title} className="flex gap-[6mm]">
                <span className="w-[42mm] shrink-0 whitespace-nowrap pt-[0.5mm] text-right text-[16px] tabular-nums text-[#787774]">
                  {entry.period}
                </span>
                {/* 레일: 점 + 아래로 잇는 선. 마지막 항목은 선을 그리지 않습니다. */}
                <span
                  aria-hidden
                  className="relative flex w-[3mm] shrink-0 justify-center"
                >
                  <span className="absolute top-[2mm] h-[2mm] w-[2mm] rounded-full bg-[#37352F]" />
                  {i < TIMELINE.length - 1 && (
                    <span className="absolute top-[4.5mm] bottom-0 w-[0.3mm] bg-[#EDECE8]" />
                  )}
                </span>
                <div className="min-w-0 flex-1 pb-[5mm]">
                  <div className="flex items-baseline gap-[4mm]">
                    <h3 className="text-[22px] font-semibold leading-tight">
                      {entry.title}
                    </h3>
                    {page && (
                      <span className="ml-auto shrink-0 text-[16px] tabular-nums text-[#9B9A97]">
                        p.{page}
                      </span>
                    )}
                  </div>
                  <p className="mt-[1mm] text-[16px] text-[#787774]">
                    {entry.meta}
                  </p>
                  <p className="mt-[1.5mm] text-[20px] leading-snug text-[#4A4843]">
                    {entry.note}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </Row>
    </Page>
  );
}

function SkillsPage({
  groups,
  part,
}: {
  groups: typeof SKILL_GROUPS;
  part: 1 | 2;
}) {
  return (
    <Page>
      <Row label="Skills" sub={`기술 스택 (${part}/2)`}>
        {part === 1 && (
          <p className="text-[16px] text-[#787774]">
            {/* 범례는 실제로 쓰인 등급만 — 아무 기술도 받지 않은 등급을 적어 두면
                그 줄이 아무것도 설명하지 않습니다(한때 5점이 그랬습니다). */}
            {SKILL_LEVEL_LEGEND.map((level, i) => (
              <span key={level}>
                {i > 0 && <span className="mx-[2mm] text-[#C6C5C1]">·</span>}
                <Stars level={level} />{' '}
                {SKILL_LEVELS[level].text}
              </span>
            ))}
          </p>
        )}
        {/* 다단(columns)은 열을 위에서 아래로 채우므로 카테고리 개수가 3의
            배수가 아니어도 빈칸이 생기지 않습니다. */}
        <div className="mt-[4.5mm] columns-2 gap-x-[12mm] [column-fill:balance]">
          {groups.map((group) => (
            <div key={group.category} className="mb-[3.5mm] break-inside-avoid">
              <h3 className="border-b border-[#DFDEDA] pb-[1mm] text-[16px] font-semibold uppercase tracking-wider text-[#787774]">
                {group.category}
              </h3>
              <ul className="mt-[2mm] divide-y divide-[#E9E9E7]">
                {group.skills.map((skill) => (
                  <li key={skill.name} className="py-[2.2mm] first:pt-0 last:pb-0">
                    <div className="flex items-baseline justify-between gap-[3mm] text-[20px]">
                      <span className="min-w-0 font-medium text-[#37352F]">
                        {skill.name}
                      </span>
                      <span className="shrink-0 text-[16px]">
                        <Stars level={skill.level} />
                      </span>
                    </div>
                    {/* 등급 이름을 행에 붙입니다 — 근거 문장이 그 등급의 증거로
                        읽혀야 별점이 설명됩니다. */}
                    <p className="mt-[1mm] text-[16px] leading-snug text-[#787774]">
                      <span className="mr-[2mm] whitespace-nowrap rounded-[1mm] bg-[#F1F0EE] px-[1.5mm] py-[0.3mm] font-medium text-[#4A4843]">
                        {SKILL_LEVELS[skill.level].short}
                      </span>
                      {skill.note}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {part === 2 && (
          <p className="text-[16px] text-[#787774]">{SKILLS_FOOTNOTE}</p>
        )}
      </Row>
    </Page>
  );
}

/**
 * 코딩 에이전트를 어떻게 운용하는지. Skills가 "무엇을 쓸 수 있나"라면 이 페이지는
 * "에이전트에 어떤 제약을 걸어 쓰나"입니다. 항목은 전부 본인 저장소의 규칙 파일이
 * 근거이고, 각 블록에 그 출처를 함께 적습니다.
 */
function AiPracticePage({ paper }: { paper: PaperName }) {
  return (
    // 위에서부터 쌓습니다 — spread로 벌리면 머리글과 본문 사이가 텅 빕니다.
    <Page spread={false}>
      {/* 이 페이지만 라벨 거터를 쓰지 않습니다 — 문장을 읽는 페이지라 한 줄에
          들어가는 글자 수가 곧 가독성입니다. 거터를 접으면 단이 52mm 넓어져
          대부분의 항목이 한 줄에 들어갑니다. */}
      <div className="flex items-baseline gap-[8mm] border-b border-[#E9E9E7] pb-[2.5mm]">
        <h2 className="shrink-0 text-[20px] font-medium italic leading-tight text-[#787774]">
          AI 활용
          <span className="ml-[3mm] font-normal not-italic text-[#9B9A97]">
            코딩 에이전트 운용
          </span>
        </h2>
        <p className="min-w-0 flex-1 text-[20px] leading-snug text-[#787774]">
          AI에게 개발을 맡기면서, 결과를 그대로 믿지 않기 위해 만들어 둔 장치입니다.
        </p>
      </div>
      <div className="mt-[3mm] columns-2 gap-x-[12mm] [column-fill:balance]">
          {AI_PRACTICE.map((block) => (
            <section
              key={block.title}
              className={`break-inside-avoid border-t border-[#E9E9E7] ${
                // A4는 같은 문장이 한 줄 더 쓰이므로 구분선의 여백만 조입니다.
                paper === 'a4' ? 'mb-[1.2mm] pt-[0.6mm]' : 'mb-[1.6mm] pt-[1.2mm]'
              }`}
            >
              <h3 className="text-[20px] font-semibold leading-snug">
                {block.title}
              </h3>
              {/* 「왜」가 먼저 와야 처음 보는 사람이 아래 항목을 읽을 수 있습니다.
                  본문과 같은 크기로 둡니다 — 이 페이지에 작은 글씨를 두지 않습니다. */}
              <p className="mt-[1mm] text-[20px] leading-snug text-[#787774]">
                {block.why}
              </p>
              <ul
                className={
                  paper === 'a4'
                    ? 'mt-[1mm] space-y-[0.9mm]'
                    : 'mt-[1.2mm] space-y-[1mm]'
                }
              >
                {block.points.map((point) => (
                  <li
                    key={point}
                    className={`flex gap-[2.5mm] text-[20px] text-[#4A4843] ${
                      // A4는 가로가 1122px로 좁아 같은 문장이 한 줄 더 쓰입니다.
                      // 글자를 줄이는 대신 이 페이지의 행간만 한 단계 조입니다.
                      paper === 'a4' ? 'leading-[1.24]' : 'leading-[1.3]'
                    }`}
                  >
                    <span aria-hidden className="shrink-0 text-[#C6C5C1]">
                      •
                    </span>
                    <span className="min-w-0">{point}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
      </div>
    </Page>
  );
}

function CredentialsPage() {
  return (
    // 항목이 5개뿐이라 justify-between으로 벌리면 구분선이 페이지 중간에 뜹니다.
    // 위에서부터 붙여 쌓고 남는 아래쪽은 비웁니다.
    <Page spread={false}>
      <Row label="Education" sub="학력 사항">
        <h3 className="text-[22px] font-semibold">
          {EDUCATION.school}
          <span className="ml-[3mm] text-[16px] font-normal text-[#787774]">
            {EDUCATION.note}
          </span>
        </h3>
        <ul className="mt-[4mm] space-y-[3.5mm]">
          {EDUCATION.extra.map((item) => (
            <li key={item.title}>
              <div className="text-[20px] text-[#37352F]">{item.title}</div>
              <div className="mt-[1mm] text-[16px] text-[#787774]">
                {item.detail}
              </div>
            </li>
          ))}
        </ul>
      </Row>

      <Row
        label="Certifications"
        sub="자격 사항"
        className="mt-[10mm] border-t border-[#E9E9E7] pt-[6mm]"
      >
        <ul className="space-y-[5mm]">
          {CERTIFICATIONS.map((cert) => (
            <li key={cert.name}>
              <div className="text-[20px] font-semibold">{cert.name}</div>
              <div className="mt-[1mm] text-[16px] text-[#787774]">
                {cert.issuer} · {cert.date}
              </div>
            </li>
          ))}
        </ul>
      </Row>
    </Page>
  );
}


export default function PortfolioDeck({
  paper = 'ppt',
}: {
  paper?: PaperName;
}) {
  const { mm } = PAPER[paper];

  // 목차의 페이지 번호. 앞서는 것은 표지·목차 둘뿐입니다 — Skills·AI 활용·학력은
  // 프로젝트 뒤로 보냈습니다. 프로젝트는 개요 1 + 담당 1 (+ 기술 선택) + 문제 해결 + 도판.
  const PAGES_BEFORE_PROJECTS = 2;
  const pageOf = new Map<string, number>();
  PROJECTS.reduce((page, project) => {
    pageOf.set(project.name, page);
    return (
      // 개요 1 + 담당 역할 1, 기술 선택은 행이 3개 이상일 때만 한 장.
      page +
      2 +
      (inlineTech(project) ? 0 : 1) +
      project.problems.length +
      (project.imagePages?.length ?? 0)
    );
  }, PAGES_BEFORE_PROJECTS + 1);
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: printCss(paper) }} />
      <div
        id="portfolio-shell-root"
        style={
          {
            '--page-w': `${mm.w}mm`,
            '--page-h': `${mm.h}mm`,
          } as React.CSSProperties
        }
        className={`deck ${pretendard.variable} ${deckMono.variable} ${pretendard.className} flex w-full flex-col items-center gap-[8mm] overflow-x-auto bg-[#EDECE8] p-[8mm]`}
      >
        <ProfilePage />
        <TimelinePage pageOf={pageOf} />
        {PROJECTS.map((project) => {
          // 순서: 개요 → 전체 아키텍처 → 기술 선택 → 담당 역할 → 문제 해결 → 상세.
          // 기술 선택이 담당보다 앞입니다 — 담당 줄이 기술 이름을 달고 있어서,
          // 왜 그 기술인지를 먼저 읽어야 담당 줄이 그대로 읽힙니다.
          const images = project.imagePages ?? [];
          // 전체 구조가 두 장인 프로젝트도 있으므로(1/2, 2/2) 전부 담당 앞에 둡니다.
          const arch = images.filter((image) => image.isArchitecture);
          const rest = images.filter((image) => !image.isArchitecture);
          return (
            <Fragment key={project.name}>
              <ProjectSummaryPage project={project} />
              {arch.map((image) => (
                <ImagePage
                  key={image.vector?.src ?? image.src}
                  project={project}
                  image={image}
                  paper={paper}
                />
              ))}
              {!inlineTech(project) && <ProjectTechPage project={project} />}
              <ProjectOwnershipPage project={project} />
              {/* 담당 범위 도면은 「주요 업무 및 담당 역할」 바로 뒤입니다 —
                  같은 것을 글과 그림으로 말하므로 떨어뜨리면 짝이 끊깁니다. */}
              {rest.map((image) => (
                <ImagePage
                  key={image.vector?.src ?? image.src}
                  project={project}
                  image={image}
                  paper={paper}
                />
              ))}
              {project.problems.map((problem, i) => (
                <ProjectProblemPage
                  key={problem.title}
                  project={project}
                  problem={problem}
                  index={i}
                />
              ))}
            </Fragment>
          );
        })}
        {/* Skills·AI 활용·학력은 찾아보는 자료지 설득하는 자료가 아니라 뒤에 둡니다 —
            앞에 두면 프로젝트가 7쪽에서야 시작하고, 제일 센 장이 그만큼 밀립니다. */}
        <SkillsPage groups={SKILL_GROUPS.slice(0, 2)} part={1} />
        <SkillsPage groups={SKILL_GROUPS.slice(2)} part={2} />
        <AiPracticePage paper={paper} />
        <CredentialsPage />
      </div>
    </>
  );
}
