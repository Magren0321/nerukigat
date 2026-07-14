import { compareDesc, format, parseISO } from 'date-fns';

import { NormalContainer } from '@/components/layout/container/NomalContainer';
import { TimeLine } from '@/components/ui/timeline/TimeLine';
import {
  listPublicPostSummaries,
  type PublicPostSummaryView,
} from '@/lib/content';

interface ArchivePageProps {
  searchParams: Promise<{ tag?: string | string[] }>;
}

export default async function Archive({ searchParams }: ArchivePageProps) {
  const parameters = await searchParams;
  const rawTag = Array.isArray(parameters.tag)
    ? parameters.tag.join(',')
    : parameters.tag ?? '';
  const selectedTags = rawTag
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

  const posts = (await listPublicPostSummaries())
    .filter((post) =>
      selectedTags.every((selectedTag) => post.tags.includes(selectedTag))
    )
    .sort((left, right) =>
      compareDesc(parseISO(left.date), parseISO(right.date))
    );
  const dateMap: Record<string, PublicPostSummaryView[]> = {};

  for (const post of posts) {
    const year = format(parseISO(post.date), 'yyyy');
    dateMap[year] ??= [];
    dateMap[year].push(post);
  }

  const displayTitle =
    selectedTags.length === 0 ? '归档' : selectedTags.join(', ');

  return (
    <NormalContainer>
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          {displayTitle}
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          共 {posts.length} 篇文章
        </p>
      </div>
      <TimeLine dateMap={dateMap} />
    </NormalContainer>
  );
}
