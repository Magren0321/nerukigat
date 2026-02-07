import { use } from "react";
import { PostContainer } from '@/components/layout/container/PostContainer';
import { Heading1, Heading2, Heading3 } from '@/components/ui/heading/Heading';
import { Image } from '@/components/ui/img/Image';
import { PostTree } from '@/components/ui/toc/PostTree';
import { PostProvider } from '@/providers/post/PostProvider';
import { PhotoProvider } from '@/components/ui/img/PreviewImage';
import { BackButton } from '@/components/ui/button/BackButton';
import clsx from 'clsx';
import { allPosts } from 'contentlayer2/generated';
import { format, parseISO } from 'date-fns';
import { useMDXComponent } from 'next-contentlayer2/hooks';
import Link from 'next/link';

export const generateStaticParams = async () =>
  allPosts.map((post) => ({ slug: post._raw.flattenedPath.split('/') }));

export const generateMetadata = async (props: { params: Promise<{ slug: string[] }> }) => {
  const params = await props.params;
  const slugPath = params.slug.join('/');
  const post = allPosts.find((post) => post._raw.flattenedPath === slugPath);
  if (!post) throw new Error(`Post not found for slug: ${slugPath}`);
  return {
    title: post.title,
    description: post.description,
    date: post.date,
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
}) => {
  return (
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
              href={`/weekly?tag=${tag}`}
            >
              #{tag}
            </Link>
          ))}
        </span>
      </div>
    </div>
  );
};

const PostLayout = (props: { params: Promise<{ slug: string[] }> }) => {
  const params = use(props.params);
  const slugPath = params.slug.join('/');
  const post = allPosts.find((post) => post._raw.flattenedPath === slugPath);
  if (!post) throw new Error(`Post not found for slug: ${slugPath}`);

  const Component = useMDXComponent(post.body.code);

  return (
    <PostContainer>
      <div className="relative flex min-h-[120px] lg:flex lg:flex-row">
        <div className="w-full">
          <article
            className={clsx(
              'prose w-full max-w-full font-sans  text-zinc-900',
              'dark:prose-invert dark:text-zinc-200',
              'prose-code:whitespace-pre-wrap prose-pre:w-full',
              'prose-th:px-2 prose-td:px-2',
              'text-sm/7 lg:text-base/8'
            )}
          >
            <PostTitle {...post} />
            <PhotoProvider>
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
            </PhotoProvider>
          </article>
          <BackButton />
          {/* <Comment
            path={'/' + params.slug}
            serverURL={'https://waline.magren.cc'}
          /> */}
        </div>
        <PostTree />
      </div>
    </PostContainer>
  );
};

export default PostLayout;
