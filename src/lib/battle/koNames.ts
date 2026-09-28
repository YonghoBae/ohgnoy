// 서버 전용: JSON(약 180KB)을 클라이언트 번들에 넣지 않는다. 클라이언트는
// PokemonBattleData.labels를 쓴다. 재생성: node scripts/build-ko-names.mjs
import data from "./koNames.json";
import { LabelKind, toID } from "@/types/pokemon/battle";

export { toID };

type NameKind = Exclude<LabelKind, "pokemon">;

const names = data as unknown as Record<NameKind, Record<string, string>> & {
  pokemon: Record<string, { slug: string; ko: string }>;
};

export const koLabel = (kind: NameKind, nameOrId: string) =>
  names[kind][toID(nameOrId)] ?? nameOrId;

export const koPokemon = (smogonName: string) =>
  names.pokemon[toID(smogonName)] ?? null;
