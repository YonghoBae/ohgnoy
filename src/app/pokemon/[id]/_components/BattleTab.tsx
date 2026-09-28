"use client";

import { useState, useEffect, useId, useRef } from "react";
import {
  PokemonBattleData,
  BattleSet,
  LabelKind,
  labelOf,
} from "@/types/pokemon/battle";
import { FORMATS } from "@/lib/battle/constants";
import { ALL_TYPES } from "@/lib/battle/typeChart";
import TypeBadge from "@/app/_components/TypeBadge";
import { PokemonTypeName } from "@/types/pokemon/domain";
import PixelCard from "@/app/_components/ui/pixel/PixelCard";

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

type Labels = PokemonBattleData["labels"];

// 18타입은 배지로, 그 밖(스텔라 등)은 한국어 글자로.
function TeraType({ type, labels }: { type: string; labels: Labels }) {
  const t = type.toLowerCase() as PokemonTypeName;
  return ALL_TYPES.includes(t) ? (
    <TypeBadge type={t} size="sm" />
  ) : (
    <span className="text-xs font-semibold">{labelOf(labels, "types", type)}</span>
  );
}

function TopList({
  data,
  label,
  kind,
  labels,
}: {
  data: Record<string, number>;
  label: string;
  kind: LabelKind;
  labels: Labels;
}) {
  const sorted = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (!sorted.length) return null;

  return (
    <div>
      <h3 className="mb-2 text-sm font-bold text-neutral-600 dark:text-neutral-300">
        {label}
      </h3>
      <div className="flex flex-col gap-1">
        {sorted.map(([name, pct]) => (
          <div key={name} className="flex items-center gap-2">
            <div className="flex-1 overflow-hidden rounded-none bg-neutral-300 dark:bg-neutral-600">
              <div
                className="h-2 rounded-none bg-blue-500"
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
            <span className="w-32 truncate text-xs text-neutral-700 dark:text-neutral-300">
              {kind === "types" ? (
                <TeraType type={name} labels={labels} />
              ) : (
                labelOf(labels, kind, name)
              )}
            </span>
            <span className="w-12 text-right text-xs font-semibold tabular-nums">
              {pct.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SetCard({ set, labels }: { set: BattleSet; labels: Labels }) {
  const itemDisplay = [set.item]
    .flat()
    .slice(0, 2)
    .map((i) => labelOf(labels, "items", i))
    .join(" / ");

  const ability = [set.ability ?? []].flat()[0];
  const abilityDisplay = ability ? labelOf(labels, "abilities", ability) : null;

  const natureDisplay = set.nature
    ?.split(" / ")
    .map((n) => labelOf(labels, "natures", n))
    .join(" / ");

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
    <PixelCard className="p-4">
      <p translate="no" className="mb-3 text-sm font-bold text-blue-600 dark:text-blue-400">
        {set.name}
      </p>
      <div className="flex flex-col gap-2 text-sm">
        <div>
          <span className="text-xs text-neutral-500">기술</span>
          <div className="mt-1 flex flex-wrap gap-1">
            {set.moves.map((m, i) => (
              <span
                key={i}
                className="rounded-none border border-text-base bg-surface px-2 py-0.5 text-xs"
              >
                {[m].flat().map((x) => labelOf(labels, "moves", x)).join(" / ")}
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
        {natureDisplay && (
          <div className="flex gap-2">
            <span className="text-xs text-neutral-500">성격</span>
            <span className="text-xs font-semibold">{natureDisplay}</span>
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
                <TeraType key={t} type={t} labels={labels} />
              ))}
            </div>
          </div>
        )}
      </div>
    </PixelCard>
  );
}

type BattleInnerTab = "sets" | "usage" | "teammates" | "counters";

const NO_USAGE_MESSAGE = "이 포맷의 사용률 데이터가 없습니다.";

export default function BattleTab({ data, pokemonName }: { data: PokemonBattleData; pokemonName: string }) {
  const [tab, setTab] = useState<BattleInnerTab>("sets");
  const [format, setFormat] = useState(data.format);
  const [battleData, setBattleData] = useState<PokemonBattleData>(data);
  const [formatLoading, setFormatLoading] = useState(false);
  const baseId = useId();
  const tabRefs = useRef<Record<BattleInnerTab, HTMLButtonElement | null>>({
    sets: null,
    usage: null,
    teammates: null,
    counters: null,
  });

  useEffect(() => {
    if (format === data.format) {
      setBattleData(data);
      setFormatLoading(false);
      return;
    }
    const controller = new AbortController();
    setFormatLoading(true);
    // 포켓몬 이름은 data.usage?.nameEn 또는 URL에서 추출
    const encodedName = encodeURIComponent(pokemonName);
    fetch(`/api/pokemon/battle?name=${encodedName}&format=${format}`, {
      signal: controller.signal,
    })
      .then((r) => {
        if (!r.ok) throw new Error("bad response");
        return r.json() as Promise<PokemonBattleData>;
      })
      .then((json) => {
        setBattleData(json);
        setFormatLoading(false);
      })
      .catch(() => {
        // A newer request superseded this one; its own handler owns the state.
        if (controller.signal.aborted) return;
        setBattleData({ ...data, format, usage: null, sets: [] });
        setFormatLoading(false);
      });
    return () => controller.abort();
  }, [format, data, pokemonName]);

  const tabs: { key: BattleInnerTab; label: string }[] = [
    { key: "sets", label: "추천 세트" },
    { key: "usage", label: "사용 통계" },
    { key: "teammates", label: "같이 쓰는 포켓몬" },
    { key: "counters", label: "카운터" },
  ];

  const { usage, sets, labels } = battleData;
  const currentFormat = FORMATS.find((f) => f.id === format);
  const formatLabel = currentFormat?.label ?? format;

  const selectInnerTab = (next: BattleInnerTab) => {
    setTab(next);
    tabRefs.current[next]?.focus();
  };

  const handleInnerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;
    if (e.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
    else if (e.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") nextIndex = 0;
    else if (e.key === "End") nextIndex = tabs.length - 1;
    if (nextIndex !== null) {
      e.preventDefault();
      selectInnerTab(tabs[nextIndex].key);
    }
  };

  return (
    <PixelCard className="flex flex-col gap-4 p-5">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-pixel text-xs">실전 데이터</h2>
          <span role="status" className="text-xs">
            {formatLoading ? (
              <span className="text-neutral-500">불러오는 중…</span>
            ) : usage ? (
              <span className="rounded-none bg-blue-100 px-3 py-1 font-bold tabular-nums text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                {formatLabel} {usage.usagePercent.toFixed(1)}%
              </span>
            ) : null}
          </span>
        </div>
        {/* 포맷 선택 */}
        <div className="flex flex-wrap gap-1">
          {FORMATS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFormat(f.id)}
              aria-pressed={format === f.id}
              className={`rounded-none border-2 border-text-base px-2.5 py-0.5 text-xs font-semibold transition-colors ${
                format === f.id
                  ? "bg-primary text-on-primary"
                  : "bg-surface text-text-base hover:border-primary hover:text-primary"
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
          <div role="tablist" aria-label="실전 데이터 항목" className="flex flex-wrap gap-2">
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
                  onClick={() => selectInnerTab(t.key)}
                  onKeyDown={(e) => handleInnerKeyDown(e, i)}
                  className={`rounded-none border-2 border-text-base px-3 py-1 text-xs font-semibold transition-colors ${
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
            id={`${baseId}-panel-sets`}
            role="tabpanel"
            aria-labelledby={`${baseId}-tab-sets`}
            hidden={tab !== "sets"}
            className="flex flex-col gap-3"
          >
            {sets.length > 0 ? (
              sets.map((set) => <SetCard key={set.name} set={set} labels={labels} />)
            ) : (
              <p className="text-sm text-neutral-500">추천 세트 정보 없음</p>
            )}
          </div>

          <div
            id={`${baseId}-panel-usage`}
            role="tabpanel"
            aria-labelledby={`${baseId}-tab-usage`}
            hidden={tab !== "usage"}
            className="flex flex-col gap-5"
          >
            {usage ? (
              <>
                <TopList data={usage.moves} label="주요 기술" kind="moves" labels={labels} />
                <TopList data={usage.items} label="주요 아이템" kind="items" labels={labels} />
                <TopList data={usage.abilities} label="주요 특성" kind="abilities" labels={labels} />
                {usage.teraTypes && (
                  <TopList data={usage.teraTypes} label="테라스탈 타입" kind="types" labels={labels} />
                )}
                <div>
                  <h3 className="mb-2 text-sm font-bold text-neutral-600 dark:text-neutral-300">
                    주요 EV 스프레드
                  </h3>
                  <div className="flex flex-col gap-1">
                    {Object.entries(usage.spreads)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 3)
                      .map(([spread, pct]) => {
                        const { nature, evs } = parseSpread(spread);
                        return (
                          <div key={spread} className="text-xs">
                            <span className="font-semibold">
                              {labelOf(labels, "natures", nature)}
                            </span>
                            <span className="text-neutral-500"> · {evs}</span>
                            <span className="ml-2 font-semibold tabular-nums text-blue-600">
                              {pct.toFixed(1)}%
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-neutral-500">{NO_USAGE_MESSAGE}</p>
            )}
          </div>

          <div
            id={`${baseId}-panel-teammates`}
            role="tabpanel"
            aria-labelledby={`${baseId}-tab-teammates`}
            hidden={tab !== "teammates"}
          >
            {usage ? (
              <TopList
                data={usage.teammates}
                label="같이 자주 쓰는 포켓몬"
                kind="pokemon"
                labels={labels}
              />
            ) : (
              <p className="text-sm text-neutral-500">{NO_USAGE_MESSAGE}</p>
            )}
          </div>

          <div
            id={`${baseId}-panel-counters`}
            role="tabpanel"
            aria-labelledby={`${baseId}-tab-counters`}
            hidden={tab !== "counters"}
          >
            {usage ? (
              <div>
                <h3 className="mb-1 text-sm font-bold text-neutral-600 dark:text-neutral-300">
                  카운터 포켓몬
                </h3>
                <p className="mb-2 text-xs text-neutral-500">
                  상대 확률: 맞붙었을 때 이 포켓몬을 쓰러뜨리거나 교체하게 만든 비율
                </p>
                {Object.keys(usage.counters).length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {Object.entries(usage.counters)
                      // Smogon의 카운터 점수: p - 4d
                      .sort((a, b) => b[1].p - 4 * b[1].d - (a[1].p - 4 * a[1].d))
                      .slice(0, 5)
                      .map(([name, { p }]) => (
                        <div key={name} className="flex items-center gap-2">
                          <div className="flex-1 overflow-hidden rounded-none bg-neutral-300 dark:bg-neutral-600">
                            <div
                              className="h-2 rounded-none bg-red-500"
                              style={{ width: `${Math.min(p * 100, 100)}%` }}
                            />
                          </div>
                          <span className="w-32 truncate text-xs text-neutral-700 dark:text-neutral-300">
                            {labelOf(labels, "pokemon", name)}
                          </span>
                          <span className="w-12 text-right text-xs font-semibold tabular-nums">
                            {(p * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500">카운터 데이터가 없습니다.</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-neutral-500">{NO_USAGE_MESSAGE}</p>
            )}
          </div>
        </>
      )}
    </PixelCard>
  );
}
