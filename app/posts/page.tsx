// app/page.tsx
import Link from 'next/link'
import { compareDesc, format, parseISO } from 'date-fns'
import { allPosts, Post } from 'contentlayer/generated'
import { NormalContainer } from '@/components/layout/container/NomalContainer'

function PostCard(post: Post) {
  return (
    <Link href={post.url} >
      <div className="py-10">
        <h1 className="relative break-words text-2xl mb-6 font-bold">
          {post.title}
        </h1>
        <div className='break-all leading-loose text-gray-800/90 dark:text-gray-200/90 mb-3'>
          {post.description}
        </div>
        <div className='flex items-center text-xs text-gray-600 dark:text-gray-200'>
          <time dateTime={post.date} className='mr-3'>
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
        
      </div>
    </Link>
  )
}

export default function Posts() {
  const posts = allPosts.sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)))
  return (
    <NormalContainer>
      {posts.map((post, idx) => (
        <PostCard key={idx} {...post} />
      ))}
    </NormalContainer>
  )
}
