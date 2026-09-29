import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchUsageRanking } from "@/lib/battle/fetchers/fetchBattleData";
import { getLatestMonth } from "@/lib/battle/fetchers/fetchUsageStats";
import { CUTOFF_BY_FORMAT, DEFAULT_FORMAT, FORMATS } from "@/lib/battle/constants";
import FormatSelector from "./_components/FormatSelector";
import UsageRankingTable from "./_components/UsageRankingTable";
import PixelCard from "@/app/_components/ui/pixel/PixelCard";

export const metadata: Metadata = { title: "메타 분석 | Ohgnoy" };

interface Props {
  searchParams: Promise<{ format?: string; month?: string }>;
}

export default async function MetaPage({ searchParams }: Props) {
  const { format, month: rawMonth } = await searchParams;
  // Only YYYY-MM reaches the Smogon URL and the cache key; anything else is 최신.
  const month = rawMonth && /^\d{4}-\d{2}$/.test(rawMonth) ? rawMonth : undefined;
  const formatId = FORMATS.find((f) => f.id === format)
    ? format!
    : DEFAULT_FORMAT;

  const cutoff = CUTOFF_BY_FORMAT[formatId] ?? 1695;
  const formatLabel = FORMATS.find((f) => f.id === formatId)?.label ?? formatId;

  const ranking = await fetchUsageRanking(formatId, month);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold">메타 분석</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          쇼다운 배틀 통계(Smogon) 기준 상위 50개 포켓몬
        </p>
      </div>

      <Suspense fallback={null}>
        <FormatSelector
          current={formatId}
          currentMonth={month}
          latestMonth={getLatestMonth()}
        />
      </Suspense>

      <PixelCard className="p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <h2 className="font-pixel text-xs">
            <span className="whitespace-nowrap">{formatLabel}</span>{" "}
            <span className="whitespace-nowrap">사용률 랭킹</span>
          </h2>
          {ranking && (
            <span className="whitespace-nowrap text-xs text-neutral-500">
              레이팅 <span className="tabular-nums">{cutoff}</span> 이상
            </span>
          )}
        </div>

        {!ranking ? (
          <p className="py-8 text-center text-sm text-neutral-500">
            해당 포맷의 데이터를 불러올 수 없습니다.
            <br />
            다른 기간이나 포맷을 선택해 보세요.
          </p>
        ) : (
          <Suspense fallback={<RankingSkeleton />}>
            <UsageRankingTable ranking={ranking} />
          </Suspense>
        )}
      </PixelCard>
    </div>
  );
}

function RankingSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-2">
          <div className="h-4 w-8 animate-pulse rounded-none bg-neutral-300 dark:bg-neutral-600" />
          <div className="h-12 w-12 animate-pulse rounded-none bg-neutral-300 dark:bg-neutral-600" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-4 w-24 animate-pulse rounded-none bg-neutral-300 dark:bg-neutral-600" />
            <div className="h-3 w-16 animate-pulse rounded-none bg-neutral-300 dark:bg-neutral-600" />
          </div>
          <div className="h-4 w-32 animate-pulse rounded-none bg-neutral-300 dark:bg-neutral-600" />
        </div>
      ))}
    </div>
  );
}
