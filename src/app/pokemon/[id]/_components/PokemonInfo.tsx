import { PokemonDetail } from "@/types/pokemon/domain";

export default function PokemonInfo({ pokemon }: { pokemon: PokemonDetail }) {
  const heightM = (pokemon.height / 10).toFixed(1);
  const weightKg = (pokemon.weight / 10).toFixed(1);

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-neutral-200 bg-opacity-50 p-5 dark:bg-neutral-700 dark:bg-opacity-50">
      <h2 className="text-lg font-bold">기본 정보</h2>
      <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
        {pokemon.descriptionKo || pokemon.descriptionEn}
      </p>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex flex-col">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">분류</span>
          <span className="font-semibold">{pokemon.genus}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">키</span>
          <span className="font-semibold">{heightM} m</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">몸무게</span>
          <span className="font-semibold">{weightKg} kg</span>
        </div>
      </div>
    </div>
  );
}
