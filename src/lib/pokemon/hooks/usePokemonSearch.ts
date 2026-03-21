"use client";

import { useCallback, useState } from "react";
import { Pokemon } from "pokenode-ts";

export default function usePokemonSearch(pokemonNames: string[]) {
  const [searchResults, setSearchResults] = useState<Map<number, Pokemon>>(new Map());
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback(
    async (query: string): Promise<void> => {
      if (query.trim() === "") {
        setSearchResults(new Map());
        return;
      }

      setIsSearching(true);
      const matched = pokemonNames
        .filter((name) => name.toLowerCase().startsWith(query.toLowerCase()))
        .slice(0, 10);

      try {
        const results = await Promise.all(
          matched.map((name) =>
            fetch(`https://pokeapi.co/api/v2/pokemon/${name}`).then(
              (r) => r.json() as Promise<Pokemon>
            )
          )
        );
        setSearchResults(new Map(results.map((p) => [p.id, p])));
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    },
    [pokemonNames]
  );

  const clearSearch = () => setSearchResults(new Map());

  return { searchResults, isSearching, search, clearSearch };
}
