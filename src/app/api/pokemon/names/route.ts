import { NextRequest, NextResponse } from "next/server";
import { koPokemon } from "@/lib/battle/koNames";

const MAX_SLUGS = 60;
const SLUG = /^[a-z0-9-]+$/;

// GET /api/pokemon/names?slugs=charizard-mega-x,great-tusk
// → { "charizard-mega-x": { ko: "메가리자몽X", en: "Mega Charizard X" }, … }
// Unknown slugs are left out. Keeps koNames.json out of the client bundle.
export function GET(req: NextRequest) {
  const slugs = (req.nextUrl.searchParams.get("slugs") ?? "")
    .split(",")
    .filter(Boolean);
  if (!slugs.length || slugs.length > MAX_SLUGS || !slugs.every((s) => SLUG.test(s))) {
    return NextResponse.json(
      { error: `slugs: 1–${MAX_SLUGS} PokeAPI slugs, comma-separated` },
      { status: 400 }
    );
  }

  const names: Record<string, { ko: string; en: string }> = {};
  for (const slug of slugs) {
    const hit = koPokemon(slug);
    if (hit?.slug === slug) names[slug] = { ko: hit.ko, en: hit.en };
  }
  return NextResponse.json(names, {
    headers: { "Cache-Control": "public, max-age=86400, s-maxage=86400" },
  });
}
