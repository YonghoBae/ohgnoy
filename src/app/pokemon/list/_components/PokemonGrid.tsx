"use client";

import { ChangeEvent, useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Pokemon } from "pokenode-ts";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { useRouter } from "next/navigation";

import PokemonCard from "./PokemonCard";
import GenerationFilter from "./GenerationFilter";
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
  // Tracks the most recently typed value so an older, slower response can
  // correct itself instead of overwriting a newer one.
  const latestQueryRef = useRef(initialQuery);

  const { searchResults, search, clearSearch } = usePokemonSearch(allNames);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }
    userInfo(token).then(setUser).catch(console.error);
  }, [router]);

  const runSearch = useCallback(
    async (value: string) => {
      latestQueryRef.current = value;
      if (!value.trim()) {
        clearSearch();
        return;
      }
      await search(value);
      if (latestQueryRef.current !== value) {
        // A newer keystroke arrived while this request was in flight; make
        // sure the freshest query is what ends up on screen.
        await runSearch(latestQueryRef.current);
      }
    },
    [search, clearSearch]
  );

  useEffect(() => {
    if (initialQuery.trim()) void runSearch(initialQuery);
    // Hydrate from the URL once, on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateUrl = useCallback(
    (nextQuery: string) => {
      const params = new URLSearchParams();
      params.set("gen", String(currentGen));
      if (nextQuery.trim()) params.set("q", nextQuery);
      router.replace(`/pokemon/list?${params.toString()}`, { scroll: false });
    },
    [currentGen, router]
  );

  const handleSearch = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      updateUrl(value);
      void runSearch(value);
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

  return (
    <div className="-mx-5 flex flex-col border-x border-border bg-surface-2/20 backdrop-blur-sm">
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
            placeholder="포켓몬 이름으로 검색 (예: 피카츄)…"
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
              <PokemonCard key={pokemon.id} pokemon={pokemon} userInfo={user} koName={koNames[pokemon.id]} />
            ))}
        </div>
      )}
    </div>
  );
}
