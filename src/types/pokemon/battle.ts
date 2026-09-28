export interface BattleSetMoves {
  move1: string | string[];
  move2: string | string[];
  move3: string | string[];
  move4: string | string[];
}

export interface BattleSet {
  name: string;         // 세트 이름 (e.g. "Offensive Utility")
  moves: (string | string[])[];
  item: string | string[];
  ability?: string | string[];
  nature?: string;
  evs?: Partial<Record<"hp" | "atk" | "def" | "spa" | "spd" | "spe", number>>;
  teratypes?: string[];
}

export interface UsageStat {
  nameEn: string;
  usagePercent: number;
  rawCount: number;
  // 아래 분포는 모두 퍼센트(0~100)
  abilities: Record<string, number>;
  items: Record<string, number>;
  moves: Record<string, number>;
  spreads: Record<string, number>;
  teammates: Record<string, number>;
  // n: 맞붙은 수, p: 이 포켓몬이 쓰러지거나 교체된 비율(0~1), d: 표준편차
  counters: Record<string, { n: number; p: number; d: number }>;
  teraTypes?: Record<string, number>;
}

export interface PokemonBattleData {
  format: string;
  month: string;
  usage: UsageStat | null;
  sets: BattleSet[];
  // labelKey(kind, 영어 이름) → 한국어. 영어 값은 Showdown 내보내기용으로 그대로 둔다.
  labels: Record<string, string>;
}

export type LabelKind = "items" | "moves" | "abilities" | "natures" | "types" | "pokemon";

// Smogon id: "Choice Specs" → "choicespecs"
export const toID = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// 종류를 붙이는 이유: 기술 Psychic(사이코키네시스)과 타입 Psychic(에스퍼),
// 아이템/기술 Metronome처럼 id가 겹친다.
export const labelKey = (kind: LabelKind, name: string) => `${kind}:${toID(name)}`;

export const labelOf = (
  labels: Record<string, string> | undefined,
  kind: LabelKind,
  name: string
) => labels?.[labelKey(kind, name)] ?? name;
