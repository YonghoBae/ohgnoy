import { pretendard, deckMono } from '../portfolio-pdf/fonts';
import { PAPER, Page, printCss } from '../portfolio-pdf/deck';
import {
  PROFILE,
  EDUCATION,
  CERTIFICATIONS,
  SKILL_GROUPS,
  AI_PRACTICE,
} from '../portfolio-pdf/data';
import {
  PHONE,
  BIRTH_DATE,
  ADDRESS,
  PHOTO,
  AWARDS,
  AI_PRACTICE_TOOLS,
  EDU_ACTIVITIES,
  RESUME_PROJECTS,
  COVER_LETTER,
} from './data';

/**
 * 국내 이력서 양식. 노션 원본을 그대로 옮기던 판(콜아웃 박스 + 이모지 아이콘)을
 * 버리고, 국내 이력서 관례를 따릅니다:
 *   인적사항(증명사진 + 기본정보 + 한 줄 포지셔닝) → 학력 → 자격 → 수상 → 기술
 *   → 프로젝트 경험 → 교육·대외활동, 그리고 자기소개서는 뒤에 별도 장.
 * 이력서는 두 장을 넘기지 않습니다 — 프로젝트 상세는 포트폴리오에서 봅니다.
 * 항목은 전부 최신순이고, 박스 대신 «왼쪽 라벨 / 오른쪽 내용» 표 구조를 씁니다.
 *
 * 조판 규칙: 1px #EAEAEA 구분선만 쓰고 그림자·아이콘·이모지는 쓰지 않습니다.
 * 날짜와 수치는 고정폭(JetBrains Mono)이라 열이 세로로 맞습니다.
 */
const TEXT = '#2F3437';
const MUTED = '#787774';
const LINE = '#EAEAEA';

/** 이 덱 자체의 공개 주소. 이력서에서 상세 성과를 여기로 넘깁니다. */

function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <h2
      // 문서 라벨(DocLabel) 바로 뒤에 오는 첫 절도 위 여백을 지웁니다.
      className="mt-[4mm] border-b pb-[1mm] text-[17px] font-semibold tracking-[-0.01em] first:mt-0 [p+&]:mt-0"
      style={{ color: TEXT, borderColor: TEXT }}
    >
      {children}
    </h2>
  );
}

/**
 * 국내 이력서는 이력서·경력기술서·자기소개서를 각각 별도 문서로 냅니다. 한 PDF로
 * 묶어 보내더라도 어디서부터가 어느 문서인지는 장마다 밝혀 둡니다.
 */
function DocLabel({ title, part }: { title: string; part?: string }) {
  return (
    <p
      className="mb-[2.5mm] font-[family-name:var(--font-deck-mono)] text-[11px] uppercase tracking-[0.14em]"
      style={{ color: MUTED }}
    >
      {title}
      {part && <span className="ml-[2mm]">{part}</span>}
    </p>
  );
}

/** 왼쪽 고정폭 라벨 + 오른쪽 내용. 국내 이력서 표의 기본 단위입니다. */
function Row({
  label,
  children,
  /** 프로젝트 표는 본문 폭이 아쉬워 거터를 좁게 씁니다. */
  labelWidth = '24mm',
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  labelWidth?: string;
  className?: string;
}) {
  return (
    <div className={`flex gap-[5mm] py-[0.45mm] text-[15px] ${className}`}>
      <span
        className="shrink-0 font-[family-name:var(--font-deck-mono)] text-[13px] leading-[1.6]"
        style={{ color: MUTED, width: labelWidth }}
      >
        {label}
      </span>
      <span className="min-w-0 flex-1 leading-[1.55]" style={{ color: TEXT }}>
        {children}
      </span>
    </div>
  );
}

function PersonalSection() {
  return (
    <>
      <SectionHead>인적사항</SectionHead>
      <div className="mt-[3mm] flex gap-[7mm]">
        {/* 증명사진. 원본이 200x230이라 비율이 조금 다르므로 object-cover로 채웁니다.
            행 높이는 오른쪽 칸(이름·직무·연락처 5행 = 63.8mm)이 정하므로, 사진이 그
            안에 있는 한 키워도 페이지가 늘지 않습니다 — 27x36mm 이던 시절에는 사진
            아래로 28mm 가 그냥 비어 있었습니다. 3:4 를 지켜 42x56mm. 더 키우면 행
            높이를 사진이 정하게 되어 1쪽(현재 97%)이 넘칩니다. */}
        {PHONE && (
          <img
            src={PHOTO}
            alt={`${PROFILE.name} 증명사진`}
            width={200}
            height={230}
            className="h-[56mm] w-[42mm] shrink-0 border object-cover"
            style={{ borderColor: LINE }}
          />
        )}
        <div className="min-w-0 flex-1">
          <h1
            className="text-[30px] font-semibold leading-none tracking-[-0.02em]"
            style={{ color: TEXT }}
          >
            {PROFILE.name}
            <span className="ml-[4mm] text-[16px] font-normal" style={{ color: MUTED }}>
              {PROFILE.nameEn}
            </span>
          </h1>
          <p className="mt-[2mm] text-[15px]" style={{ color: MUTED }}>
            {PROFILE.roleKo}
          </p>
          {/* 한 줄 포지셔닝. 「핵심 역량」 절을 따로 두면 그 안이 결국 아래 프로젝트
              경험의 요약이 되어 같은 내용을 두 번 읽히게 됩니다. */}
          <p className="mt-[1.5mm] text-[15px] font-medium" style={{ color: TEXT }}>
            {PROFILE.lead}
          </p>
          <div className="mt-[3mm] border-t pt-[2mm]" style={{ borderColor: LINE }}>
            {BIRTH_DATE && <Row label="생년월일">{BIRTH_DATE}</Row>}
            {ADDRESS && <Row label="주소">{ADDRESS}</Row>}
            {PHONE && (
              <Row label="연락처">
                <Link href={`tel:${PHONE.replace(/-/g, '')}`}>{PHONE}</Link>
              </Row>
            )}
            <Row label="이메일">
              <Link href={`mailto:${PROFILE.email}`}>{PROFILE.email}</Link>
            </Row>
            <Row label="GitHub">
              <Link href={PROFILE.githubUrl}>{PROFILE.github}</Link>
            </Row>
            <Row label="Blog">
              <Link href={PROFILE.blogUrl}>{PROFILE.blog}</Link>
            </Row>
            <Row label="Portfolio">
              <Link href={PROFILE.portfolioUrl}>{PROFILE.portfolio}</Link>
            </Row>
          </div>
        </div>
      </div>
    </>
  );
}

function EducationSection() {
  return (
    <>
      <SectionHead>학력사항</SectionHead>
      <div className="mt-[2mm]">
        <Row label={EDUCATION.note.replace(' 졸업', '')}>
          <span className="font-medium">{EDUCATION.school}</span>
          <span className="ml-[3mm] text-[13px]" style={{ color: MUTED }}>
            졸업
          </span>
        </Row>
      </div>
    </>
  );
}

function CertificationsSection() {
  return (
    <>
      <SectionHead>자격사항</SectionHead>
      <div className="mt-[2mm]">
        {CERTIFICATIONS.map((cert) => (
          <Row key={cert.name} label={cert.date}>
            <span className="font-medium">{cert.name}</span>
            <span className="ml-[3mm] text-[13px]" style={{ color: MUTED }}>
              {cert.issuer}
            </span>
          </Row>
        ))}
      </div>
    </>
  );
}

function AwardsSection() {
  return (
    <>
      <SectionHead>수상경력</SectionHead>
      <div className="mt-[2mm]">
        {AWARDS.map((award) => (
          <Row key={award.name} label={award.date}>
            <span className="font-medium">{award.name}</span>
            <span className="ml-[3mm] text-[13px]" style={{ color: MUTED }}>
              {award.event}
            </span>
            <span className="block text-[13px]" style={{ color: MUTED }}>
              {award.detail}
            </span>
          </Row>
        ))}
      </div>
    </>
  );
}

function SkillsSection() {
  return (
    <>
      <SectionHead>기술사항</SectionHead>
      <div className="mt-[2mm]">
        {SKILL_GROUPS.map((group) => (
          <Row key={group.category} label={group.category}>
            <span className="flex flex-wrap gap-x-[3mm] gap-y-[0.5mm]">
              {group.skills.slice(0, 4).map((skill) => (
                <span key={skill.name} className="whitespace-nowrap">
                  {skill.name}
                  <span
                    className="ml-[1mm] font-[family-name:var(--font-deck-mono)] text-[12px]"
                    style={{ color: MUTED }}
                  >
                    {skill.level}/5
                  </span>
                </span>
              ))}
            </span>
          </Row>
        ))}
        {/* 코딩 에이전트 활용은 절을 따로 두면 이력서에서 제일 군더더기가 됩니다.
            도구와 운용 장치의 이름만 기술사항 한 행으로 흡수하고, 내용은 포트폴리오로. */}
        <Row label="AI 에이전트 운용">
          {AI_PRACTICE_TOOLS} · {AI_PRACTICE.map((b) => b.title).join(' · ')}
        </Row>
      </div>
    </>
  );
}

/**
 * 실제 하이퍼링크. Chrome의 「PDF로 저장」은 `<a href>`를 PDF 링크 주석으로 넣으므로
 * 인쇄물에서도 그대로 눌립니다. 인쇄에서 파랑은 과하니 색은 본문과 같이 두고,
 * 눌린다는 표시는 옅은 밑줄로만 냅니다.
 */
function Link({ href, children }: { href: string; children: React.ReactNode }) {
  // 새 탭은 웹 주소만 — `mailto:`/`tel:` 은 빈 탭을 띄웁니다.
  const external = /^https?:/.test(href);
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      className="underline decoration-[0.4px] underline-offset-[2.5px]"
      style={{ color: 'inherit', textDecorationColor: '#C9C9C6' }}
    >
      {children}
    </a>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-[2mm] text-[15px] leading-[1.5]" style={{ color: TEXT }}>
      <span aria-hidden className="shrink-0" style={{ color: MUTED }}>
        ·
      </span>
      <span className="min-w-0 text-pretty">{children}</span>
    </li>
  );
}

/**
 * 국내 이력서의 프로젝트 경험. 제목 줄에 기간을 오른쪽 정렬로 붙이고, 팀·역할과
 * 기술은 라벨 행으로, 성과는 「[무엇을 했나] 어떻게·얼마나」 불릿으로 둡니다.
 */
function ProjectBlock({ project }: { project: (typeof RESUME_PROJECTS)[number] }) {
  return (
    <div className="mt-[2mm] border-t pt-[1.6mm] first:mt-[2mm] first:border-t-0 first:pt-0" style={{ borderColor: LINE }}>
      <div className="flex items-baseline justify-between gap-[4mm]">
        <h3 className="text-[16px] font-semibold tracking-[-0.01em]" style={{ color: TEXT }}>
          {project.name}
          {project.repo && (
            <span
              className="ml-[3mm] font-[family-name:var(--font-deck-mono)] text-[12px] font-normal"
              style={{ color: MUTED }}
            >
              <Link href={`https://${project.repo}`}>{project.repo}</Link>
            </span>
          )}
        </h3>
        <span
          className="shrink-0 font-[family-name:var(--font-deck-mono)] text-[13px]"
          style={{ color: MUTED }}
        >
          {project.period}
        </span>
      </div>
      {/* 팀 구성·역할·개요·기술 스택은 1쪽(인적사항·학력·자격)과 같은 표 문법으로 둡니다 —
          한 문서에 라벨 문법이 둘이면 같은 성격의 정보가 다르게 읽힙니다. 성과는
          길이가 제각각이라 표에 넣지 않고 아래 불릿으로 남깁니다. */}
      {/* 팀과 역할은 한 행에 둡니다 — 행을 나누면 프로젝트마다 한 줄씩 늘어 3건이
          한 장에 안 들어갑니다. 라벨에 둘 다 밝혀 두면 구분은 유지됩니다. */}
      <div className="mt-[1.2mm]">
        <Row label="팀 · 역할" labelWidth="19mm">
          {project.team} · {project.role}
        </Row>
        <Row label="개요" labelWidth="19mm">
          {project.oneLiner}
        </Row>
        {/* 전체 스택은 1쪽 기술사항이 이미 보여 주므로 여기서는 대표 6종까지만 */}
        <Row label="기술 스택" labelWidth="19mm">
          {project.stack.slice(0, 6).join(', ')}
          {project.stack.length > 6 && ` 외 ${project.stack.length - 6}종`}
        </Row>
      </div>
      <ul className="mt-[1.3mm] flex flex-col gap-[0.8mm]">
        {/* 이력서에는 대표 2건만 — 나머지 성과와 그 과정은 포트폴리오에 있습니다 */}
        {project.highlights.slice(0, 2).map((h) => (
          <li
            key={h.label}
            className="flex gap-[2mm] text-[15px] leading-[1.45]"
            style={{ color: TEXT }}
          >
            <span aria-hidden className="shrink-0" style={{ color: MUTED }}>
              ·
            </span>
            <span className="min-w-0 text-pretty">
              <span className="font-semibold">[{h.label}]</span> {h.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProjectsSection({
  projects,
  continued = false,
}: {
  projects: typeof RESUME_PROJECTS;
  continued?: boolean;
}) {
  return (
    <>
      <SectionHead>
        프로젝트 경험
        {continued && (
          <span className="ml-[2mm] text-[13px] font-normal" style={{ color: MUTED }}>
            (이어서)
          </span>
        )}
      </SectionHead>
      {projects.map((project) => (
        <ProjectBlock key={project.name} project={project} />
      ))}
    </>
  );
}

function ActivitiesSection() {
  return (
    <>
      <SectionHead>교육 및 대외활동</SectionHead>
      <div className="mt-[2mm] flex flex-col gap-[2mm]">
        {EDU_ACTIVITIES.map((entry) => (
          <div key={entry.title}>
            <div className="flex items-baseline justify-between gap-[4mm]">
              <h3 className="text-[15px] font-semibold" style={{ color: TEXT }}>
                {entry.title}
              </h3>
              <span
                className="shrink-0 font-[family-name:var(--font-deck-mono)] text-[13px]"
                style={{ color: MUTED }}
              >
                {entry.period}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function CoverLetterPage({ sections }: { sections: typeof COVER_LETTER }) {
  return (
    <>
      <div className="mt-[3mm] flex flex-col gap-[5mm]">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="text-[16px] font-semibold" style={{ color: TEXT }}>
              {section.title}
            </h2>
            <div className="mt-[1.5mm] flex flex-col gap-[1.5mm]">
              {section.paragraphs.map((p, i) => (
                <p
                  key={i}
                  className="text-[15px] leading-[1.6]"
                  style={{ color: i === 0 ? TEXT : MUTED }}
                >
                  {p}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function Resume() {
  const { mm } = PAPER.resume;
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: printCss('resume') }} />
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
        {/* 이력서는 두 장으로 끝냅니다 — 프로젝트 상세는 이력서가 아니라 포트폴리오에서
            보는 것이라, 여기서는 무엇을 했고 결과가 무엇이었는지 한 줄씩만 둡니다. */}
        <Page spread={false}>
          <DocLabel title="이력서" part="1 / 2" />
          <PersonalSection />
          <EducationSection />
          <ActivitiesSection />
          <CertificationsSection />
          <AwardsSection />
          <SkillsSection />
        </Page>
        <Page spread={false}>
          <DocLabel title="이력서" part="2 / 2" />
          <ProjectsSection projects={RESUME_PROJECTS} />
        </Page>
        <Page spread={false}>
          <DocLabel title="자기소개서" part="1 / 2" />
          <CoverLetterPage sections={COVER_LETTER.slice(0, 2)} />
        </Page>
        <Page spread={false}>
          <DocLabel title="자기소개서" part="2 / 2" />
          <CoverLetterPage sections={COVER_LETTER.slice(2)} />
        </Page>
      </div>
    </>
  );
}
