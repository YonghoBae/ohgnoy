import { NextRequest, NextResponse } from "next/server";
import { fetchPokemonBattleData } from "@/lib/battle/fetchers/fetchBattleData";
import { DEFAULT_FORMAT, FORMATS } from "@/lib/battle/constants";

const bad = (error: string) => NextResponse.json({ error }, { status: 400 });

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const name = searchParams.get("name") ?? "";
  const format = searchParams.get("format") ?? DEFAULT_FORMAT;
  const month = searchParams.get("month") || undefined;

  // These end up in Smogon URLs and cache keys.
  if (!FORMATS.some((f) => f.id === format)) return bad("unknown format");
  if (month && !/^\d{4}-\d{2}$/.test(month)) return bad("month must be YYYY-MM");
  if (!/^[a-z0-9 .'-]{1,40}$/i.test(name)) return bad("invalid name");

  return NextResponse.json(await fetchPokemonBattleData(name, format, month));
}
