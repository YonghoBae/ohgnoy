import { fetchAllPokemonNames, fetchPokemonBatch } from "@/lib/pokemon/fetchers/fetchPokemon";
import { fetchGenerationIds, fetchGenerationList } from "@/lib/pokemon/fetchers/fetchGeneration";
import { extractKoNames, fetchSpeciesBatch } from "@/lib/pokemon/fetchers/fetchSpecies";
import PokemonGrid from "./_components/PokemonGrid";

interface Props {
  searchParams: { gen?: string };
}

export default async function PokemonListPage({ searchParams }: Props) {
  const gen = Math.max(1, Number(searchParams.gen ?? "1"));

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
