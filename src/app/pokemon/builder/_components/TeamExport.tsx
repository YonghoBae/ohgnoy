"use client";

import { useState } from "react";
import { TeamMember } from "./TeamBuilder";

function toShowdownFormat(member: TeamMember): string {
  const { nameEn, set } = member;
  if (!set) return `${nameEn}\n\n`;

  const lines: string[] = [];

  // 이름 @ 아이템
  const item = Array.isArray(set.item) ? set.item[0] : set.item;
  lines.push(item ? `${nameEn} @ ${item}` : nameEn);

  // 특성
  if (set.ability) {
    const ability = Array.isArray(set.ability) ? set.ability[0] : set.ability;
    if (ability) lines.push(`Ability: ${ability}`);
  }

  // 테라스탈
  if (set.teratypes?.[0]) {
    lines.push(`Tera Type: ${set.teratypes[0]}`);
  }

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
  if (set.nature) lines.push(`${set.nature} Nature`);

  // 기술
  for (const move of set.moves) {
    const moveName = Array.isArray(move) ? move[0] : move;
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
  const [copied, setCopied] = useState(false);

  const exportText = team.map(toShowdownFormat).join("\n\n");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(exportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="flex w-full max-w-lg flex-col gap-4 rounded-2xl bg-white p-5 shadow-2xl dark:bg-neutral-800">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">Pokémon Showdown 내보내기</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700">✕</button>
        </div>
        <p className="text-xs text-neutral-500">
          아래 텍스트를 복사해서 PS! 팀 임포트에 붙여넣으세요.
        </p>
        <textarea
          readOnly
          value={exportText}
          className="h-72 rounded-xl bg-neutral-100 p-4 font-mono text-xs outline-none dark:bg-neutral-700"
        />
        <div className="flex gap-3">
          <button
            onClick={() => void handleCopy()}
            className="flex-1 rounded-xl bg-blue-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            {copied ? "복사됨 ✓" : "클립보드에 복사"}
          </button>
          <button
            onClick={onClose}
            className="rounded-xl bg-neutral-200 px-4 py-2 text-sm font-semibold transition-colors hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
