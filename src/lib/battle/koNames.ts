import "server-only";
// 서버 전용: JSON(약 200KB)을 클라이언트 번들에 넣지 않는다. 클라이언트는
// PokemonBattleData.labels를 쓴다. 재생성: node scripts/build-ko-names.mjs
import data from "./koNames.json";
import { LabelKind, toID } from "@/types/pokemon/battle";

export { toID };

type NameKind = Exclude<LabelKind, "pokemon">;

const names = data as unknown as Record<NameKind, Record<string, string>> & {
  pokemon: Record<string, { slug: string; ko: string; en: string }>;
  en: Record<EnKind, Record<string, string>>;
};

type EnKind = "items" | "moves" | "abilities";

export const koLabel = (kind: NameKind, nameOrId: string) =>
  names[kind][toID(nameOrId)] ?? nameOrId;

// Smogon 사용률은 id("focussash")만 준다. 세트에 넣을 영어 표시 이름.
export const enLabel = (kind: EnKind, nameOrId: string) =>
  names.en[kind][toID(nameOrId)] ?? nameOrId;

export const koPokemon = (smogonName: string) =>
  names.pokemon[toID(smogonName)] ?? null;
