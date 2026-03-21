"use client";

import React from "react";
import { UserInfo } from "@/interfaces/user";

const STORAGE_KEY = "liked_mons";

function getLocalLikedMons(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

function setLocalLikedMons(ids: number[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function toggleLocalLike(pokemonId: number): number[] {
  const current = getLocalLikedMons();
  const next = current.includes(pokemonId)
    ? current.filter((id) => id !== pokemonId)
    : [...current, pokemonId];
  setLocalLikedMons(next);
  return next;
}

export default function useLikedMons(userInfo: UserInfo): {
  likedMons: number[];
  toggle: (pokemonId: number) => void;
} {
  const [likedMons, setLikedMons] = React.useState<number[]>([]);

  React.useEffect(() => {
    if (!userInfo?.user_id) return;
    // 백엔드 준비 전까지 localStorage 사용
    setLikedMons(getLocalLikedMons());
  }, [userInfo?.user_id]);

  const toggle = React.useCallback((pokemonId: number) => {
    setLikedMons(toggleLocalLike(pokemonId));
  }, []);

  return { likedMons, toggle };
}
