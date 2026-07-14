import { notFound } from 'next/navigation';

import { PostEditor } from '@/components/admin/posts/PostEditor';
import { requireOwner } from '@/lib/auth';
import { getAdminPost, PostNotFoundError } from '@/lib/posts';

export const dynamic = 'force-dynamic';

export default async function EditAdminPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireOwner();

  let post;
  try {
    post = await getAdminPost(id);
  } catch (error) {
    if (error instanceof PostNotFoundError) notFound();
    throw error;
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
          {post.status === 'published' ? '编辑已发布文章' : '编辑草稿'}
        </p>
        <h1 className="mt-1 truncate text-2xl font-bold">{post.title}</h1>
      </div>
      <PostEditor post={post} />
    </div>
  );
}
