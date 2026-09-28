"use client";

import { useCallback, useRef, useState } from "react";
import { Pokemon } from "pokenode-ts";

export default function usePokemonSearch(pokemonNames: string[]) {
  const [searchResults, setSearchResults] = useState<Map<number, Pokemon>>(new Map());
  const [isSearching, setIsSearching] = useState(false);
  // Only the most recently started request is allowed to touch state, so a
  // slower response for an older query can never overwrite a newer one.
  const requestIdRef = useRef(0);

  const search = useCallback(
    async (query: string): Promise<void> => {
      const requestId = ++requestIdRef.current;

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
        if (requestId === requestIdRef.current) {
          setSearchResults(new Map(results.map((p) => [p.id, p])));
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        if (requestId === requestIdRef.current) setIsSearching(false);
      }
    },
    [pokemonNames]
  );

  const clearSearch = () => {
    // Invalidate any in-flight request so it can't land after this clear.
    requestIdRef.current += 1;
    setSearchResults(new Map());
    setIsSearching(false);
  };

  return { searchResults, isSearching, search, clearSearch };
}
