"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FORMATS } from "@/lib/battle/constants";

export default function FormatSelector({ current }: { current: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const onChange = (format: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("format", format);
    router.push(`/pokemon/meta?${params.toString()}`);
  };

  const byGen = FORMATS.reduce<Record<number, typeof FORMATS>>((acc, f) => {
    if (!acc[f.gen]) acc[f.gen] = [];
    acc[f.gen]!.push(f);
    return acc;
  }, {});

  return (
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
                  onClick={() => onChange(f.id)}
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
  );
}
