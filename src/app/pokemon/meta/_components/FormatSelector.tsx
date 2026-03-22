"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FORMATS } from "@/lib/battle/constants";

function getRecentMonths(count = 6): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 1; i <= count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return months;
}

export default function FormatSelector({ current, currentMonth }: { current: string; currentMonth?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const months = getRecentMonths(6);

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`/pokemon/meta?${params.toString()}`);
  };

  const byGen = FORMATS.reduce<Record<number, typeof FORMATS>>((acc, f) => {
    if (!acc[f.gen]) acc[f.gen] = [];
    acc[f.gen]!.push(f);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4">
      {/* 포맷 선택 */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(byGen)
          .sort(([a], [b]) => Number(b) - Number(a))
          .map(([gen, formats]) => (
            <div key={gen} className="flex flex-col gap-1">
              <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
                Gen {gen}
              </span>
              <div className="flex flex-wrap gap-1">
                {formats.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => update("format", f.id)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                      current === f.id
                        ? "bg-blue-600 text-white"
                        : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
      </div>

      {/* 월 선택 */}
      <div className="flex flex-col gap-1">
        <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">기간</span>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => update("month", "")}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              !currentMonth
                ? "bg-blue-600 text-white"
                : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
            }`}
          >
            최신
          </button>
          {months.map((m) => (
            <button
              key={m}
              onClick={() => update("month", m)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                currentMonth === m
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
