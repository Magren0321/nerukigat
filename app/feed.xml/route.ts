import { allPosts, Post } from 'contentlayer/generated';
import { compareDesc } from 'date-fns';
import RSS from 'rss';

export interface MetaData {
  title: string;
  slug: string;
  description: string;
  publish: boolean;
  date: string;
  tags: string[];
}

export async function GET() {
  const feed = new RSS({
    title: `Magren's Blog`,
    description: '不为繁华易匠心',
    site_url: 'https://magren.cc',
    feed_url: 'https://magren.cc/feed.xml',
    language: 'en', // 网站语言代码
    image_url: 'https://magren.cc/avatar.png',
  });
  const data = allPosts.sort((a, b) =>
    compareDesc(new Date(a.date), new Date(b.date))
  );

  data.forEach((post: Post) => {
    feed.item({
      title: post.title,
      guid: post.slug,
      url: `https://magren.cc/posts/${post.slug}`,
      description: post.description || '',
      date: new Date(post.date),
    });
  });

  return new Response(feed.xml(), {
    headers: {
      'content-type': 'application/xml',
    },
  });
}
