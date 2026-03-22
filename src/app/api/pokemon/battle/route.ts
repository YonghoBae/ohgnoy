import { NextRequest, NextResponse } from "next/server";
import { fetchUsageStats, getPokemonUsage } from "@/lib/battle/fetchers/fetchUsageStats";
import { fetchSets, getPokemonSets } from "@/lib/battle/fetchers/fetchSets";
import { PokemonBattleData } from "@/types/pokemon/battle";
import { CUTOFF_BY_FORMAT } from "@/lib/battle/constants";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const name = searchParams.get("name") ?? "";
  const format = searchParams.get("format") ?? "gen9ou";
  const month = searchParams.get("month") ?? undefined;
  const cutoff = CUTOFF_BY_FORMAT[format] ?? 1695;

  const [statsMap, setsMap] = await Promise.all([
    fetchUsageStats(format, month, cutoff),
    fetchSets(format),
  ]);

  const result: PokemonBattleData = {
    format,
    month: month ?? new Date().toISOString().slice(0, 7),
    usage: statsMap ? getPokemonUsage(statsMap, name) : null,
    sets: setsMap ? getPokemonSets(setsMap, name) : [],
  };

  return NextResponse.json(result);
}
