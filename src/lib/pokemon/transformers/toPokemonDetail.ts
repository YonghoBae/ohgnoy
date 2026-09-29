import { EvolutionChain, Move, Pokemon, PokemonSpecies } from "pokenode-ts";
import { PokemonDetail, PokemonTypeName } from "@/types/pokemon/domain";
import { getPixelSpriteUrl } from "@/lib/pokemon/spriteUrl";
import {
  getEnglishFlavorText,
  getKoreanFlavorText,
  getKoreanGenus,
  PokemonNames,
} from "@/lib/pokemon/i18n";
import { toEvolutionChain } from "./toEvolutionChain";
import { MoveWithLearnInfo, toMoveList } from "./toMoveList";

export function toPokemonDetail(
  pokemon: Pokemon,
  species: PokemonSpecies,
  evolutionChain: EvolutionChain,
  movesWithInfo: MoveWithLearnInfo[],
  names: PokemonNames
): PokemonDetail {
  const stats = {
    hp: pokemon.stats.find((s) => s.stat.name === "hp")?.base_stat ?? 0,
    attack: pokemon.stats.find((s) => s.stat.name === "attack")?.base_stat ?? 0,
    defense: pokemon.stats.find((s) => s.stat.name === "defense")?.base_stat ?? 0,
    specialAttack: pokemon.stats.find((s) => s.stat.name === "special-attack")?.base_stat ?? 0,
    specialDefense: pokemon.stats.find((s) => s.stat.name === "special-defense")?.base_stat ?? 0,
    speed: pokemon.stats.find((s) => s.stat.name === "speed")?.base_stat ?? 0,
  };

  const { levelUpMoves, tmMoves } = toMoveList(movesWithInfo);

  return {
    id: pokemon.id,
    dexNumber: species.id,
    nameEn: names.en,
    nameKo: names.ko,
    types: pokemon.types.map((t) => t.type.name as PokemonTypeName),
    spriteUrl: getPixelSpriteUrl(pokemon),
    height: pokemon.height,
    weight: pokemon.weight,
    genus: getKoreanGenus(species),
    descriptionKo: getKoreanFlavorText(species),
    descriptionEn: getEnglishFlavorText(species),
    stats,
    evolutionChain: toEvolutionChain(evolutionChain.chain),
    levelUpMoves,
    tmMoves,
  };
}
