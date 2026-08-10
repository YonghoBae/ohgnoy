"use client";

import { useState } from "react";
import { PokemonMove } from "@/types/pokemon/domain";
import TypeBadge from "@/app/_components/TypeBadge";
import PixelCard from "@/app/_components/ui/pixel/PixelCard";

const CATEGORY_BADGE: Record<PokemonMove["category"], string> = {
  physical: "bg-orange-200 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  special: "bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  status: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
};

function MoveRow({ move, showLevel }: { move: PokemonMove; showLevel: boolean }) {
  return (
    <tr className="border-b border-neutral-200 text-sm dark:border-neutral-700">
      {showLevel && (
        <td className="py-2 text-center font-semibold text-neutral-500">
          {move.levelLearnedAt ?? "-"}
        </td>
      )}
      <td className="py-2 font-semibold">
        {move.nameKo || move.nameEn}
      </td>
      <td className="py-2">
        <TypeBadge type={move.type} size="sm" />
      </td>
      <td className="py-2">
        <span className={`rounded px-2 py-0.5 text-xs font-medium ${CATEGORY_BADGE[move.category]}`}>
          {move.category === "physical" ? "물리" : move.category === "special" ? "특수" : "변화"}
        </span>
      </td>
      <td className="py-2 text-center">{move.power ?? "-"}</td>
      <td className="py-2 text-center">{move.accuracy != null ? `${move.accuracy}%` : "-"}</td>
      <td className="py-2 text-center">{move.pp ?? "-"}</td>
    </tr>
  );
}

type Tab = "level-up" | "tm";

export default function MoveList({
  levelUpMoves,
  tmMoves,
}: {
  levelUpMoves: PokemonMove[];
  tmMoves: PokemonMove[];
}) {
  const [tab, setTab] = useState<Tab>("level-up");
  const moves = tab === "level-up" ? levelUpMoves : tmMoves;

  return (
    <PixelCard className="flex flex-col gap-3 p-5">
      <h2 className="font-pixel text-xs">기술</h2>
      <div className="flex flex-row gap-2">
        {(["level-up", "tm"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-none border-2 border-text-base px-4 py-1 text-sm font-semibold transition-colors ${
              tab === t
                ? "bg-primary text-white"
                : "bg-surface text-text-base hover:border-primary hover:text-primary"
            }`}
          >
            {t === "level-up" ? "레벨업" : "기술머신"}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-neutral-300 text-xs text-neutral-500 dark:border-neutral-600">
              {tab === "level-up" && <th className="pb-1 text-center">레벨</th>}
              <th className="pb-1">기술명</th>
              <th className="pb-1">타입</th>
              <th className="pb-1">분류</th>
              <th className="pb-1 text-center">위력</th>
              <th className="pb-1 text-center">명중</th>
              <th className="pb-1 text-center">PP</th>
            </tr>
          </thead>
          <tbody>
            {moves.map((move) => (
              <MoveRow key={move.id} move={move} showLevel={tab === "level-up"} />
            ))}
          </tbody>
        </table>
        {moves.length === 0 && (
          <p className="mt-4 text-center text-sm text-neutral-500">기술 정보 없음</p>
        )}
      </div>
    </PixelCard>
  );
}
