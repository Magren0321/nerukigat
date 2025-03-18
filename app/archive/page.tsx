'use client';

import { NormalContainer } from '@/components/layout/container/NomalContainer';
import { TimeLine } from '@/components/ui/timeline/TimeLine';
import { getPostTimeLine } from '@/utils';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoadingState() {
  return (
    <NormalContainer>
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-2 border-gray-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-2 border-t-black rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-xl font-medium text-gray-600">Loading...</p>
      </div>
    </NormalContainer>
  );
}

export default function Archive() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ArchiveContent />
    </Suspense>
  );
}

function ArchiveContent() {
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
