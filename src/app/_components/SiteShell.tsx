"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
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

  return (
    <div className={`${styles.pageBg} site-shell-pagebg`}>
      <BootScreen />
      <div className={`${styles.shellGrid} site-shell-grid`}>
        <aside className={`${styles.sidebar} site-shell-sidebar`}>
          <Link href="/" className={styles.logoRow}>
            <Image
              src="/frames/pokeball.png"
              alt=""
              width={18}
              height={18}
              className={styles.logoIcon}
            />
            <span className={styles.logo}>{BLOG_NAME.toUpperCase()}</span>
          </Link>

          <nav className={styles.nav} aria-label="주요 메뉴">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = item.matchPrefix ? pathname.startsWith(item.matchPrefix) : false;
              const inner = (
                <>
                  <span className={styles.navCursor}>▶</span>
                  <Icon size={14} />
                  {item.label}
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

              return (
                <div key={item.href}>
                  <EncounterLink
                    href={item.href}
                    className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
                    aria-current={active ? "page" : undefined}
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
            <Link href="/auth/login" aria-label="로그인">
              <PixelIconBox>
                <FaRegUser size={14} />
              </PixelIconBox>
            </Link>
            <ThemeSwitcher />
          </div>

          <div className={styles.sidebarSprite}>
            <div className={styles.spriteFrame}>
              <Image src={SIDEBAR_SPRITE_URL} alt="피카츄" width={72} height={72} />
            </div>
            <span className={styles.spriteCaption}>PARTNER</span>
          </div>
        </aside>

        <main className={`${styles.main} site-shell-main`}>{children}</main>
      </div>
    </div>
  );
}
