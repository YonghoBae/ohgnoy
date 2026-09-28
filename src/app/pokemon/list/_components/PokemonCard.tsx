"use client";

import Link from "next/link";
import { Pokemon } from "pokenode-ts";
import React from "react";
import { BiGitCompare } from "react-icons/bi";
import { FaPlus, FaTrashCan } from "react-icons/fa6";

import useLikedMons from "@/lib/pokemon/hooks/useLikedMons";
import useCompare from "@/lib/pokemon/hooks/useCompare";
import { UserInfo } from "@/interfaces/user";
import PixelCard from "@/app/_components/ui/pixel/PixelCard";
import PixelSprite from "@/app/_components/ui/pixel/PixelSprite";
import TypeBadge from "@/app/_components/TypeBadge";
import { PokemonTypeName } from "@/types/pokemon/domain";

export default function PokemonCard({
  pokemon,
  userInfo,
  koName,
}: {
  pokemon: Pokemon;
  userInfo: UserInfo;
  koName?: string;
}): React.JSX.Element {
  const { likedMons, toggle } = useLikedMons(userInfo);
  const { isComparing, toggleCompare } = useCompare();
  const liked = likedMons.includes(pokemon.id);
  const comparing = isComparing(pokemon);

  return (
    <PixelCard className="flex h-fit w-full flex-col items-center justify-center px-3 py-2">
      <div className="mb-1 flex w-full flex-row justify-between">
        {Boolean(userInfo?.userId) && (
          <button
            type="button"
            aria-label={liked ? "좋아요 취소" : "좋아요 추가"}
            onClick={() => toggle(pokemon.id)}
            className="group -m-1 p-1"
          >
            {liked ? (
              <FaTrashCan aria-hidden className="h-5 w-5 text-red-500 transition-transform duration-300 ease-in-out group-hover:scale-125" />
            ) : (
              <FaPlus aria-hidden className="h-5 w-5 text-green-600 transition-transform duration-300 ease-in-out group-hover:scale-125" />
            )}
          </button>
        )}
        <button
          type="button"
          aria-label={comparing ? "비교 취소" : "비교에 추가"}
          onClick={() => toggleCompare(pokemon)}
          className="group -m-1 ml-auto p-1"
        >
          <BiGitCompare
            aria-hidden
            className={`h-5 w-5 transition-transform duration-300 ease-in-out group-hover:scale-125 ${
              comparing ? "text-red-600" : "text-primary"
            }`}
          />
        </button>
      </div>
      <h1 className="font-mono-pixel w-11/12 truncate text-center text-sm font-bold">
        {koName ?? pokemon.name.toUpperCase()}
      </h1>
      <Link
        href={`/pokemon/${pokemon.id}`}
        aria-label={`${koName ?? pokemon.name} 상세 보기`}
      >
        <PixelSprite pokemon={pokemon} alt="" size={130} />
      </Link>
      <div className="mt-1 flex flex-row items-center justify-center gap-2">
        {pokemon.types.map(({ type: { name } }) => (
          <TypeBadge key={name} type={name as PokemonTypeName} size="sm" />
        ))}
      </div>
    </PixelCard>
  );
}
