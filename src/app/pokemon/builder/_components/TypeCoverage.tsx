"use client";

import { PokemonTypeName } from "@/types/pokemon/domain";
import { ALL_TYPES, calcTeamWeaknesses } from "@/lib/battle/typeChart";
import PixelCard from "@/app/_components/ui/pixel/PixelCard";
import TypeBadge from "@/app/_components/TypeBadge";

export default function TypeCoverage({ teamTypes }: { teamTypes: PokemonTypeName[][] }) {
  const weaknesses = calcTeamWeaknesses(teamTypes);

  // 0인 타입은 표시 안 함
  const nonZero = ALL_TYPES.filter((t) => (weaknesses[t] ?? 0) > 0)
    .sort((a, b) => (weaknesses[b] ?? 0) - (weaknesses[a] ?? 0));

  if (!nonZero.length) {
    return (
      <PixelCard className="p-5">
        <h2 className="font-pixel text-xs">타입 상성</h2>
        <p className="mt-2 text-sm text-neutral-500">약점 없음</p>
      </PixelCard>
    );
  }

  return (
    <PixelCard className="p-5">
      <h2 className="mb-3 font-pixel text-xs">타입 상성</h2>
      <p className="mb-4 text-xs text-neutral-500">
        각 공격 타입에 약한 포켓몬 수
      </p>
      <div className="flex flex-wrap gap-2">
        {nonZero.map((type) => {
          const count = weaknesses[type] ?? 0;
          const danger = count >= 3 ? "ring-2 ring-red-500" : count >= 2 ? "ring-2 ring-yellow-400" : "";
          return (
            <div
              key={type}
              className={`flex items-center gap-1 rounded-none p-0.5 ${danger}`}
            >
              <TypeBadge type={type} size="sm" />
              <span className="rounded-none bg-text-base px-1.5 text-xs font-bold text-surface">
                {count}
              </span>
            </div>
          );
        })}
      </div>
      {nonZero.some((t) => (weaknesses[t] ?? 0) >= 3) && (
        <p className="mt-3 text-xs text-red-500">
          <span aria-hidden>⚠</span> 3마리 이상 약점인 타입이 있습니다.
        </p>
      )}
    </PixelCard>
  );
}
