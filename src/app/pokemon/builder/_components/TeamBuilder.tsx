"use client";

import { useState } from "react";
import { BattleSet } from "@/types/pokemon/battle";
import { PokemonTypeName } from "@/types/pokemon/domain";
import TypeBadge from "@/app/_components/TypeBadge";
import PokemonPicker from "./PokemonPicker";
import TypeCoverage from "./TypeCoverage";
import TeamExport from "./TeamExport";
import PixelCard from "@/app/_components/ui/pixel/PixelCard";
import PixelButton from "@/app/_components/ui/pixel/PixelButton";
import PixelSprite from "@/app/_components/ui/pixel/PixelSprite";

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
      className="flex h-36 flex-col items-center justify-center gap-2 rounded-none border-2 border-dashed border-text-muted text-text-muted transition-colors hover:border-primary hover:text-primary"
    >
      <span className="text-3xl">+</span>
      <span className="font-mono-pixel text-xs">포켓몬 추가</span>
    </button>
  );
}

function FilledSlot({
  member,
  onRemove,
  onSetChange: _onSetChange,
}: {
  member: TeamMember;
  onRemove: () => void;
  onSetChange: (set: BattleSet | null) => void;
}) {
  return (
    <PixelCard className="relative flex h-36 flex-col items-center justify-center gap-1 px-2 py-2">
      <button
        onClick={onRemove}
        aria-label={`${member.nameKo} 팀에서 제거`}
        className="absolute right-2 top-2 text-xs text-text-muted hover:text-red-500"
      >
        ✕
      </button>
      <div className="relative h-16 w-16">
        <PixelSprite spriteUrl={member.spriteUrl} alt={member.nameEn} fill />
      </div>
      <span className="font-mono-pixel text-xs font-bold">{member.nameKo}</span>
      <div className="flex gap-1">
        {member.types.map((t) => (
          <TypeBadge key={t} type={t} size="sm" />
        ))}
      </div>
      {member.set && (
        <span className="text-xs text-primary">{member.set.name}</span>
      )}
    </PixelCard>
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
        <PixelButton
          variant="primary"
          onClick={() => setShowExport(true)}
          className="self-end"
        >
          Pokémon Showdown 내보내기
        </PixelButton>
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
