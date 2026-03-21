export default function Loading() {
  return (
    <div className="flex h-full w-full flex-col items-center border-x bg-gray-500 bg-opacity-20 backdrop-blur-sm backdrop-filter dark:bg-gray-800 dark:bg-opacity-20">
      <div className="relative mt-5 h-10 w-4/5 animate-pulse rounded-full bg-neutral-300 dark:bg-neutral-600 sm:w-2/3" />
      <div className="mt-5 flex h-[70vh] flex-wrap justify-center overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="m-5 h-[260px] w-[14rem] animate-pulse rounded-2xl bg-neutral-300 dark:bg-neutral-600"
          />
        ))}
      </div>
    </div>
  );
}
