import type { ChainLink } from "pokenode-ts";
import type { EvolutionNode } from "@/types/pokemon/domain";
import { koLabel, koPokemon } from "@/lib/battle/koNames";

type Kind = "items" | "moves" | "types";

// PokeAPI now returns more fields than pokenode-ts declares (used_move,
// min_steps, condition_expression, …), so read the detail loosely.
type Detail = Record<string, unknown>;
type Named = { name: string } | null | undefined;

const GENERIC = "특수 조건";
const MAX_CONDITIONS = 4;

// Korean or a generic word, never the English slug.
function ko(kind: Kind, res: Named, fallback: string): string {
  if (!res) return fallback;
  const label = koLabel(kind, res.name);
  return label === res.name ? fallback : label;
}

function koSpecies(res: Named): string {
  return (res && koPokemon(res.name)?.ko) || "특정 포켓몬";
}

const TIME: Record<string, string> = {
  day: "낮",
  night: "밤",
  dusk: "황혼",
  "full-moon": "보름달",
};

const TRIGGER: Record<string, string> = {
  trade: "통신교환",
  spin: "제자리 회전",
  shed: "빈자리와 몬스터볼",
  "tower-of-darkness": "악의 탑 수행",
  "tower-of-waters": "물의 탑 수행",
  "three-critical-hits": "한 배틀에서 급소 3회",
  "take-damage": "데미지를 받은 뒤",
  "recoil-damage": "반동 데미지 누적",
  "three-defeated-bisharp": "절각참 3마리 쓰러뜨리기",
  "meltan-candies": "멜탄 사탕 400개",
  "gimmighoul-coins": "모으령의 코인 999개",
};

// Fields that are bookkeeping (which game/form), or are read by the base phrase.
const IGNORED = new Set([
  "trigger", "version_group", "is_default", "region",
  "required_pokemon_form", "evolved_pokemon_form", "near_special_rock",
  "min_level", "item", "used_move", "min_move_count", "min_damage_taken",
]);

function base(d: Detail): string {
  const trigger = (d.trigger as Named)?.name ?? "";
  const move = d.used_move as Named;
  if (move) {
    const count = d.min_move_count ? ` ${d.min_move_count}회` : "";
    return `${ko("moves", move, "특정 기술")}${count} 사용`;
  }
  if (trigger === "level-up" || trigger === "in-battle-level-up") {
    return d.min_level ? `Lv.${d.min_level}` : "레벨업";
  }
  if (trigger === "use-item") {
    return `${ko("items", d.item as Named, "특정 도구")} 사용`;
  }
  if (d.min_damage_taken) {
    const kind = trigger === "recoil-damage" ? "반동 데미지" : "데미지";
    return `${kind} ${d.min_damage_taken} 이상 받은 뒤`;
  }
  return TRIGGER[trigger] ?? GENERIC;
}

function extra(key: string, value: unknown): string {
  const res = value as Named;
  switch (key) {
    case "min_happiness":
    case "min_affection":
      return "친밀도 높음";
    case "min_beauty":
      return "아름다움 높음";
    case "time_of_day":
      return TIME[String(value).toLowerCase()] ?? GENERIC;
    case "held_item":
      return `${ko("items", res, "특정 도구")} 지닌 상태`;
    case "known_move":
      return `${ko("moves", res, "특정")} 기술을 배운 상태`;
    case "known_move_type":
      return `${ko("types", res, "특정")} 타입 기술을 배운 상태`;
    case "location":
      return "특정 장소";
    case "gender":
      return value === 1 ? "암컷" : value === 2 ? "수컷" : GENERIC;
    case "relative_physical_stats":
      return value === 1 ? "공격 > 방어" : value === -1 ? "공격 < 방어" : "공격 = 방어";
    case "party_species":
      return `파티에 ${koSpecies(res)}`;
    case "party_type":
      return `파티에 ${ko("types", res, "특정")} 타입`;
    case "trade_species":
      return `교환 상대 ${koSpecies(res)}`;
    case "needs_overworld_rain":
      return "비 오는 날씨";
    case "turn_upside_down":
      return "기기를 거꾸로";
    case "min_steps":
      return `함께 ${value}걸음`;
    case "needs_multiplayer":
      return "유니온서클";
    case "allowed_natures":
      return "특정 성격";
    case "condition_expression": {
      const pct = (value as { percentage_chance?: number }).percentage_chance;
      return pct ? `확률 ${pct}%` : GENERIC;
    }
    default:
      return GENERIC;
  }
}

// One phrase per evolution_details entry: "Lv.36", "천둥의돌 사용",
// "레벨업 (친밀도 높음, 밤)". Unknown triggers/fields → "특수 조건".
function formatEvolutionDetail(d: Detail): string {
  const extras = Object.entries(d)
    .filter(
      ([k, v]) =>
        !IGNORED.has(k) &&
        v !== null && v !== false && v !== "" &&
        !(Array.isArray(v) && v.length === 0),
    )
    .map(([k, v]) => extra(k, v));
  const unique = Array.from(new Set(extras));
  return unique.length ? `${base(d)} (${unique.join(", ")})` : base(d);
}

function extractSpeciesId(url: string): number {
  const parts = url.split("/").filter(Boolean);
  return Number(parts[parts.length - 1]);
}

function parseChainLink(link: ChainLink): EvolutionNode {
  const details = link.evolution_details as unknown as Detail[];
  let conditions = Array.from(new Set(details.map(formatEvolutionDetail)));
  // Alcremie: 21 sweet × time variants of one species. Keep the trigger only.
  if (conditions.length > MAX_CONDITIONS) {
    conditions = Array.from(
      new Set(details.map((d) => `${base(d)} (모습마다 조건 다름)`)),
    );
  }
  return {
    speciesId: extractSpeciesId(link.species.url),
    speciesName: link.species.name,
    conditions,
    nextEvolutions: link.evolves_to.map(parseChainLink),
  };
}

export function toEvolutionChain(chain: ChainLink): EvolutionNode {
  return parseChainLink(chain);
}
