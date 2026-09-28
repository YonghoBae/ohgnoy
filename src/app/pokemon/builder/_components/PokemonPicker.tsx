"use client";

import { useState, useEffect, useId, useRef } from "react";
import { Pokemon } from "pokenode-ts";
import {
  BattleSet,
  labelKey,
  labelOf,
  PokemonBattleData,
} from "@/types/pokemon/battle";
import { PokemonTypeName } from "@/types/pokemon/domain";
import { TeamMember } from "./TeamBuilder";
import TypeBadge from "@/app/_components/TypeBadge";
import { DEFAULT_FORMAT } from "@/lib/battle/constants";
import PixelCard from "@/app/_components/ui/pixel/PixelCard";
import PixelButton from "@/app/_components/ui/pixel/PixelButton";
import PixelSprite, { getPixelSpriteUrl } from "@/app/_components/ui/pixel/PixelSprite";
import ModalDialog from "./ModalDialog";

interface Props {
  allNames: string[];
  onSelect: (member: TeamMember) => void;
  onClose: () => void;
}

interface SearchResult {
  pokemon: Pokemon;
  nameKo: string;
}

const isKorean = (s: string) => /[가-힣]/.test(s);

export default function PokemonPicker({ allNames, onSelect, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState<SearchResult | null>(null);
  const [sets, setSets] = useState<BattleSet[]>([]);
  const [labels, setLabels] = useState<PokemonBattleData["labels"]>({});
  const [setsLoading, setSetsLoading] = useState(false);
  const [koIndex, setKoIndex] = useState<Record<string, string> | null>(null);
  const [koIndexLoading, setKoIndexLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // 한국어 입력 감지 시 인덱스 로드
  useEffect(() => {
    if (!isKorean(query) || koIndex !== null || koIndexLoading) return;
    setKoIndexLoading(true);
    fetch("/api/pokemon/ko-names")
      .then((r) => r.json() as Promise<Record<string, string>>)
      .then(setKoIndex)
      .catch(() => setKoIndex({}))
      .finally(() => setKoIndexLoading(false));
  }, [query, koIndex, koIndexLoading]);

  useEffect(() => {
    // Reset here too: the cleanup below cancels an in-flight search, and the
    // early returns would otherwise leave "검색 중" up.
    setLoading(false);
    if (!query.trim()) {
      setResults([]);
      return;
    }

    let matched: string[];

    if (isKorean(query)) {
      if (!koIndex) return; // 인덱스 로드 전
      const enNames = Object.entries(koIndex)
        .filter(([ko]) => ko.startsWith(query))
        .map(([, en]) => en);
      matched = enNames.slice(0, 8);
    } else {
      matched = allNames
        .filter((n) => n.toLowerCase().startsWith(query.toLowerCase()))
        .slice(0, 8);
    }

    if (!matched.length) {
      setResults([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    // Form slugs (pikachu-rock-star, charizard-mega-x) have no pokemon-species
    // entry of their own, so take the species URL from the pokemon, and keep
    // whatever loaded instead of dropping every result when one request fails.
    Promise.allSettled(
      matched.map(async (name) => {
        const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        if (!pokeRes.ok) throw new Error(`${name}: ${pokeRes.status}`);
        const pokemon = await pokeRes.json() as Pokemon;
        const speciesRes = await fetch(pokemon.species.url);
        const species = speciesRes.ok
          ? await speciesRes.json() as { names: { language: { name: string }; name: string }[] }
          : null;
        const ko = species?.names.find((n) => n.language.name === "ko");
        return { pokemon, nameKo: ko?.name ?? name };
      })
    )
      .then((settled) => {
        if (cancelled) return;
        setResults(settled.flatMap((r) => (r.status === "fulfilled" ? [r.value] : [])));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    // A slower response for an older query must not overwrite newer results.
    return () => {
      cancelled = true;
    };
  }, [query, allNames, koIndex]);

  const handleSelectPokemon = async (result: SearchResult) => {
    setSelectedPokemon(result);
    setSetsLoading(true);
    try {
      // 서버가 정규화한 영어 세트(내보내기용)와 한국어 labels(표시용)를 준다.
      const res = await fetch(
        `/api/pokemon/battle?name=${encodeURIComponent(result.pokemon.name)}&format=${DEFAULT_FORMAT}`
      );
      if (!res.ok) throw new Error(`battle ${res.status}`);
      const data = await res.json() as PokemonBattleData;
      setSets(data.sets);
      setLabels(data.labels);
    } catch {
      setSets([]);
      setLabels({});
    } finally {
      setSetsLoading(false);
    }
  };

  const handleConfirm = (set: BattleSet | null) => {
    if (!selectedPokemon) return;
    const { pokemon, nameKo } = selectedPokemon;
    // 슬롯에 보이는 기술/아이템 번역만 저장한다(localStorage).
    const shown = set
      ? [
          ...set.moves.map((m) => labelKey("moves", [m].flat()[0])),
          labelKey("items", [set.item].flat()[0] ?? ""),
        ]
      : [];
    onSelect({
      id: pokemon.id,
      nameEn: pokemon.name,
      nameKo,
      spriteUrl: getPixelSpriteUrl(pokemon),
      types: pokemon.types.map((t) => t.type.name as PokemonTypeName),
      set,
      labels: Object.fromEntries(
        shown.flatMap((k) => (labels[k] ? [[k, labels[k]]] : []))
      ),
    });
  };

  return (
    <ModalDialog labelledBy={titleId} onClose={onClose} className="max-w-md">
      <PixelCard className="flex w-full flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <h3 id={titleId} className="font-bold">포켓몬 선택</h3>
          <button type="button" onClick={onClose} aria-label="닫기" className="text-neutral-400 hover:text-neutral-700">✕</button>
        </div>

        {!selectedPokemon ? (
          <>
            <input
              ref={inputRef}
              type="search"
              aria-label="포켓몬 이름으로 검색"
              autoComplete="off"
              spellCheck={false}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="이름으로 검색 (예: 이상해씨, garchomp)"
              className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm focus:border-blue-400 dark:border-neutral-600 dark:bg-neutral-700"
            />
            <div aria-live="polite">
              {koIndexLoading && (
                <p className="text-center text-xs text-neutral-500">한국어 이름 인덱스 로딩 중…</p>
              )}
              {loading && (
                <p className="text-center text-xs text-neutral-500">검색 중…</p>
              )}
              {!loading && !koIndexLoading && query.trim() && results.length === 0 && (
                <p className="text-center text-xs text-neutral-500">검색 결과가 없습니다.</p>
              )}
            </div>
            <div className="flex max-h-72 flex-col gap-1 overflow-y-auto">
              {results.map((r) => (
                <button
                  key={r.pokemon.id}
                  type="button"
                  onClick={() => void handleSelectPokemon(r)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  <div className="relative h-10 w-10 flex-shrink-0">
                    <PixelSprite pokemon={r.pokemon} alt="" fill />
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
                <PixelSprite pokemon={selectedPokemon.pokemon} alt="" fill />
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
                <p className="text-xs text-neutral-500">세트 불러오는 중…</p>
              ) : sets.length === 0 ? (
                <p className="text-xs text-neutral-500">추천 세트 없음</p>
              ) : (
                <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
                  {sets.map((set) => (
                    <button
                      key={set.name}
                      type="button"
                      onClick={() => handleConfirm(set)}
                      className="rounded-xl border border-neutral-200 px-4 py-2 text-left text-sm transition-colors hover:border-blue-400 hover:bg-blue-50 dark:border-neutral-600 dark:hover:bg-blue-900"
                    >
                      <p className="font-semibold text-blue-600 dark:text-blue-400">{set.name}</p>
                      <p className="text-xs text-neutral-500">
                        {set.moves
                          .map((m) => labelOf(labels, "moves", [m].flat()[0]))
                          .join(" / ")}
                      </p>
                      {[set.item].flat()[0] && (
                        <p className="text-xs text-neutral-500">
                          @ {labelOf(labels, "items", [set.item].flat()[0])}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <PixelButton variant="primary" onClick={() => handleConfirm(null)}>
              세트 없이 추가
            </PixelButton>
          </>
        )}
      </PixelCard>
    </ModalDialog>
  );
}
