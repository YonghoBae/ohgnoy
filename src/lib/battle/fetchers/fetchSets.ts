import { BattleSet } from "@/types/pokemon/battle";

const SETS_BASE = "https://data.pkmn.cc/sets";

interface RawSets {
  [pokemonName: string]: {
    [setName: string]: {
      moves: (string | string[])[];
      item?: string | string[];
      ability?: string | string[];
      nature?: string;
      evs?: Partial<Record<string, number>>;
      teratypes?: string[];
    };
  };
}

export async function fetchSets(
  format: string
): Promise<Record<string, BattleSet[]> | null> {
  const url = `${SETS_BASE}/${format}.json`;

  try {
    const res = await fetch(url, { next: { revalidate: 86400 } } as RequestInit);
    if (!res.ok) return null;

    const raw = await res.json() as RawSets;
    const result: Record<string, BattleSet[]> = {};

    for (const [pokemonName, setMap] of Object.entries(raw)) {
      result[pokemonName] = Object.entries(setMap).map(([setName, data]) => ({
        name: setName,
        moves: data.moves ?? [],
        item: data.item ?? [],
        ability: data.ability,
        nature: data.nature,
        evs: data.evs as BattleSet["evs"],
        teratypes: data.teratypes,
      }));
    }

    return result;
  } catch {
    return null;
  }
}

export function getPokemonSets(
  setsData: Record<string, BattleSet[]>,
  nameEn: string
): BattleSet[] {
  const key = Object.keys(setsData).find(
    (k) => k.toLowerCase() === nameEn.toLowerCase()
  );
  return key ? (setsData[key] ?? []) : [];
}
