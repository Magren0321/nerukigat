import clsx from 'clsx';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { MarkdownContent } from '@/components/MarkdownContent';
import { MDXContent } from '@/components/MDXContent';
import { BackButton } from '@/components/ui/button/BackButton';
import { PostContainer } from '@/components/layout/container/PostContainer';
import { PhotoProvider } from '@/components/ui/img/PreviewImage';
import { PostTree } from '@/components/ui/toc/PostTree';
import {
  getPublicPostByPath,
  listPublicPostPaths,
} from '@/lib/content';
import { PostProvider } from '@/providers/post/PostProvider';

interface PostPageProps {
  params: Promise<{ slug: string[] }>;
}

export const generateStaticParams = async () =>
  (await listPublicPostPaths()).map((canonicalPath) => ({
    slug: canonicalPath.split('/'),
  }));

export const generateMetadata = async ({ params }: PostPageProps) => {
  const { slug } = await params;
  const post = await getPublicPostByPath(slug.join('/'));
  if (!post) notFound();

  return {
    title: post.title,
    description: post.description,
    date: post.date,
    alternates: { canonical: post.url },
  };
};

const PostTitle = ({
  title,
  date,
  tags,
}: {
  title: string;
  date: string;
  tags: string[];
}) => (
  <div className="mb-8 text-center">
    <h1 className="text-2xl font-bold">{title}</h1>
    <div className="text-xs text-gray-600 dark:text-zinc-100">
      <time dateTime={date}>{format(parseISO(date), 'LLLL d, yyyy')}</time>
      <span> • </span>
      <span>
        {tags.map((tag) => (
          <Link
            key={tag}
            className="inline-block px-1 font-medium uppercase"
            href={`/archive?tag=${encodeURIComponent(tag)}`}
          >
            #{tag}
          </Link>
        ))}
      </span>
    </div>
  </div>
);

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPublicPostByPath(slug.join('/'));
  if (!post) notFound();

  return (
    <PostContainer>
      <div className="relative flex min-h-[120px] lg:flex lg:flex-row">
        <div className="w-full">
          <article
            className={clsx(
              'prose w-full max-w-full text-zinc-900',
              'dark:prose-invert dark:text-zinc-200',
              'prose-code:whitespace-pre-wrap prose-pre:w-full',
              'prose-th:px-2 prose-td:px-2',
              'text-sm/7 lg:text-base/8'
            )}
          >
            <PostTitle title={post.title} date={post.date} tags={post.tags} />
            <PhotoProvider>
              <PostProvider>
                {post.source === 'contentlayer' ? (
                  <MDXContent code={post.compiledCode} />
                ) : (
                  <MarkdownContent markdown={post.markdown} />
                )}
              </PostProvider>
            </PhotoProvider>
          </article>
          <BackButton />
        </div>
        <PostTree />
      </div>
    </PostContainer>
  );
}
