import Image from "next/image";
import Link from "next/link";
import { UsageRankEntry } from "@/lib/battle/fetchers/fetchUsageStats";
import { fetchPokemon } from "@/lib/pokemon/fetchers/fetchPokemon";
import { fetchSpecies } from "@/lib/pokemon/fetchers/fetchSpecies";
import { getKoreanName } from "@/lib/pokemon/i18n";
import TypeBadge from "@/app/_components/TypeBadge";
import { PokemonTypeName } from "@/types/pokemon/domain";

async function RankRow({
  entry,
  maxUsage,
}: {
  entry: UsageRankEntry;
  maxUsage: number;
}) {
  let spriteUrl = "";
  let nameKo = entry.nameEn;
  let types: PokemonTypeName[] = [];
  let id: number | string = entry.nameEn;

  try {
    const slug = entry.nameEn.toLowerCase().replace(/ /g, "-");
    const pokemon = await fetchPokemon(slug);
    id = pokemon.id;
    spriteUrl = pokemon.sprites.other?.["official-artwork"].front_default ?? "";
    types = pokemon.types.map((t) => t.type.name as PokemonTypeName);

    const species = await fetchSpecies(pokemon.id);
    nameKo = getKoreanName(species);
  } catch {
    // 데이터 없으면 영어 이름으로 폴백
  }

  const barWidth = maxUsage > 0 ? (entry.usagePercent / maxUsage) * 100 : 0;

  return (
    <Link
      href={`/pokemon/${id}`}
      className="flex items-center gap-4 rounded-xl px-4 py-2 transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-700"
    >
      <span className="w-8 text-right text-sm font-bold text-neutral-400">
        {entry.rank}
      </span>
      <div className="relative h-12 w-12 flex-shrink-0">
        {spriteUrl && (
          <Image src={spriteUrl} alt={entry.nameEn} fill className="object-contain" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold">{nameKo}</span>
          <span className="text-xs text-neutral-500">{entry.nameEn}</span>
        </div>
        <div className="flex items-center gap-1">
          {types.map((t) => (
            <TypeBadge key={t} type={t} size="sm" />
          ))}
        </div>
      </div>
      <div className="flex w-32 flex-shrink-0 flex-col gap-1">
        <div className="overflow-hidden rounded-full bg-neutral-300 dark:bg-neutral-600">
          <div
            className="h-2 rounded-full bg-blue-500"
            style={{ width: `${barWidth}%` }}
          />
        </div>
        <span className="text-right text-xs font-semibold text-blue-600 dark:text-blue-400">
          {entry.usagePercent.toFixed(2)}%
        </span>
      </div>
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
    <div className="flex flex-col divide-y divide-neutral-200 dark:divide-neutral-700">
      {ranking.map((entry) => (
        <RankRow key={entry.nameEn} entry={entry} maxUsage={maxUsage} />
      ))}
    </div>
  );
}
