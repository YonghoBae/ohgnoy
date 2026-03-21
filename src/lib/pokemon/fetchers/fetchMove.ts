import { Move } from "pokenode-ts";

const BASE_URL = "https://pokeapi.co/api/v2";
const CACHE_OPTIONS = { next: { revalidate: false } } as const;

export async function fetchMove(id: number): Promise<Move> {
  const res = await fetch(`${BASE_URL}/move/${id}`, CACHE_OPTIONS);
  if (!res.ok) throw new Error(`Move not found: ${id}`);
  return res.json() as Promise<Move>;
}

export async function fetchMoves(ids: number[]): Promise<Move[]> {
  return Promise.all(ids.map((id) => fetchMove(id)));
}
