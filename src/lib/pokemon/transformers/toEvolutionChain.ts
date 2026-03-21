import { ChainLink } from "pokenode-ts";
import { EvolutionNode } from "@/types/pokemon/domain";

function extractSpeciesId(url: string): number {
  const parts = url.split("/").filter(Boolean);
  return Number(parts[parts.length - 1]);
}

function parseChainLink(link: ChainLink): EvolutionNode {
  const evolutionDetail = link.evolution_details[0];
  return {
    speciesId: extractSpeciesId(link.species.url),
    speciesName: link.species.name,
    minLevel: evolutionDetail?.min_level ?? undefined,
    trigger: evolutionDetail?.trigger?.name ?? undefined,
    item: evolutionDetail?.item?.name ?? undefined,
    nextEvolutions: link.evolves_to.map(parseChainLink),
  };
}

export function toEvolutionChain(chain: ChainLink): EvolutionNode {
  return parseChainLink(chain);
}
