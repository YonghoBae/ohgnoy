import { NextRequest, NextResponse } from "next/server";
import { fetchPokemonBattleData } from "@/lib/battle/fetchers/fetchBattleData";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const name = searchParams.get("name") ?? "";
  const format = searchParams.get("format") ?? "gen9ou";
  const month = searchParams.get("month") ?? undefined;

  return NextResponse.json(await fetchPokemonBattleData(name, format, month));
}
