"use client";

import { ChangeEvent, useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Pokemon } from "pokenode-ts";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { useRouter } from "next/navigation";

import PokemonCard from "./PokemonCard";
import GenerationFilter from "./GenerationFilter";
import CompareTray from "./CompareTray";
import useCompare from "@/lib/pokemon/hooks/useCompare";
import usePokemonSearch from "@/lib/pokemon/hooks/usePokemonSearch";
import { UserInfo } from "@/interfaces/user";
import { userInfo } from "@/lib/user/token";

interface Props {
  pokemons: Pokemon[];
  generations: string[];
  currentGen: number;
  allNames: string[];
  koNames: Record<number, string>;
  initialQuery?: string;
}

export default function PokemonGrid({
  pokemons,
  generations,
  currentGen,
  allNames,
  koNames,
  initialQuery = "",
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [user, setUser] = useState<UserInfo>({ userId: 0, nickname: "", email: "" });
  const [isPending, startTransition] = useTransition();

  const { searchResults, search, clearSearch } = usePokemonSearch(allNames);
  const { compare } = useCompare();
  const trayOpen = Boolean(compare.mon_1 || compare.mon_2);

  // koNames only covers this generation's species. Search hits from other
  // generations, forms (charizard-mega-x) and the compare tray get theirs
  // from /api/pokemon/names; each id is asked for once unless that fails.
  const [extraNames, setExtraNames] = useState<Record<number, string>>({});
  const requestedRef = useRef(new Set<number>());
  useEffect(() => {
    const missing = [...searchResults.values(), compare.mon_1, compare.mon_2].filter(
      (p): p is Pokemon => !!p && !koNames[p.id] && !requestedRef.current.has(p.id)
    );
    if (!missing.length) return;
    missing.forEach((p) => requestedRef.current.add(p.id));
    fetch(`/api/pokemon/names?slugs=${missing.map((p) => p.name).join(",")}`)
      .then((r) => {
        if (!r.ok) throw new Error(`names ${r.status}`);
        return r.json() as Promise<Record<string, { ko: string }>>;
      })
      .then((found) =>
        setExtraNames((prev) => ({
          ...prev,
          ...Object.fromEntries(
            missing.flatMap((p) => (found[p.name] ? [[p.id, found[p.name].ko]] : []))
          ),
        }))
      )
      // Failed ids are asked for again on the next search.
      .catch(() => missing.forEach((p) => requestedRef.current.delete(p.id)));
  }, [searchResults, compare, koNames]);
  const names = { ...extraNames, ...koNames };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }
    userInfo(token).then(setUser).catch(console.error);
  }, [router]);

  const runSearch = useCallback(
    (value: string) => {
      if (!value.trim()) {
        clearSearch();
        return;
      }
      void search(value);
    },
    [search, clearSearch]
  );

  useEffect(() => {
    if (initialQuery.trim()) runSearch(initialQuery);
    // Hydrate from the URL once, on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keeps `?q=` in sync without re-running the server data pipeline: Next
  // keeps useSearchParams in sync with native history navigation, so a plain
  // history update is enough (no router.replace / server round-trip).
  const updateUrl = useCallback(
    (nextQuery: string) => {
      const params = new URLSearchParams();
      params.set("gen", String(currentGen));
      if (nextQuery.trim()) params.set("q", nextQuery);
      window.history.replaceState(null, "", `/pokemon/list?${params.toString()}`);
    },
    [currentGen]
  );

  const handleSearch = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      updateUrl(value);
      runSearch(value);
    },
    [runSearch, updateUrl]
  );

  const handleGenerationChange = (gen: number) => {
    setQuery("");
    clearSearch();
    startTransition(() => {
      router.push(`/pokemon/list?gen=${gen}`);
    });
  };

  const isSearchActive = query.trim().length > 0;
  const displayPokemons = isSearchActive ? Array.from(searchResults.values()) : pokemons;

  // The tray is a sibling, not a child: backdrop-blur makes this div the
  // containing block for position: fixed descendants.
  return (
    <>
    <div className={`-mx-5 flex flex-col border-x border-border bg-surface-2/20 backdrop-blur-sm${trayOpen ? " pb-40" : ""}`}>
      <h1 className="px-4 pt-4 text-2xl font-extrabold">포켓몬 도감</h1>
      <div className="sticky top-[var(--header-h)] z-40 bg-[#ECEFF4]/90 dark:bg-[#2E3440]/90 backdrop-blur-sm py-3 px-4">
        <div className="relative flex w-full flex-row rounded-none border-2 border-text-base sm:w-2/3 sm:mx-auto">
          <FaMagnifyingGlass
            aria-hidden
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-text-muted"
          />
          <input
            value={query}
            onChange={handleSearch}
            aria-label="포켓몬 검색"
            name="q"
            className="w-full truncate rounded-none bg-surface p-2 px-5 pl-10 text-text-base placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
            type="search"
            autoComplete="off"
            spellCheck={false}
            placeholder="포켓몬 영어 이름으로 검색 (예: pikachu)…"
          />
          <GenerationFilter
            generations={generations}
            current={currentGen}
            onChange={handleGenerationChange}
          />
          {isPending && (
            <span
              role="status"
              className="absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] text-text-muted"
            >
              불러오는 중…
            </span>
          )}
        </div>
      </div>
      {isSearchActive && displayPokemons.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-text-muted">검색 결과가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-4 py-4">
          {displayPokemons
            .slice()
            .sort((a, b) => a.id - b.id)
            .map((pokemon) => (
              <PokemonCard key={pokemon.id} pokemon={pokemon} userInfo={user} koName={names[pokemon.id]} />
            ))}
        </div>
      )}
    </div>
    <CompareTray koNames={names} />
    </>
  );
}
