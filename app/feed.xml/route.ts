import { listPublicPostSummaries } from '@/lib/content';
import { publishedDateToInstant } from '@/lib/content/date';
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
    language: 'en',
    image_url: 'https://magren.cc/avatar.png',
  });
  const data = (await listPublicPostSummaries()).sort((a, b) =>
    compareDesc(new Date(a.date), new Date(b.date))
  );

  data.forEach((post) => {
    feed.item({
      title: post.title,
      guid: post.canonicalPath,
      url: `https://magren.cc${post.url}`,
      description: `${post.description || ''} <br/> <a href="https://magren.cc${post.url}">Continue to read</a>`,
      date: publishedDateToInstant(post.date),
    });
  });

  return new Response(feed.xml(), {
    headers: {
      'content-type': 'application/xml',
    },
  });
}
