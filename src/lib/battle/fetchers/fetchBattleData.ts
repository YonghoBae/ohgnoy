import { unstable_cache } from "next/cache";
import { PokemonBattleData } from "@/types/pokemon/battle";
import { CUTOFF_BY_FORMAT } from "@/lib/battle/constants";
import { fetchSets, getPokemonSets } from "./fetchSets";
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

// bump when UsageStat's shape changes
const CACHE_VERSION = "v2";

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

export async function fetchPokemonBattleData(
  name: string,
  format: string,
  month: string = getLatestMonth()
): Promise<PokemonBattleData> {
  const m = month || getLatestMonth();
  const cutoff = cutoffFor(format);
  const [usage, setsMap] = await Promise.all([
    unstable_cache(
      async () =>
        getPokemonUsage(await loadUsageStats(format, m, cutoff), name),
      [`usage-pokemon-${CACHE_VERSION}-${format}-${m}-${cutoff}-${name.toLowerCase()}`],
      { revalidate: false }
    )().catch((e) => {
      console.error(`[battle] usage for ${name} ${format} ${m} failed:`, e);
      return null;
    }),
    fetchSets(format),
  ]);
  return {
    format,
    month: m,
    usage,
    sets: setsMap ? getPokemonSets(setsMap, name) : [],
  };
}
