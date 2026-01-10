'use client';

import { Post } from 'contentlayer2/generated';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { startNavigation } from '@/components/ui/progress/useProgress';

// 检测是否支持真正的 hover（而非触摸）
const useSupportsHover = () => {
  const [supportsHover, setSupportsHover] = useState(false);

  useEffect(() => {
    // 检测是否支持真正的 hover（不是触摸设备的伪 hover）
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    setSupportsHover(mediaQuery.matches);

    // 监听变化（例如设备方向改变）
    const handleChange = (e: MediaQueryListEvent) => {
      setSupportsHover(e.matches);
    };

    // 使用 addEventListener 替代 addListener（更好的兼容性）
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // 降级方案（旧浏览器）
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return supportsHover;
};

export const TimeLine = ({ dateMap }: { dateMap: Record<string, Post[]> }) => {
  const router = useRouter();
  const supportsHover = useSupportsHover();
  const MAX_VISIBLE_TAGS = 5; // 最多显示的标签数量

  const handleTagClick = (tag: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startNavigation();
    router.push(`/archive?tag=${encodeURIComponent(tag)}`);
  };

  const handlePostClick = (url: string, e: React.MouseEvent) => {
    e.preventDefault();
    startNavigation();
    router.push(url);
  };

  return (
    <div className="mt-10">
      {dateMap &&
        Object.keys(dateMap)
          .reverse()
          .map((year, idx) => (
            <div key={idx} className="mb-10">
              <h2 className="mb-5 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {year}
              </h2>
              <div className="space-y-4">
                {dateMap[year].map((post, postIdx) => (
                  <div
                    key={postIdx}
                    className="flex flex-col gap-3 border-b border-zinc-200 pb-4 last:border-b-0 dark:border-zinc-700 lg:flex-row lg:items-start lg:justify-between"
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-3 text-sm">
                      <time
                        dateTime={post.date}
                        className="flex-shrink-0 text-zinc-500 dark:text-zinc-400"
                      >
                        {format(parseISO(post.date), 'MM/dd')}
                      </time>
                      <Link
                        href={post.url}
                        onClick={(e) => handlePostClick(post.url, e)}
                        className={`relative min-w-0 flex-1 font-medium text-zinc-900 transition-colors dark:text-zinc-100 ${
                          supportsHover
                            ? 'hover:text-blue-600 dark:hover:text-blue-400'
                            : ''
                        }`}
                      >
                        <span className="timeline-link">{post.title}</span>
                      </Link>
                    </div>
                    {post.tags.length > 0 && (
                      <div className="hidden flex-shrink-0 flex-wrap items-center gap-2 lg:flex lg:max-w-md xl:max-w-lg">
                        {post.tags.slice(0, MAX_VISIBLE_TAGS).map((tag, tagIdx) => (
                          <button
                            key={tagIdx}
                            onClick={(e) => handleTagClick(tag, e)}
                            className={`inline-flex items-center whitespace-nowrap rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700 transition-colors dark:bg-zinc-700 dark:text-zinc-300 ${
                              supportsHover
                                ? 'hover:bg-zinc-200 dark:hover:bg-zinc-600'
                                : 'active:bg-zinc-200 dark:active:bg-zinc-600'
                            }`}
                          >
                            #{tag}
                          </button>
                        ))}
                        {post.tags.length > MAX_VISIBLE_TAGS && (
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            +{post.tags.length - MAX_VISIBLE_TAGS}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
    </div>
  );
};
