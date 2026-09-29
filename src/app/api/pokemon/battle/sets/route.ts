import { NextRequest, NextResponse } from "next/server";
import { fetchPokemonSets } from "@/lib/battle/fetchers/fetchBattleData";
import { DEFAULT_FORMAT, FORMATS } from "@/lib/battle/constants";

const bad = (error: string) => NextResponse.json({ error }, { status: 400 });

// 빌더 피커용: 세트만. 사용률까지 주는 건 ../route.ts.
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const name = searchParams.get("name") ?? "";
  const format = searchParams.get("format") ?? DEFAULT_FORMAT;

  // These end up in URLs and cache keys.
  if (!FORMATS.some((f) => f.id === format)) return bad("unknown format");
  if (!/^[a-z0-9 .'-]{1,40}$/i.test(name)) return bad("invalid name");

  return NextResponse.json(await fetchPokemonSets(name, format));
}
