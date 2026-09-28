"use client";

import Link from "next/link";
import { Pokemon } from "pokenode-ts";
import { FaXmark } from "react-icons/fa6";

import useCompare from "@/lib/pokemon/hooks/useCompare";
import PixelCard from "@/app/_components/ui/pixel/PixelCard";
import PixelButton from "@/app/_components/ui/pixel/PixelButton";
import PixelSprite from "@/app/_components/ui/pixel/PixelSprite";
import styles from "@/app/_components/ui/pixel/pixel-theme.module.css";
import { cn } from "@/lib/utils";

const ACTION_CLASS = cn(
  styles.pixelFrameSmall,
  "shrink-0 px-4 py-2 text-sm font-semibold",
);

export default function CompareTray({
  koNames,
}: {
  koNames: Record<number, string>;
}) {
  const { compare, toggleCompare } = useCompare();
  const selected = [compare.mon_1, compare.mon_2].filter(
    (p): p is Pokemon => p !== undefined,
  );
  const count = selected.length;
  const message =
    count === 0
      ? ""
      : count === 1
        ? "1/2 선택됨. 한 마리 더 고르세요."
        : `2/2 선택됨: ${selected.map((p) => koNames[p.id] ?? p.name).join(", ")}`;

  // Always mounted so the live region exists before its first change; it only
  // becomes a named landmark while something is selected.
  return (
    <section
      aria-label={count ? "비교 목록" : undefined}
      className="pointer-events-none fixed bottom-0 left-4 z-40 sm:left-[168px] min-[901px]:left-[204px]"
      style={{
        // Clears the chat toggle (1rem inset + 3rem button + 1rem gap).
        right: "calc(5rem + env(safe-area-inset-right))",
        paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))",
      }}
    >
      <p aria-live="polite" className="sr-only">
        {message}
      </p>
      {count > 0 && (
        <PixelCard className="pointer-events-auto mx-auto flex max-w-xl flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2">
          <ul className="flex min-w-0 flex-1 flex-wrap gap-2">
            {selected.map((pokemon) => {
              const name = koNames[pokemon.id] ?? pokemon.name;
              return (
                <li
                  key={pokemon.id}
                  className="flex min-w-0 items-center gap-1"
                >
                  <PixelSprite pokemon={pokemon} alt="" size={40} />
                  <span className="font-mono-pixel max-w-[7rem] truncate text-sm font-bold">
                    {name}
                  </span>
                  <PixelButton
                    variant="ghost"
                    aria-label={`${name} 비교에서 빼기`}
                    onClick={() => toggleCompare(pokemon)}
                    className="shrink-0 px-1.5 py-1"
                  >
                    <FaXmark aria-hidden className="h-3.5 w-3.5" />
                  </PixelButton>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="text-xs tabular-nums text-text-muted"
            >
              {count === 1 ? "한 마리 더 고르세요." : "2/2"}
            </span>
            {count === 2 ? (
              <Link
                href={`/pokemon/compare?a=${compare.mon_1!.id}&b=${compare.mon_2!.id}`}
                className={cn(
                  ACTION_CLASS,
                  "bg-primary text-on-primary hover:bg-primary-hover",
                )}
              >
                비교하기
              </Link>
            ) : (
              <span
                className={cn(
                  ACTION_CLASS,
                  styles.pixelPanelBg,
                  "cursor-not-allowed text-text-muted",
                )}
              >
                비교하기
              </span>
            )}
          </div>
        </PixelCard>
      )}
    </section>
  );
}
