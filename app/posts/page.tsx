'use client';

import { NormalContainer } from '@/components/layout/container/NomalContainer';
import { Post, allPosts } from 'contentlayer/generated';
import { compareDesc, format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MouseEvent, useEffect, useRef, useState } from 'react';

const PostCardMask = ({
  maskY,
  maskHeight,
}: {
  maskY: number;
  maskHeight: number;
}) => {
  return (
    <div className="hidden lg:block">
      <motion.div
        className="absolute left-[-20px] top-0 z-[-1] w-[calc(100%+40px)] rounded-lg bg-zinc-200 dark:bg-zinc-700 "
        animate={{ y: maskY, height: maskHeight }}
        transition={{ type: 'spring', duration: 0.5 }}
      />
    </div>
  );
};

const PostCard = (post: Post) => {
  return (
    <Link href={post.url}>
      <div className="mb-10">
        <h1 className="relative mb-6 break-words text-2xl font-bold">
          {post.title}
        </h1>
        <div className="mb-5 break-all font-medium  leading-loose text-gray-800/90 dark:text-gray-200/90">
          {post.description}
        </div>
        <div className="mb-5 flex items-center text-xs font-bold text-gray-600 dark:text-gray-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="mr-1 h-3 w-3"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
          <time dateTime={post.date} className="mr-3">
            {format(parseISO(post.date), 'LLLL d, yyyy')}
          </time>
          <div>
            #
            {post.tags.map((tag, idx) => (
              <span key={idx}>
                {tag}
                {idx < post.tags.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end  text-xs font-bold text-blue-600">
          阅读全文
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="ml-1 h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
};

export default function Posts() {
  const [maskHeight, setMaskHeight] = useState(0);
  const [maskY, setMaskY] = useState(0);

  const postList = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (maskHeight === 0 && window.innerWidth > 1024) {
      const target = postList.current?.firstChild;
      if (target) {
        const { clientHeight, offsetTop } = target as HTMLElement;
        setMaskHeight(clientHeight + 20);
        setMaskY(offsetTop - 15);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMask = (e: MouseEvent<HTMLElement>) => {
    if (window.innerWidth < 1024) return;
    const { clientHeight, offsetTop } = e.currentTarget;
    if (maskHeight === clientHeight && maskY === offsetTop) return;
    setMaskHeight(clientHeight + 20);
    setMaskY(offsetTop - 10);
  };

  const posts = allPosts.sort((a, b) =>
    compareDesc(new Date(a.date), new Date(b.date))
  );
  return (
    <NormalContainer>
      <div ref={postList}>
        {posts.map((post, idx) => (
          <div key={idx} onMouseEnter={handleMask} onMouseLeave={handleMask}>
            <PostCard {...post} />
          </div>
        ))}
      </div>
      <PostCardMask maskY={maskY} maskHeight={maskHeight} />
    </NormalContainer>
  );
}
