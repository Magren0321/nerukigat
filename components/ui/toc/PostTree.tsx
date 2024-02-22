'use client';

import { useHeadings } from '@/hooks/useHead';
import { useScroll } from '@/hooks/useScroll';
import { PostItem } from './PostItem';

export const PostTree = () => {
  const headings = useHeadings();
  const activeId = useScroll(
    headings.map((heading) => heading.id),
    { rootMargin: `0% 0% -70% 0%` }
  );
  return (
    <div className="sticky top-28 hidden h-fit pl-8 text-sm lg:block ">
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
