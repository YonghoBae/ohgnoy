"use client";

import { useRecoilState } from "recoil";
import { compareMons } from "@/app/_components/compareMons";
import { Pokemon } from "pokenode-ts";

export default function useCompare() {
  const [compare, setCompare] = useRecoilState(compareMons);

  const isComparing = (pokemon: Pokemon): boolean =>
    compare.mon_1?.id === pokemon.id || compare.mon_2?.id === pokemon.id;

  const toggleCompare = (pokemon: Pokemon): void => {
    if (compare.mon_1?.id === pokemon.id) {
      setCompare({ ...compare, mon_1: undefined });
      return;
    }
    if (compare.mon_2?.id === pokemon.id) {
      setCompare({ ...compare, mon_2: undefined });
      return;
    }
    if (!compare.mon_1) {
      setCompare({ ...compare, mon_1: pokemon });
      return;
    }
    if (!compare.mon_2) {
      setCompare({ ...compare, mon_2: pokemon });
      return;
    }
    // 둘 다 채워져 있으면 mon_1 교체
    setCompare({ ...compare, mon_1: pokemon });
  };

  return { compare, isComparing, toggleCompare };
}
