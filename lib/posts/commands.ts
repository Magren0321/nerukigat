import 'server-only';

import { and, desc, eq, max } from 'drizzle-orm';

import {
  postDrafts,
  postRevisions,
  posts,
  postTags,
  tags,
} from '@/db/schema';
import { getDatabase } from '@/lib/db';

import { PostConflictError, PostNotFoundError } from './errors';
import { getAdminPost } from './repository';
import {
  createPostInputSchema,
  normalizeTagSlug,
  saveDraftInputSchema,
} from './validation';
import type { CreatePostInput, SaveDraftInput } from './validation';

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === '23505'
  );
}

export async function createPost(input: CreatePostInput) {
  const draft = createPostInputSchema.parse(input);
  const sourceSlug =
    draft.sourceSlug ?? draft.canonicalPath.split('/').at(-1) ?? null;

  let postId: string;

  try {
    postId = await getDatabase().transaction(async (transaction) => {
      const [post] = await transaction
        .insert(posts)
        .values({
          kind: draft.kind,
          canonicalPath: draft.canonicalPath,
          sourceSlug,
          status: 'draft',
        })
        .returning({ id: posts.id });

      await transaction.insert(postDrafts).values({
        postId: post.id,
        version: 1,
        kind: draft.kind,
        canonicalPath: draft.canonicalPath,
        sourceSlug,
        title: draft.title,
        description: draft.description,
        markdown: draft.markdown,
        publishedOn: draft.publishedOn,
        isPinned: draft.isPinned,
        tagNames: draft.tags,
      });

      return post.id;
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new PostConflictError('该文章路径已经存在。');
    }
    throw error;
  }

  return getAdminPost(postId);
}

export async function savePostDraft(postId: string, input: SaveDraftInput) {
  const draft = saveDraftInputSchema.parse(input);

  try {
    await getDatabase().transaction(async (transaction) => {
      const [identity] = await transaction
        .select({ canonicalPath: posts.canonicalPath })
        .from(posts)
        .where(eq(posts.id, postId))
        .limit(1);

      if (!identity) throw new PostNotFoundError();
      if (identity.canonicalPath !== draft.canonicalPath) {
        throw new PostConflictError(
          '文章固定路径在创建后不可直接修改；如需改址应建立重定向。'
        );
      }

      const [updated] = await transaction
        .update(postDrafts)
        .set({
          kind: draft.kind,
          sourceSlug: draft.sourceSlug,
          title: draft.title,
          description: draft.description,
          markdown: draft.markdown,
          publishedOn: draft.publishedOn,
          isPinned: draft.isPinned,
          tagNames: draft.tags,
          version: draft.expectedVersion + 1,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(postDrafts.postId, postId),
            eq(postDrafts.version, draft.expectedVersion)
          )
        )
        .returning({ postId: postDrafts.postId });

      if (!updated) {
        throw new PostConflictError(
          '草稿已在其他页面被更新，请刷新后再继续编辑。'
        );
      }
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new PostConflictError('该文章路径或标签已经存在。');
    }
    throw error;
  }

  return getAdminPost(postId);
}

export async function publishPost(postId: string, expectedVersion: number) {
  await getDatabase().transaction(async (transaction) => {
    const [row] = await transaction
      .select({
        post: posts,
        draft: postDrafts,
      })
      .from(posts)
      .innerJoin(postDrafts, eq(posts.id, postDrafts.postId))
      .where(eq(posts.id, postId))
      .for('update')
      .limit(1);

    if (!row) throw new PostNotFoundError();
    if (row.draft.version !== expectedVersion) {
      throw new PostConflictError(
        '草稿版本已变化，请刷新并确认最新内容后再发布。'
      );
    }
    if (!row.draft.publishedOn) {
      throw new PostConflictError('发布前必须填写发布日期。');
    }

    const [revisionState] = await transaction
      .select({ revisionNumber: max(postRevisions.revisionNumber) })
      .from(postRevisions)
      .where(eq(postRevisions.postId, postId));
    const revisionNumber = (revisionState?.revisionNumber ?? 0) + 1;

    const [revision] = await transaction
      .insert(postRevisions)
      .values({
        postId,
        revisionNumber,
        kind: row.draft.kind,
        canonicalPath: row.draft.canonicalPath,
        sourceSlug: row.draft.sourceSlug,
        title: row.draft.title,
        description: row.draft.description,
        markdown: row.draft.markdown,
        publishedOn: row.draft.publishedOn,
        isPinned: row.draft.isPinned,
        tagNames: row.draft.tagNames,
      })
      .returning({ id: postRevisions.id });

    await transaction.delete(postTags).where(eq(postTags.postId, postId));

    for (let position = 0; position < row.draft.tagNames.length; position += 1) {
      const name = row.draft.tagNames[position];
      const [tag] = await transaction
        .insert(tags)
        .values({ name, slug: normalizeTagSlug(name) })
        .onConflictDoUpdate({
          target: tags.name,
          set: { slug: normalizeTagSlug(name) },
        })
        .returning({ id: tags.id });

      await transaction.insert(postTags).values({
        postId,
        tagId: tag.id,
        position,
      });
    }

    await transaction
      .update(posts)
      .set({
        kind: row.draft.kind,
        sourceSlug: row.draft.sourceSlug,
        status: 'published',
        publishedRevisionId: revision.id,
        publishedOn: row.draft.publishedOn,
        publishedAt: new Date(),
        isPinned: row.draft.isPinned,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, postId));
  });

  return getAdminPost(postId);
}

export async function archivePost(postId: string) {
  const [archived] = await getDatabase()
    .update(posts)
    .set({ status: 'archived', updatedAt: new Date() })
    .where(eq(posts.id, postId))
    .returning({ id: posts.id });

  if (!archived) throw new PostNotFoundError();
  return getAdminPost(postId);
}

export async function getLatestPublishedRevisionNumber(postId: string) {
  const [row] = await getDatabase()
    .select({ revisionNumber: postRevisions.revisionNumber })
    .from(postRevisions)
    .where(eq(postRevisions.postId, postId))
    .orderBy(desc(postRevisions.revisionNumber))
    .limit(1);

  return row?.revisionNumber ?? 0;
}
