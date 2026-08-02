'use client';

import { NormalContainer } from '@/components/layout/container/NomalContainer';
import { TimeLine } from '@/components/ui/timeline/TimeLine';
import { getPostTimeLine } from '@/utils';
import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo } from 'react';

export default function Archive() {
  return (
    <Suspense fallback={null}>
      <ArchiveContent />
    </Suspense>
  );
}

function ArchiveContent() {
  const searchParams = useSearchParams();
  const tag = searchParams.get('tag') || '';

  // 解析多个 tag（逗号分割）
  const tags = useMemo(() => {
    return tag
      ? tag
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t.length > 0)
      : [];
  }, [tag]);

  const { value, length } = getPostTimeLine(tag);

  const displayTitle = useMemo(() => {
    if (tags.length === 0) {
      return '归档';
    }
    if (tags.length === 1) {
      return tags[0];
    }
    return tags.join(', ');
  }, [tags]);

  return (
    <NormalContainer>
      <div className="grid gap-10 lg:grid-cols-[minmax(250px,0.7fr)_minmax(0,1.7fr)] lg:gap-14 xl:gap-20">
        <header className="h-fit lg:sticky lg:top-28">
          <p className="mb-3 text-sm font-medium text-blue-600 dark:text-blue-400">
            Archive
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-950 lg:text-5xl dark:text-zinc-50">
            {displayTitle}
          </h1>
          <p className="mt-5 text-sm text-zinc-600 dark:text-zinc-400">
            共 {length} 篇文章
          </p>
        </header>
        <section className="min-w-0" aria-label="文章归档">
          <TimeLine dateMap={value} />
        </section>
      </div>
    </NormalContainer>
  );
}
