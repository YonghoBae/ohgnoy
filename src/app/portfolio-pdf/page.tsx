'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { 
  DownloadIcon, 
  ChevronDown, 
  ArrowUpRight,
  MailIcon,
  GithubIcon
} from 'lucide-react';
import Link from 'next/link';

import { Spotlight } from '@/app/_components/ui/spotlight';
import { Magnetic } from '@/app/_components/ui/magnetic';
import { AnimatedBackground } from '@/app/_components/ui/animated-background';

import {
  PROJECTS,
  WORK_EXPERIENCE,
  BLOG_POSTS,
  EMAIL,
  SOCIAL_LINKS,
  SKILLS,
  EDUCATION,
} from './data';

// --- 애니메이션 설정 ---

const VARIANTS_CONTAINER = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const VARIANTS_SECTION = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
};

const TRANSITION_SECTION = { duration: 0.3 };

// --- 유틸리티 ---

const CORE_TECH_LIMIT = 5;

type StarKey = 'S' | 'T' | 'A' | 'R';
const LABEL_MAP: Record<StarKey, string> = {
    S: 'Problem', // 인쇄 공간 절약을 위해 짧게 변경 (화면엔 한글로 맵핑해도 됨)
    T: 'Challenge',
    A: 'Solution',
    R: 'Impact'
};
type StarGroups = Record<StarKey, string[]>;

function groupDetailsBySTAR(details?: string[]): StarGroups {
  const groups: StarGroups = { S: [], T: [], A: [], R: [] };
  if (!details) return groups;
  details.forEach((detail) => {
    const match = detail.match(/^([STAR](?:\d+)?)\.\s*(.*)$/i);
    if (!match) { groups.A.push(detail); return; }
    const [, rawPrefix, rest] = match;
    const key = rawPrefix?.[0]?.toUpperCase() as StarKey | undefined;
    if (!key || !groups[key]) { groups.A.push(rest || detail); return; }
    groups[key].push((rest || detail).trim());
  });
  return groups;
}

// --- 컴포넌트 ---

function ProjectMedia({ src, alt }: { src: string; alt: string }) {
  if (!src) return null;
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-3 print:hidden dark:border-zinc-800 dark:bg-zinc-900/60">
      <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Architecture Diagram</div>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="mt-2 aspect-video w-full rounded-lg object-contain"
      />
    </div>
  );
}

function MagneticSocialLink({ children, link, isDownload = false }: { children: React.ReactNode; link: string; isDownload?: boolean }) {
  return (
    <Magnetic springOptions={{ bounce: 0 }} intensity={0.3}>
      <a
        href={link}
        className="group relative inline-flex shrink-0 items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-950 hover:text-zinc-50 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 print:border print:border-zinc-300 print:bg-white print:text-black"
        {...(isDownload ? { download: true } : { target: '_blank', rel: 'noopener noreferrer' })}
      >
        {children}
        {isDownload ? <DownloadIcon className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5 opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 print:hidden" />}
      </a>
    </Magnetic>
  );
}

function ProjectCard({ project }: { project: (typeof PROJECTS)[number] }) {
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();
  
  // 인쇄 감지 로직: 인쇄 시 자동으로 details 펼치기
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('print');
    const handleChange = (mql: MediaQueryListEvent | MediaQueryList) => {
        if (mql.matches) setExpanded(true);
    };
    // 최신 브라우저 지원
    try {
        mediaQuery.addEventListener('change', handleChange);
    } catch {
        mediaQuery.addListener(handleChange);
    }
    // 인쇄 모드 체크
    if (mediaQuery.matches) setExpanded(true);

    return () => {
        try { mediaQuery.removeEventListener('change', handleChange); } catch { mediaQuery.removeListener(handleChange); }
    };
  }, []);

  const starGroups = useMemo(() => groupDetailsBySTAR(project.details), [project.details]);
  const summaryTech = useMemo(() => project.techStack.slice(0, CORE_TECH_LIMIT), [project.techStack]);
  const remainingTechCount = project.techStack.length - summaryTech.length;
  const hasStarDetails = (['S', 'T', 'A', 'R'] as StarKey[]).some((key) => starGroups[key].length > 0);
  const mediaSrc = project.architectureImg || project.video;

  return (
    <div className="flex flex-col space-y-4 print:space-y-2 print:break-inside-avoid">
      <div className="flex items-start justify-between px-1 print:px-0">
        <div className="space-y-1">
            <div className='flex items-center gap-2'>
                <a
                className="group relative inline-flex items-center gap-1 font-bold text-lg text-zinc-900 dark:text-zinc-50 print:text-black"
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                >
                {project.name}
                <ArrowUpRight className='h-4 w-4 opacity-50 print:hidden' />
                <span className="absolute bottom-0 left-0 block h-[1px] w-0 bg-zinc-900 transition-all duration-300 group-hover:w-full dark:bg-zinc-50 print:hidden"></span>
                </a>
            </div>
            
            {/* Tech Stack: 화면용(요약) + 인쇄용(전체) */}
            <div className="flex flex-wrap gap-1.5 print:hidden">
                {summaryTech.map((tech) => (
                <span key={tech} className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {tech}
                </span>
                ))}
                {remainingTechCount > 0 && (
                <span className="rounded-md border border-zinc-200 px-2 py-0.5 text-[11px] text-zinc-400 dark:border-zinc-700">
                    +{remainingTechCount}
                </span>
                )}
            </div>
            {/* 인쇄용 전체 기술 스택 (Plain Text) */}
            <div className="hidden print:block text-xs text-zinc-500">
                Stack: {project.techStack.join(', ')}
            </div>
        </div>
        
        {project.architectureImg && (
          <a
            href={project.architectureImg}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-zinc-400 underline decoration-zinc-300 underline-offset-2 transition hover:text-zinc-900 dark:decoration-zinc-700 dark:hover:text-zinc-200 print:text-zinc-600"
          >
            Architecture
          </a>
        )}
      </div>

      {/* 다이어그램 영역: 인쇄에서 제외해 A4 구성 유지 */}
      {mediaSrc && (
        <div className="relative rounded-2xl bg-zinc-50/40 p-1 ring-1 ring-zinc-200/50 ring-inset dark:bg-zinc-950/40 dark:ring-zinc-800/50 print:hidden">
          <ProjectMedia src={mediaSrc} alt={project.name} />
        </div>
      )}

      <div className="px-1 print:px-0">
        <p className="mb-3 text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400 print:text-sm print:text-black">
          {project.description}
        </p>

        {project.relatedLinks?.length ? (
          <div className="mb-3 space-y-1 print:space-y-0.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 print:text-black">
              Related Repositories
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-zinc-500 dark:text-zinc-400 print:gap-1 print:text-black">
              {project.relatedLinks.map((resource) => (
                <a
                  key={resource.link}
                  href={resource.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-dashed border-zinc-300 px-2 py-1 print:border-zinc-500"
                >
                  <span className="print:hidden">{resource.label}</span>
                  <span className="hidden print:inline">{resource.label} — {resource.link}</span>
                  <ArrowUpRight className="h-3 w-3 print:hidden" />
                </a>
              ))}
            </div>
          </div>
        ) : null}

        {hasStarDetails && (
          <div className="mt-2 print:mt-1">
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
              aria-controls={detailsId}
              className="group inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-200 print:hidden"
            >
              <span className={expanded ? '' : 'underline underline-offset-4'}>
                {expanded ? '접기' : '기술적 의사결정 (Deep Dive)'}
              </span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
            </button>
            
            {/* 인쇄 시 애니메이션 없이 무조건 표시되도록 CSS 클래스(print:block) 추가 */}
            <div className={expanded ? 'block' : 'hidden print:block'}>
                <motion.div
                    id={detailsId}
                    initial={false}
                    animate={expanded ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
                    // 인쇄 시에는 animation 무시하고 auto height
                    className="overflow-hidden print:!h-auto print:!opacity-100"
                >
                    <div className="mt-4 space-y-4 border-t border-dashed border-zinc-200 pt-4 dark:border-zinc-800 print:mt-2 print:border-zinc-300 print:pt-2 print:space-y-2">
                        {(['S', 'T', 'A', 'R'] as StarKey[]).map((key) => {
                        const items = starGroups[key];
                        if (!items.length) return null;
                        
                        return (
                            <div key={key} className="pl-1 print:pl-0">
                                <h5 className="mb-1 text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 print:text-black">
                                    {LABEL_MAP[key]}
                                </h5>
                                <ul className="list-disc space-y-1 pl-4 print:space-y-0.5">
                                    {items.map((item, i) => (
                                    <li key={i} className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 print:text-sm print:text-black">
                                        {item}
                                    </li>
                                    ))}
                                </ul>
                            </div>
                        );
                        })}
                    </div>
                </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- 메인 컴포넌트 ---

export default function Personal() {
  return (
    <>
    {/* 인쇄 전용 스타일: A4 여백 설정 */}
    <style jsx global>{`
        @media print {
            @page {
                margin: 15mm 15mm 15mm 15mm;
                size: A4;
            }
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                background-color: white !important;
                color: black !important;
            }
            /* 다크모드 강제 해제 */
            .dark { color: black !important; background: white !important; }
        }
    `}</style>

    <motion.main
      id="portfolio-shell-root"
      className="mx-auto max-w-2xl space-y-20 px-6 py-24 print:max-w-none print:px-0 print:py-0 print:space-y-8"
      variants={VARIANTS_CONTAINER}
      initial="hidden"
      animate="visible"
      // 인쇄 시 애니메이션 효과 무력화
      style={{ opacity: 1, filter: 'none', transform: 'none' }}
    >
      {/* --- 헤더 --- */}
      <header className="space-y-4 print:space-y-2 print:border-b print:border-zinc-900 print:pb-6">
        <div className='flex flex-col gap-2'>
          <Link href="/" className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 print:text-black print:text-4xl">
            배용호 (Bae Yong-ho)
          </Link>
          <div className="text-lg font-medium text-zinc-500 dark:text-zinc-400 print:text-zinc-600">
            Backend · Agent & Infrastructure Developer
          </div>
          {/* 인쇄 시에만 보이는 연락처 정보 */}
          <div className="hidden print:flex flex-wrap gap-4 text-sm text-zinc-600 mt-2">
             <span className='flex items-center gap-1'><MailIcon className='w-3 h-3'/> {EMAIL}</span>
             <span className='flex items-center gap-1'><GithubIcon className='w-3 h-3'/> github.com/YonghoBae</span>
          </div>
        </div>
      </header>

      {/* --- 자기소개 --- */}
      <motion.section variants={VARIANTS_SECTION} transition={TRANSITION_SECTION}>
        <p className="leading-relaxed text-zinc-600 dark:text-zinc-300 print:text-black print:text-sm">
            <span className='font-medium text-zinc-900 dark:text-zinc-100 print:font-bold print:text-black'>안정적인 백엔드 위에 의미 있는 인터랙션</span>을 설계합니다.
            서버 아키텍처와 AI 에이전트 파이프라인 설계를 주력으로 하며, 
            인프라부터 사용자 경험까지 서비스의 전 과정을 주도적으로 연결합니다.
        </p>
      </motion.section>

      {/* --- 프로젝트 --- */}
      <motion.section variants={VARIANTS_SECTION} transition={TRANSITION_SECTION}>
        <h3 className="mb-6 font-medium text-zinc-900 dark:text-zinc-100 print:mb-4 print:text-lg print:font-bold print:uppercase print:tracking-wider">Selected Projects</h3>
        <div className="flex flex-col space-y-12 print:space-y-8">
          {PROJECTS.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </div>
      </motion.section>

      {/* --- 과정 프로젝트 & 스킬 --- */}
      <motion.section variants={VARIANTS_SECTION} transition={TRANSITION_SECTION} className="print:break-inside-avoid">
        <h3 className="mb-4 font-medium text-zinc-900 dark:text-zinc-100 print:mb-3 print:text-lg print:font-bold print:uppercase print:tracking-wider">Course Projects & Skills</h3>
        <div className="space-y-8">
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 print:text-black">Course Projects</div>
            <div className="flex flex-col space-y-2 print:space-y-4">
              {WORK_EXPERIENCE.map((job) => (
                <a
                  className="group relative overflow-hidden rounded-2xl bg-zinc-100/50 p-[1px] dark:bg-zinc-800/50 print:bg-transparent print:p-0 print:border-none"
                  href={job.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={job.id}
                >
                  <Spotlight
                    className="-top-40 left-0 from-zinc-500/10 via-zinc-400/10 to-zinc-300/10 blur-2xl print:hidden"
                    size={300}
                  />
                  <div className="relative h-full w-full rounded-[15px] bg-white p-5 transition-colors group-hover:bg-zinc-50 dark:bg-zinc-950 dark:group-hover:bg-zinc-900 print:p-0 print:bg-transparent">
                    <div className="flex w-full flex-col justify-between gap-1 sm:flex-row sm:items-baseline">
                       <h4 className="font-medium text-zinc-900 dark:text-zinc-100 print:font-bold print:text-black">
                        {job.title}
                      </h4>
                      <span className="text-xs text-zinc-400 font-mono print:text-zinc-600">
                        {job.start} — {job.end}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 print:text-black print:mb-1">
                        {job.company}
                    </p>
                    <ul className="mt-3 list-disc space-y-1 pl-4 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 print:mt-1 print:text-sm print:text-black">
                      {job.achievements.map((achievement, index) => (
                        <li key={index}>{achievement}</li>
                      ))}
                    </ul>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 print:text-black">Skills Snapshot</div>
            <div className="space-y-4 print:space-y-2">
              {SKILLS.map((group) => (
                <div key={group.category} className="space-y-1 print:space-y-0.5">
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black print:font-bold">
                    {group.category}
                  </h4>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 print:text-black">
                    {group.skills.join(', ')}
                  </p>
                  {group.note && (
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 print:text-zinc-700">
                      {group.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* --- 학력 --- */}
      <motion.section variants={VARIANTS_SECTION} transition={TRANSITION_SECTION} className="print:break-inside-avoid">
        <h3 className="mb-4 font-medium text-zinc-900 dark:text-zinc-100 print:mb-2 print:text-lg print:font-bold print:uppercase print:tracking-wider">Education</h3>
          {EDUCATION.map((edu, index) => (
            <div key={index} className="flex items-center justify-between py-2 print:py-1">
              <div>
                <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 print:text-black print:font-bold">{edu.school}</h4>
                <p className="text-xs text-zinc-500 print:text-sm print:text-zinc-700">{edu.major}</p>
              </div>
              <span className="text-xs text-zinc-400 font-mono print:text-zinc-600">{edu.period}</span>
            </div>
          ))}
      </motion.section>

      {/* --- 블로그 (인쇄 시 숨김 - 공간 절약) --- */}
      <motion.section variants={VARIANTS_SECTION} transition={TRANSITION_SECTION} className="print:hidden">
        <h3 className="mb-2 font-medium text-zinc-900 dark:text-zinc-100">Writing</h3>
        <div className="-mx-3">
            <AnimatedBackground
                enableHover
                className="h-full w-full rounded-lg bg-zinc-100 dark:bg-zinc-800/50"
                transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
            >
                {BLOG_POSTS.map((post) => (
                <Link
                    key={post.uid}
                    href={post.link}
                    data-id={post.uid}
                    className="flex flex-col gap-0.5 px-3 py-2"
                >
                    <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {post.title}
                    </h4>
                    <p className="text-xs text-zinc-500">
                        {post.description}
                    </p>
                </Link>
                ))}
            </AnimatedBackground>
        </div>
      </motion.section>

      {/* --- 연락처 (인쇄 시 하단에 작게 표시 or 숨김) --- */}
      <motion.section variants={VARIANTS_SECTION} transition={TRANSITION_SECTION} className="print:hidden">
        <h3 className="mb-4 font-medium text-zinc-900 dark:text-zinc-100">Connect</h3>
        <div className="flex flex-wrap items-center gap-3">
          {SOCIAL_LINKS.map((link) => (
            <MagneticSocialLink key={link.label} link={link.link}>
              {link.label}
            </MagneticSocialLink>
          ))}
        </div>
      </motion.section>
    </motion.main>
    </>
  );
}
