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
  abilities: Record<string, number>;
  items: Record<string, number>;
  moves: Record<string, number>;
  spreads: Record<string, number>;
  teammates: Record<string, number>;
  counters: Record<string, [number, number]>; // [score, stddev]
  teraTypes?: Record<string, number>;
}

export interface PokemonBattleData {
  format: string;
  month: string;
  usage: UsageStat | null;
  sets: BattleSet[];
}
