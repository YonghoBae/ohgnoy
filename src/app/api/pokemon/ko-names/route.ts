import { NextResponse } from "next/server";

const BASE_URL = "https://pokeapi.co/api/v2";
const CACHE = { next: { revalidate: false } } as const;

async function fetchInChunks<T>(urls: string[], chunkSize = 20): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < urls.length; i += chunkSize) {
    const chunk = urls.slice(i, i + chunkSize);
    const chunkData = await Promise.all(
      chunk.map((url) => fetch(url, CACHE).then((r) => r.json() as Promise<T>))
    );
    results.push(...chunkData);
  }
  return results;
}

export async function GET() {
  const listRes = await fetch(`${BASE_URL}/pokemon-species?limit=100000`, CACHE);
  const list = await listRes.json() as { results: { name: string; url: string }[] };

  type SpeciesNames = { name: string; names: { language: { name: string }; name: string }[] };
  const speciesList = await fetchInChunks<SpeciesNames>(list.results.map((s) => s.url));

  const koToEn: Record<string, string> = {};
  for (const s of speciesList) {
    const ko = s.names.find((n) => n.language.name === "ko");
    if (ko) koToEn[ko.name] = s.name;
  }

  return NextResponse.json(koToEn, {
    headers: { "Cache-Control": "public, max-age=86400, s-maxage=86400" },
  });
}
