"use client";

import { useState } from "react";
import { PokemonBattleData } from "@/types/pokemon/battle";
import { PokemonMove } from "@/types/pokemon/domain";
import MoveList from "./MoveList";
import BattleTab from "./BattleTab";

type Tab = "info" | "moves" | "battle";

interface Props {
  infoContent: React.ReactNode;
  levelUpMoves: PokemonMove[];
  tmMoves: PokemonMove[];
  battleData: PokemonBattleData;
}

export default function PokemonDetailTabs({
  infoContent,
  levelUpMoves,
  tmMoves,
  battleData,
}: Props) {
  const [tab, setTab] = useState<Tab>("info");

  const tabs: { key: Tab; label: string }[] = [
    { key: "info", label: "도감 정보" },
    { key: "moves", label: "기술" },
    { key: "battle", label: "실전 데이터" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              tab === t.key
                ? "bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-900"
                : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={tab === "info" ? "flex flex-col gap-4" : "hidden"}>
        {infoContent}
      </div>

      {tab === "moves" && (
        <MoveList levelUpMoves={levelUpMoves} tmMoves={tmMoves} />
      )}

      {tab === "battle" && <BattleTab data={battleData} />}
    </div>
  );
}
