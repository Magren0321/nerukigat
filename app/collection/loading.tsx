export default function CollectionLoading() {
  return (
    <div
      aria-label="正在加载收藏记录"
      aria-busy="true"
      className="grid animate-pulse gap-12 pb-20 pt-9 motion-reduce:animate-none lg:grid-cols-[minmax(16rem,0.72fr)_minmax(0,1.8fr)] lg:gap-16 lg:pt-14 xl:gap-24"
    >
      <div>
        <div className="h-8 w-24 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-5 h-14 w-40 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-7 h-20 max-w-sm rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-10 h-16 border-t border-zinc-200 pt-5 dark:border-zinc-800" />
        <div className="mt-8 h-14 max-w-sm rounded-xl bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <div>
        <div className="h-16 border-b border-zinc-200 dark:border-zinc-800" />
        <div className="mt-7 h-11 max-w-sm rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-9 space-y-10">
          {Array.from({ length: 3 }).map((_, groupIndex) => (
            <div key={groupIndex}>
              <div className="mb-3 h-7 w-24 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
              <div className="grid gap-2 rounded-2xl bg-white/60 p-2 ring-1 ring-zinc-200/75 sm:grid-cols-2 dark:bg-zinc-900/45 dark:ring-zinc-800">
                {Array.from({ length: 4 }).map((__, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="h-[76px] rounded-xl bg-zinc-100/75 dark:bg-zinc-800/60"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
