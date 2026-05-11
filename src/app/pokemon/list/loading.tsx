export default function Loading() {
  return (
    <div className="-mx-5 flex flex-col border-x border-border bg-surface-2/20 backdrop-blur-sm">
      <div className="py-3 px-4">
        <div className="relative mx-auto h-10 w-full animate-pulse rounded-full bg-surface-2 sm:w-2/3" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-4 py-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="h-[220px] w-full animate-pulse rounded-2xl bg-surface-2"
          />
        ))}
      </div>
    </div>
  );
}
