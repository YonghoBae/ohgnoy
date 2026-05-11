"use client";

import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
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
}

export default function PokemonGrid({ pokemons, generations, currentGen, allNames, koNames }: Props) {
  const router = useRouter();
  const searchBarRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<UserInfo>({ userId: 0, nickname: "", email: "" });

  const { searchResults, search, clearSearch } = usePokemonSearch(allNames);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }
    userInfo(token).then(setUser).catch(console.error);
  }, [router]);

  const handleSearch = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      if (!query.trim()) {
        clearSearch();
        return;
      }
      await search(query);
    },
    [search, clearSearch]
  );

  const handleGenerationChange = (gen: number) => {
    if (searchBarRef.current) searchBarRef.current.value = "";
    clearSearch();
    router.push(`/pokemon/list?gen=${gen}`);
  };

  const displayPokemons =
    searchResults.size && searchBarRef.current?.value
      ? Array.from(searchResults.values())
      : pokemons;

  return (
    <div className="-mx-5 flex flex-col border-x border-border bg-surface-2/20 backdrop-blur-sm">
      <div className="sticky top-[var(--header-h)] z-40 bg-[#ECEFF4]/90 dark:bg-[#2E3440]/90 backdrop-blur-sm py-3 px-4">
        <div className="relative flex w-full flex-row rounded-full shadow-md sm:w-2/3 sm:mx-auto">
          <FaMagnifyingGlass className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-text-muted" />
          <input
            ref={searchBarRef}
            onChange={(e) => void handleSearch(e)}
            aria-label="포켓몬 검색"
            className="w-full truncate rounded-full bg-surface p-2 px-5 pl-10 text-text-base placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
            type="text"
            placeholder="Search for a Pokemon"
          />
          <GenerationFilter
            generations={generations}
            current={currentGen}
            onChange={handleGenerationChange}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-4 py-4">
        {displayPokemons
          .slice()
          .sort((a, b) => a.id - b.id)
          .map((pokemon) => (
            <PokemonCard key={pokemon.id} pokemon={pokemon} userInfo={user} koName={koNames[pokemon.id]} />
          ))}
      </div>
    </div>
  );
}
