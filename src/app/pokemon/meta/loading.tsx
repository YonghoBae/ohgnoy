export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-2">
        <div className="h-8 w-32 animate-pulse rounded bg-neutral-300 dark:bg-neutral-600" />
        <div className="h-4 w-48 animate-pulse rounded bg-neutral-300 dark:bg-neutral-600" />
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-7 w-20 animate-pulse rounded-none border border-text-base bg-neutral-300 dark:bg-neutral-600" />
        ))}
      </div>
      <div className="rounded-none border-2 border-text-base bg-surface p-4">
        <div className="flex flex-col gap-2">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-2">
              <div className="h-4 w-8 animate-pulse rounded bg-neutral-300 dark:bg-neutral-600" />
              <div className="h-12 w-12 animate-pulse rounded-none border border-text-base bg-neutral-300 dark:bg-neutral-600" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="h-4 w-24 animate-pulse rounded bg-neutral-300 dark:bg-neutral-600" />
                <div className="h-3 w-16 animate-pulse rounded bg-neutral-300 dark:bg-neutral-600" />
              </div>
              <div className="h-4 w-32 animate-pulse rounded bg-neutral-300 dark:bg-neutral-600" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
