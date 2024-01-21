'use client'

import { PostItem } from "./PostItem"
import { useHeadings } from "@/hooks/useHead"
import { useScroll } from "@/hooks/useScroll"

export const PostTree = () => {
  const headings = useHeadings()
  const activeId = useScroll(
    headings.map((heading) => heading.id),
    { rootMargin: `0% 0% -70% 0%` }
  )
  return (
    <div className="sticky h-fit top-28 hidden lg:block pl-8 text-sm ">
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
  )
}
