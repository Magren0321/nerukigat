export default function CollectionLoading() {
  return (
    <div
      aria-label="正在加载收藏记录"
      aria-busy="true"
      className="animate-pulse motion-reduce:animate-none"
    >
      <div className="border-b border-zinc-200 py-9 dark:border-zinc-800">
        <div className="size-8 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-3 h-10 w-40 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-3 h-5 w-72 max-w-full rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="mt-6 h-6 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-3 space-y-1">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-12 border-b border-zinc-200 dark:border-zinc-800"
          />
        ))}
      </div>
    </div>
  );
}
