"use client";

import { useEffect, useId, useRef, useState } from "react";
import { TeamMember } from "./TeamBuilder";
import ModalDialog from "./ModalDialog";

// 후보가 여러 개인 값(배열, 성격 "Adamant / Jolly")은 첫 번째만. 옛 저장 팀은
// teratypes가 문자열이라 인덱싱하면 첫 글자가 나온다.
const first = (v: string | string[] | undefined) =>
  [v ?? []].flat()[0]?.split(" / ")[0];

// 옛 저장 팀에는 species가 없다: "great-tusk" → "Great-Tusk"(Showdown은 id로 맞춘다).
const titleCase = (slug: string) =>
  slug.replace(/(^|-)([a-z])/g, (m) => m.toUpperCase());

function toShowdownFormat(member: TeamMember): string {
  const { set } = member;
  const nameEn = member.species ?? titleCase(member.nameEn);
  if (!set) return `${nameEn}\n\n`;

  const lines: string[] = [];

  // 이름 @ 아이템
  const item = first(set.item);
  lines.push(item ? `${nameEn} @ ${item}` : nameEn);

  // 특성
  const ability = first(set.ability);
  if (ability) lines.push(`Ability: ${ability}`);

  // 테라스탈
  const tera = first(set.teratypes);
  if (tera) lines.push(`Tera Type: ${tera}`);

  // EV
  if (set.evs) {
    const evParts: string[] = [];
    const labels: Record<string, string> = {
      hp: "HP", atk: "Atk", def: "Def", spa: "SpA", spd: "SpD", spe: "Spe",
    };
    for (const [key, val] of Object.entries(set.evs)) {
      if (val && val > 0) evParts.push(`${val} ${labels[key] ?? key}`);
    }
    if (evParts.length) lines.push(`EVs: ${evParts.join(" / ")}`);
  }

  // 성격
  const nature = first(set.nature);
  if (nature) lines.push(`${nature} Nature`);

  // 기술
  for (const move of set.moves) {
    const moveName = first(move);
    if (moveName) lines.push(`- ${moveName}`);
  }

  return lines.join("\n");
}

export default function TeamExport({
  team,
  onClose,
}: {
  team: TeamMember[];
  onClose: () => void;
}) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const titleId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const exportText = team.map(toShowdownFormat).join("\n\n");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportText);
      setStatus("copied");
    } catch {
      textareaRef.current?.select();
      setStatus("failed");
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setStatus("idle"), 2000);
  };

  return (
    <ModalDialog labelledBy={titleId} onClose={onClose} className="max-w-lg">
      <div className="flex w-full flex-col gap-4 rounded-none bg-white p-5 shadow-2xl dark:bg-neutral-800">
        <div className="flex items-center justify-between">
          <h3 id={titleId} className="font-bold">Pokémon Showdown 내보내기</h3>
          <button type="button" onClick={onClose} aria-label="닫기" className="text-neutral-400 hover:text-neutral-700">✕</button>
        </div>
        <p className="text-xs text-neutral-500">
          아래 텍스트를 복사해서 PS! 팀 임포트에 붙여넣으세요.
        </p>
        <textarea
          ref={textareaRef}
          readOnly
          aria-label="Showdown 팀 텍스트"
          spellCheck={false}
          value={exportText}
          className="h-72 rounded-none bg-neutral-100 p-4 font-mono text-xs dark:bg-neutral-700"
        />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="flex-1 rounded-none bg-blue-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            클립보드에 복사
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-none bg-neutral-200 px-4 py-2 text-sm font-semibold transition-colors hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600"
          >
            닫기
          </button>
        </div>
        <p aria-live="polite" className="min-h-[1em] text-center text-xs text-neutral-500">
          {status === "copied" && (
            <>
              <span aria-hidden>✓</span> 복사됨
            </>
          )}
          {status === "failed" && "복사하지 못했습니다. 직접 선택해서 복사하세요."}
        </p>
      </div>
    </ModalDialog>
  );
}
