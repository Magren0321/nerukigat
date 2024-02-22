'use client';

import { NormalContainer } from '@/components/layout/container/NomalContainer';
import { TimeLine } from '@/components/ui/timeline/TimeLine';
import { getPostTimeLine } from '@/utils';
import { useSearchParams } from 'next/navigation';

export default function Archive() {
  const searchParams = useSearchParams();
  const tag = searchParams.get('tag') || '';

  const { value, length } = getPostTimeLine(tag);

  const TimeHead = () => {
    return (
      <header>
        <h1 className="text-3xl font-bold">{tag || '归档'}</h1>
        <h2 className="mt-10 text-xl font-bold">
          目前共有{length}篇文章，继续努力
        </h2>
      </header>
    );
  };

  return (
    <NormalContainer>
      <TimeHead />
      <TimeLine dateMap={value} />
    </NormalContainer>
  );
}
