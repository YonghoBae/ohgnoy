"use client";

import { useState, useEffect } from "react";
import { PokemonBattleData, BattleSet } from "@/types/pokemon/battle";
import { FORMATS } from "@/lib/battle/constants";
import TypeBadge from "@/app/_components/TypeBadge";
import { PokemonTypeName } from "@/types/pokemon/domain";

// EV 스프레드 파싱: "Jolly:252/4/0/0/0/252" → 표시용 문자열
function parseSpread(spread: string): { nature: string; evs: string } {
  const [nature, evStr] = spread.split(":");
  if (!evStr) return { nature: spread, evs: "" };
  const [hp, atk, def, spa, spd, spe] = evStr.split("/").map(Number);
  const parts: string[] = [];
  if (hp)  parts.push(`HP ${hp}`);
  if (atk) parts.push(`공격 ${atk}`);
  if (def) parts.push(`방어 ${def}`);
  if (spa) parts.push(`특공 ${spa}`);
  if (spd) parts.push(`특방 ${spd}`);
  if (spe) parts.push(`스피드 ${spe}`);
  return { nature: nature ?? "", evs: parts.join(" / ") || "노력치 없음" };
}

function TopList({
  data,
  label,
}: {
  data: Record<string, number>;
  label: string;
}) {
  const sorted = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (!sorted.length) return null;

  return (
    <div>
      <h4 className="mb-2 text-sm font-bold text-neutral-600 dark:text-neutral-300">
        {label}
      </h4>
      <div className="flex flex-col gap-1">
        {sorted.map(([name, pct]) => (
          <div key={name} className="flex items-center gap-2">
            <div className="flex-1 overflow-hidden rounded-full bg-neutral-300 dark:bg-neutral-600">
              <div
                className="h-2 rounded-full bg-blue-500"
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
            <span className="w-32 truncate text-xs text-neutral-700 dark:text-neutral-300">
              {name}
            </span>
            <span className="w-12 text-right text-xs font-semibold">
              {pct.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SetCard({ set }: { set: BattleSet }) {
  const itemDisplay = Array.isArray(set.item)
    ? set.item.slice(0, 2).join(" / ")
    : set.item;

  const abilityDisplay = set.ability
    ? Array.isArray(set.ability)
      ? set.ability[0]
      : set.ability
    : null;

  const topSpread = set.evs
    ? Object.entries(set.evs)
        .filter(([, v]) => v && v > 0)
        .map(([k, v]) => {
          const label: Record<string, string> = {
            hp: "HP", atk: "공격", def: "방어",
            spa: "특공", spd: "특방", spe: "스피드",
          };
          return `${label[k] ?? k} ${v}`;
        })
        .join(" / ")
    : null;

  return (
    <div className="rounded-xl bg-neutral-100 p-4 dark:bg-neutral-800">
      <p className="mb-3 text-sm font-bold text-blue-600 dark:text-blue-400">
        {set.name}
      </p>
      <div className="flex flex-col gap-2 text-sm">
        <div>
          <span className="text-xs text-neutral-500">기술</span>
          <div className="mt-1 flex flex-wrap gap-1">
            {set.moves.map((m, i) => (
              <span
                key={i}
                className="rounded-full bg-neutral-200 px-2 py-0.5 text-xs dark:bg-neutral-700"
              >
                {Array.isArray(m) ? m.join(" / ") : m}
              </span>
            ))}
          </div>
        </div>
        {itemDisplay && (
          <div className="flex gap-2">
            <span className="text-xs text-neutral-500">아이템</span>
            <span className="text-xs font-semibold">{itemDisplay}</span>
          </div>
        )}
        {abilityDisplay && (
          <div className="flex gap-2">
            <span className="text-xs text-neutral-500">특성</span>
            <span className="text-xs font-semibold">{abilityDisplay}</span>
          </div>
        )}
        {set.nature && (
          <div className="flex gap-2">
            <span className="text-xs text-neutral-500">성격</span>
            <span className="text-xs font-semibold">{set.nature}</span>
          </div>
        )}
        {topSpread && (
          <div className="flex gap-2">
            <span className="text-xs text-neutral-500">노력치</span>
            <span className="text-xs font-semibold">{topSpread}</span>
          </div>
        )}
        {set.teratypes && set.teratypes.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">테라스탈</span>
            <div className="flex flex-wrap gap-1">
              {set.teratypes.slice(0, 3).map((t) => (
                <TypeBadge
                  key={t}
                  type={t.toLowerCase() as PokemonTypeName}
                  size="sm"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

type BattleInnerTab = "sets" | "usage" | "teammates" | "counters";

export default function BattleTab({ data, pokemonName }: { data: PokemonBattleData; pokemonName: string }) {
  const [tab, setTab] = useState<BattleInnerTab>("sets");
  const [format, setFormat] = useState(data.format);
  const [battleData, setBattleData] = useState<PokemonBattleData>(data);
  const [formatLoading, setFormatLoading] = useState(false);

  useEffect(() => {
    if (format === data.format) {
      setBattleData(data);
      return;
    }
    setFormatLoading(true);
    // 포켓몬 이름은 data.usage?.nameEn 또는 URL에서 추출
    const encodedName = encodeURIComponent(pokemonName);
    fetch(`/api/pokemon/battle?name=${encodedName}&format=${format}`)
      .then((r) => r.json() as Promise<PokemonBattleData>)
      .then(setBattleData)
      .catch(() => setBattleData({ ...data, format, usage: null, sets: [] }))
      .finally(() => setFormatLoading(false));
  }, [format, data]);

  const tabs: { key: BattleInnerTab; label: string }[] = [
    { key: "sets", label: "추천 세트" },
    { key: "usage", label: "사용 통계" },
    { key: "teammates", label: "같이 쓰는 포켓몬" },
    { key: "counters", label: "카운터" },
  ];

  const { usage, sets } = battleData;

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-neutral-200 bg-opacity-50 p-5 dark:bg-neutral-700 dark:bg-opacity-50">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">실전 데이터</h2>
          {usage && !formatLoading && (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              {format.toUpperCase()} {usage.usagePercent.toFixed(1)}%
            </span>
          )}
          {formatLoading && (
            <span className="text-xs text-neutral-500">로딩 중...</span>
          )}
        </div>
        {/* 포맷 선택 */}
        <div className="flex flex-wrap gap-1">
          {FORMATS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFormat(f.id)}
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${
                format === f.id
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {!usage && !sets.length ? (
        <p className="text-sm text-neutral-500">
          실전 데이터가 없습니다. (낮은 티어 또는 미사용 포켓몬)
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  tab === t.key
                    ? "bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900"
                    : "bg-neutral-300 text-neutral-600 hover:bg-neutral-400 dark:bg-neutral-600 dark:text-neutral-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "sets" && (
            <div className="flex flex-col gap-3">
              {sets.length > 0 ? (
                sets.map((set) => <SetCard key={set.name} set={set} />)
              ) : (
                <p className="text-sm text-neutral-500">추천 세트 정보 없음</p>
              )}
            </div>
          )}

          {tab === "usage" && usage && (
            <div className="flex flex-col gap-5">
              <TopList data={usage.moves} label="주요 기술" />
              <TopList data={usage.items} label="주요 아이템" />
              <TopList data={usage.abilities} label="주요 특성" />
              {usage.teraTypes && (
                <TopList data={usage.teraTypes} label="테라스탈 타입" />
              )}
              <div>
                <h4 className="mb-2 text-sm font-bold text-neutral-600 dark:text-neutral-300">
                  주요 EV 스프레드
                </h4>
                <div className="flex flex-col gap-1">
                  {Object.entries(usage.spreads)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([spread, pct]) => {
                      const { nature, evs } = parseSpread(spread);
                      return (
                        <div key={spread} className="text-xs">
                          <span className="font-semibold">{nature}</span>
                          <span className="ml-2 text-neutral-500">{evs}</span>
                          <span className="ml-2 font-semibold text-blue-600">
                            {pct.toFixed(1)}%
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {tab === "teammates" && usage && (
            <TopList data={usage.teammates} label="같이 자주 쓰는 포켓몬" />
          )}

          {tab === "counters" && usage && (
            <div>
              <h4 className="mb-2 text-sm font-bold text-neutral-600 dark:text-neutral-300">
                카운터 포켓몬
              </h4>
              <div className="flex flex-col gap-2">
                {Object.entries(usage.counters)
                  .sort((a, b) => b[1][0] - a[1][0])
                  .slice(0, 5)
                  .map(([name, [score]]) => (
                    <div key={name} className="flex items-center gap-2">
                      <div className="flex-1 overflow-hidden rounded-full bg-neutral-300 dark:bg-neutral-600">
                        <div
                          className="h-2 rounded-full bg-red-500"
                          style={{ width: `${Math.min((score / 100) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="w-32 truncate text-xs text-neutral-700 dark:text-neutral-300">
                        {name}
                      </span>
                      <span className="w-10 text-right text-xs font-semibold">
                        {score.toFixed(0)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
