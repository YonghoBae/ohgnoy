"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Pokemon } from "pokenode-ts";
import React from "react";
import { BiGitCompare } from "react-icons/bi";
import { FaPlus, FaTrashCan } from "react-icons/fa6";

import useLikedMons from "@/lib/pokemon/hooks/useLikedMons";
import useCompare from "@/lib/pokemon/hooks/useCompare";
import { UserInfo } from "@/interfaces/user";
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
  const router = useRouter();
  const { likedMons, toggle } = useLikedMons(userInfo);
  const { isComparing, toggleCompare } = useCompare();
  const liked = likedMons.includes(pokemon.id);
  const comparing = isComparing(pokemon);

  return (
    <div className="flex h-fit w-full flex-col items-center justify-center rounded-2xl bg-surface-2/60 px-3 py-2 shadow-md backdrop-blur-sm dark:shadow-none dark:border dark:border-border">
      <div className="mb-1 flex w-full flex-row justify-between">
        {Boolean(userInfo?.userId) &&
          (liked ? (
            <FaTrashCan
              role="button"
              tabIndex={0}
              aria-label="좋아요 취소"
              className="h-5 w-5 transform cursor-pointer text-red-500 transition-all duration-300 ease-in-out hover:scale-125"
              onClick={() => toggle(pokemon.id)}
            />
          ) : (
            <FaPlus
              role="button"
              tabIndex={0}
              aria-label="좋아요 추가"
              className="h-5 w-5 transform cursor-pointer text-green-600 transition-all duration-300 ease-in-out hover:scale-125"
              onClick={() => toggle(pokemon.id)}
            />
          ))}
        <BiGitCompare
          role="button"
          tabIndex={0}
          aria-label={comparing ? "비교 취소" : "비교에 추가"}
          onClick={() => toggleCompare(pokemon)}
          className={`h-5 w-5 transform cursor-pointer transition-all duration-300 ease-in-out hover:scale-125 ml-auto ${
            comparing ? "text-red-600" : "text-primary"
          }`}
        />
      </div>
      <h1 className="w-11/12 truncate text-center text-base font-extrabold">
        {koName ?? pokemon.name.toUpperCase()}
      </h1>
      <button
        className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary rounded-xl"
        onClick={() => router.push(`/pokemon/${pokemon.id}`)}
        aria-label={`${koName ?? pokemon.name} 상세 보기`}
      >
        <Image
          src={String(pokemon.sprites.other?.["official-artwork"].front_default)}
          alt={pokemon.name}
          width={130}
          height={130}
        />
      </button>
      <div className="mt-1 flex flex-row items-center justify-center gap-2">
        {pokemon.types.map(({ type: { name } }) => (
          <TypeBadge key={name} type={name as PokemonTypeName} size="sm" />
        ))}
      </div>
    </div>
  );
}
