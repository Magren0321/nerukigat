'use client';

import { useHeadings } from '@/hooks/useHead';
import { useScroll } from '@/hooks/useScroll';
import { PostItem } from './PostItem';

export const PostTree = () => {
  const headings = useHeadings();
  const activeId = useScroll(headings.map((heading) => heading.id));

  if (headings.length === 0) return null;

  return (
    <aside
      className="group sticky top-28 hidden h-fit w-full pl-2 text-sm lg:block"
      aria-label="文章目录"
    >
      {headings.map((heading) => (
        <PostItem
          key={heading.id}
          active={heading.id === activeId}
          level={heading.level}
          text={heading.title}
          id={heading.id}
        />
      ))}
    </aside>
  );
};
