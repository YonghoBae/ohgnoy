import { BattleSet, UsageStat } from "@/types/pokemon/battle";
import { enLabel } from "@/lib/battle/koNames";

const SETS_BASE = "https://data.pkmn.cc/sets";

interface RawSet {
  moves: (string | string[])[];
  item?: string | string[];
  ability?: string | string[];
  nature?: string | string[];
  evs?: Partial<Record<string, number>> | Partial<Record<string, number>>[];
  teratypes?: string | string[];
}

interface RawSets {
  [pokemonName: string]: { [setName: string]: RawSet };
}

const toBattleSet = (name: string, data: RawSet): BattleSet => ({
  name,
  moves: data.moves ?? [],
  item: data.item ?? [],
  ability: data.ability,
  // pkmn 세트는 한 값일 때 배열 대신 문자열/객체로 준다.
  nature: [data.nature ?? []].flat().join(" / ") || undefined,
  evs: [data.evs ?? []].flat()[0] as BattleSet["evs"],
  teratypes: data.teratypes ? [data.teratypes].flat() : undefined,
});

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
      result[pokemonName] = Object.entries(setMap).map(([setName, data]) =>
        toBattleSet(setName, data)
      );
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

const EV_STATS = ["hp", "atk", "def", "spa", "spd", "spe"] as const;

// pkmn 세트가 없는 포맷(싱글/더블 랭크배틀)용: 사용률 1위 값들로 세트 하나를
// 만든다. 기술 4개, 아이템, 특성, 1위 스프레드("Jolly:0/252/0/0/4/252")의 성격과
// 노력치(0은 뺀다). Smogon id("focussash")는 pkmn 세트처럼 영어 이름
// ("Focus Sash")으로 바꾼다. 없는 이름은 id 그대로 둔다(Showdown이 id로 맞춘다).
export function deriveSet(usage: UsageStat): BattleSet | null {
  const top = (r: Record<string, number> | undefined) =>
    Object.entries(r ?? {})
      .sort((a, b) => b[1] - a[1])
      .map(([k]) => k);
  const moves = top(usage.moves)
    .slice(0, 4)
    .map((m) => enLabel("moves", m));
  if (!moves.length) return null;
  const [nature, evStr] = (top(usage.spreads)[0] ?? "").split(":");
  const evs: Partial<Record<string, number>> = {};
  evStr?.split("/").forEach((v, i) => {
    if (Number(v) > 0 && EV_STATS[i]) evs[EV_STATS[i]] = Number(v);
  });
  const [item] = top(usage.items);
  const [ability] = top(usage.abilities);
  const [tera] = top(usage.teraTypes);
  return toBattleSet("가장 많이 쓰는 구성", {
    moves,
    item: item && enLabel("items", item),
    ability: ability && enLabel("abilities", ability),
    nature: nature || undefined,
    evs: Object.keys(evs).length ? evs : undefined,
    teratypes: tera,
  });
}
