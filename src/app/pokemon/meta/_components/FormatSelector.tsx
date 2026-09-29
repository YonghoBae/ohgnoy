"use client";

import { useId, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FORMATS } from "@/lib/battle/constants";

// The months before the server's latestMonth ("2026-08" → 2026-07 … 2026-03),
// not the browser clock: the two can disagree and list latestMonth twice.
function getRecentMonths(latestMonth: string, count = 5): string[] {
  const [y, m] = latestMonth.split("-").map(Number);
  const months: string[] = [];
  for (let i = 1; i <= count; i++) {
    const d = new Date(y, m - 1 - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return months;
}

const monthFormat = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  timeZone: "UTC",
});

// "2026-08" → "2026년 8월". Built and formatted in UTC so the month never shifts.
function formatMonth(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return monthFormat.format(new Date(Date.UTC(y, m - 1, 1)));
}

export default function FormatSelector({
  current,
  currentMonth,
  latestMonth,
}: {
  current: string;
  currentMonth?: string;
  /** The month "최신" resolves to (getLatestMonth on the server). */
  latestMonth: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const months = getRecentMonths(latestMonth);
  const isLatest = !currentMonth || currentMonth === latestMonth;
  const periodLabelId = useId();

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    startTransition(() => {
      router.push(`/pokemon/meta?${params.toString()}`);
    });
  };

  const official = FORMATS.filter((f) => f.group === "official");
  const byGen = FORMATS.filter((f) => f.group === "smogon").reduce<
    Record<number, typeof FORMATS>
  >((acc, f) => {
    if (!acc[f.gen]) acc[f.gen] = [];
    acc[f.gen]!.push(f);
    return acc;
  }, {});
  const currentFormat = FORMATS.find((f) => f.id === current);

  const formatButton = (f: (typeof FORMATS)[number], big = false) => (
    <button
      key={f.id}
      type="button"
      onClick={() => update("format", f.id)}
      aria-pressed={current === f.id}
      className={`rounded-none border-2 font-semibold transition-colors ${
        big ? "px-4 py-2 text-sm" : "px-3 py-1 text-xs"
      } ${
        current === f.id
          ? "border-blue-600 bg-blue-600 text-white"
          : "border-neutral-300 bg-neutral-200 text-neutral-600 hover:bg-neutral-300 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
      }`}
    >
      {f.label}
    </button>
  );

  return (
    <div
      aria-busy={isPending}
      className={`flex flex-col gap-4 transition-opacity ${isPending ? "opacity-60" : ""}`}
    >
      {/* 포맷 선택: 공식 규칙 먼저, Smogon 등급은 접어 둔다 */}
      <div className="flex flex-col gap-2">
        <div role="group" aria-label="공식 규칙" className="flex flex-wrap gap-2">
          {official.map((f) => formatButton(f, true))}
        </div>
        <details open={currentFormat?.group === "smogon"}>
          <summary className="cursor-pointer text-xs font-bold text-neutral-500 dark:text-neutral-400">
            Smogon 등급전 (쇼다운)
          </summary>
          <div className="mt-2 flex flex-wrap gap-3">
            {Object.entries(byGen)
              .sort(([a], [b]) => Number(b) - Number(a))
              .map(([gen, formats]) => {
                const genLabelId = `format-selector-gen-${gen}`;
                return (
                  <div key={gen} className="flex flex-col gap-1">
                    <span id={genLabelId} className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
                      {gen}세대
                    </span>
                    <div role="group" aria-labelledby={genLabelId} className="flex flex-wrap gap-1">
                      {formats.map((f) => formatButton(f))}
                    </div>
                  </div>
                );
              })}
          </div>
        </details>
        {currentFormat && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {currentFormat.desc}
          </p>
        )}
      </div>

      {/* 월 선택 */}
      <div className="flex flex-col gap-1">
        <span id={periodLabelId} className="text-xs font-bold text-neutral-500 dark:text-neutral-400">기간</span>
        <div role="group" aria-labelledby={periodLabelId} className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => update("month", "")}
            aria-pressed={isLatest}
            className={`rounded-none border-2 px-3 py-1 text-xs font-semibold transition-colors ${
              isLatest
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-neutral-300 bg-neutral-200 text-neutral-600 hover:bg-neutral-300 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
            }`}
          >
            최신 ({formatMonth(latestMonth)})
          </button>
          {months.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => update("month", m)}
              aria-pressed={currentMonth === m}
              className={`rounded-none border-2 px-3 py-1 text-xs font-semibold transition-colors ${
                currentMonth === m
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-neutral-300 bg-neutral-200 text-neutral-600 hover:bg-neutral-300 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
              }`}
            >
              {formatMonth(m)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
