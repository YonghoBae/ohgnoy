import { BLOG_NAME } from '@/lib/constants';
import Link from 'next/link';
import { ThemeSwitcher } from './theme-switcher';
import PokemonDropdown from './PokemonDropdown';
import { FaRegUser } from 'react-icons/fa';
import PixelIconBox from './ui/pixel/PixelIconBox';

const navLinks = [
  { href: '/studys/list', label: 'Study' },
  { href: '/portfolio', label: 'Portfolio' },
];

export function Intro() {
  return (
    <section className="flex items-center justify-between py-3">
      <Link
        href="/"
        className="font-pixel text-sm tracking-tight hover:opacity-70 transition-opacity whitespace-nowrap"
      >
        {BLOG_NAME}.
      </Link>
      <nav aria-label="주요 메뉴" className="flex items-center gap-3 min-w-0">
        <PokemonDropdown />
        <ul className="flex flex-nowrap overflow-x-auto gap-3 text-sm scrollbar-hide">
          {navLinks.map(({ href, label }) => (
            <li key={href} className="flex-shrink-0">
              <Link
                href={href}
                className="hover:text-primary transition-colors duration-200 whitespace-nowrap"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/auth/login" aria-label="로그인" className="flex-shrink-0">
          <PixelIconBox>
            <FaRegUser size={14} />
          </PixelIconBox>
        </Link>
        <ThemeSwitcher />
      </nav>
    </section>
  );
}
