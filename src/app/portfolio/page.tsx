'use client';
import { motion } from 'motion/react';
import { XIcon, DownloadIcon } from 'lucide-react';
import { Spotlight } from '@/app/_components/ui/spotlight';
import { Magnetic } from '@/app/_components/ui/magnetic';
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContent,
  MorphingDialogClose,
  MorphingDialogContainer,
} from '@/app/_components/ui/morphing-dialog';
import Link from 'next/link';
import { AnimatedBackground } from '@/app/_components/ui/animated-background';
import {
  PROJECTS,
  WORK_EXPERIENCE,
  BLOG_POSTS,
  EMAIL,
  SOCIAL_LINKS,
  SKILLS,
  EDUCATION, // 학력 데이터 import 추가
  RESUME_LINK,
} from './data';
import { TextEffect } from '../_components/ui/text-effect';

// --- 상수 및 유틸리티 컴포넌트 ---

const VARIANTS_CONTAINER = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const VARIANTS_SECTION = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
};

const TRANSITION_SECTION = {
  duration: 0.3,
};

type ProjectVideoProps = {
  src: string;
};

function ProjectVideo({ src }: ProjectVideoProps) {
  return (
    <MorphingDialog
      transition={{
        type: 'spring',
        bounce: 0,
        duration: 0.3,
      }}
    >
      <MorphingDialogTrigger>
        <video
          src={src}
          autoPlay
          loop
          muted
          playsInline
          className="aspect-video w-full cursor-zoom-in rounded-xl"
        />
      </MorphingDialogTrigger>
      <MorphingDialogContainer>
        <MorphingDialogContent className="relative aspect-video rounded-2xl bg-zinc-50 p-1 ring-1 ring-zinc-200/50 ring-inset dark:bg-zinc-950 dark:ring-zinc-800/50">
          <video
            src={src}
            autoPlay
            loop
            muted
            playsInline
            className="aspect-video h-[50vh] w-full rounded-xl md:h-[70vh]"
          />
        </MorphingDialogContent>
        <MorphingDialogClose
          className="fixed top-6 right-6 h-fit w-fit rounded-full bg-white p-1"
          variants={{
            initial: { opacity: 0 },
            animate: {
              opacity: 1,
              transition: { delay: 0.3, duration: 0.1 },
            },
            exit: { opacity: 0, transition: { duration: 0 } },
          }}
        >
          <XIcon className="h-5 w-5 text-zinc-500" />
        </MorphingDialogClose>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}

function MagneticSocialLink({
  children,
  link,
  isDownload = false,
}: {
  children: React.ReactNode;
  link: string;
  isDownload?: boolean;
}) {
  return (
    <Magnetic springOptions={{ bounce: 0 }} intensity={0.3}>
      <a
        href={link}
        className="group relative inline-flex shrink-0 items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-sm text-black transition-colors duration-200 hover:bg-zinc-950 hover:text-zinc-50 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
        {...(isDownload ? { download: true } : { target: '_blank', rel: 'noopener noreferrer' })}
      >
        {children}
        {isDownload ? (
          <DownloadIcon className="h-3 w-3" />
        ) : (
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3"
          >
            <path
              d="M3.64645 11.3536C3.45118 11.1583 3.45118 10.8417 3.64645 10.6465L10.2929 4L6 4C5.72386 4 5.5 3.77614 5.5 3.5C5.5 3.22386 5.72386 3 6 3L11.5 3C11.6326 3 11.7598 3.05268 11.8536 3.14645C11.9473 3.24022 12 3.36739 12 3.5L12 9.00001C12 9.27615 11.7761 9.50001 11.5 9.50001C11.2239 9.50001 11 9.27615 11 9.00001V4.70711L4.35355 11.3536C4.15829 11.5488 3.84171 11.5488 3.64645 11.3536Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            ></path>
          </svg>
        )}
      </a>
    </Magnetic>
  );
}

// --- 메인 컴포넌트 ---

export default function Personal() {
  return (
    <motion.main
      className="space-y-24"
      variants={VARIANTS_CONTAINER}
      initial="hidden"
      animate="visible"
    >
      {/* --- 헤더 --- */}
      <header className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/" className="font-medium text-black dark:text-white">
            배용호 (Bae Yong-ho)
          </Link>
          <TextEffect
            as="p"
            preset="fade"
            per="char"
            className="text-zinc-600 dark:text-zinc-500"
            delay={0.5}
          >
            Backend & AR/VR Developer
          </TextEffect>
        </div>
      </header>

      {/* --- 자기소개 --- */}
      <motion.section
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
      >
        <div className="flex-1">
          <p className="text-zinc-600 dark:text-zinc-400">
            견고한 백엔드 인프라 위에서 사용자에게 새로운 가치를 주는
            인터랙티브 경험을 만드는 것을 목표로 합니다. 서버 구축 및 배포
            자동화부터 3D 모델링과 AR 앱 개발까지, 아이디어를 현실로 만드는
            풀스택 개발 역량을 갖추고 있습니다.
          </p>
        </div>
      </motion.section>

      {/* --- 프로젝트 --- */}
      <motion.section
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
      >
        <h3 className="mb-5 text-lg font-medium">Selected Projects</h3>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          {PROJECTS.map((project) => (
            <div key={project.name} className="flex flex-col space-y-3">
              <div className="relative rounded-2xl bg-zinc-50/40 p-1 ring-1 ring-zinc-200/50 ring-inset dark:bg-zinc-950/40 dark:ring-zinc-800/50">
                <ProjectVideo src={project.video} />
              </div>
              <div className="flex-1 space-y-2 px-1">
                 <div className="flex items-center justify-between">
                    <a
                      className="group relative inline-block font-[450] text-zinc-900 dark:text-zinc-50"
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {project.name}
                      <span className="absolute bottom-0.5 left-0 block h-[1px] w-full max-w-0 bg-zinc-900 transition-all duration-200 group-hover:max-w-full dark:bg-zinc-50"></span>
                    </a>
                    {project.architectureImg && (
                      <a
                        href={project.architectureImg}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-zinc-500 underline hover:text-zinc-700 dark:hover:text-zinc-300"
                      >
                        Architecture
                      </a>
                    )}
                  </div>
                <p className="text-base text-zinc-600 dark:text-zinc-400">
                  {project.description}
                </p>
                {project.details && (
                  <ul className="list-disc space-y-1 pl-4 text-sm text-zinc-600 dark:text-zinc-400">
                    {project.details.map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))}
                  </ul>
                )}
                <div className="!mt-3 flex flex-wrap gap-2">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* --- 업무 경험 --- */}
      <motion.section
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
      >
        <h3 className="mb-5 text-lg font-medium">Work Experience</h3>
        <div className="flex flex-col space-y-4">
          {WORK_EXPERIENCE.map((job) => (
            <a
              className="group relative overflow-hidden rounded-2xl bg-zinc-300/30 p-[1px] dark:bg-zinc-600/30"
              href={job.link}
              target="_blank"
              rel="noopener noreferrer"
              key={job.id}
            >
              <Spotlight
                className="from-zinc-900 via-zinc-800 to-zinc-700 blur-2xl dark:from-zinc-100 dark:via-zinc-200 dark:to-zinc-50"
                size={64}
              />
              <div className="relative h-full w-full rounded-[15px] bg-white p-4 dark:bg-zinc-950">
                <div className="relative flex w-full flex-col justify-between md:flex-row">
                  <div>
                    <h4 className="font-normal dark:text-zinc-100">
                      {job.title}
                    </h4>
                    <p className="text-zinc-500 dark:text-zinc-400">
                      {job.company}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 md:mt-0">
                    {job.start} - {job.end}
                  </p>
                </div>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
                  {job.achievements.map((achievement, index) => (
                    <li key={index}>{achievement}</li>
                  ))}
                </ul>
              </div>
            </a>
          ))}
        </div>
      </motion.section>

      {/* --- 기술 스택 --- */}
      <motion.section
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
      >
        <h3 className="mb-5 text-lg font-medium">Skills</h3>
        <div className="flex flex-col space-y-4">
          {Object.entries(SKILLS).map(([category, skills]) => (
            <div key={category}>
              <h4 className="mb-2 font-normal text-zinc-800 dark:text-zinc-200">
                {category}
              </h4>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <div
                    key={skill}
                    className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.section>
      
      {/* --- 학력 (신규) --- */}
      <motion.section
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
      >
        <h3 className="mb-5 text-lg font-medium">Education</h3>
        <div className="flex flex-col space-y-3">
          {EDUCATION.map((edu, index) => (
            <div key={index} className="rounded-lg bg-zinc-100 p-4 dark:bg-zinc-900">
              <h4 className="font-normal text-zinc-900 dark:text-zinc-100">{edu.school}</h4>
              <p className="text-zinc-600 dark:text-zinc-400">{edu.major}</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-500">{edu.period}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* --- 블로그 --- */}
      <motion.section
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
      >
        <h3 className="mb-3 text-lg font-medium">Blog</h3>
        <div className="flex flex-col space-y-0">
          <AnimatedBackground
            enableHover
            className="h-full w-full rounded-lg bg-zinc-100 dark:bg-zinc-900/80"
            transition={{
              type: 'spring',
              bounce: 0,
              duration: 0.2,
            }}
          >
            {BLOG_POSTS.map((post) => (
              <Link
                key={post.uid}
                className="-mx-3 rounded-xl px-3 py-3"
                href={post.link}
                data-id={post.uid}
              >
                <div className="flex flex-col space-y-1">
                  <h4 className="font-normal dark:text-zinc-100">
                    {post.title}
                  </h4>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    {post.description}
                  </p>
                </div>
              </Link>
            ))}
          </AnimatedBackground>
        </div>
      </motion.section>

      {/* --- 연락처 --- */}
      <motion.section
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
      >
        <h3 className="mb-5 text-lg font-medium">Connect</h3>
        <p className="mb-5 text-zinc-600 dark:text-zinc-400">
          Feel free to contact me at{' '}
          <a
            className="underline dark:text-zinc-300"
            href={`mailto:${EMAIL}`}
          >
            {EMAIL}
          </a>
        </p>
        <div className="flex flex-wrap items-center justify-start gap-3">
          {SOCIAL_LINKS.map((link) => (
            <MagneticSocialLink key={link.label} link={link.link}>
              {link.label}
            </MagneticSocialLink>
          ))}
          <MagneticSocialLink link={RESUME_LINK} isDownload>
            Resume
          </MagneticSocialLink>
        </div>
      </motion.section>
    </motion.main>
  );
}