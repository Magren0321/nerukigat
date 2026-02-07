'use client';

import { NormalContainer } from '@/components/layout/container/NomalContainer';
import { calculateReadingStats } from '@/utils/post';
import { Post, allPosts } from 'contentlayer2/generated';
import { AnimatePresence, motion } from 'framer-motion';
import { compareDesc, format, parseISO } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

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

const POSTS_PER_PAGE = 10;

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const supportsHover = useSupportsHover();
  const { words, readingTime } = useMemo(() => {
    if (!post.body?.code) {
      return { words: 0, readingTime: 1 };
    }
    return calculateReadingStats(post.body.code);
  }, [post.body?.code]);

  return (
    <article
      className="group relative border-b border-zinc-200/60 py-5 transition-colors dark:border-zinc-800/60 last:border-b-0"
    >
      <div className="relative">
        {/* 主要内容区域和元数据 - 可点击 */}
        <Link
          href={post.url}
          className="block"
        >
          {/* 标题 */}
          <h2
            className={`mb-2 text-lg font-medium text-zinc-900 transition-colors dark:text-zinc-100 ${
              supportsHover
                ? 'group-hover:text-blue-600 dark:group-hover:text-blue-400'
                : ''
            }`}
          >
            {post.title}
          </h2>

          {/* 描述 */}
          {post.description && (
            <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              {post.description}
            </p>
          )}

          {/* 元数据 */}
          <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-zinc-400 dark:text-zinc-500">
            {/* 置顶标签 */}
            {post.top && (
              <div className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-3 w-3"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                  />
                </svg>
                <span>置顶</span>
              </div>
            )}

            {/* 日期 */}
            <time dateTime={post.date} className="flex items-center gap-1">
              {format(parseISO(post.date), 'yyyy-MM-dd')}
            </time>

            {/* 阅读信息 */}
            <span className="flex items-center gap-1">
              {words} 字 · {readingTime} 分钟
            </span>
          </div>
        </Link>

        {/* 标签 - 独立链接，不在文章链接内 */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/archive?tag=${encodeURIComponent(tag)}`}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className={`text-xs text-zinc-400 transition-colors dark:text-zinc-500 ${
                  supportsHover
                    ? 'hover:text-zinc-600 dark:hover:text-zinc-400'
                    : 'active:text-zinc-600 dark:active:text-zinc-400'
                }`}
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  );
};


interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  const supportsHover = useSupportsHover();

  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const hoverClasses = supportsHover
    ? 'hover:bg-zinc-100 dark:hover:bg-zinc-700'
    : 'active:bg-zinc-100 dark:active:bg-zinc-700';

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-300 ${hoverClasses}`}
      >
        上一页
      </button>

      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className={`rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors dark:text-zinc-300 ${hoverClasses}`}
          >
            1
          </button>
          {startPage > 2 && <span className="px-2 text-zinc-500">...</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            page === currentPage
              ? 'bg-blue-500 text-white'
              : `text-zinc-700 dark:text-zinc-300 ${hoverClasses}`
          }`}
        >
          {page}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <span className="px-2 text-zinc-500">...</span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            className={`rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors dark:text-zinc-300 ${hoverClasses}`}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-300 ${hoverClasses}`}
      >
        下一页
      </button>
    </div>
  );
};

export default function Posts() {
  const [currentPage, setCurrentPage] = useState(1);

  // 获取所有文章并排序
  const allPostsData = useMemo(() => {
    let posts = allPosts
      .slice()
      .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)));

    if (process.env.NODE_ENV !== 'development') {
      posts = posts.filter((post) => !post.draft);
    }

    return posts;
  }, []);

  // 分离置顶和普通文章
  const { topPosts, regularPosts } = useMemo(() => {
    return allPostsData.reduce(
      (acc, post) => {
        if (post.top) {
          acc.topPosts.push(post);
        } else {
          acc.regularPosts.push(post);
        }
        return acc;
      },
      { topPosts: [] as Post[], regularPosts: [] as Post[] }
    );
  }, [allPostsData]);

  // 合并置顶和普通文章（置顶在前）
  const sortedPosts = useMemo(() => {
    return [...topPosts, ...regularPosts];
  }, [topPosts, regularPosts]);

  // 分页
  const totalPages = Math.ceil(sortedPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * POSTS_PER_PAGE;
    const end = start + POSTS_PER_PAGE;
    return sortedPosts.slice(start, end);
  }, [sortedPosts, currentPage]);

  // 翻页时滚动到顶部
  useEffect(() => {
    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // 处理翻页，添加滚动
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <NormalContainer>
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          文章列表
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          共 {sortedPosts.length} 篇文章
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {paginatedPosts.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 dark:text-zinc-400">
              暂无文章
            </div>
          ) : (
            paginatedPosts.map((post, index) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <PostCard post={post} />
              </motion.div>
            ))
          )}
        </motion.div>
      </AnimatePresence>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </NormalContainer>
  );
}
