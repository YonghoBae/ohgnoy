import Image from "next/image";
import Link from "next/link";
import { EvolutionNode } from "@/types/pokemon/domain";
import { fetchPokemon } from "@/lib/pokemon/fetchers/fetchPokemon";

async function EvolutionNodeCard({ node }: { node: EvolutionNode }) {
  let spriteUrl = "";
  try {
    const pokemon = await fetchPokemon(node.speciesId);
    spriteUrl = pokemon.sprites.other?.["official-artwork"].front_default ?? "";
  } catch {
    // 이미지 없으면 빈칸
  }

  return (
    <Link
      href={`/pokemon/${node.speciesId}`}
      className="flex flex-col items-center gap-1 rounded-xl p-2 transition-all hover:bg-neutral-200 dark:hover:bg-neutral-600"
    >
      {spriteUrl && (
        <div className="relative h-20 w-20">
          <Image src={spriteUrl} alt={node.speciesName} fill className="object-contain" />
        </div>
      )}
      <span className="text-xs font-semibold capitalize">{node.speciesName}</span>
      {node.minLevel && (
        <span className="text-xs text-neutral-500">Lv. {node.minLevel}</span>
      )}
      {node.item && (
        <span className="text-xs text-neutral-500 capitalize">{node.item}</span>
      )}
    </Link>
  );
}

function EvolutionArrow() {
  return (
    <span className="mx-2 text-xl text-neutral-400 dark:text-neutral-500">→</span>
  );
}

function renderChain(node: EvolutionNode): React.ReactNode {
  if (node.nextEvolutions.length === 0) {
    return <EvolutionNodeCard node={node} />;
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex flex-row flex-wrap items-center justify-center">
        <EvolutionNodeCard node={node} />
        <EvolutionArrow />
        <div className="flex flex-col gap-2">
          {node.nextEvolutions.map((next) => (
            <div key={next.speciesId} className="flex flex-row items-center">
              {renderChain(next)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function EvolutionChainSection({ chain }: { chain: EvolutionNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-neutral-200 bg-opacity-50 p-5 dark:bg-neutral-700 dark:bg-opacity-50">
      <h2 className="text-lg font-bold">진화</h2>
      <div className="flex flex-row flex-wrap items-center justify-center">
        {renderChain(chain)}
      </div>
    </div>
  );
}
