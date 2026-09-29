import { unstable_cache } from "next/cache";
import {
  BattleSet,
  LabelKind,
  labelKey,
  PokemonBattleData,
  PokemonSetsData,
  toID,
  UsageStat,
} from "@/types/pokemon/battle";
import { CUTOFF_BY_FORMAT } from "@/lib/battle/constants";
import { koLabel, koPokemon } from "@/lib/battle/koNames";
import { deriveSet, fetchSets, getPokemonSets } from "./fetchSets";
import {
  getLatestMonth,
  getPokemonUsage,
  getUsageRanking,
  loadUsageStats,
  UsageRankEntry,
} from "./fetchUsageStats";

// 페이지가 쓰는 실전 데이터 읽기는 이 두 함수뿐이다. 포켓몬 백엔드 API가
// 생기면 함수 본문만 apiClient 호출로 바꾸면 되고 페이지는 그대로 둔다.
//
// 캐시는 각자 필요한 작은 조각(순위 50개, 포켓몬 1마리)만 한다. 실패는
// unstable_cache 안에서 예외로 끝나 저장되지 않고, 여기서 null로 바뀐다.
// ponytail: 조각 캐시가 비어 있으면 Smogon 원본(약 10MB)을 통째로 다시 받는다.
// 포켓몬마다 처음 한 번씩이다. 백엔드로 옮기면 없어지는 비용이다.

// bump when UsageStat's shape or the name lookup changes (v3: slug -> Smogon
// key, v2 caches hold null for "great-tusk" etc.; v4: koNames.json rebuilt,
// v3 caches hold null for necrozma-dusk-mane etc.)
const CACHE_VERSION = "v4";

const cutoffFor = (format: string) => CUTOFF_BY_FORMAT[format] ?? 1695;

export async function fetchUsageRanking(
  format: string,
  month: string = getLatestMonth(),
  limit = 50
): Promise<UsageRankEntry[] | null> {
  // ?month= can arrive as "" (the 최신 button); defaults only cover undefined.
  const m = month || getLatestMonth();
  const cutoff = cutoffFor(format);
  try {
    return await unstable_cache(
      async () =>
        getUsageRanking(await loadUsageStats(format, m, cutoff), limit),
      [`usage-ranking-${CACHE_VERSION}-${format}-${m}-${cutoff}-${limit}`],
      { revalidate: false }
    )();
  } catch (e) {
    console.error(`[battle] usage ranking ${format} ${m} failed:`, e);
    return null;
  }
}

// 페이지는 PokeAPI 슬러그("great-tusk", "landorus-incarnate",
// "ogerpon-wellspring-mask")를 넘기고 Smogon 키는 "Great Tusk", "Landorus",
// "Ogerpon-Wellspring"이다.
const smogonKey = (keys: string[], slug: string) =>
  keys.find((k) => toID(k) === toID(slug)) ??
  keys.find((k) => koPokemon(k)?.slug === slug) ??
  slug;

// 이 포켓몬의 사용률/세트에 나오는 이름만 한국어로. 번역이 없으면 뺀다.
function buildLabels(usage: UsageStat | null, sets: BattleSet[]) {
  const labels: Record<string, string> = {};
  const add = (kind: LabelKind, names: (string | string[] | undefined)[]) => {
    for (const name of names.flat()) {
      if (!name) continue;
      const ko =
        kind === "pokemon" ? koPokemon(name)?.ko : koLabel(kind, name);
      if (ko && ko !== name) labels[labelKey(kind, name)] = ko;
    }
  };
  const keys = (r: Record<string, unknown> | undefined) => Object.keys(r ?? {});
  add("moves", [...keys(usage?.moves), ...sets.flatMap((s) => s.moves)]);
  add("items", [...keys(usage?.items), ...sets.map((s) => s.item)]);
  add("abilities", [...keys(usage?.abilities), ...sets.map((s) => s.ability)]);
  add("types", [...keys(usage?.teraTypes), ...sets.flatMap((s) => s.teratypes ?? [])]);
  add("natures", [
    ...keys(usage?.spreads).map((s) => s.split(":")[0]),
    ...sets.flatMap((s) => s.nature?.split(" / ") ?? []),
  ]);
  add("pokemon", [...keys(usage?.teammates), ...keys(usage?.counters)]);
  return labels;
}

// 포켓몬 1마리 사용률 조각. 상세(fetchPokemonBattleData)와 빌더(fetchPokemonSets)가
// 같은 캐시 키를 쓴다.
function loadPokemonUsage(
  name: string,
  format: string,
  month: string
): Promise<UsageStat | null> {
  const cutoff = cutoffFor(format);
  return unstable_cache(
    async () => {
      const stats = await loadUsageStats(format, month, cutoff);
      return getPokemonUsage(stats, smogonKey(Object.keys(stats), name));
    },
    [`usage-pokemon-${CACHE_VERSION}-${format}-${month}-${cutoff}-${name.toLowerCase()}`],
    { revalidate: false }
  )().catch((e) => {
    console.error(`[battle] usage for ${name} ${format} ${month} failed:`, e);
    return null;
  });
}

export async function fetchPokemonBattleData(
  name: string,
  format: string,
  month: string = getLatestMonth()
): Promise<PokemonBattleData> {
  const m = month || getLatestMonth();
  const [usage, setsMap] = await Promise.all([
    loadPokemonUsage(name, format, m),
    fetchSets(format),
  ]);
  const pkmnSets = setsMap
    ? getPokemonSets(setsMap, smogonKey(Object.keys(setsMap), name))
    : [];
  // 랭크배틀 포맷은 pkmn 세트가 없다. 사용률로 세트 하나를 만든다.
  const derived = !pkmnSets.length && usage ? deriveSet(usage) : null;
  const sets = derived ? [derived] : pkmnSets;
  return { format, month: m, usage, sets, labels: buildLabels(usage, sets) };
}

// 빌더 피커용. pkmn 세트가 있으면 사용률(Smogon 원본 약 10MB)을 기다리지 않는다.
// 없으면 상세와 같은 사용률 조각 캐시로 세트 하나를 만든다.
export async function fetchPokemonSets(
  name: string,
  format: string
): Promise<PokemonSetsData> {
  const setsMap = await fetchSets(format);
  if (setsMap) {
    const key = smogonKey(Object.keys(setsMap), name);
    const sets = getPokemonSets(setsMap, key);
    if (sets.length) return { species: key, sets, labels: buildLabels(null, sets) };
  }
  const usage = await loadPokemonUsage(name, format, getLatestMonth());
  const derived = usage && deriveSet(usage);
  if (!usage || !derived) return { species: null, sets: [], labels: {} };
  return {
    species: usage.nameEn,
    sets: [derived],
    labels: buildLabels(null, [derived]),
  };
}
