export default function Loading() {
  return (
    <div role="status" className="flex h-full w-full items-center justify-center">
      <div className="h-12 w-12 motion-safe:animate-spin border-4 border-neutral-300 border-t-neutral-700 dark:border-neutral-600 dark:border-t-neutral-200" />
      <span className="sr-only">불러오는 중…</span>
    </div>
  );
}
