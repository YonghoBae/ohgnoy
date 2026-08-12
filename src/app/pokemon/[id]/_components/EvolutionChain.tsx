import Link from "next/link";
import { EvolutionNode } from "@/types/pokemon/domain";
import { fetchPokemon } from "@/lib/pokemon/fetchers/fetchPokemon";
import { fetchSpecies } from "@/lib/pokemon/fetchers/fetchSpecies";
import PixelCard from "@/app/_components/ui/pixel/PixelCard";
import PixelSprite, { getPixelSpriteUrl } from "@/app/_components/ui/pixel/PixelSprite";

async function EvolutionNodeCard({ node }: { node: EvolutionNode }) {
  let spriteUrl = "";
  let koName = node.speciesName;
  try {
    const [pokemon, species] = await Promise.all([
      fetchPokemon(node.speciesId),
      fetchSpecies(node.speciesId),
    ]);
    spriteUrl = getPixelSpriteUrl(pokemon);
    const ko = species.names.find((n) => n.language.name === "ko");
    if (ko) koName = ko.name;
  } catch {
    // 이미지/이름 없으면 기본값 유지
  }

  return (
    <Link
      href={`/pokemon/${node.speciesId}`}
      className="flex flex-col items-center gap-1 rounded-xl p-2 transition-all hover:bg-neutral-200 dark:hover:bg-neutral-600"
    >
      {spriteUrl && (
        <div className="relative h-20 w-20">
          <PixelSprite spriteUrl={spriteUrl} alt={koName} fill />
        </div>
      )}
      <span className="text-xs font-semibold">{koName}</span>
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
    <PixelCard className="flex flex-col gap-3 p-5">
      <h2 className="font-pixel text-xs">진화</h2>
      <div className="flex flex-row flex-wrap items-center justify-center">
        {renderChain(chain)}
      </div>
    </PixelCard>
  );
}
