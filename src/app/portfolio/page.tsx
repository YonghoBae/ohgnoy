'use client';

import { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  XIcon, 
  DownloadIcon, 
  ArrowUpRight,
  PlayIcon
} from 'lucide-react';
import Link from 'next/link';

// 컴포넌트 경로 확인 (사용하시는 환경에 맞춰주세요)
import { Spotlight } from '@/app/_components/ui/spotlight';
import { Magnetic } from '@/app/_components/ui/magnetic';
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContent,
  MorphingDialogClose,
  MorphingDialogContainer,
} from '@/app/_components/ui/morphing-dialog';
import { AnimatedBackground } from '@/app/_components/ui/animated-background';
import { TextEffect } from '@/app/_components/ui/text-effect';

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

// [수정] STAR 내부 키는 유지하되, UI에 노출되는 라벨은 현업 스타일로 매핑합니다.
type StarKey = 'S' | 'T' | 'A' | 'R';
const LABEL_MAP: Record<StarKey, string> = {
    S: 'Problem (문제 정의)',
    T: 'Challenge (해결 과제)',
    A: 'Solution (기술적 해결)',
    R: 'Impact (성과)'
};
type StarGroups = Record<StarKey, string[]>;

function groupDetailsBySTAR(details?: readonly string[]): StarGroups {
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

const VIDEO_PATTERN = /\.(mp4|webm|mov|m4v)$/i;

function resolveMediaSrc(src: string) {
  if (!src) return src;
  if (/^(https?:)?\/\//.test(src)) return src;
  const normalized = src.replace(/^\/+/, '');
  return `/${normalized}`;
}

function ProjectMedia({ src, alt }: { src: string; alt: string }) {
  const resolvedSrc = resolveMediaSrc(src);
  const isVideo = VIDEO_PATTERN.test(resolvedSrc);
  return (
    <MorphingDialog transition={{ type: 'spring', bounce: 0, duration: 0.3 }}>
      <MorphingDialogTrigger>
        <div className="group relative overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
          {isVideo ? (
            <>
              <video
                src={resolvedSrc}
                autoPlay
                loop
                muted
                playsInline
                className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105 print:hidden"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="rounded-full bg-white/30 p-3 backdrop-blur-md">
                  <PlayIcon className="h-5 w-5 text-white" />
                </div>
              </div>
            </>
          ) : (
            <>
              <img
                src={resolvedSrc}
                alt={alt}
                loading="lazy"
                className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="rounded-full bg-white/30 px-3 py-2 text-xs font-medium uppercase tracking-wide text-white/80 backdrop-blur-md">
                  Zoom
                </div>
              </div>
            </>
          )}
        </div>
      </MorphingDialogTrigger>
      <MorphingDialogContainer>
        <MorphingDialogContent className="relative aspect-video rounded-2xl bg-zinc-50 p-1 ring-1 ring-zinc-200/50 ring-inset dark:bg-zinc-950 dark:ring-zinc-800/50">
          {isVideo ? (
            <video
              src={resolvedSrc}
              autoPlay
              loop
              muted
              playsInline
              className="aspect-video h-[50vh] w-full rounded-xl bg-black object-contain md:h-[70vh] print:hidden"
            />
          ) : (
            <div className="flex h-[50vh] w-full items-center justify-center rounded-xl bg-white dark:bg-zinc-900 md:h-[70vh]">
              <img
                src={resolvedSrc}
                alt={alt}
                className="h-full w-full object-contain"
              />
            </div>
          )}
        </MorphingDialogContent>
        <MorphingDialogClose className="fixed right-6 top-6 h-fit w-fit rounded-full bg-white p-2 shadow-sm transition-transform active:scale-95">
          <XIcon className="h-4 w-4 text-zinc-500" />
        </MorphingDialogClose>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}

function MagneticSocialLink({ children, link, isDownload = false }: { children: React.ReactNode; link: string; isDownload?: boolean }) {
  return (
    <Magnetic springOptions={{ bounce: 0 }} intensity={0.3}>
      <a
        href={link}
        className="group relative inline-flex shrink-0 items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-950 hover:text-zinc-50 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
        {...(isDownload ? { download: true } : { target: '_blank', rel: 'noopener noreferrer' })}
      >
        {children}
        {isDownload ? <DownloadIcon className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5 opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}
      </a>
    </Magnetic>
  );
}

function ProjectCard({ project }: { project: (typeof PROJECTS)[number] }) {
  const starGroups = useMemo(() => groupDetailsBySTAR(project.details), [project.details]);
  const summaryTech = useMemo(() => project.techStack.slice(0, CORE_TECH_LIMIT), [project.techStack]);
  const remainingTechCount = project.techStack.length - summaryTech.length;
  const hasStarDetails = (['S', 'T', 'A', 'R'] as StarKey[]).some((key) => starGroups[key].length > 0);

  return (
    <div className="flex flex-col space-y-4 print:space-y-3 print-break-avoid">
      <div className="flex items-start justify-between px-1">
        <div className="space-y-1">
            <a
            className="group relative inline-flex items-center gap-1 font-semibold text-zinc-900 dark:text-zinc-50"
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            >
            {project.name}
            <span className="absolute bottom-0 left-0 block h-[1px] w-0 bg-zinc-900 transition-all duration-300 group-hover:w-full dark:bg-zinc-50"></span>
            </a>
            <div className="flex flex-wrap gap-1.5">
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
        </div>
        
        {project.architectureImg && (
          <a
            href={project.architectureImg}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-zinc-400 underline decoration-zinc-300 underline-offset-2 transition hover:text-zinc-900 dark:decoration-zinc-700 dark:hover:text-zinc-200"
          >
            Architecture
          </a>
        )}
      </div>

      <div className="relative rounded-2xl bg-zinc-50/40 p-1 ring-1 ring-zinc-200/50 ring-inset dark:bg-zinc-950/40 dark:ring-zinc-800/50">
        <ProjectMedia src={project.video} alt={project.name} />
      </div>

      <div className="px-1 print:px-0">
        <p className="mb-3 text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400">
          {project.description}
        </p>

        {project.relatedLinks?.length ? (
          <div className="mb-3 flex flex-wrap gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            {project.relatedLinks.map((resource) => (
              <a
                key={resource.link}
                href={resource.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-zinc-200 px-2.5 py-1 transition hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-600"
              >
                {resource.label}
                <ArrowUpRight className="h-3 w-3" />
              </a>
            ))}
          </div>
        ) : null}

        {hasStarDetails && (
          <div className="mt-6 border-t border-dashed border-zinc-200 pt-6 dark:border-zinc-800">
            <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              Technical Deep Dive
            </div>
            <div className="relative">
              <div className="absolute left-2 top-0 h-full w-px bg-gradient-to-b from-zinc-200 to-transparent dark:from-zinc-800" aria-hidden />
              <ul className="space-y-6">
                {(['S', 'T', 'A', 'R'] as StarKey[]).map((key, index) => {
                  const items = starGroups[key];
                  if (!items.length) return null;

                  return (
                    <li key={key} className="relative pl-8">
                      <span className="absolute left-0 top-1 flex h-5 w-5 items-center justify-center rounded-full border border-zinc-300 bg-white text-[10px] font-semibold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                        {index + 1}
                      </span>
                      <div className="space-y-2 rounded-2xl bg-zinc-50/70 p-3 ring-1 ring-zinc-100 dark:bg-zinc-900/50 dark:ring-zinc-800/60">
                        <h5 className="text-xs font-bold uppercase tracking-wide text-zinc-900 dark:text-zinc-100">
                          {LABEL_MAP[key]}
                        </h5>
                        <ul className="space-y-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                          {items.map((item, i) => (
                            <li key={i} className="list-disc pl-4 marker:text-zinc-400">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </li>
                  );
                })}
              </ul>
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
    <motion.main
      id="portfolio-shell-root"
      className="mx-auto max-w-2xl space-y-20 px-6 py-24 print:max-w-none print:space-y-12 print:px-10 print:py-10"
      variants={VARIANTS_CONTAINER}
      initial="hidden"
      animate="visible"
    >
      {/* --- 헤더 --- */}
      <header className="space-y-4 print:space-y-2 print-break-avoid">
        <div className='space-y-1'>
          <Link href="/" className="font-semibold text-zinc-900 dark:text-zinc-50">
            배용호 (Bae Yong-ho)
          </Link>
          <TextEffect
            as="p"
            preset="fade"
            per="char"
            className="text-zinc-500 dark:text-zinc-400"
            delay={0.5}
          >
            Backend · Agent & Infrastructure Developer
          </TextEffect>
        </div>
      </header>

      {/* --- 자기소개 --- */}
      <motion.section variants={VARIANTS_SECTION} transition={TRANSITION_SECTION} className="print-break-avoid">
        <p className="leading-relaxed text-zinc-600 dark:text-zinc-300">
            <span className='font-medium text-zinc-900 dark:text-zinc-100'>안정적인 백엔드 위에 의미 있는 인터랙션</span>을 설계합니다.
            서버 아키텍처와 AI 에이전트 파이프라인 설계를 주력으로 하며, 
            인프라부터 사용자 경험까지 서비스의 전 과정을 주도적으로 연결합니다.
        </p>
      </motion.section>

      {/* --- 프로젝트 --- */}
      <motion.section variants={VARIANTS_SECTION} transition={TRANSITION_SECTION} className="print-break-avoid">
        <h3 className="mb-6 font-medium text-zinc-900 dark:text-zinc-100 print:mb-3">Selected Projects</h3>
        <div className="flex flex-col space-y-12 print:space-y-6">
          {PROJECTS.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </div>
      </motion.section>

      {/* --- 과정 프로젝트 & 스킬 --- */}
      <motion.section variants={VARIANTS_SECTION} transition={TRANSITION_SECTION} className="print-break-avoid">
        <h3 className="mb-4 font-medium text-zinc-900 dark:text-zinc-100 print:mb-2">Course Projects & Skills</h3>
        <div className="space-y-8">
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Course Projects
            </div>
            <div className="flex flex-col space-y-2">
              {WORK_EXPERIENCE.map((job) => (
                <a
                  className="group relative overflow-hidden rounded-2xl bg-zinc-100/50 p-[1px] dark:bg-zinc-800/50 print-break-avoid"
                  href={job.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={job.id}
                >
                  <Spotlight
                    className="-top-40 left-0 from-zinc-500/10 via-zinc-400/10 to-zinc-300/10 blur-2xl"
                    size={300}
                  />
                  <div className="relative h-full w-full rounded-[15px] bg-white p-5 transition-colors group-hover:bg-zinc-50 dark:bg-zinc-950 dark:group-hover:bg-zinc-900">
                    <div className="flex w-full flex-col justify-between gap-1 sm:flex-row sm:items-baseline">
                       <h4 className="font-medium text-zinc-900 dark:text-zinc-100">
                        {job.title}
                      </h4>
                      <span className="text-xs text-zinc-400 font-mono">
                        {job.start} — {job.end}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {job.company}
                    </p>
                    <ul className="mt-3 list-disc space-y-1 pl-4 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
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
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Skills Snapshot
            </div>
            <div className="space-y-4 print:space-y-2">
              {SKILLS.map((group) => (
                <div key={group.category} className="space-y-1">
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {group.category}
                  </div>
                  <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {group.skills.join(', ')}
                  </p>
                  {group.note && (
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">
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
      <motion.section variants={VARIANTS_SECTION} transition={TRANSITION_SECTION} className="print-break-avoid">
        <h3 className="mb-4 font-medium text-zinc-900 dark:text-zinc-100 print:mb-2">Education</h3>
          {EDUCATION.map((edu, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <div>
                <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{edu.school}</h4>
                <p className="text-xs text-zinc-500">{edu.major}</p>
              </div>
              <span className="text-xs text-zinc-400 font-mono">{edu.period}</span>
            </div>
          ))}
      </motion.section>

      {/* --- 블로그 --- */}
      <motion.section variants={VARIANTS_SECTION} transition={TRANSITION_SECTION} className="print-break-avoid">
        <h3 className="mb-2 font-medium text-zinc-900 dark:text-zinc-100 print:mb-1">Writing</h3>
        <div className="-mx-3 print:mx-0">
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

      {/* --- 연락처 --- */}
      <motion.section variants={VARIANTS_SECTION} transition={TRANSITION_SECTION} className="print-break-avoid">
        <h3 className="mb-4 font-medium text-zinc-900 dark:text-zinc-100 print:mb-2">Connect</h3>
        <div className="flex flex-wrap items-center gap-3">
          {SOCIAL_LINKS.map((link) => (
            <MagneticSocialLink key={link.label} link={link.link}>
              {link.label}
            </MagneticSocialLink>
          ))}
        </div>
      </motion.section>
    </motion.main>
  );
}
