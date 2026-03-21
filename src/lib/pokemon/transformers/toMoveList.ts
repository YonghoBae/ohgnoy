import { Move, Pokemon } from "pokenode-ts";
import { PokemonMove, PokemonTypeName } from "@/types/pokemon/domain";
import { getLocalizedMoveName } from "@/lib/pokemon/i18n";

function toCategory(damageClass: string | undefined): PokemonMove["category"] {
  if (damageClass === "physical") return "physical";
  if (damageClass === "special") return "special";
  return "status";
}

export interface MoveWithLearnInfo {
  move: Move;
  learnMethod: string;
  levelLearnedAt: number;
}

export function toMoveList(movesWithInfo: MoveWithLearnInfo[]): {
  levelUpMoves: PokemonMove[];
  tmMoves: PokemonMove[];
} {
  const levelUpMoves: PokemonMove[] = [];
  const tmMoves: PokemonMove[] = [];

  for (const { move, learnMethod, levelLearnedAt } of movesWithInfo) {
    const pokemonMove: PokemonMove = {
      id: move.id,
      nameEn: move.name,
      nameKo: getLocalizedMoveName(move.names, "ko"),
      type: (move.type?.name ?? "normal") as PokemonTypeName,
      category: toCategory(move.damage_class?.name),
      power: move.power,
      accuracy: move.accuracy,
      pp: move.pp,
    };

    if (learnMethod === "level-up") {
      levelUpMoves.push({ ...pokemonMove, levelLearnedAt });
    } else if (learnMethod === "machine") {
      tmMoves.push(pokemonMove);
    }
  }

  levelUpMoves.sort((a, b) => (a.levelLearnedAt ?? 0) - (b.levelLearnedAt ?? 0));

  return { levelUpMoves, tmMoves };
}

export function extractMoveIdsWithLearnInfo(
  pokemon: Pokemon
): { id: number; learnMethod: string; levelLearnedAt: number }[] {
  const result: { id: number; learnMethod: string; levelLearnedAt: number }[] = [];

  for (const moveEntry of pokemon.moves) {
    const versionDetail = moveEntry.version_group_details[moveEntry.version_group_details.length - 1];
    if (!versionDetail) continue;

    const learnMethod = versionDetail.move_learn_method.name;
    if (learnMethod !== "level-up" && learnMethod !== "machine") continue;

    const parts = moveEntry.move.url.split("/").filter(Boolean);
    const id = Number(parts[parts.length - 1]);
    result.push({ id, learnMethod, levelLearnedAt: versionDetail.level_learned_at });
  }

  return result;
}
