import PixelSprite from "@/app/_components/ui/pixel/PixelSprite";
import { PokemonDetail } from "@/types/pokemon/domain";
import TypeBadge from "@/app/_components/TypeBadge";

export default function PokemonHeader({ pokemon }: { pokemon: PokemonDetail }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="font-mono-pixel text-sm font-semibold text-text-muted">
        #{String(pokemon.dexNumber).padStart(4, "0")}
      </span>
      <h1 className="font-pixel text-lg tracking-tight">
        {pokemon.nameKo || pokemon.nameEn}
      </h1>
      <p className="text-sm text-text-muted">{pokemon.nameEn}</p>
      <div className="relative h-56 w-56">
        <PixelSprite spriteUrl={pokemon.spriteUrl} alt={pokemon.nameKo || pokemon.nameEn} fill priority />
      </div>
      <div className="flex flex-row gap-2">
        {pokemon.types.map((type) => (
          <TypeBadge key={type} type={type} />
        ))}
      </div>
    </div>
  );
}
