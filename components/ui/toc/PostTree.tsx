'use client';

import { useHeadings } from '@/hooks/useHead';
import { useScroll } from '@/hooks/useScroll';
import { PostItem } from './PostItem';

export const PostTree = () => {
  const headings = useHeadings();
  const activeId = useScroll(headings.map((heading) => heading.id));

  if (headings.length === 0) return null;

  return (
    <div className="group sticky top-28 hidden h-fit w-[200px] shrink-0 pl-8 text-sm lg:block">
      {headings.map((heading) => (
        <PostItem
          key={heading.id}
          active={heading.id === activeId}
          level={heading.level}
          text={heading.title}
          id={heading.id}
        />
      ))}
    </div>
  );
};
