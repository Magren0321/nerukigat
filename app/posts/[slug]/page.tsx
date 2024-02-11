import { format, parseISO } from 'date-fns'
import { allPosts } from 'contentlayer/generated'
import Link from 'next/link'
import { PostContainer } from '@/components/layout/container/PostContainer'
import { Image } from '@/components/ui/img/Image'
import { Heading1 ,Heading2 ,Heading3 } from '@/components/ui/heading/Heading'
import { PostTree } from '@/components/ui/toc/PostTree'
import { Comment } from '@/components/ui/comment/Comment'
import { useMDXComponent } from 'next-contentlayer/hooks'
import { PostProvider } from '@/providers/post/PostProvider'


export const generateStaticParams = async () => allPosts.map((post) => ({ slug: post._raw.flattenedPath }))

export const generateMetadata = ({ params }: { params: { slug: string } }) => {
  const post = allPosts.find((post) => post._raw.flattenedPath === params.slug)
  if (!post) throw new Error(`Post not found for slug: ${params.slug}`)
  return {
    title: post.title,
    description: post.description,
    date: post.date,
  }
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
          <Link key={tag} className="inline-block px-1 font-medium uppercase" href={`/archive?tag=${tag}`}>
            #{tag}
          </Link>
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
        <div>
          <article className="prose dark:prose-invert max-w-full text-sm/7 font-sans  text-zinc-900 dark:text-zinc-200
          prose-code:whitespace-pre-wrap">
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
          <div className='mt-4 text-sm font-mono opacity-50  hover:opacity-75'>
            <Link href={'/posts'}>{'>'}<span className='border-solid border-b-2 border-b-[#000] ml-2 dark:border-b-[#fff]'>cd .. </span></Link>
          </div>
          <Comment 
            path={'/' + params.slug}
            serverURL={'https://waline.magren.cc'}/>
          </div>
        <PostTree />
      </div>
    </PostContainer>
  )
}

export default PostLayout

