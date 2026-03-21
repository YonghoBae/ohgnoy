export type PokemonTypeName =
  | "normal" | "fire" | "water" | "electric" | "grass"
  | "ice" | "fighting" | "poison" | "ground" | "flying"
  | "psychic" | "bug" | "rock" | "ghost" | "dragon"
  | "dark" | "steel" | "fairy";

export interface PokemonSummary {
  id: number;
  nameEn: string;
  nameKo: string;
  types: PokemonTypeName[];
  spriteUrl: string;
}

export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export interface PokemonMove {
  id: number;
  nameEn: string;
  nameKo: string;
  type: PokemonTypeName;
  category: "physical" | "special" | "status";
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  levelLearnedAt?: number;
}

export interface EvolutionNode {
  speciesId: number;
  speciesName: string;
  minLevel?: number;
  trigger?: string;
  item?: string;
  nextEvolutions: EvolutionNode[];
}

export interface PokemonDetail extends PokemonSummary {
  height: number;
  weight: number;
  genus: string;
  descriptionKo: string;
  descriptionEn: string;
  stats: PokemonStats;
  evolutionChain: EvolutionNode;
  levelUpMoves: PokemonMove[];
  tmMoves: PokemonMove[];
}
