"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";
import {
  FaGithub,
  FaExternalLinkAlt,
  FaGamepad,
  FaBook,
  FaBlog,
  FaBriefcase,
  FaComments,
  FaRegUser,
} from "react-icons/fa";
import type { IconType } from "react-icons";
import { MdEmail } from "react-icons/md";
import { DIGITAL_GARDEN_URL, GITHUB_URL, EMAIL, BLOG_NAME } from "@/lib/constants";
import PixelIconBox from "@/app/_components/ui/pixel/PixelIconBox";
import { ThemeSwitcher } from "@/app/_components/theme-switcher";
import EncounterLink from "@/app/_components/EncounterLink";
import BootScreen from "@/app/_components/BootScreen";
import styles from "./site-shell.module.css";

const SIDEBAR_SPRITE_URL = "/pokemon/pikachu.png";

type NavItem = {
  href: string;
  label: string;
  icon: IconType;
  external?: boolean;
  matchPrefix?: string;
  subLinks?: { href: string; label: string }[];
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/pokemon/list",
    label: "포켓몬 도구",
    icon: FaGamepad,
    matchPrefix: "/pokemon",
    subLinks: [
      { href: "/pokemon/list", label: "List" },
      { href: "/pokemon/meta", label: "Meta" },
      { href: "/pokemon/builder", label: "Builder" },
    ],
  },
  { href: "/studys/list", label: "학습 노트", icon: FaBook, matchPrefix: "/studys" },
  { href: DIGITAL_GARDEN_URL, label: "블로그", icon: FaBlog, external: true },
  { href: "/portfolio", label: "포트폴리오", icon: FaBriefcase, matchPrefix: "/portfolio" },
  { href: "/chat/user", label: "채팅", icon: FaComments, matchPrefix: "/chat" },
];

export default function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // Only matters at <=640px; CSS keeps the panel always shown on wider screens.
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <div className={`${styles.pageBg} site-shell-pagebg`}>
      <BootScreen />
      <div className={`${styles.shellGrid} site-shell-grid`}>
        <aside
          className={`${styles.sidebar} site-shell-sidebar`}
          onKeyDown={(e) => {
            if (menuOpen && e.key === "Escape") {
              setMenuOpen(false);
              toggleRef.current?.focus();
            }
          }}
        >
          <div className={styles.topBar}>
            <Link href="/" className={styles.logoRow}>
              <Image
                src="/frames/pokeball.png"
                alt=""
                width={18}
                height={18}
                className={styles.logoIcon}
              />
              <span className={styles.logo} translate="no">{BLOG_NAME.toUpperCase()}</span>
            </Link>
            <button
              ref={toggleRef}
              type="button"
              className={styles.menuToggle}
              aria-expanded={menuOpen}
              aria-controls="site-nav-panel"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span aria-hidden="true">{menuOpen ? "✕" : "☰"}</span>
              {menuOpen ? "닫기" : "메뉴"}
            </button>
          </div>

          <div
            id="site-nav-panel"
            className={`${styles.navPanel} ${menuOpen ? styles.navPanelOpen : ""}`}
          >
            {/* Other links close the panel via the route change; the current
                page's own link doesn't change the route, so close it here. */}
            <nav
              className={styles.nav}
              aria-label="주요 메뉴"
              onClick={(e) => {
                const link = (e.target as HTMLElement).closest("a");
                if (link && link.pathname === pathname) setMenuOpen(false);
              }}
            >
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = item.matchPrefix ? pathname.startsWith(item.matchPrefix) : false;
                const inner = (
                  <>
                    <span className={styles.navCursor} aria-hidden="true">▶</span>
                    <Icon size={14} aria-hidden="true" />
                    {item.label}
                    {item.external && <span className="sr-only"> (새 탭)</span>}
                  </>
                );

                if (item.external) {
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.navItem}
                    >
                      {inner}
                    </a>
                  );
                }

                const isExactHref = pathname === item.href;
                const parentAriaCurrent = active ? (isExactHref ? "page" : "true") : undefined;

                return (
                  <div key={item.href}>
                    <EncounterLink
                      href={item.href}
                      className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
                      aria-current={parentAriaCurrent}
                    >
                      {inner}
                    </EncounterLink>
                    {item.subLinks && active && (
                      <div className={styles.subNav}>
                        {item.subLinks.map((sub) => (
                          <EncounterLink
                            key={sub.href}
                            href={sub.href}
                            className={`${styles.subNavItem} ${
                              pathname === sub.href ? styles.subNavItemActive : ""
                            }`}
                            aria-current={pathname === sub.href ? "page" : undefined}
                          >
                            {sub.label}
                          </EncounterLink>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            <div className={styles.iconRow}>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub (새 탭)"
                className="group"
              >
                <PixelIconBox className="group-focus-visible:bg-[var(--px-active)] group-focus-visible:text-[var(--px-text)]">
                  <FaGithub size={16} aria-hidden="true" />
                </PixelIconBox>
              </a>
              <a
                href={DIGITAL_GARDEN_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="디지털가든 (새 탭)"
                className="group"
              >
                <PixelIconBox className="group-focus-visible:bg-[var(--px-active)] group-focus-visible:text-[var(--px-text)]">
                  <FaExternalLinkAlt size={14} aria-hidden="true" />
                </PixelIconBox>
              </a>
              <a href={`mailto:${EMAIL}`} aria-label="이메일" className="group">
                <PixelIconBox className="group-focus-visible:bg-[var(--px-active)] group-focus-visible:text-[var(--px-text)]">
                  <MdEmail size={16} aria-hidden="true" />
                </PixelIconBox>
              </a>
              <Link href="/auth/login" aria-label="로그인" className="group">
                <PixelIconBox className="group-focus-visible:bg-[var(--px-active)] group-focus-visible:text-[var(--px-text)]">
                  <FaRegUser size={14} aria-hidden="true" />
                </PixelIconBox>
              </Link>
              <ThemeSwitcher />
            </div>
          </div>

          <div className={styles.sidebarSprite}>
            <div className={styles.spriteFrame}>
              <Image src={SIDEBAR_SPRITE_URL} alt="피카츄" width={72} height={72} />
            </div>
            <span className={styles.spriteCaption}>PARTNER</span>
          </div>
        </aside>

        <main id="main" tabIndex={-1} className={`${styles.main} site-shell-main`}>{children}</main>
      </div>
    </div>
  );
}
