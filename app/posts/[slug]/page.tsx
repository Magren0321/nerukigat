// app/posts/[slug]/page.tsx
import { format, parseISO } from 'date-fns'
import { allPosts } from 'contentlayer/generated'
import { PostContainer } from '@/components/layout/container/PostContainer'
import { Image } from '@/components/ui/img/Image'
import { useMDXComponent } from 'next-contentlayer/hooks'


export const generateStaticParams = async () => allPosts.map((post) => ({ slug: post._raw.flattenedPath }))

export const generateMetadata = ({ params }: { params: { slug: string } }) => {
  const post = allPosts.find((post) => post._raw.flattenedPath === params.slug)
  if (!post) throw new Error(`Post not found for slug: ${params.slug}`)
  return { title: post.title }
}

const PostLayout = ({ params }: { params: { slug: string } }) => {
  const post = allPosts.find((post) => post._raw.flattenedPath === params.slug)
  if (!post) throw new Error(`Post not found for slug: ${params.slug}`)

  const Component = useMDXComponent(post.body.code);

  return (
    <PostContainer>
      <div className='relative flex min-h-[120px] grid-cols-[auto,200px] lg:grid'>
        <article className="prose dark:prose-invert max-w-full">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">{post.title}</h1>
            <div className='text-xs text-gray-600 dark:text-zinc-100'>
              <time dateTime={post.date}>
                {format(parseISO(post.date), 'LLLL d, yyyy')}
              </time>
              <span> • </span>
              <span>
                {post.tags.map((tag) => (
                  <span key={tag} className="inline-block px-1 font-medium uppercase">
                    #{tag}
                  </span>
                ))}
              </span>
            </div>
          </div>
          <Component
            components={{
              img: Image
            }}
          />
        </article>
        <div>
          
        </div>
      </div>
    </PostContainer>
  )
}

export default PostLayout

