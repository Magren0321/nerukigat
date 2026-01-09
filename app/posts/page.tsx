'use client';

import { NormalContainer } from '@/components/layout/container/NomalContainer';
import { calculateReadingStats } from '@/utils/post';
import { Post, allPosts } from 'contentlayer2/generated';
import { AnimatePresence, motion } from 'framer-motion';
import { compareDesc, format, parseISO } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

const POSTS_PER_PAGE = 10;

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const { words, readingTime } = useMemo(() => {
    if (!post.body?.code) {
      return { words: 0, readingTime: 1 };
    }
    return calculateReadingStats(post.body.code);
  }, [post.body?.code]);

  const handleCardClick = () => {
    router.push(post.url);
  };

  const handleTagClick = (tag: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/archive?tag=${encodeURIComponent(tag)}`);
  };

  return (
    <article
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative mb-6 cursor-pointer overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 transition-all duration-300 hover:border-blue-500 hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:border-blue-400"
    >
      {/* 左侧蓝色竖线 */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative">
        {/* 标题 */}
        <h2 className="mb-3 text-xl font-bold text-zinc-900 transition-colors group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
          {post.title}
        </h2>

        {/* 描述 */}
        {post.description && (
          <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {post.description}
          </p>
        )}

        {/* 元数据 */}
        <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          {/* 置顶标签 */}
          {post.top && (
            <div className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-3.5 w-3.5"
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
          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-3.5 w-3.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
              />
            </svg>
            <time dateTime={post.date}>
              {format(parseISO(post.date), 'yyyy-MM-dd')}
            </time>
          </div>

          {/* 阅读信息 */}
          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-3.5 w-3.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            <span>
              {words} 字 | {readingTime} 分钟
            </span>
          </div>
        </div>

        {/* 标签 */}
        <div className="flex flex-wrap items-center gap-2">
          {post.tags.map((tag) => (
            <button
              key={tag}
              onClick={(e) => handleTagClick(tag, e)}
              className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* 右侧箭头 */}
        <motion.div
          className="absolute right-6 top-4"
          animate={{
            opacity: isHovered ? 1 : 0,
            x: isHovered ? 0 : -10,
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-5 w-5 text-blue-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"
            />
          </svg>
        </motion.div>
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

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
      >
        上一页
      </button>

      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
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
              : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700'
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
            className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
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
