import { Post } from 'contentlayer2/generated';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';

export const TimeLine = ({ dateMap }: { dateMap: Record<string, Post[]> }) => {
  return (
    <div className="mt-10">
      {dateMap &&
        Object.keys(dateMap)
          .reverse()
          .map((year, idx) => (
            <div key={idx} className="mb-10">
              <div className="text-xl font-bold">{year}</div>
              <div className="mt-5 text-sm">
                {dateMap[year].map((post, idx) => (
                  <div key={idx} className="mb-5">
                    <div className="flex items-center justify-between text-gray-800/90 dark:text-gray-200/90">
                      <div className="relative font-medium">
                        <time dateTime={post.date} className="mr-3">
                          {format(parseISO(post.date), 'MM/dd')}
                        </time>
                        <Link
                          href={post.url}
                          className="timeline-link relative"
                        >
                          <span>{post.title}</span>
                        </Link>
                      </div>
                      <div className="hidden lg:block">
                        #
                        {post.tags.map((tag, idx) => (
                          <span key={idx}>
                            <Link href={`/archive?tag=${tag}`}>{tag}</Link>
                            {idx < post.tags.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
    </div>
  );
};
