import { Pokemon } from "pokenode-ts";

const BASE_URL = "https://pokeapi.co/api/v2";
const CACHE_OPTIONS = { next: { revalidate: false } } as const;

export async function fetchPokemon(idOrName: number | string): Promise<Pokemon> {
  const res = await fetch(`${BASE_URL}/pokemon/${idOrName}`, CACHE_OPTIONS);
  if (!res.ok) throw new Error(`Pokemon not found: ${idOrName}`);
  return res.json() as Promise<Pokemon>;
}

async function chunkPromiseAll<T>(
  items: number[],
  fn: (id: number) => Promise<T>,
  chunkSize = 20
): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(chunk.map(fn));
    results.push(...chunkResults);
  }
  return results;
}

export async function fetchPokemonBatch(ids: number[]): Promise<Pokemon[]> {
  return chunkPromiseAll(ids, fetchPokemon);
}

export async function fetchAllPokemonNames(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/pokemon?limit=100000`, CACHE_OPTIONS);
  if (!res.ok) throw new Error("Failed to fetch pokemon names");
  const data = await res.json() as { results: { name: string }[] };
  return data.results.map((p) => p.name);
}
