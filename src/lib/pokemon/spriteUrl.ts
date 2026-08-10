import { Pokemon } from "pokenode-ts";

export function getPixelSpriteUrl(pokemon: Pick<Pokemon, "sprites">): string {
  return (
    pokemon.sprites.front_default ??
    pokemon.sprites.other?.["official-artwork"].front_default ??
    ""
  );
}
