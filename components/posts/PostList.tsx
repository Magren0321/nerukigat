'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { compareDesc, format, parseISO } from 'date-fns';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { NormalContainer } from '@/components/layout/container/NomalContainer';
import { useSupportsHover } from '@/hooks/useSupportsHover';
import type { PublicPostSummaryView } from '@/lib/content';

const POSTS_PER_PAGE = 10;

const PostCard = ({ post }: { post: PublicPostSummaryView }) => {
  const supportsHover = useSupportsHover();

  return (
    <article className="group relative border-b border-zinc-200/60 py-5 transition-colors last:border-b-0 dark:border-zinc-800/60">
      <div className="relative">
        <Link href={post.url} className="block">
          <h2
            className={`mb-2 text-lg font-medium text-zinc-900 transition-colors dark:text-zinc-100 ${
              supportsHover
                ? 'group-hover:text-blue-600 dark:group-hover:text-blue-400'
                : ''
            }`}
          >
            {post.title}
          </h2>

          {post.description && (
            <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              {post.description}
            </p>
          )}

          <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-zinc-400 dark:text-zinc-500">
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
            <time dateTime={post.date}>
              {format(parseISO(post.date), 'yyyy-MM-dd')}
            </time>
            <span>
              {post.words} 字 · {post.readingTime} 分钟
            </span>
          </div>
        </Link>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/archive?tag=${encodeURIComponent(tag)}`}
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

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  const supportsHover = useSupportsHover();
  if (totalPages <= 1) return null;

  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  const endPage = Math.min(totalPages, startPage + maxVisible - 1);
  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  const pages = Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index
  );
  const hoverClasses = supportsHover
    ? 'hover:bg-zinc-100 dark:hover:bg-zinc-700'
    : 'active:bg-zinc-100 dark:active:bg-zinc-700';

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-300 ${hoverClasses}`}
      >
        上一页
      </button>

      {startPage > 1 && (
        <>
          <button
            type="button"
            onClick={() => onPageChange(1)}
            className={`rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors dark:text-zinc-300 ${hoverClasses}`}
          >
            1
          </button>
          {startPage > 2 && <span className="px-2 text-zinc-500">…</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          type="button"
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
            <span className="px-2 text-zinc-500">…</span>
          )}
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            className={`rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors dark:text-zinc-300 ${hoverClasses}`}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-300 ${hoverClasses}`}
      >
        下一页
      </button>
    </div>
  );
};

export const PostList = ({ posts }: { posts: PublicPostSummaryView[] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const sortedPosts = useMemo(
    () =>
      posts.slice().sort((left, right) => {
        if (left.top !== right.top) return left.top ? -1 : 1;
        return compareDesc(parseISO(left.date), parseISO(right.date));
      }),
    [posts]
  );
  const totalPages = Math.ceil(sortedPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = sortedPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  return (
    <NormalContainer>
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Blog
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
                key={post.id}
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
        onPageChange={setCurrentPage}
      />
    </NormalContainer>
  );
};
