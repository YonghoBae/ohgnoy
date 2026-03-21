import { PokemonTypeName } from "@/types/pokemon/domain";

const TYPE_KO: Record<PokemonTypeName, string> = {
  normal:   "노말",
  fire:     "불꽃",
  water:    "물",
  electric: "전기",
  grass:    "풀",
  ice:      "얼음",
  fighting: "격투",
  poison:   "독",
  ground:   "땅",
  flying:   "비행",
  psychic:  "에스퍼",
  bug:      "벌레",
  rock:     "바위",
  ghost:    "고스트",
  dragon:   "드래곤",
  dark:     "악",
  steel:    "강철",
  fairy:    "페어리",
};

const TYPE_COLORS: Record<PokemonTypeName, string> = {
  normal:   "bg-[#A8A878] text-white",
  fire:     "bg-[#F08030] text-white",
  water:    "bg-[#6890F0] text-white",
  electric: "bg-[#F8D030] text-neutral-800",
  grass:    "bg-[#78C850] text-white",
  ice:      "bg-[#98D8D8] text-neutral-800",
  fighting: "bg-[#C03028] text-white",
  poison:   "bg-[#A040A0] text-white",
  ground:   "bg-[#E0C068] text-neutral-800",
  flying:   "bg-[#A890F0] text-white",
  psychic:  "bg-[#F85888] text-white",
  bug:      "bg-[#A8B820] text-white",
  rock:     "bg-[#B8A038] text-white",
  ghost:    "bg-[#705898] text-white",
  dragon:   "bg-[#7038F8] text-white",
  dark:     "bg-[#705848] text-white",
  steel:    "bg-[#B8B8D0] text-neutral-800",
  fairy:    "bg-[#EE99AC] text-white",
};

export default function TypeBadge({
  type,
  size = "md",
}: {
  type: PokemonTypeName;
  size?: "sm" | "md";
}) {
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";
  return (
    <span
      className={`rounded-full font-semibold uppercase tracking-wide ${sizeClass} ${TYPE_COLORS[type]}`}
    >
      {TYPE_KO[type]}
    </span>
  );
}
