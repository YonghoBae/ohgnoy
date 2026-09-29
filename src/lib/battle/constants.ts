export interface FormatOption {
  id: string;
  label: string;
  desc: string;
  gen: number;
  // official: 게임 공식 규칙(랭크배틀·VGC). smogon: 쇼다운 팬 등급전, 접어서 보여 준다.
  group: "official" | "smogon";
}

export const FORMATS: FormatOption[] = [
  { id: "gen9championsbssregmb", label: "싱글 랭크배틀", desc: "게임 공식 규칙 싱글배틀 · 레귤레이션 M-B", gen: 9, group: "official" },
  { id: "gen9championsvgc2026regmb", label: "더블 랭크배틀", desc: "공식 대회(VGC 2026) 규칙 더블배틀 · 레귤레이션 M-B", gen: 9, group: "official" },
  { id: "gen9ou",        label: "9세대 OU",      desc: "쇼다운 표준 싱글 규칙. 너무 강한 포켓몬은 금지", gen: 9, group: "smogon" },
  { id: "gen9ubers",     label: "9세대 Ubers",   desc: "전설 포켓몬까지 허용하는 싱글 규칙", gen: 9, group: "smogon" },
  { id: "gen9uu",        label: "9세대 UU",      desc: "OU 아래 등급. OU에서 많이 쓰는 포켓몬은 금지", gen: 9, group: "smogon" },
  { id: "gen9ru",        label: "9세대 RU",      desc: "UU 아래 등급", gen: 9, group: "smogon" },
  { id: "gen9nu",        label: "9세대 NU",      desc: "RU 아래 등급", gen: 9, group: "smogon" },
  { id: "gen9doublesou", label: "9세대 더블 OU", desc: "쇼다운 표준 더블 규칙", gen: 9, group: "smogon" },
  { id: "gen8ou",        label: "8세대 OU",      desc: "소드·실드 시절 쇼다운 표준 싱글 규칙", gen: 8, group: "smogon" },
  { id: "gen7ou",        label: "7세대 OU",      desc: "썬·문 시절 쇼다운 표준 싱글 규칙", gen: 7, group: "smogon" },
];

export const DEFAULT_FORMAT = "gen9championsbssregmb";

// 포맷별 cutoff. Smogon은 0/1500/1630/1760(주요 포맷은 1695도)만 공개한다.
export const CUTOFF_BY_FORMAT: Record<string, number> = {
  // 싱글 랭크배틀은 표본이 작아(2026-08 약 6.7만 배틀) 1630이면 가중치의
  // 13%만 남는다. 1500은 68%.
  gen9championsbssregmb: 1500,
  gen9championsvgc2026regmb: 1630,
  gen9ou:          1695,
  gen9ubers:       1630,
  gen9uu:          1630,
  gen9ru:          1630,
  gen9nu:          1630,
  gen9doublesou:   1695,
  gen8ou:          1630,
  gen7ou:          1630,
};
