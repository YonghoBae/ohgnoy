import { PokemonTypeName } from "./domain";

export interface PokemonFilter {
  generation: number;
  types: PokemonTypeName[];
  searchQuery: string;
}

export interface FilterParams {
  gen?: string;
  types?: string;
  q?: string;
}
