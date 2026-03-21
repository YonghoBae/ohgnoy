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
  const [user, setUser] = useState<UserInfo>({ user_id: 0, nick_name: "", email: "" });

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
    <div className="flex h-full w-full flex-col items-center border-x bg-gray-500 bg-opacity-20 backdrop-blur-sm backdrop-filter dark:bg-gray-800 dark:bg-opacity-20">
      <div className="relative mt-5 flex w-4/5 flex-row rounded-full shadow-lg sm:w-2/3">
        <FaMagnifyingGlass className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-neutral-900 dark:text-neutral-100" />
        <input
          ref={searchBarRef}
          onChange={(e) => void handleSearch(e)}
          className="w-full truncate rounded-full bg-neutral-300 bg-opacity-40 p-2 px-5 pl-10 text-neutral-900 dark:bg-neutral-500 dark:bg-opacity-40 dark:text-neutral-100"
          type="text"
          placeholder="Search for a Pokemon"
        />
        <GenerationFilter
          generations={generations}
          current={currentGen}
          onChange={handleGenerationChange}
        />
      </div>
      <div className="mt-5 flex h-[70vh] flex-wrap justify-center overflow-y-scroll scrollbar-hide">
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
