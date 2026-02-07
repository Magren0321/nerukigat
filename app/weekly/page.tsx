'use client';

import { NormalContainer } from '@/components/layout/container/NomalContainer';
import { allPosts, Post } from 'contentlayer2/generated';
import { compareDesc, format, parseISO } from 'date-fns';
import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';

// 检测是否支持真正的 hover（而非触摸）
const useSupportsHover = () => {
  const [supportsHover, setSupportsHover] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    setSupportsHover(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setSupportsHover(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return supportsHover;
};

export default function Weekly() {
  const supportsHover = useSupportsHover();

  const weeklyPosts = useMemo(() => {
    return allPosts
      .filter((post) => post._raw.flattenedPath === 'weekly' || post._raw.flattenedPath.startsWith('weekly/'))
      .filter((post) => process.env.NODE_ENV === 'development' || !post.draft)
      .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)));
  }, []);

  // 按年份分组
  const groupedByYear = useMemo(() => {
    const grouped: Record<string, Post[]> = {};
    weeklyPosts.forEach((post) => {
      const year = format(parseISO(post.date), 'yyyy');
      if (!grouped[year]) {
        grouped[year] = [];
      }
      grouped[year].push(post);
    });
    return grouped;
  }, [weeklyPosts]);

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
                <span className="block text-[80px] font-bold leading-none text-zinc-300/50 dark:text-zinc-800/50">
                  {year}
                </span>
              </div>
              <div className="relative space-y-3 pt-6">
                {groupedByYear[year].map((post) => (
                  <div
                    key={post._id}
                    className="flex min-w-0 flex-1 items-baseline gap-4 text-base"
                  >
                    <time
                      dateTime={post.date}
                      className="flex-shrink-0 tabular-nums text-zinc-500 dark:text-zinc-400"
                    >
                      {format(parseISO(post.date), 'MMM d')}
                    </time>
                    <Link
                      href={post.url}
                      className={`relative min-w-0 flex-1 font-medium text-zinc-900 transition-colors dark:text-zinc-100 ${
                        supportsHover
                          ? 'hover:text-blue-600 dark:hover:text-blue-400'
                          : ''
                      }`}
                    >
                      <span>{post.title}</span>
                    </Link>
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

