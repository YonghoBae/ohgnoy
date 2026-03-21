import { PokemonTypeName } from "@/types/pokemon/domain";

// 공격 타입 → 방어 타입 배율 (2x 약점만 명시, 나머지 1x)
// 0: 무효, 0.5: 반감, 2: 약점
const CHART: Record<PokemonTypeName, Partial<Record<PokemonTypeName, number>>> = {
  normal:   { rock: 0.5, ghost: 0, steel: 0.5 },
  fire:     { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water:    { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass:    { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice:      { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, rock: 2, bug: 0.5, ghost: 0, steel: 2, psychic: 0.5, flying: 0.5, dark: 2, fairy: 0.5 },
  poison:   { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground:   { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying:   { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5, ground: 0 },
  psychic:  { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug:      { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock:     { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost:    { normal: 0, fighting: 0, poison: 0.5, bug: 0.5, ghost: 2, dark: 0.5 },
  dragon:   { dragon: 2, steel: 0.5, fairy: 0 },
  dark:     { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel:    { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, poison: 0, grass: 0.5, psychic: 0.5, bug: 0.5, dragon: 0.5, dark: 0.5, fairy: 2, normal: 0.5, flying: 0.5, fighting: 2, ground: 2 },
  fairy:    { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5, bug: 0.5 },
};

export const ALL_TYPES: PokemonTypeName[] = [
  "normal", "fire", "water", "electric", "grass", "ice",
  "fighting", "poison", "ground", "flying", "psychic", "bug",
  "rock", "ghost", "dragon", "dark", "steel", "fairy",
];

// 특정 포켓몬 타입 조합에 대한 각 공격 타입의 배율 계산
export function calcDefenseMultipliers(
  defenderTypes: PokemonTypeName[]
): Record<PokemonTypeName, number> {
  const result = {} as Record<PokemonTypeName, number>;
  for (const atkType of ALL_TYPES) {
    let multiplier = 1;
    for (const defType of defenderTypes) {
      multiplier *= CHART[atkType]?.[defType] ?? 1;
    }
    result[atkType] = multiplier;
  }
  return result;
}

// 팀 전체 약점 집계: 각 타입에 몇 마리가 약점인지
export function calcTeamWeaknesses(
  teamTypes: PokemonTypeName[][]
): Record<PokemonTypeName, number> {
  const counts = {} as Record<PokemonTypeName, number>;
  for (const t of ALL_TYPES) counts[t] = 0;

  for (const types of teamTypes) {
    const mults = calcDefenseMultipliers(types);
    for (const atkType of ALL_TYPES) {
      if ((mults[atkType] ?? 1) >= 2) counts[atkType]!++;
    }
  }
  return counts;
}
