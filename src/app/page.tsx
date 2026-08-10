import Link from "next/link";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { DIGITAL_GARDEN_URL, GITHUB_URL, EMAIL } from "@/lib/constants";
import PixelCard from "@/app/_components/ui/pixel/PixelCard";
import PixelIconBox from "@/app/_components/ui/pixel/PixelIconBox";

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
    </main>
  );
}
