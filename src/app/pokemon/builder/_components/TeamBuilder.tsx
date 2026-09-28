"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
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
const STORAGE_KEY = "ohgnoy.builder.team.v1";

function isValidTeamData(data: unknown): data is (TeamMember | null)[] {
  if (!Array.isArray(data) || data.length > MAX_SLOTS) return false;
  return data.every((entry) => {
    if (entry === null) return true;
    if (typeof entry !== "object") return false;
    const e = entry as Record<string, unknown>;
    return (
      typeof e.id === "number" &&
      typeof e.nameEn === "string" &&
      typeof e.nameKo === "string" &&
      typeof e.spriteUrl === "string" &&
      Array.isArray(e.types) &&
      e.types.every((t) => typeof t === "string")
    );
  });
}

function EmptySlot({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex h-36 flex-col items-center justify-center gap-2 rounded-none border-2 border-dashed border-text-muted text-text-muted transition-colors hover:border-primary hover:text-primary"
    >
      <span aria-hidden className="text-3xl">+</span>
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
    <PixelCard className="relative flex min-h-36 flex-col items-center justify-center gap-1 px-2 py-2">
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
      <span className="font-mono-pixel max-w-full truncate text-xs font-bold">{member.nameKo}</span>
      <div className="flex gap-1">
        {member.types.map((t) => (
          <TypeBadge key={t} type={t} size="sm" />
        ))}
      </div>
      {member.set && (
        <span className="max-w-full truncate text-xs text-primary">{member.set.name}</span>
      )}
    </PixelCard>
  );
}

export default function TeamBuilder({ allNames }: { allNames: string[] }) {
  const [team, setTeam] = useState<(TeamMember | null)[]>(Array(MAX_SLOTS).fill(null));
  const [pickerSlot, setPickerSlot] = useState<number | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [restored, setRestored] = useState(false);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [undoTeam, setUndoTeam] = useState<(TeamMember | null)[] | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 마운트 시 저장된 팀 복원 (서버 렌더링은 항상 빈 팀)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (isValidTeamData(parsed)) {
          const next = Array(MAX_SLOTS).fill(null) as (TeamMember | null)[];
          parsed.forEach((entry, i) => {
            if (entry) next[i] = { ...entry, set: entry.set ?? null };
          });
          setTeam(next);
        }
      }
    } catch {
      // 손상된 데이터는 무시하고 빈 팀으로 시작
    }
    setRestored(true);
  }, []);

  // 복원이 끝난 뒤에만 저장 — 초기 빈 상태가 저장된 팀을 덮어쓰지 않도록 함
  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(team));
    } catch {
      // 스토리지를 쓸 수 없는 환경(용량 초과, 프라이빗 모드)은 무시
    }
  }, [team, restored]);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  const openPicker = (slotIndex: number) => setPickerSlot(slotIndex);

  // 되돌리기 스냅샷/확인 프롬프트는 "비우기" 이후 팀이 그대로일 때만 유효함 —
  // 되돌리기 자체가 아닌 다른 팀 변경이 생기면 무효화한다.
  const invalidatePendingClear = () => {
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    setUndoTeam(null);
    setConfirmingClear(false);
  };

  const handleSelect = (member: TeamMember) => {
    if (pickerSlot === null) return;
    invalidatePendingClear();
    setTeam((prev) => {
      const next = [...prev];
      next[pickerSlot] = member;
      return next;
    });
    setPickerSlot(null);
  };

  const handleRemove = (index: number) => {
    invalidatePendingClear();
    setTeam((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  };

  const handleSetChange = (index: number, set: BattleSet | null) => {
    invalidatePendingClear();
    setTeam((prev) => {
      const next = [...prev];
      const member = next[index];
      if (member) next[index] = { ...member, set };
      return next;
    });
  };

  const handleClearConfirm = () => {
    setUndoTeam(team);
    setTeam(Array(MAX_SLOTS).fill(null));
    setConfirmingClear(false);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => {
      setUndoTeam(null);
      undoTimerRef.current = null;
    }, 5000);
  };

  const handleUndo = () => {
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    if (undoTeam) setTeam(undoTeam);
    setUndoTeam(null);
  };

  const handleClearKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") setConfirmingClear(false);
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

      {/* 내보내기 / 팀 비우기 버튼 */}
      {filledMembers.length > 0 && (
        <div className="flex items-center justify-end gap-3">
          <div onKeyDown={handleClearKeyDown}>
            {confirmingClear ? (
              <div className="flex items-center gap-2">
                <span className="font-mono-pixel text-xs text-text-muted">
                  팀을 모두 비울까요?
                </span>
                <PixelButton variant="primary" onClick={handleClearConfirm}>
                  비우기
                </PixelButton>
                <PixelButton
                  variant="ghost"
                  autoFocus
                  onClick={() => setConfirmingClear(false)}
                >
                  취소
                </PixelButton>
              </div>
            ) : (
              <PixelButton variant="ghost" onClick={() => setConfirmingClear(true)}>
                팀 비우기
              </PixelButton>
            )}
          </div>
          <PixelButton variant="primary" onClick={() => setShowExport(true)}>
            Pokémon Showdown 내보내기
          </PixelButton>
        </div>
      )}

      {/* 팀 비움 알림 + 되돌리기 */}
      <div aria-live="polite">
        {undoTeam && (
          <div className="flex items-center gap-2 font-mono-pixel text-xs text-text-muted">
            <span>팀을 비웠습니다.</span>
            <PixelButton variant="ghost" onClick={handleUndo}>
              되돌리기
            </PixelButton>
          </div>
        )}
      </div>

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
