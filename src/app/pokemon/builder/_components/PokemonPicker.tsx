"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Pokemon } from "pokenode-ts";
import { BattleSet } from "@/types/pokemon/battle";
import { PokemonTypeName } from "@/types/pokemon/domain";
import { TeamMember } from "./TeamBuilder";
import TypeBadge from "@/app/_components/TypeBadge";
import { DEFAULT_FORMAT } from "@/lib/battle/constants";

interface Props {
  allNames: string[];
  onSelect: (member: TeamMember) => void;
  onClose: () => void;
}

interface SearchResult {
  pokemon: Pokemon;
  nameKo: string;
}

export default function PokemonPicker({ allNames, onSelect, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState<SearchResult | null>(null);
  const [sets, setSets] = useState<BattleSet[]>([]);
  const [setsLoading, setSetsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const matched = allNames
      .filter((n) => n.toLowerCase().startsWith(query.toLowerCase()))
      .slice(0, 8);

    if (!matched.length) {
      setResults([]);
      return;
    }

    setLoading(true);
    Promise.all(
      matched.map(async (name) => {
        const [pokeRes, speciesRes] = await Promise.all([
          fetch(`https://pokeapi.co/api/v2/pokemon/${name}`),
          fetch(`https://pokeapi.co/api/v2/pokemon-species/${name}`),
        ]);
        const pokemon = await pokeRes.json() as Pokemon;
        const species = await speciesRes.json() as { names: { language: { name: string }; name: string }[] };
        const ko = species.names.find((n) => n.language.name === "ko");
        return { pokemon, nameKo: ko?.name ?? name };
      })
    )
      .then(setResults)
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [query, allNames]);

  const handleSelectPokemon = async (result: SearchResult) => {
    setSelectedPokemon(result);
    setSetsLoading(true);
    try {
      const res = await fetch(`https://data.pkmn.cc/sets/${DEFAULT_FORMAT}.json`);
      if (res.ok) {
        const data = await res.json() as Record<string, Record<string, object>>;
        const key = Object.keys(data).find(
          (k) => k.toLowerCase() === result.pokemon.name.toLowerCase()
        );
        if (key && data[key]) {
          const setList: BattleSet[] = Object.entries(data[key]).map(([name, raw]) => {
            const s = raw as {
              moves?: (string | string[])[];
              item?: string | string[];
              ability?: string | string[];
              nature?: string;
              evs?: Record<string, number>;
              teratypes?: string[];
            };
            return {
              name,
              moves: s.moves ?? [],
              item: s.item ?? [],
              ability: s.ability,
              nature: s.nature,
              evs: s.evs as BattleSet["evs"],
              teratypes: s.teratypes,
            };
          });
          setSets(setList);
        } else {
          setSets([]);
        }
      }
    } catch {
      setSets([]);
    } finally {
      setSetsLoading(false);
    }
  };

  const handleConfirm = (set: BattleSet | null) => {
    if (!selectedPokemon) return;
    const { pokemon, nameKo } = selectedPokemon;
    onSelect({
      id: pokemon.id,
      nameEn: pokemon.name,
      nameKo,
      spriteUrl: pokemon.sprites.other?.["official-artwork"].front_default ?? "",
      types: pokemon.types.map((t) => t.type.name as PokemonTypeName),
      set,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="flex w-full max-w-md flex-col gap-4 rounded-2xl bg-white p-5 shadow-2xl dark:bg-neutral-800">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">포켓몬 선택</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700">✕</button>
        </div>

        {!selectedPokemon ? (
          <>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="영어 이름으로 검색 (예: garchomp)"
              className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm outline-none focus:border-blue-400 dark:border-neutral-600 dark:bg-neutral-700"
            />
            {loading && (
              <p className="text-center text-xs text-neutral-500">검색 중...</p>
            )}
            <div className="flex max-h-72 flex-col gap-1 overflow-y-auto">
              {results.map((r) => (
                <button
                  key={r.pokemon.id}
                  onClick={() => void handleSelectPokemon(r)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  <div className="relative h-10 w-10 flex-shrink-0">
                    <Image
                      src={r.pokemon.sprites.front_default ?? ""}
                      alt={r.pokemon.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">{r.nameKo}</span>
                    <span className="text-xs text-neutral-500">{r.pokemon.name}</span>
                  </div>
                  <div className="ml-auto flex gap-1">
                    {r.pokemon.types.map(({ type: { name } }) => (
                      <TypeBadge key={name} type={name as PokemonTypeName} size="sm" />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* 포켓몬 확인 */}
            <div className="flex items-center gap-3 rounded-xl bg-neutral-100 px-4 py-3 dark:bg-neutral-700">
              <div className="relative h-14 w-14">
                <Image
                  src={selectedPokemon.pokemon.sprites.other?.["official-artwork"].front_default ?? ""}
                  alt={selectedPokemon.nameKo}
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <p className="font-bold">{selectedPokemon.nameKo}</p>
                <div className="flex gap-1 mt-1">
                  {selectedPokemon.pokemon.types.map(({ type: { name } }) => (
                    <TypeBadge key={name} type={name as PokemonTypeName} size="sm" />
                  ))}
                </div>
              </div>
              <button
                onClick={() => { setSelectedPokemon(null); setSets([]); }}
                className="ml-auto text-xs text-neutral-400 hover:text-neutral-700"
              >
                다시 선택
              </button>
            </div>

            {/* 세트 선택 */}
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold">세트 선택 (선택 사항)</p>
              {setsLoading ? (
                <p className="text-xs text-neutral-500">세트 불러오는 중...</p>
              ) : sets.length === 0 ? (
                <p className="text-xs text-neutral-500">추천 세트 없음</p>
              ) : (
                <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
                  {sets.map((set) => (
                    <button
                      key={set.name}
                      onClick={() => handleConfirm(set)}
                      className="rounded-xl border border-neutral-200 px-4 py-2 text-left text-sm transition-colors hover:border-blue-400 hover:bg-blue-50 dark:border-neutral-600 dark:hover:bg-blue-900"
                    >
                      <p className="font-semibold text-blue-600 dark:text-blue-400">{set.name}</p>
                      <p className="text-xs text-neutral-500">
                        {set.moves.map((m) => (Array.isArray(m) ? m[0] : m)).join(" / ")}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => handleConfirm(null)}
              className="rounded-xl bg-neutral-800 py-2 text-sm font-semibold text-white hover:bg-neutral-700 dark:bg-neutral-200 dark:text-neutral-900"
            >
              세트 없이 추가
            </button>
          </>
        )}
      </div>
    </div>
  );
}
