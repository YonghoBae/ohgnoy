import { UsageStat } from "@/types/pokemon/battle";

const SMOGON_STATS_BASE = "https://www.smogon.com/stats";

// YYYY-MM 형식으로 최근 월 반환
export function getLatestMonth(): string {
  const now = new Date();
  now.setMonth(now.getMonth() - 1);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

interface ChaosData {
  info: { metagame: string; cutoff: number; "number of battles": number };
  data: Record<string, RawUsageStat>;
}

interface RawUsageStat {
  "Raw count": number;
  Abilities: Record<string, number>;
  Items: Record<string, number>;
  Moves: Record<string, number>;
  Spreads: Record<string, number>;
  Teammates: Record<string, number>;
  "Checks and Counters": Record<string, [number, number]>;
  "Tera Types"?: Record<string, number>;
}

// 원본(약 10MB)과 가공 결과 모두 Next 데이터 캐시 한도(2MB)를 넘어 캐시하지 않는다.
// 캐시는 fetchBattleData.ts가 필요한 조각만 한다. 실패는 null이 아니라 예외로 던져서
// 호출 쪽 unstable_cache가 실패를 저장하지 않게 한다.
export async function loadUsageStats(
  format: string,
  month: string,
  cutoff: number
): Promise<Record<string, UsageStat>> {
  const url = `${SMOGON_STATS_BASE}/${month}/chaos/${format}-${cutoff}.json`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`${url} responded ${res.status}`);

  const chaos = await res.json() as ChaosData;
  const totalBattles = chaos.info["number of battles"];

  const result: Record<string, UsageStat> = {};
  for (const [name, raw] of Object.entries(chaos.data)) {
    const rawCount = raw["Raw count"];
    result[name] = {
      nameEn: name,
      usagePercent: totalBattles > 0 ? (rawCount / totalBattles) * 100 : 0,
      rawCount,
      abilities: raw.Abilities ?? {},
      items: raw.Items ?? {},
      moves: raw.Moves ?? {},
      spreads: raw.Spreads ?? {},
      teammates: raw.Teammates ?? {},
      counters: raw["Checks and Counters"] ?? {},
      teraTypes: raw["Tera Types"],
    };
  }
  return result;
}

export interface UsageRankEntry {
  rank: number;
  nameEn: string;
  usagePercent: number;
  rawCount: number;
}

export function getUsageRanking(
  stats: Record<string, UsageStat>,
  limit = 50
): UsageRankEntry[] {
  return Object.values(stats)
    .sort((a, b) => b.usagePercent - a.usagePercent)
    .slice(0, limit)
    .map((s, i) => ({
      rank: i + 1,
      nameEn: s.nameEn,
      usagePercent: s.usagePercent,
      rawCount: s.rawCount,
    }));
}

export function getPokemonUsage(
  stats: Record<string, UsageStat>,
  nameEn: string
): UsageStat | null {
  // 대소문자 구분 없이 검색
  const key = Object.keys(stats).find(
    (k) => k.toLowerCase() === nameEn.toLowerCase()
  );
  return key ? (stats[key] ?? null) : null;
}
