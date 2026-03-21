import { EvolutionChain } from "pokenode-ts";

const BASE_URL = "https://pokeapi.co/api/v2";
const CACHE_OPTIONS = { next: { revalidate: false } } as const;

export async function fetchEvolutionChain(id: number): Promise<EvolutionChain> {
  const res = await fetch(`${BASE_URL}/evolution-chain/${id}`, CACHE_OPTIONS);
  if (!res.ok) throw new Error(`Evolution chain not found: ${id}`);
  return res.json() as Promise<EvolutionChain>;
}

export function extractEvolutionChainId(url: string): number {
  const parts = url.split("/").filter(Boolean);
  return Number(parts[parts.length - 1]);
}
