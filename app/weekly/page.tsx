import { NormalContainer } from '@/components/layout/container/NomalContainer';
import { listPublicPostSummaries, type PublicPostSummaryView } from '@/lib/content';
import { compareDesc, format, parseISO } from 'date-fns';
import { WeeklyLink } from '@/components/ui/link/WeeklyLink';

export default async function Weekly() {
  const weeklyPosts = (await listPublicPostSummaries())
    .filter((post) => post.kind === 'weekly')
    .sort((a, b) => compareDesc(parseISO(a.date), parseISO(b.date)));

  // 按年份分组
  const groupedByYear: Record<string, PublicPostSummaryView[]> = {};
  weeklyPosts.forEach((post) => {
    const year = format(parseISO(post.date), 'yyyy');
    if (!groupedByYear[year]) {
      groupedByYear[year] = [];
    }
    groupedByYear[year].push(post);
  });

  const years = Object.keys(groupedByYear).sort((a, b) => Number(b) - Number(a));

  return (
    <NormalContainer>
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Weekly
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          共 {weeklyPosts.length} 篇周刊
        </p>
      </div>

      {weeklyPosts.length === 0 ? (
        <div className="flex min-h-[400px] items-center justify-center text-center text-zinc-500 dark:text-zinc-400">
          这里空空如也...
        </div>
      ) : (
        <div className="space-y-16">
          {years.map((year) => (
            <div key={year} className="relative">
              <div className="pointer-events-none absolute -left-2 -top-4 select-none">
                <span className="block text-[80px] font-bold leading-none text-zinc-300/50 dark:text-zinc-700/50">
                  {year}
                </span>
              </div>
              <div className="relative space-y-3 pt-6">
                {groupedByYear[year].map((post) => (
                  <div
                    key={post.id}
                    className="flex min-w-0 flex-1 items-baseline gap-4 text-base"
                  >
                    <time
                      dateTime={post.date}
                      className="w-16 flex-shrink-0 tabular-nums text-zinc-500 dark:text-zinc-400"
                    >
                      {format(parseISO(post.date), 'MMM d')}
                    </time>
                    <WeeklyLink href={post.url}>
                      <span>{post.title}</span>
                    </WeeklyLink>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </NormalContainer>
  );
}
