"use client";

import { PokemonTypeName } from "@/types/pokemon/domain";
import { ALL_TYPES, calcTeamWeaknesses } from "@/lib/battle/typeChart";

const TYPE_KO: Record<PokemonTypeName, string> = {
  normal: "노말", fire: "불꽃", water: "물", electric: "전기",
  grass: "풀", ice: "얼음", fighting: "격투", poison: "독",
  ground: "땅", flying: "비행", psychic: "에스퍼", bug: "벌레",
  rock: "바위", ghost: "고스트", dragon: "드래곤", dark: "악",
  steel: "강철", fairy: "페어리",
};

const TYPE_COLORS: Record<PokemonTypeName, string> = {
  normal: "bg-[#A8A878]", fire: "bg-[#F08030]", water: "bg-[#6890F0]",
  electric: "bg-[#F8D030]", grass: "bg-[#78C850]", ice: "bg-[#98D8D8]",
  fighting: "bg-[#C03028]", poison: "bg-[#A040A0]", ground: "bg-[#E0C068]",
  flying: "bg-[#A890F0]", psychic: "bg-[#F85888]", bug: "bg-[#A8B820]",
  rock: "bg-[#B8A038]", ghost: "bg-[#705898]", dragon: "bg-[#7038F8]",
  dark: "bg-[#705848]", steel: "bg-[#B8B8D0]", fairy: "bg-[#EE99AC]",
};

export default function TypeCoverage({ teamTypes }: { teamTypes: PokemonTypeName[][] }) {
  const weaknesses = calcTeamWeaknesses(teamTypes);

  // 0인 타입은 표시 안 함
  const nonZero = ALL_TYPES.filter((t) => (weaknesses[t] ?? 0) > 0)
    .sort((a, b) => (weaknesses[b] ?? 0) - (weaknesses[a] ?? 0));

  if (!nonZero.length) {
    return (
      <div className="rounded-2xl bg-neutral-200 bg-opacity-50 p-5 dark:bg-neutral-700 dark:bg-opacity-50">
        <h2 className="text-lg font-bold">타입 상성</h2>
        <p className="mt-2 text-sm text-neutral-500">약점 없음</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-neutral-200 bg-opacity-50 p-5 dark:bg-neutral-700 dark:bg-opacity-50">
      <h2 className="mb-3 text-lg font-bold">팀 약점 분석</h2>
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
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-white ${TYPE_COLORS[type]} ${danger}`}
            >
              <span>{TYPE_KO[type]}</span>
              <span className="rounded-full bg-black bg-opacity-20 px-1.5">
                {count}
              </span>
            </div>
          );
        })}
      </div>
      {nonZero.some((t) => (weaknesses[t] ?? 0) >= 3) && (
        <p className="mt-3 text-xs text-red-500">
          ⚠ 3마리 이상 약점인 타입이 있습니다.
        </p>
      )}
    </div>
  );
}
