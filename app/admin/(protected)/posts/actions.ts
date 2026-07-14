'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { requireOwner } from '@/lib/auth';
import {
  archivePost,
  createPost,
  postDraftDataSchema,
  PostConflictError,
  PostNotFoundError,
  publishPost,
  savePostDraft,
} from '@/lib/posts';

type EditorActionState = { error: string };

const intents = ['save', 'preview', 'publish', 'archive'] as const;

function parseIntent(value: FormDataEntryValue | null) {
  return z.enum(intents).parse(value);
}

function parseTags(value: FormDataEntryValue | null) {
  return String(value ?? '')
    .split(/[,，\n]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function draftFromFormData(formData: FormData) {
  return postDraftDataSchema.parse({
    kind: String(formData.get('kind') ?? ''),
    canonicalPath: String(formData.get('canonicalPath') ?? ''),
    sourceSlug: String(formData.get('sourceSlug') ?? ''),
    title: String(formData.get('title') ?? ''),
    description: String(formData.get('description') ?? ''),
    markdown: String(formData.get('markdown') ?? ''),
    publishedOn: String(formData.get('publishedOn') ?? ''),
    isPinned: formData.get('isPinned') === 'on',
    tags: parseTags(formData.get('tags')),
  });
}

function actionError(error: unknown): EditorActionState {
  if (error instanceof PostConflictError || error instanceof PostNotFoundError) {
    return { error: error.message };
  }

  if (error instanceof z.ZodError) {
    return {
      error: error.issues
        .slice(0, 3)
        .map((issue) => issue.message)
        .join('；'),
    };
  }

  console.error('Admin post mutation failed.', error);
  return { error: '操作失败，请稍后重试。' };
}

function revalidatePostPages(postId: string, canonicalPath: string) {
  revalidatePath('/admin/posts');
  revalidatePath(`/admin/posts/${postId}/edit`);
  revalidatePath(`/admin/posts/${postId}/preview`);
  revalidatePath(`/posts/${canonicalPath}`);
  revalidatePath('/posts');
  revalidatePath('/archive');
  revalidatePath('/weekly');
  revalidatePath('/feed.xml');
}

export async function mutatePostAction(
  _previousState: EditorActionState,
  formData: FormData
): Promise<EditorActionState> {
  await requireOwner();

  let destination = '/admin/posts';

  try {
    const intent = parseIntent(formData.get('intent'));
    const postIdValue = String(formData.get('postId') ?? '').trim();

    if (intent === 'archive') {
      if (!postIdValue) throw new PostNotFoundError();
      const archived = await archivePost(postIdValue);
      revalidatePostPages(archived.id, archived.canonicalPath);
      destination = '/admin/posts?archived=1';
    } else {
      const draft = draftFromFormData(formData);
      let post;

      if (postIdValue) {
        const expectedVersion = Number(formData.get('expectedVersion'));
        post = await savePostDraft(postIdValue, {
          ...draft,
          expectedVersion,
        });
      } else {
        post = await createPost(draft);
      }

      if (intent === 'publish') {
        post = await publishPost(post.id, post.version);
      }

      revalidatePostPages(post.id, post.canonicalPath);

      if (intent === 'preview') {
        destination = `/admin/posts/${post.id}/preview`;
      } else if (intent === 'publish') {
        destination = `/admin/posts/${post.id}/edit?published=1`;
      } else {
        destination = `/admin/posts/${post.id}/edit?saved=1`;
      }
    }
  } catch (error) {
    return actionError(error);
  }

  redirect(destination);
}

export async function archivePostAction(formData: FormData) {
  await requireOwner();

  const postId = z.string().uuid().parse(formData.get('postId'));

  try {
    const archived = await archivePost(postId);
    revalidatePostPages(archived.id, archived.canonicalPath);
  } catch (error) {
    console.error('Admin post archive failed.', error);
    throw error;
  }

  redirect('/admin/posts?archived=1');
}
