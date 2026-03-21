import { notFound } from "next/navigation";
import { fetchPokemon } from "@/lib/pokemon/fetchers/fetchPokemon";
import { fetchSpecies } from "@/lib/pokemon/fetchers/fetchSpecies";
import { extractEvolutionChainId, fetchEvolutionChain } from "@/lib/pokemon/fetchers/fetchEvolutionChain";
import { extractMoveIdsWithLearnInfo, MoveWithLearnInfo } from "@/lib/pokemon/transformers/toMoveList";
import { fetchMove } from "@/lib/pokemon/fetchers/fetchMove";
import { toPokemonDetail } from "@/lib/pokemon/transformers/toPokemonDetail";
import { fetchUsageStats, getPokemonUsage } from "@/lib/battle/fetchers/fetchUsageStats";
import { fetchSets, getPokemonSets } from "@/lib/battle/fetchers/fetchSets";
import { PokemonBattleData } from "@/types/pokemon/battle";
import PokemonHeader from "./_components/PokemonHeader";
import PokemonInfo from "./_components/PokemonInfo";
import PokemonStatsSection from "./_components/PokemonStats";
import EvolutionChainSection from "./_components/EvolutionChain";
import PokemonDetailTabs from "./_components/PokemonDetailTabs";

const DEFAULT_FORMAT = "gen9ou";

interface Props {
  params: { id: string };
}

export default async function PokemonDetailPage({ params }: Props) {
  const idOrName = isNaN(Number(params.id)) ? params.id : Number(params.id);

  try {
    const pokemon = await fetchPokemon(idOrName);
    const species = await fetchSpecies(pokemon.id);

    const evolutionChainId = extractEvolutionChainId(species.evolution_chain.url);
    const moveInfoList = extractMoveIdsWithLearnInfo(pokemon);

    const [evolutionChain, moves, usageStatsMap, setsMap] = await Promise.all([
      fetchEvolutionChain(evolutionChainId),
      Promise.all(moveInfoList.map(({ id }) => fetchMove(id))),
      fetchUsageStats(DEFAULT_FORMAT),
      fetchSets(DEFAULT_FORMAT),
    ]);

    const movesWithInfo: MoveWithLearnInfo[] = moveInfoList.map((info, i) => ({
      move: moves[i],
      learnMethod: info.learnMethod,
      levelLearnedAt: info.levelLearnedAt,
    }));

    const detail = toPokemonDetail(pokemon, species, evolutionChain, movesWithInfo);

    const battleData: PokemonBattleData = {
      format: DEFAULT_FORMAT,
      month: new Date().toISOString().slice(0, 7),
      usage: usageStatsMap ? getPokemonUsage(usageStatsMap, pokemon.name) : null,
      sets: setsMap ? getPokemonSets(setsMap, pokemon.name) : [],
    };

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
        />
      </div>
    );
  } catch {
    notFound();
  }
}
