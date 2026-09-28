import { UsageStat } from "@/types/pokemon/battle";

const SMOGON_STATS_BASE = "https://www.smogon.com/stats";

// YYYY-MM 형식으로 지난달 반환. 1일로 잡아야 10월 31일에 "9월 31일"이
// 10월 1일로 넘어가 한 달을 건너뛰지 않는다.
export function getLatestMonth(): string {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

interface ChaosData {
  info: { metagame: string; cutoff: number; "number of battles": number };
  data: Record<string, RawUsageStat>;
}

type RawCounter = [number, number, number] | { n: number; p: number; d: number };

interface RawUsageStat {
  "Raw count": number;
  usage?: number;
  Abilities: Record<string, number>;
  Items: Record<string, number>;
  Moves: Record<string, number>;
  Spreads: Record<string, number>;
  Teammates: Record<string, number>;
  "Checks and Counters": Record<string, RawCounter>;
  "Tera Types"?: Record<string, number>;
}

// 가중 횟수를 포켓몬 가중 합계(특성 합) 대비 퍼센트로. 빈 키, "nothing",
// 0 이하 값(Teammates의 음수 편차)은 뺀다.
function toPercent(
  counts: Record<string, number> | undefined,
  total: number
): Record<string, number> {
  const out: Record<string, number> = {};
  if (!counts || total <= 0) return out;
  for (const [k, v] of Object.entries(counts)) {
    if (k && k !== "nothing" && v > 0) out[k] = (v / total) * 100;
  }
  return out;
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
    const total = Object.values(raw.Abilities ?? {}).reduce((a, b) => a + b, 0);
    const counters: UsageStat["counters"] = {};
    for (const [k, c] of Object.entries(raw["Checks and Counters"] ?? {})) {
      counters[k] = Array.isArray(c) ? { n: c[0], p: c[1], d: c[2] } : c;
    }
    result[name] = {
      nameEn: name,
      // 한 배틀에 팀이 둘이라 rawCount/battles는 약 2배가 된다.
      usagePercent:
        raw.usage != null
          ? raw.usage * 100
          : totalBattles > 0
            ? (rawCount / (2 * totalBattles)) * 100
            : 0,
      rawCount,
      abilities: toPercent(raw.Abilities, total),
      items: toPercent(raw.Items, total),
      moves: toPercent(raw.Moves, total),
      spreads: toPercent(raw.Spreads, total),
      teammates: toPercent(raw.Teammates, total),
      counters,
      teraTypes: raw["Tera Types"] && toPercent(raw["Tera Types"], total),
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
