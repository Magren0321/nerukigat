'use client';

import { NormalContainer } from '@/components/layout/container/NomalContainer';
import { TimeLine } from '@/components/ui/timeline/TimeLine';
import { Loading } from '@/components/ui/loading/Loading';
import { getPostTimeLine } from '@/utils';
import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo } from 'react';

export default function Archive() {
  return (
    <Suspense fallback={
      <NormalContainer>
        <Loading />
      </NormalContainer>
    }>
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
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          {displayTitle}
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          共 {length} 篇文章
        </p>
      </div>
      <TimeLine dateMap={value} />
    </NormalContainer>
  );
}
