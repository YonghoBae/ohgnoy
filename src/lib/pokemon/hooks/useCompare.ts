"use client";

import { Pokemon } from "pokenode-ts";
import { useCompareStore } from "@/app/_components/compareMons";

export default function useCompare() {
  const { compare, setCompare } = useCompareStore();

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
    setCompare({ ...compare, mon_1: pokemon });
  };

  return { compare, isComparing, toggleCompare };
}
