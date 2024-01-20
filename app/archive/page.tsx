import { allPosts, Post } from 'contentlayer/generated'
import { compareDesc, format, parseISO } from 'date-fns'
import Link from 'next/link'
import { NormalContainer } from "@/components/layout/container/NomalContainer"

export default function Archive() {

  const posts = allPosts.sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)));

  const dateMap = {} as Record<string, Post[]>

  posts.forEach((post) => {
    const year = format(parseISO(post.date), 'yyyy')
    if (!dateMap[year]) {
      dateMap[year] = []
    }
    dateMap[year].push(post);
  })


  const TimeHead = () =>{
    return (
      <header>
        <h1 className="text-3xl font-bold">归档</h1>
        <h2 className='text-xl font-bold mt-10'>目前共有{posts.length}篇文章，继续努力</h2>
      </header>
    )
  }

  const TimeLine = () => {
    return (
      <div className='mt-10'>
        {
          dateMap && Object.keys(dateMap).reverse().map((year, idx) => (
            <div key={idx} className='mb-10'>
              <div className='text-xl font-bold'>{year}</div>
              <div className='mt-5 text-sm'>
                {
                  dateMap[year].map((post, idx) => (
                    <div key={idx} className='mb-5'>
                      <div className='flex items-center justify-between text-gray-800/90 dark:text-gray-200/90'>
                        <div className='font-mediu'>
                          <time dateTime={post.date} className='mr-3'>
                            {format(parseISO(post.date), 'MM/dd')}
                          </time>
                          <Link href={post.url} >
                            <span>{post.title}</span>
                          </Link>
                        </div>
                        <div className='hidden lg:block'>
                          #
                          {
                            post.tags.map((tag, idx) => (
                              <span key={idx}>
                                {tag}
                                {idx < post.tags.length - 1 ? ', ' : ''}
                              </span>
                            ))
                          }
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          ))  
        }
      </div>
    )
  }

  return (
    <NormalContainer>
      <TimeHead />
      <TimeLine />
    </NormalContainer>
  )
}
