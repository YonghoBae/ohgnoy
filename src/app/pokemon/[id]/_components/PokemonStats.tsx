import { PokemonStats } from "@/types/pokemon/domain";

const STAT_LABELS: Record<keyof PokemonStats, string> = {
  hp: "HP",
  attack: "공격",
  defense: "방어",
  specialAttack: "특공",
  specialDefense: "특방",
  speed: "스피드",
};

const MAX_STAT = 255;

function StatBar({ label, value }: { label: string; value: number }) {
  const percent = Math.min((value / MAX_STAT) * 100, 100);
  const color =
    value >= 100
      ? "bg-green-500"
      : value >= 60
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <div className="flex items-center gap-3">
      <span className="w-14 text-right text-xs font-semibold text-neutral-500 dark:text-neutral-400">
        {label}
      </span>
      <span className="w-8 text-right text-sm font-bold">{value}</span>
      <div className="flex-1 overflow-hidden rounded-full bg-neutral-300 dark:bg-neutral-600">
        <div
          className={`h-2 rounded-full ${color} transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default function PokemonStatsSection({ stats }: { stats: PokemonStats }) {
  const total = Object.values(stats).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-neutral-200 bg-opacity-50 p-5 dark:bg-neutral-700 dark:bg-opacity-50">
      <h2 className="text-lg font-bold">기본 스탯</h2>
      <div className="flex flex-col gap-2">
        {(Object.entries(stats) as [keyof PokemonStats, number][]).map(([key, value]) => (
          <StatBar key={key} label={STAT_LABELS[key]} value={value} />
        ))}
        <div className="mt-1 flex items-center gap-3 border-t border-neutral-300 pt-2 dark:border-neutral-600">
          <span className="w-14 text-right text-xs font-semibold text-neutral-500 dark:text-neutral-400">
            합계
          </span>
          <span className="text-sm font-bold">{total}</span>
        </div>
      </div>
    </div>
  );
}
