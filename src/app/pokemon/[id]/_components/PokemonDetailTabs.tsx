"use client";

import { useEffect, useId, useRef, useState } from "react";
import { PokemonBattleData } from "@/types/pokemon/battle";
import { PokemonMove } from "@/types/pokemon/domain";
import MoveList from "./MoveList";
import BattleTab from "./BattleTab";

type Tab = "info" | "moves" | "battle";
const TAB_KEYS: Tab[] = ["info", "moves", "battle"];

interface Props {
  infoContent: React.ReactNode;
  levelUpMoves: PokemonMove[];
  tmMoves: PokemonMove[];
  battleData: PokemonBattleData;
  pokemonName: string;
}

export default function PokemonDetailTabs({
  infoContent,
  levelUpMoves,
  tmMoves,
  battleData,
  pokemonName,
}: Props) {
  const [tab, setTab] = useState<Tab>("info");
  const baseId = useId();
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({
    info: null,
    moves: null,
    battle: null,
  });

  const tabs: { key: Tab; label: string }[] = [
    { key: "info", label: "도감 정보" },
    { key: "moves", label: "기술" },
    { key: "battle", label: "실전 데이터" },
  ];

  // No Suspense boundary wraps this page for useSearchParams, so read the
  // initial tab from the URL directly on mount; first paint keeps the
  // server-rendered "info" default.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get("tab");
    if (initial && (TAB_KEYS as string[]).includes(initial)) {
      setTab(initial as Tab);
    }
    // mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectTab = (next: Tab) => {
    setTab(next);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", next);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
    tabRefs.current[next]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;
    if (e.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
    else if (e.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") nextIndex = 0;
    else if (e.key === "End") nextIndex = tabs.length - 1;
    if (nextIndex !== null) {
      e.preventDefault();
      selectTab(tabs[nextIndex].key);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div role="tablist" aria-label="포켓몬 상세 정보" className="flex flex-row gap-2">
        {tabs.map((t, i) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              ref={(el) => {
                tabRefs.current[t.key] = el;
              }}
              id={`${baseId}-tab-${t.key}`}
              role="tab"
              type="button"
              aria-selected={active}
              aria-controls={`${baseId}-panel-${t.key}`}
              tabIndex={active ? 0 : -1}
              onClick={() => selectTab(t.key)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className={`rounded-none border-2 border-text-base px-4 py-1.5 text-sm font-semibold transition-colors ${
                active
                  ? "bg-primary text-on-primary"
                  : "bg-surface text-text-base hover:border-primary hover:text-primary"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div
        id={`${baseId}-panel-info`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-info`}
        hidden={tab !== "info"}
        className={tab === "info" ? "flex flex-col gap-4" : undefined}
      >
        {infoContent}
      </div>

      <div
        id={`${baseId}-panel-moves`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-moves`}
        hidden={tab !== "moves"}
      >
        {tab === "moves" && <MoveList levelUpMoves={levelUpMoves} tmMoves={tmMoves} />}
      </div>

      <div
        id={`${baseId}-panel-battle`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-battle`}
        hidden={tab !== "battle"}
      >
        {tab === "battle" && <BattleTab data={battleData} pokemonName={pokemonName} />}
      </div>
    </div>
  );
}
