import { PokemonDetail } from "@/types/pokemon/domain";
import PixelCard from "@/app/_components/ui/pixel/PixelCard";

const numberFormat = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 1 });

export default function PokemonInfo({ pokemon }: { pokemon: PokemonDetail }) {
  const heightM = numberFormat.format(pokemon.height / 10);
  const weightKg = numberFormat.format(pokemon.weight / 10);

  return (
    <PixelCard className="flex flex-col gap-4 p-5">
      <h2 className="font-pixel text-xs">기본 정보</h2>
      <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
        {pokemon.descriptionKo || pokemon.descriptionEn}
      </p>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex flex-col">
          <span className="text-xs text-text-muted">분류</span>
          <span className="font-semibold">{pokemon.genus}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-text-muted">키</span>
          <span className="font-semibold">{heightM}&nbsp;m</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-text-muted">몸무게</span>
          <span className="font-semibold">{weightKg}&nbsp;kg</span>
        </div>
      </div>
    </PixelCard>
  );
}
