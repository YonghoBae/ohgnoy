export default function Loading() {
  return (
    <div
      aria-busy="true"
      className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8"
    >
      <span className="sr-only">불러오는 중…</span>
      <div className="flex flex-col gap-2">
        <div className="h-8 w-32 motion-safe:animate-pulse rounded bg-neutral-300 dark:bg-neutral-600" />
        <div className="h-4 w-48 motion-safe:animate-pulse rounded bg-neutral-300 dark:bg-neutral-600" />
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-7 w-20 motion-safe:animate-pulse rounded-none border border-text-base bg-neutral-300 dark:bg-neutral-600" />
        ))}
      </div>
      <div className="rounded-none border-2 border-text-base bg-surface p-4">
        <div className="flex flex-col gap-2">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-2">
              <div className="h-4 w-8 motion-safe:animate-pulse rounded bg-neutral-300 dark:bg-neutral-600" />
              <div className="h-12 w-12 motion-safe:animate-pulse rounded-none border border-text-base bg-neutral-300 dark:bg-neutral-600" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="h-4 w-24 motion-safe:animate-pulse rounded bg-neutral-300 dark:bg-neutral-600" />
                <div className="h-3 w-16 motion-safe:animate-pulse rounded bg-neutral-300 dark:bg-neutral-600" />
              </div>
              <div className="h-4 w-32 motion-safe:animate-pulse rounded bg-neutral-300 dark:bg-neutral-600" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
