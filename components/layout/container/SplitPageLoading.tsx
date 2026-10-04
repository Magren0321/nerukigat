import { SplitLayout, SplitPageContainer } from './SplitPageLayout';

export function SplitPageLoading({ label }: { label: string }) {
  return (
    <SplitPageContainer animated={false}>
      <SplitLayout
        aria-label={label}
        aria-busy="true"
        className="animate-pulse motion-reduce:animate-none"
      >
        <div aria-hidden="true">
          <div className="h-5 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-3 h-12 w-36 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-5 h-5 w-28 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-8 hidden grid-cols-2 gap-x-6 gap-y-3 border-t border-zinc-200 pt-6 lg:grid dark:border-zinc-800">
            {Array.from({ length: 8 }, (_, index) => (
              <div
                key={index}
                className="h-4 w-20 rounded bg-zinc-200 dark:bg-zinc-800"
              />
            ))}
          </div>
        </div>

        <div aria-hidden="true" className="min-w-0">
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              className="border-b border-zinc-200 py-5 last:border-b-0 dark:border-zinc-800"
            >
              <div className="h-6 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="mt-3 h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="mt-3 h-4 w-40 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="mt-3 h-4 w-28 rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
          ))}
        </div>
      </SplitLayout>
    </SplitPageContainer>
  );
}
