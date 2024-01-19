// app/page.tsx
import Link from 'next/link'
import { compareDesc, format, parseISO } from 'date-fns'
import { allPosts, Post } from 'contentlayer/generated'
import { NormalContainer } from '@/components/layout/container/NomalContainer'

function PostCard(post: Post) {
  return (
    <Link href={post.url} >
      <div className="mt-20">
        <h1 className="relative break-words text-2xl mb-6 font-bold">
          {post.title}
        </h1>
        <div className='break-all leading-loose text-gray-800/90 dark:text-gray-200/90 mb-5'>
          {post.description}
        </div>
        <div className='flex justify-between items-center'>
          <div className='flex mb-5 items-center text-xs text-gray-600 dark:text-gray-200'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
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
          <div className='flex items-center  text-gray-800/90 dark:text-gray-200/90 text-xs'>
            阅读全文
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="ml-1 w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
            </svg>
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
