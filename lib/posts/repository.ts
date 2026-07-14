import 'server-only';

import { and, desc, eq } from 'drizzle-orm';

import { postDrafts, postRevisions, posts } from '@/db/schema';
import { getDatabase } from '@/lib/db';

import { PostNotFoundError } from './errors';
import { calculateMarkdownReadingStats } from './reading-stats';
import type {
  AdminPostDetail,
  AdminPostSummary,
  PostKind,
  PublicPost,
  PublicPostSummary,
} from './types';

export async function listAdminPosts(): Promise<AdminPostSummary[]> {
  const rows = await getDatabase()
    .select({
      id: posts.id,
      status: posts.status,
      kind: postDrafts.kind,
      canonicalPath: posts.canonicalPath,
      title: postDrafts.title,
      publishedOn: postDrafts.publishedOn,
      isPinned: postDrafts.isPinned,
      version: postDrafts.version,
      updatedAt: postDrafts.updatedAt,
    })
    .from(posts)
    .innerJoin(postDrafts, eq(posts.id, postDrafts.postId))
    .orderBy(desc(postDrafts.updatedAt));

  return rows;
}

export async function getAdminPost(postId: string): Promise<AdminPostDetail> {
  const [row] = await getDatabase()
    .select({
      id: posts.id,
      status: posts.status,
      kind: postDrafts.kind,
      canonicalPath: postDrafts.canonicalPath,
      sourceSlug: postDrafts.sourceSlug,
      title: postDrafts.title,
      description: postDrafts.description,
      markdown: postDrafts.markdown,
      publishedOn: postDrafts.publishedOn,
      isPinned: postDrafts.isPinned,
      tags: postDrafts.tagNames,
      version: postDrafts.version,
      updatedAt: postDrafts.updatedAt,
      publishedRevisionId: posts.publishedRevisionId,
      publishedAt: posts.publishedAt,
    })
    .from(posts)
    .innerJoin(postDrafts, eq(posts.id, postDrafts.postId))
    .where(eq(posts.id, postId))
    .limit(1);

  if (!row) throw new PostNotFoundError();
  return row;
}

const publishedSelection = {
  id: posts.id,
  kind: postRevisions.kind,
  canonicalPath: postRevisions.canonicalPath,
  title: postRevisions.title,
  description: postRevisions.description,
  markdown: postRevisions.markdown,
  publishedOn: postRevisions.publishedOn,
  publishedAt: posts.publishedAt,
  isPinned: postRevisions.isPinned,
  tags: postRevisions.tagNames,
};

function mapPublicPost(
  row: Omit<PublicPost, 'url'>
): PublicPost {
  return {
    ...row,
    url: `/posts/${row.canonicalPath}`,
  };
}

export async function getPublishedPostByPath(
  canonicalPath: string
): Promise<PublicPost | null> {
  const [row] = await getDatabase()
    .select(publishedSelection)
    .from(posts)
    .innerJoin(postRevisions, eq(posts.publishedRevisionId, postRevisions.id))
    .where(
      and(
        eq(posts.status, 'published'),
        eq(posts.canonicalPath, canonicalPath)
      )
    )
    .limit(1);

  return row ? mapPublicPost(row) : null;
}

export async function listPublishedPostSummaries(
  kind?: PostKind
): Promise<PublicPostSummary[]> {
  const where = kind
    ? and(eq(posts.status, 'published'), eq(posts.kind, kind))
    : eq(posts.status, 'published');

  const rows = await getDatabase()
    .select(publishedSelection)
    .from(posts)
    .innerJoin(postRevisions, eq(posts.publishedRevisionId, postRevisions.id))
    .where(where)
    .orderBy(desc(posts.isPinned), desc(posts.publishedOn), desc(posts.createdAt));

  return rows.map((row) => {
    const post = mapPublicPost(row);
    const stats = calculateMarkdownReadingStats(post.markdown);
    const { markdown: _markdown, publishedAt: _publishedAt, ...summary } = post;
    return { ...summary, ...stats };
  });
}

export async function listPublishedPostPaths(): Promise<string[]> {
  const rows = await getDatabase()
    .select({ canonicalPath: posts.canonicalPath })
    .from(posts)
    .where(eq(posts.status, 'published'))
    .orderBy(posts.canonicalPath);

  return rows.map((row) => row.canonicalPath);
}

export async function requirePublishedPostByPath(canonicalPath: string) {
  const post = await getPublishedPostByPath(canonicalPath);
  if (!post) throw new PostNotFoundError();
  return post;
}
