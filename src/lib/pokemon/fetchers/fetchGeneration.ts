import { Generation, NamedAPIResourceList } from "pokenode-ts";

const BASE_URL = "https://pokeapi.co/api/v2";
const CACHE_OPTIONS = { next: { revalidate: false } } as const;

export async function fetchGeneration(id: number): Promise<Generation> {
  const res = await fetch(`${BASE_URL}/generation/${id}`, CACHE_OPTIONS);
  if (!res.ok) throw new Error(`Generation not found: ${id}`);
  return res.json() as Promise<Generation>;
}

export async function fetchGenerationList(): Promise<NamedAPIResourceList> {
  const res = await fetch(`${BASE_URL}/generation`, CACHE_OPTIONS);
  if (!res.ok) throw new Error("Failed to fetch generation list");
  return res.json() as Promise<NamedAPIResourceList>;
}

export async function fetchGenerationIds(generationId: number): Promise<number[]> {
  const generation = await fetchGeneration(generationId);
  return generation.pokemon_species
    .map((s) => {
      const parts = s.url.split("/").filter(Boolean);
      return Number(parts[parts.length - 1]);
    })
    .sort((a, b) => a - b);
}
