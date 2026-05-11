import { fetchAllPokemonNames, fetchPokemonBatch } from "@/lib/pokemon/fetchers/fetchPokemon";
import { fetchGenerationIds, fetchGenerationList } from "@/lib/pokemon/fetchers/fetchGeneration";
import { extractKoNames, fetchSpeciesBatch } from "@/lib/pokemon/fetchers/fetchSpecies";
import PokemonGrid from "./_components/PokemonGrid";

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ gen?: string }>;
}

export default async function PokemonListPage({ searchParams }: Props) {
  const { gen: genParam } = await searchParams;
  const gen = Math.max(1, Number(genParam ?? "1"));

  const [generationList, ids, allNames] = await Promise.all([
    fetchGenerationList(),
    fetchGenerationIds(gen),
    fetchAllPokemonNames(),
  ]);

  const [pokemons, speciesList] = await Promise.all([
    fetchPokemonBatch(ids),
    fetchSpeciesBatch(ids),
  ]);

  const koNames = extractKoNames(speciesList);
  const generations = generationList.results.map((g) => g.name);

  return (
    <PokemonGrid
      pokemons={pokemons}
      generations={generations}
      currentGen={gen}
      allNames={allNames}
      koNames={koNames}
    />
  );
}
