import { format, parseISO } from 'date-fns'
import { allPosts } from 'contentlayer/generated'
import { PostContainer } from '@/components/layout/container/PostContainer'
import { Image } from '@/components/ui/img/Image'
import { Heading1 ,Heading2 ,Heading3 } from '@/components/ui/heading/Heading'
import { PostTree } from '@/components/ui/toc/PostTree'
import { useMDXComponent } from 'next-contentlayer/hooks'
import { PostProvider } from '@/providers/post/PostProvider'


export const generateStaticParams = async () => allPosts.map((post) => ({ slug: post._raw.flattenedPath }))

export const generateMetadata = ({ params }: { params: { slug: string } }) => {
  const post = allPosts.find((post) => post._raw.flattenedPath === params.slug)
  if (!post) throw new Error(`Post not found for slug: ${params.slug}`)
  return { title: post.title }
}

const PostTitle =  ({ title , date , tags } : {
  title: string,
  date: string,
  tags: string[]
}) =>{
  return (
    <div className="mb-8 text-center">
    <h1 className="text-3xl font-bold">{title}</h1>
    <div className='text-xs text-gray-600 dark:text-zinc-100'>
      <time dateTime={date}>
        {format(parseISO(date), 'LLLL d, yyyy')}
      </time>
      <span> • </span>
      <span>
        {tags.map((tag) => (
          <span key={tag} className="inline-block px-1 font-medium uppercase">
            #{tag}
          </span>
        ))}
      </span>
    </div>
  </div>
  )
}

const PostLayout = ({ params }: { params: { slug: string } }) => {
  const post = allPosts.find((post) => post._raw.flattenedPath === params.slug)
  if (!post) throw new Error(`Post not found for slug: ${params.slug}`)

  const Component = useMDXComponent(post.body.code);

  return (
    <PostContainer>
      <div className='relative flex min-h-[120px] grid-cols-[auto,200px] lg:grid'>
        <article className="prose dark:prose-invert max-w-full">
          <PostTitle {...post} />
          <PostProvider>
            <Component
              components={{
                img: Image,
                h1: Heading1,
                h2: Heading2,
                h3: Heading3,
              }}
            />
          </PostProvider>
        </article>
        <PostTree />
      </div>
    </PostContainer>
  )
}

export default PostLayout

