export interface FormatOption {
  id: string;
  label: string;
  gen: number;
}

export const FORMATS: FormatOption[] = [
  { id: "gen9ou",        label: "Gen 9 OU",          gen: 9 },
  { id: "gen9ubers",     label: "Gen 9 Ubers",        gen: 9 },
  { id: "gen9uu",        label: "Gen 9 UU",           gen: 9 },
  { id: "gen9ru",        label: "Gen 9 RU",           gen: 9 },
  { id: "gen9nu",        label: "Gen 9 NU",           gen: 9 },
  { id: "gen9doublesou", label: "Gen 9 Doubles OU",   gen: 9 },
  { id: "gen9vgc2024regg", label: "Gen 9 VGC 2024",  gen: 9 },
  { id: "gen8ou",        label: "Gen 8 OU",           gen: 8 },
  { id: "gen7ou",        label: "Gen 7 OU",           gen: 7 },
];

export const DEFAULT_FORMAT = "gen9ou";

// Gen 9 OU cutoff
export const CUTOFF_BY_FORMAT: Record<string, number> = {
  gen9ou:          1695,
  gen9ubers:       1695,
  gen9uu:          1630,
  gen9ru:          1630,
  gen9nu:          1630,
  gen9doublesou:   1695,
  gen9vgc2024regg: 1695,
  gen8ou:          1695,
  gen7ou:          1695,
};
