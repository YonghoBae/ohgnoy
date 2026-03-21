import { notFound } from "next/navigation";
import { fetchPokemon } from "@/lib/pokemon/fetchers/fetchPokemon";
import { fetchSpecies } from "@/lib/pokemon/fetchers/fetchSpecies";
import {
  extractEvolutionChainId,
  fetchEvolutionChain,
} from "@/lib/pokemon/fetchers/fetchEvolutionChain";
import { fetchMoves } from "@/lib/pokemon/fetchers/fetchMove";
import { toPokemonDetail } from "@/lib/pokemon/transformers/toPokemonDetail";
import { extractMoveIdsWithLearnInfo, MoveWithLearnInfo } from "@/lib/pokemon/transformers/toMoveList";
import { fetchMove } from "@/lib/pokemon/fetchers/fetchMove";
import PokemonHeader from "./_components/PokemonHeader";
import PokemonInfo from "./_components/PokemonInfo";
import PokemonStatsSection from "./_components/PokemonStats";
import EvolutionChainSection from "./_components/EvolutionChain";
import MoveList from "./_components/MoveList";

interface Props {
  params: { id: string };
}

export default async function PokemonDetailPage({ params }: Props) {
  const idOrName = isNaN(Number(params.id)) ? params.id : Number(params.id);

  try {
    const pokemon = await fetchPokemon(idOrName);
    const species = await fetchSpecies(pokemon.id);

    const evolutionChainId = extractEvolutionChainId(species.evolution_chain.url);
    const evolutionChain = await fetchEvolutionChain(evolutionChainId);

    const moveInfoList = extractMoveIdsWithLearnInfo(pokemon);
    const moves = await Promise.all(
      moveInfoList.map(({ id }) => fetchMove(id))
    );
    const movesWithInfo: MoveWithLearnInfo[] = moveInfoList.map((info, i) => ({
      move: moves[i],
      learnMethod: info.learnMethod,
      levelLearnedAt: info.levelLearnedAt,
    }));

    const detail = toPokemonDetail(pokemon, species, evolutionChain, movesWithInfo);

    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
        <PokemonHeader pokemon={detail} />
        <PokemonInfo pokemon={detail} />
        <PokemonStatsSection stats={detail.stats} />
        <EvolutionChainSection chain={detail.evolutionChain} />
        <MoveList levelUpMoves={detail.levelUpMoves} tmMoves={detail.tmMoves} />
      </div>
    );
  } catch {
    notFound();
  }
}
