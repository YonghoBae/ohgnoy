'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Pokemon } from 'pokenode-ts';
import React from 'react';
import { BiGitCompare } from 'react-icons/bi';
import { FaPlus, FaTrashCan } from 'react-icons/fa6';

import useLikedMons from '@/lib/pokemon/hooks/useLikedMons';
import { likeApi } from '@/lib/api/like';

import { useCompareStore } from '@/app/_components/compareMons';
import { UserInfo } from '@/interfaces/user';
import TypeBadge from '@/app/_components/TypeBadge';
import { PokemonTypeName } from '@/types/pokemon/domain';

export const toggleLike = async (
  pokemon: Pokemon,
  userId: number,
): Promise<void> => {
  try {
    await likeApi.toggle(pokemon.id, { userId, pokemon_id: pokemon.id });
  } catch (error) {
    console.error('Error toggling like:', error);
  }
};

export default function PokemonCard({
  pokemon,
  userInfo,
}: {
  pokemon: Pokemon;
  path?: string;
  userInfo: UserInfo;
}): React.JSX.Element {
  const { compare, setCompare } = useCompareStore();
  const router = useRouter();
  const { likedMons: likedPokemon, toggle: toggleLikeLocal } = useLikedMons(userInfo);

  const toggleCompare = (pokemon: Pokemon): void => {
    if (compare.mon_1 && compare.mon_1.id === pokemon.id) {
      setCompare({ ...compare, mon_1: undefined });
      return;
    }
    if (compare.mon_2 && compare.mon_2.id === pokemon.id) {
      setCompare({ ...compare, mon_2: undefined });
      return;
    }
    if (!compare.mon_1 && !compare.mon_2) {
      setCompare({ ...compare, mon_1: pokemon });
      return;
    }
    if (compare.mon_1 && !compare.mon_2 && compare.mon_1.id !== pokemon.id) {
      setCompare({ ...compare, mon_2: pokemon });
      return;
    }
    if (!compare.mon_1 && compare.mon_2 && compare.mon_2.id !== pokemon.id) {
      setCompare({ ...compare, mon_1: pokemon });
      return;
    }
    if (
      compare.mon_1 &&
      compare.mon_2 &&
      compare.mon_1.id !== pokemon.id &&
      compare.mon_2.id !== pokemon.id
    ) {
      setCompare({ ...compare, mon_1: pokemon });
    }
  };

  return (
    <div className="m-5 flex h-fit w-[14rem] flex-col items-center justify-center rounded-2xl bg-neutral-300 bg-opacity-50 px-3 py-2 shadow-xl shadow-neutral-500 backdrop-blur-sm backdrop-filter dark:bg-neutral-500 dark:bg-opacity-50 dark:shadow-neutral-900">
      <div className="mb-1 flex w-full flex-row justify-between">
        {Boolean(userInfo?.userId) &&
          (likedPokemon.includes(pokemon.id) ? (
            <FaTrashCan
              className="h-5 w-5 transform cursor-pointer text-red-600 transition-all duration-300 ease-in-out hover:scale-125"
              onClick={() => toggleLikeLocal(pokemon.id)}
            />
          ) : (
            <FaPlus
              className="h-5 w-5 transform cursor-pointer text-green-600 transition-all duration-300 ease-in-out hover:scale-125"
              onClick={() => toggleLikeLocal(pokemon.id)}
            />
          ))}
        {(compare.mon_1 && compare.mon_1.id === pokemon.id) ||
        (compare.mon_2 && compare.mon_2.id === pokemon.id) ? (
          <BiGitCompare
            onClick={(): void => toggleCompare(pokemon)}
            className="h-5 w-5 transform cursor-pointer text-red-700 transition-all duration-300 ease-in-out hover:scale-125"
          />
        ) : (
          <BiGitCompare
            onClick={(): void => toggleCompare(pokemon)}
            className="h-5 w-5 transform cursor-pointer text-blue-700 transition-all duration-300 ease-in-out hover:scale-125"
          />
        )}
      </div>
      <h1 className="w-11/12 truncate text-center text-xl font-extrabold">
        {pokemon.name.toLocaleUpperCase()}
      </h1>
      <div
        className="Drop-shadow"
        onClick={(): void => router.push(`/pokemon/${pokemon.id}`)}
      >
        <Image
          src={String(
            pokemon.sprites.other?.['official-artwork'].front_default,
          )}
          alt={pokemon.name}
          width={170}
          height={170}
          className="cursor-pointer"
        />
      </div>
      <div className="mt-1 flex flex-row items-center justify-center gap-2">
        {pokemon.types.map(({type:{name}}) => (
          <TypeBadge key={name} type={name as PokemonTypeName} size="sm" />
        ))}
      </div>
    </div>
  );
}
