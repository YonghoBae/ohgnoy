import Image from "next/image";
import { PokemonDetail } from "@/types/pokemon/domain";
import TypeBadge from "@/app/_components/TypeBadge";

export default function PokemonHeader({ pokemon }: { pokemon: PokemonDetail }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
        #{String(pokemon.id).padStart(4, "0")}
      </span>
      <h1 className="text-3xl font-extrabold tracking-tight">
        {pokemon.nameKo || pokemon.nameEn.toUpperCase()}
      </h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        {pokemon.nameEn.toUpperCase()}
      </p>
      <div className="relative h-56 w-56">
        <Image
          src={pokemon.spriteUrl}
          alt={pokemon.nameEn}
          fill
          className="object-contain drop-shadow-lg"
          priority
        />
      </div>
      <div className="flex flex-row gap-2">
        {pokemon.types.map((type) => (
          <TypeBadge key={type} type={type} />
        ))}
      </div>
    </div>
  );
}
