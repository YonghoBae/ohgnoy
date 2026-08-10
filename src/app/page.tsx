import Link from "next/link";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { DIGITAL_GARDEN_URL, GITHUB_URL, EMAIL } from "@/lib/constants";
import styles from "@/app/_components/pokedex-home.module.css";

const TILE_ACCENTS = ["var(--blue-primary)", "var(--cyan)", "var(--purple)", "var(--success)"];

const sections = [
  {
    title: "포켓몬 도구",
    description: "포켓몬 도감, 메타 분석, 팀 빌더",
    href: "/pokemon/list",
    external: false,
  },
  {
    title: "학습 노트",
    description: "개발하며 공부한 내용들",
    href: "/studys/list",
    external: false,
  },
  {
    title: "블로그",
    description: "Obsidian으로 작성하는 디지털가든",
    href: DIGITAL_GARDEN_URL,
    external: true,
  },
  {
    title: "포트폴리오",
    description: "만들어온 것들과 기술 스택",
    href: "/portfolio",
    external: false,
  },
];

export default function Home() {
  return (
    <div id="home-shell-root" className={styles.shell}>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/gh/neodgm/neodgm-webfont@1.601/neodgm/style.css"
      />

      <aside className={styles.sidebar}>
        <span className={styles.logo}>POKEDEX</span>
        <nav className={styles.nav} aria-label="주요 메뉴">
          {sections.map((section) =>
            section.external ? (
              <a
                key={section.href}
                href={section.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.navItem}
              >
                <span className={styles.navCursor}>▶</span>
                {section.title}
              </a>
            ) : (
              <Link key={section.href} href={section.href} className={styles.navItem}>
                <span className={styles.navCursor}>▶</span>
                {section.title}
              </Link>
            ),
          )}
        </nav>
      </aside>

      <main className={styles.main}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>TRAINER DATA</div>
          <div className={styles.panelBody}>
            <div className={styles.identityRow}>
              <div className={styles.avatarBox}>OG</div>
              <div>
                <p className={styles.identityNumber}>No. 0001</p>
                <h1 className={styles.identityName}>OHGNOY</h1>
                <p className={styles.identityTagline}>개발하며 기록하는 공간</p>
              </div>
            </div>
            <div className={styles.iconRow}>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className={styles.iconBox}
              >
                <FaGithub size={16} />
              </a>
              <a
                href={DIGITAL_GARDEN_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="디지털가든"
                className={styles.iconBox}
              >
                <FaExternalLinkAlt size={14} />
              </a>
              <a href={`mailto:${EMAIL}`} aria-label="이메일" className={styles.iconBox}>
                <MdEmail size={16} />
              </a>
            </div>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>MAIN MENU</div>
          <div className={styles.menuGrid}>
            {sections.map((section, index) => {
              const tileStyle = { "--tile-accent": TILE_ACCENTS[index % TILE_ACCENTS.length] } as React.CSSProperties;
              const inner = (
                <>
                  <span className={styles.menuTileIndex}>{String(index + 1).padStart(2, "0")}</span>
                  <span className={styles.menuTileTitle}>{section.title}</span>
                  <span className={styles.menuTileDesc}>{section.description}</span>
                  <span className={styles.menuTileArrow}>▸</span>
                </>
              );

              return section.external ? (
                <a
                  key={section.href}
                  href={section.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.menuTile}
                  style={tileStyle}
                >
                  {inner}
                </a>
              ) : (
                <Link key={section.href} href={section.href} className={styles.menuTile} style={tileStyle}>
                  {inner}
                </Link>
              );
            })}
          </div>
        </section>

        <div className={styles.dialog}>
          <span>Ohgnoy의 기록 공간에 오신 것을 환영합니다</span>
          <span className={styles.dialogCursor}>▼</span>
        </div>
      </main>
    </div>
  );
}
