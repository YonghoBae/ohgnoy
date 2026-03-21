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
    <div className="m-5 flex h-fit w-[14rem] flex-col items-center justify-center rounded-2xl bg-neutral-300 bg-opacity-50 px-3 py-2 shadow-xl shadow-neutral-500 backdrop-blur-sm backdrop-filter dark:bg-neutral-500 dark:bg-opacity-50 dark:shadow-neutral-900">
      <div className="mb-1 flex w-full flex-row justify-between">
        {Boolean(userInfo?.user_id) &&
          (liked ? (
            <FaTrashCan
              className="h-5 w-5 transform cursor-pointer text-red-600 transition-all duration-300 ease-in-out hover:scale-125"
              onClick={() => toggle(pokemon.id)}
            />
          ) : (
            <FaPlus
              className="h-5 w-5 transform cursor-pointer text-green-600 transition-all duration-300 ease-in-out hover:scale-125"
              onClick={() => toggle(pokemon.id)}
            />
          ))}
        <BiGitCompare
          onClick={() => toggleCompare(pokemon)}
          className={`h-5 w-5 transform cursor-pointer transition-all duration-300 ease-in-out hover:scale-125 ${
            comparing ? "text-red-700" : "text-blue-700"
          }`}
        />
      </div>
      <h1 className="w-11/12 truncate text-center text-xl font-extrabold">
        {koName ?? pokemon.name.toUpperCase()}
      </h1>
      <div
        className="cursor-pointer"
        onClick={() => router.push(`/pokemon/${pokemon.id}`)}
      >
        <Image
          src={String(pokemon.sprites.other?.["official-artwork"].front_default)}
          alt={pokemon.name}
          width={170}
          height={170}
        />
      </div>
      <div className="mt-1 flex flex-row items-center justify-center gap-2">
        {pokemon.types.map(({ type: { name } }) => (
          <TypeBadge key={name} type={name as PokemonTypeName} size="sm" />
        ))}
      </div>
    </div>
  );
}
