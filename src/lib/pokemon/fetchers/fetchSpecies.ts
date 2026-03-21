import { PokemonSpecies } from "pokenode-ts";

const BASE_URL = "https://pokeapi.co/api/v2";
const CACHE_OPTIONS = { next: { revalidate: false } } as const;

export async function fetchSpecies(id: number): Promise<PokemonSpecies> {
  const res = await fetch(`${BASE_URL}/pokemon-species/${id}`, CACHE_OPTIONS);
  if (!res.ok) throw new Error(`Species not found: ${id}`);
  return res.json() as Promise<PokemonSpecies>;
}

export async function fetchSpeciesBatch(ids: number[]): Promise<PokemonSpecies[]> {
  return Promise.all(ids.map((id) => fetchSpecies(id)));
}

export function extractKoNames(speciesList: PokemonSpecies[]): Record<number, string> {
  return Object.fromEntries(
    speciesList.map((s) => {
      const ko = s.names.find((n) => n.language.name === "ko");
      return [s.id, ko?.name ?? s.name];
    })
  );
}
