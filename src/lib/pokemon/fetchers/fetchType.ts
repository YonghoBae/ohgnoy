import { Type } from "pokenode-ts";

const BASE_URL = "https://pokeapi.co/api/v2";
const CACHE_OPTIONS = { next: { revalidate: false } } as const;

// 추후 타입 상성 계산 기능에서 사용
export async function fetchType(nameOrId: string | number): Promise<Type> {
  const res = await fetch(`${BASE_URL}/type/${nameOrId}`, CACHE_OPTIONS);
  if (!res.ok) throw new Error(`Type not found: ${nameOrId}`);
  return res.json() as Promise<Type>;
}
