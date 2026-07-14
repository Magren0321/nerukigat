import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { MarkdownContent } from '@/components/MarkdownContent';
import { requireOwner } from '@/lib/auth';
import { getAdminPost, PostNotFoundError } from '@/lib/posts';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '草稿预览 | Nerukigat Admin',
  robots: { index: false, follow: false },
};

export default async function AdminPostPreviewPage({
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
        <div>
          <p className="text-sm font-semibold">草稿预览 · 不会被搜索引擎收录</p>
          <p className="mt-1 text-xs opacity-75">当前显示后台已保存的 v{post.version}。</p>
        </div>
        <Link
          className="rounded-xl bg-amber-950 px-4 py-2 text-sm font-medium text-white dark:bg-amber-100 dark:text-amber-950"
          href={`/admin/posts/${post.id}/edit`}
        >
          返回编辑
        </Link>
      </div>

      <article className="rounded-2xl border border-zinc-200 bg-white px-5 py-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:px-10">
        <header className="mb-10 border-b border-zinc-100 pb-8 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">
            {post.publishedOn ?? '未设置发布日期'} ·{' '}
            {post.kind === 'weekly' ? 'Weekly' : '文章'}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {post.title}
          </h1>
          {post.description ? (
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">{post.description}</p>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                key={tag}
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        <div className="prose prose-zinc max-w-none dark:prose-invert">
          <MarkdownContent markdown={post.markdown} />
        </div>
      </article>
    </div>
  );
}
