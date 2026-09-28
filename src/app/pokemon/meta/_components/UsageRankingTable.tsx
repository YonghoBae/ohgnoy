import Link from "next/link";
import { Pokemon } from "pokenode-ts";
import { UsageRankEntry } from "@/lib/battle/fetchers/fetchUsageStats";
import { fetchPokemon } from "@/lib/pokemon/fetchers/fetchPokemon";
import { fetchSpecies } from "@/lib/pokemon/fetchers/fetchSpecies";
import { getPokemonNames } from "@/lib/pokemon/i18n";
import { koPokemon } from "@/lib/battle/koNames";
import TypeBadge from "@/app/_components/TypeBadge";
import PixelSprite from "@/app/_components/ui/pixel/PixelSprite";
import { PokemonTypeName } from "@/types/pokemon/domain";

async function RankRow({
  entry,
  maxUsage,
}: {
  entry: UsageRankEntry;
  maxUsage: number;
}) {
  let pokemon: Pokemon | null = null;
  // Smogon names ("Ogerpon-Wellspring", "Landorus") → PokeAPI slug + names.
  const known = koPokemon(entry.nameEn);
  let nameKo = known?.ko ?? entry.nameEn;
  let nameEn = known?.en ?? entry.nameEn;
  let types: PokemonTypeName[] = [];
  let id: number | string = entry.nameEn;

  try {
    const slug = known?.slug ?? entry.nameEn.toLowerCase().replace(/ /g, "-");
    pokemon = await fetchPokemon(slug);
    id = pokemon.id;
    types = pokemon.types.map((t) => t.type.name as PokemonTypeName);

    if (!known) {
      // Forms have no species of their own: species id comes from species.url.
      const speciesId = Number(pokemon.species.url.match(/\/(\d+)\/?$/)?.[1]);
      ({ ko: nameKo, en: nameEn } = await getPokemonNames(
        pokemon,
        await fetchSpecies(speciesId)
      ));
    }
  } catch {
    // 데이터 없으면 영어 이름으로 폴백
  }

  const barWidth = maxUsage > 0 ? (entry.usagePercent / maxUsage) * 100 : 0;

  const content = (
    <>
      <span className="w-6 text-right text-sm font-bold tabular-nums text-text-muted sm:w-8">
        {entry.rank}
      </span>
      <div className="relative h-10 w-10 flex-shrink-0 sm:h-12 sm:w-12">
        {pokemon && <PixelSprite pokemon={pokemon} alt="" fill />}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate font-bold">{nameKo}</span>
          {/* Below sm the Korean name needs the whole line; the English name
              stays in the accessible text only. */}
          <span className="hidden truncate text-xs text-neutral-500 sm:block">{nameEn}</span>
          <span className="sr-only sm:hidden">{nameEn}</span>
        </div>
        <div className="flex flex-wrap items-center gap-1 whitespace-nowrap">
          {types.map((t) => (
            <TypeBadge key={t} type={t} size="sm" />
          ))}
        </div>
      </div>
      {/* Below sm the bar + percent wrap onto their own full-width line. */}
      <div className="flex w-full flex-shrink-0 items-center gap-2 sm:w-32 sm:flex-col sm:items-stretch sm:gap-1">
        <div className="flex-1 overflow-hidden rounded-full bg-neutral-300 dark:bg-neutral-600 sm:flex-none">
          <div
            className="h-2 rounded-full bg-blue-500"
            style={{ width: `${barWidth}%` }}
          />
        </div>
        <span className="text-right text-xs font-semibold tabular-nums text-blue-600 dark:text-blue-400">
          {entry.usagePercent.toFixed(2)}%
        </span>
      </div>
    </>
  );

  // 이름 조회에 실패하면 id가 nameEn으로 폴백된 상태 — 실제 상세 페이지가
  // 없을 가능성이 높으므로 링크 대신 일반 행으로 표시
  if (!pokemon) {
    return (
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-none px-2 py-2 sm:flex-nowrap sm:gap-x-4 sm:px-4">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={`/pokemon/${id}`}
      className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-none px-2 py-2 sm:flex-nowrap sm:gap-x-4 sm:px-4 transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-700"
    >
      {content}
    </Link>
  );
}

export default async function UsageRankingTable({
  ranking,
}: {
  ranking: UsageRankEntry[];
}) {
  if (!ranking.length) {
    return <p className="text-center text-sm text-neutral-500">데이터 없음</p>;
  }

  const maxUsage = ranking[0]?.usagePercent ?? 1;

  return (
    <ol className="flex list-none flex-col divide-y divide-neutral-200 dark:divide-neutral-700">
      {ranking.map((entry) => (
        <li key={entry.nameEn}>
          <RankRow entry={entry} maxUsage={maxUsage} />
        </li>
      ))}
    </ol>
  );
}
