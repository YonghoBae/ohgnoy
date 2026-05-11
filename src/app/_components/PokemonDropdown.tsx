"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const pokemonLinks = [
  { href: "/pokemon/list", label: "List" },
  { href: "/pokemon/meta", label: "Meta" },
  { href: "/pokemon/builder", label: "Builder" },
];

export default function PokemonDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);
  const pathname = usePathname();
  const isActive = pathname.startsWith("/pokemon");

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <li
      ref={ref}
      className="relative flex-shrink-0"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`flex items-center gap-1 text-sm whitespace-nowrap hover:text-primary transition-colors duration-200 ${
          isActive ? "text-primary" : ""
        }`}
      >
        Pokemon
        <svg
          className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full pt-2">
          <ul
            role="menu"
            className="w-28 rounded-xl border border-border bg-[#ECEFF4]/95 py-1 shadow-md backdrop-blur-sm dark:bg-[#2E3440]/95"
          >
            {pokemonLinks.map(({ href, label }) => (
              <li key={href} role="none">
                <Link
                  href={href}
                  role="menuitem"
                  className={`block px-4 py-2 text-sm transition-colors duration-200 hover:text-primary ${
                    pathname === href ? "font-semibold text-primary" : ""
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}
