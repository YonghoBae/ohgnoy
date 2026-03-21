import { Suspense } from "react";
import { fetchUsageStats, getUsageRanking } from "@/lib/battle/fetchers/fetchUsageStats";
import { CUTOFF_BY_FORMAT, DEFAULT_FORMAT, FORMATS } from "@/lib/battle/constants";
import FormatSelector from "./_components/FormatSelector";
import UsageRankingTable from "./_components/UsageRankingTable";

interface Props {
  searchParams: { format?: string; month?: string };
}

export default async function MetaPage({ searchParams }: Props) {
  const formatId = FORMATS.find((f) => f.id === searchParams.format)
    ? searchParams.format!
    : DEFAULT_FORMAT;

  const cutoff = CUTOFF_BY_FORMAT[formatId] ?? 1695;
  const formatLabel = FORMATS.find((f) => f.id === formatId)?.label ?? formatId;

  const statsMap = await fetchUsageStats(formatId, searchParams.month, cutoff);
  const ranking = statsMap ? getUsageRanking(statsMap, 50) : [];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold">메타 분석</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Smogon 사용률 기준 상위 50개 포켓몬
        </p>
      </div>

      <Suspense fallback={null}>
        <FormatSelector current={formatId} />
      </Suspense>

      <div className="rounded-2xl bg-neutral-200 bg-opacity-50 p-4 dark:bg-neutral-700 dark:bg-opacity-50">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold">{formatLabel} 사용률 랭킹</h2>
          {statsMap && (
            <span className="text-xs text-neutral-500">
              cutoff {cutoff}+
            </span>
          )}
        </div>

        {!statsMap ? (
          <p className="py-8 text-center text-sm text-neutral-500">
            해당 포맷의 데이터를 불러올 수 없습니다.
          </p>
        ) : (
          <Suspense fallback={<RankingSkeleton />}>
            <UsageRankingTable ranking={ranking} />
          </Suspense>
        )}
      </div>
    </div>
  );
}

function RankingSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-2">
          <div className="h-4 w-8 animate-pulse rounded bg-neutral-300 dark:bg-neutral-600" />
          <div className="h-12 w-12 animate-pulse rounded-full bg-neutral-300 dark:bg-neutral-600" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-4 w-24 animate-pulse rounded bg-neutral-300 dark:bg-neutral-600" />
            <div className="h-3 w-16 animate-pulse rounded bg-neutral-300 dark:bg-neutral-600" />
          </div>
          <div className="h-4 w-32 animate-pulse rounded bg-neutral-300 dark:bg-neutral-600" />
        </div>
      ))}
    </div>
  );
}
