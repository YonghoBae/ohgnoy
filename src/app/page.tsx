import Link from "next/link";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { DIGITAL_GARDEN_URL, GITHUB_URL, EMAIL } from "@/lib/constants";

const sections = [
  {
    title: "포켓몬 도구",
    description: "포켓몬 도감, 메타 분석, 팀 빌더",
    icon: "🎮",
    href: "/pokemon/list",
    external: false,
  },
  {
    title: "학습 노트",
    description: "개발하며 공부한 내용들",
    icon: "📝",
    href: "/studys/list",
    external: false,
  },
  {
    title: "블로그",
    description: "Obsidian으로 작성하는 디지털가든",
    icon: "📖",
    href: DIGITAL_GARDEN_URL,
    external: true,
  },
  {
    title: "포트폴리오",
    description: "만들어온 것들과 기술 스택",
    icon: "💼",
    href: "/portfolio",
    external: false,
  },
];

export default function Home() {
  return (
    <main className="py-16 space-y-16">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Ohgnoy.</h1>
        <p className="text-text-muted text-lg">개발하며 기록하는 공간</p>
        <div className="flex items-center gap-4 pt-1">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-text-muted hover:text-primary transition-colors duration-200"
          >
            <FaGithub size={22} />
          </a>
          <a
            href={DIGITAL_GARDEN_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="디지털가든"
            className="text-text-muted hover:text-primary transition-colors duration-200"
          >
            <FaExternalLinkAlt size={18} />
          </a>
          <a
            href={`mailto:${EMAIL}`}
            aria-label="이메일"
            className="text-text-muted hover:text-primary transition-colors duration-200"
          >
            <MdEmail size={22} />
          </a>
        </div>
      </section>

      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sections.map((section) => {
            const cardClass =
              "flex flex-col gap-2 rounded-2xl bg-surface-2/60 px-6 py-5 shadow-md backdrop-blur-sm border border-transparent hover:border-primary/40 hover:bg-surface-2/80 transition-all duration-200 dark:shadow-none dark:border-border dark:hover:border-primary/60";

            const inner = (
              <>
                <span className="text-2xl">{section.icon}</span>
                <h2 className="text-base font-bold">{section.title}</h2>
                <p className="text-sm text-text-muted">{section.description}</p>
              </>
            );

            return section.external ? (
              <a
                key={section.href}
                href={section.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cardClass}
              >
                {inner}
              </a>
            ) : (
              <Link key={section.href} href={section.href} className={cardClass}>
                {inner}
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
