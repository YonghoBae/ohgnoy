import { UsageStat } from "@/types/pokemon/battle";

const SMOGON_STATS_BASE = "https://www.smogon.com/stats";
const DEFAULT_CUTOFF = 1695;

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

export async function fetchUsageStats(
  format: string,
  month?: string,
  cutoff: number = DEFAULT_CUTOFF
): Promise<Record<string, UsageStat> | null> {
  const targetMonth = month ?? getLatestMonth();
  const url = `${SMOGON_STATS_BASE}/${targetMonth}/chaos/${format}-${cutoff}.json`;

  try {
    const res = await fetch(url, { next: { revalidate: false } } as RequestInit);
    if (!res.ok) return null;

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
  } catch {
    return null;
  }
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
