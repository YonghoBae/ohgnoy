import { create } from "zustand";
import { Pokemon } from "pokenode-ts";

interface CompareMons {
  mon_1?: Pokemon;
  mon_2?: Pokemon;
}

interface CompareStore {
  compare: CompareMons;
  setCompare: (compare: CompareMons) => void;
}

export const useCompareStore = create<CompareStore>((set) => ({
  compare: {},
  setCompare: (compare) => set({ compare }),
}));
