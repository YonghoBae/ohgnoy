import localFont from "next/font/local";
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

// Real Pokémon type colors — keep as-is (docs/design/pixel-theme-unification.md).
const TYPE_COLORS: Record<PokemonTypeName, string> = {
  normal:   "#A8A878",
  fire:     "#F08030",
  water:    "#6890F0",
  electric: "#F8D030",
  grass:    "#78C850",
  ice:      "#98D8D8",
  fighting: "#C03028",
  poison:   "#A040A0",
  ground:   "#E0C068",
  flying:   "#A890F0",
  psychic:  "#F85888",
  bug:      "#A8B820",
  rock:     "#B8A038",
  ghost:    "#705898",
  dragon:   "#7038F8",
  dark:     "#705848",
  steel:    "#B8B8D0",
  fairy:    "#EE99AC",
};

// Galmuri (OFL) at its native pixel sizes: Galmuri9 is drawn for 10px,
// Galmuri11 for 12px. ponytail: subset to the 18 type names only (~1.6KB each
// vs 430KB/167KB full); re-run pyftsubset with more --text if reused elsewhere.
const galmuri9 = localFont({
  src: "./fonts/galmuri9-types.woff2",
  display: "swap",
});
const galmuri11Bold = localFont({
  src: "./fonts/galmuri11-bold-types.woff2",
  weight: "700",
  display: "swap",
});

// Gen 5 / Showdown badge: same-hue dark 1px border, white text with a gray
// 1px shadow right, below and diagonal (the L-shape the BW sprites use).
export default function TypeBadge({
  type,
  size = "md",
}: {
  type: PokemonTypeName;
  size?: "sm" | "md";
}) {
  const sizeClass =
    size === "sm"
      ? `${galmuri9.className} px-2 py-0.5 text-[10px]`
      : `${galmuri11Bold.className} px-3 py-1 text-xs font-bold`;
  const color = TYPE_COLORS[type];
  return (
    <span
      className={`rounded-none border text-white [text-shadow:1px_0_0_#525252,0_1px_0_#525252,1px_1px_0_#525252] ${sizeClass}`}
      style={{
        backgroundColor: color,
        borderColor: `color-mix(in srgb, ${color} 45%, #000)`,
      }}
    >
      {TYPE_KO[type]}
    </span>
  );
}
