import { notFound } from "next/navigation";
import { fetchPokemon } from "@/lib/pokemon/fetchers/fetchPokemon";
import { fetchSpecies } from "@/lib/pokemon/fetchers/fetchSpecies";
import { extractEvolutionChainId, fetchEvolutionChain } from "@/lib/pokemon/fetchers/fetchEvolutionChain";
import { extractMoveIdsWithLearnInfo, MoveWithLearnInfo } from "@/lib/pokemon/transformers/toMoveList";
import { fetchMove } from "@/lib/pokemon/fetchers/fetchMove";
import { toPokemonDetail } from "@/lib/pokemon/transformers/toPokemonDetail";
import { fetchPokemonBattleData } from "@/lib/battle/fetchers/fetchBattleData";
import { DEFAULT_FORMAT } from "@/lib/battle/constants";
import PokemonHeader from "./_components/PokemonHeader";
import PokemonInfo from "./_components/PokemonInfo";
import PokemonStatsSection from "./_components/PokemonStats";
import EvolutionChainSection from "./_components/EvolutionChain";
import PokemonDetailTabs from "./_components/PokemonDetailTabs";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PokemonDetailPage({ params }: Props) {
  const { id } = await params;
  const idOrName = isNaN(Number(id)) ? id : Number(id);

  try {
    const pokemon = await fetchPokemon(idOrName);
    const species = await fetchSpecies(pokemon.id);

    const evolutionChainId = extractEvolutionChainId(species.evolution_chain.url);
    const moveInfoList = extractMoveIdsWithLearnInfo(pokemon);

    const [evolutionChain, moves, battleData] = await Promise.all([
      fetchEvolutionChain(evolutionChainId),
      Promise.all(moveInfoList.map(({ id }) => fetchMove(id))),
      fetchPokemonBattleData(pokemon.name, DEFAULT_FORMAT),
    ]);

    const movesWithInfo: MoveWithLearnInfo[] = moveInfoList.map((info, i) => ({
      move: moves[i],
      learnMethod: info.learnMethod,
      levelLearnedAt: info.levelLearnedAt,
    }));

    const detail = toPokemonDetail(pokemon, species, evolutionChain, movesWithInfo);

    // 서버 컴포넌트(EvolutionChain 포함)를 children으로 전달
    const infoContent = (
      <>
        <PokemonInfo pokemon={detail} />
        <PokemonStatsSection stats={detail.stats} />
        <EvolutionChainSection chain={detail.evolutionChain} />
      </>
    );

    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
        <PokemonHeader pokemon={detail} />
        <PokemonDetailTabs
          infoContent={infoContent}
          levelUpMoves={detail.levelUpMoves}
          tmMoves={detail.tmMoves}
          battleData={battleData}
          pokemonName={pokemon.name}
        />
      </div>
    );
  } catch {
    notFound();
  }
}
