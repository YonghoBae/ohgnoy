"use client";

import { useState } from "react";
import Image from "next/image";
import { BattleSet } from "@/types/pokemon/battle";
import { PokemonTypeName } from "@/types/pokemon/domain";
import TypeBadge from "@/app/_components/TypeBadge";
import PokemonPicker from "./PokemonPicker";
import TypeCoverage from "./TypeCoverage";
import TeamExport from "./TeamExport";

export interface TeamMember {
  id: number;
  nameEn: string;
  nameKo: string;
  spriteUrl: string;
  types: PokemonTypeName[];
  set: BattleSet | null;
}

const MAX_SLOTS = 6;

function EmptySlot({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex h-36 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-neutral-300 text-neutral-400 transition-colors hover:border-blue-400 hover:text-blue-400 dark:border-neutral-600 dark:hover:border-blue-500"
    >
      <span className="text-3xl">+</span>
      <span className="text-xs">포켓몬 추가</span>
    </button>
  );
}

function FilledSlot({
  member,
  onRemove,
  onSetChange,
}: {
  member: TeamMember;
  onRemove: () => void;
  onSetChange: (set: BattleSet | null) => void;
}) {
  return (
    <div className="relative flex h-36 flex-col items-center justify-center gap-1 rounded-2xl bg-neutral-200 px-2 py-2 dark:bg-neutral-700">
      <button
        onClick={onRemove}
        className="absolute right-2 top-2 text-xs text-neutral-400 hover:text-red-500"
      >
        ✕
      </button>
      <div className="relative h-16 w-16">
        <Image src={member.spriteUrl} alt={member.nameEn} fill className="object-contain" />
      </div>
      <span className="text-xs font-bold">{member.nameKo}</span>
      <div className="flex gap-1">
        {member.types.map((t) => (
          <TypeBadge key={t} type={t} size="sm" />
        ))}
      </div>
      {member.set && (
        <span className="text-xs text-blue-500">{member.set.name}</span>
      )}
    </div>
  );
}

export default function TeamBuilder({ allNames }: { allNames: string[] }) {
  const [team, setTeam] = useState<(TeamMember | null)[]>(Array(MAX_SLOTS).fill(null));
  const [pickerSlot, setPickerSlot] = useState<number | null>(null);
  const [showExport, setShowExport] = useState(false);

  const openPicker = (slotIndex: number) => setPickerSlot(slotIndex);

  const handleSelect = (member: TeamMember) => {
    if (pickerSlot === null) return;
    setTeam((prev) => {
      const next = [...prev];
      next[pickerSlot] = member;
      return next;
    });
    setPickerSlot(null);
  };

  const handleRemove = (index: number) => {
    setTeam((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  };

  const handleSetChange = (index: number, set: BattleSet | null) => {
    setTeam((prev) => {
      const next = [...prev];
      const member = next[index];
      if (member) next[index] = { ...member, set };
      return next;
    });
  };

  const filledMembers = team.filter((m): m is TeamMember => m !== null);
  const teamTypes = filledMembers.map((m) => m.types);

  return (
    <div className="flex flex-col gap-6">
      {/* 팀 슬롯 */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {team.map((member, i) =>
          member ? (
            <FilledSlot
              key={i}
              member={member}
              onRemove={() => handleRemove(i)}
              onSetChange={(set) => handleSetChange(i, set)}
            />
          ) : (
            <EmptySlot key={i} onClick={() => openPicker(i)} />
          )
        )}
      </div>

      {/* 타입 상성 */}
      {filledMembers.length > 0 && <TypeCoverage teamTypes={teamTypes} />}

      {/* 내보내기 버튼 */}
      {filledMembers.length > 0 && (
        <button
          onClick={() => setShowExport(true)}
          className="self-end rounded-full bg-neutral-800 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300"
        >
          Pokémon Showdown 내보내기
        </button>
      )}

      {/* 피커 모달 */}
      {pickerSlot !== null && (
        <PokemonPicker
          allNames={allNames}
          onSelect={handleSelect}
          onClose={() => setPickerSlot(null)}
        />
      )}

      {/* 내보내기 모달 */}
      {showExport && (
        <TeamExport team={filledMembers} onClose={() => setShowExport(false)} />
      )}
    </div>
  );
}
