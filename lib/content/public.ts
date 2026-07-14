import 'server-only';

import { allPosts, type Post as ContentlayerPost } from 'contentlayer2/generated';
import { cache } from 'react';

import {
  getPublishedPostByPath,
  listPublishedPostPaths as listDatabasePostPaths,
  listPublishedPostSummaries as listDatabasePostSummaries,
} from '@/lib/posts/repository';
import { calculateMarkdownReadingStats } from '@/lib/posts/reading-stats';
import type { PostKind } from '@/lib/posts/types';
import {
  filterVisiblePosts,
  findVisiblePostByFlattenedPath,
} from '@/utils/post-visibility';

import { normalizePublishedDate } from './date';

export type ContentSource = 'contentlayer' | 'database';

export interface PublicPostSummaryView {
  id: string;
  kind: PostKind;
  canonicalPath: string;
  url: string;
  title: string;
  description: string | null;
  date: string;
  tags: string[];
  top: boolean;
  words: number;
  readingTime: number;
}

interface PublicPostDocumentBase extends PublicPostSummaryView {
  source: ContentSource;
}

export interface ContentlayerPostDocument extends PublicPostDocumentBase {
  source: 'contentlayer';
  compiledCode: string;
}

export interface DatabasePostDocument extends PublicPostDocumentBase {
  source: 'database';
  markdown: string;
}

export type PublicPostDocument =
  | ContentlayerPostDocument
  | DatabasePostDocument;

export function getContentSource(
  value = process.env.CONTENT_SOURCE
): ContentSource {
  const normalized = value?.trim() || 'contentlayer';

  if (normalized !== 'contentlayer' && normalized !== 'database') {
    throw new Error(
      'CONTENT_SOURCE must be either "contentlayer" or "database".'
    );
  }

  return normalized;
}

function getKind(canonicalPath: string): PostKind {
  return canonicalPath === 'weekly' || canonicalPath.startsWith('weekly/')
    ? 'weekly'
    : 'post';
}

function mapContentlayerSummary(
  post: ContentlayerPost
): PublicPostSummaryView {
  const stats = calculateMarkdownReadingStats(post.body.raw);

  return {
    id: post._id,
    kind: getKind(post._raw.flattenedPath),
    canonicalPath: post._raw.flattenedPath,
    url: post.url,
    title: post.title,
    description: post.description ?? null,
    date: normalizePublishedDate(post.date),
    tags: post.tags,
    top: post.top ?? false,
    words: stats.wordCount,
    readingTime: stats.readingMinutes,
  };
}

export async function listPublicPostSummaries(): Promise<
  PublicPostSummaryView[]
> {
  if (getContentSource() === 'contentlayer') {
    return filterVisiblePosts(allPosts).map(mapContentlayerSummary);
  }

  const posts = await listDatabasePostSummaries();
  return posts.map((post) => ({
    id: post.id,
    kind: post.kind,
    canonicalPath: post.canonicalPath,
    url: post.url,
    title: post.title,
    description: post.description,
    date: post.publishedOn,
    tags: post.tags,
    top: post.isPinned,
    words: post.wordCount,
    readingTime: post.readingMinutes,
  }));
}

const loadPublicPostByPath = async (
  canonicalPath: string
): Promise<PublicPostDocument | null> => {
  if (getContentSource() === 'contentlayer') {
    const post = findVisiblePostByFlattenedPath(allPosts, canonicalPath);
    if (!post) return null;

    return {
      ...mapContentlayerSummary(post),
      source: 'contentlayer',
      compiledCode: post.body.code,
    };
  }

  const post = await getPublishedPostByPath(canonicalPath);
  if (!post) return null;
  const stats = calculateMarkdownReadingStats(post.markdown);

  return {
    id: post.id,
    kind: post.kind,
    canonicalPath: post.canonicalPath,
    url: post.url,
    title: post.title,
    description: post.description,
    date: post.publishedOn,
    tags: post.tags,
    top: post.isPinned,
    words: stats.wordCount,
    readingTime: stats.readingMinutes,
    source: 'database',
    markdown: post.markdown,
  };
};

export const getPublicPostByPath = cache(loadPublicPostByPath);

export async function listPublicPostPaths(): Promise<string[]> {
  if (getContentSource() === 'database') {
    return listDatabasePostPaths();
  }

  return filterVisiblePosts(allPosts).map(
    (post) => post._raw.flattenedPath
  );
}
