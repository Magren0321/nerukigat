import Link from 'next/link';

import { requireOwner } from '@/lib/auth';
import { listAdminPosts } from '@/lib/posts';

import { archivePostAction } from './actions';

export const dynamic = 'force-dynamic';

const statusLabel = {
  draft: '草稿',
  published: '已发布',
  archived: '已归档',
} as const;

const statusClassName = {
  draft: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  published: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  archived: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
} as const;

const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Shanghai',
});

export default async function AdminPostsPage() {
  await requireOwner();
  const posts = await listAdminPosts();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">文章管理</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            共 {posts.length} 篇，草稿与线上版本彼此独立。
          </p>
        </div>
        <Link
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
          href="/admin/posts/new"
        >
          新建文章
        </Link>
      </div>

      {posts.length === 0 ? (
        <section className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <h2 className="font-semibold">还没有文章</h2>
          <p className="mt-2 text-sm text-zinc-500">创建第一篇 Markdown 草稿吧。</p>
        </section>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {posts.map((post) => (
              <li className="p-5" key={post.id}>
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`${statusClassName[post.status]} rounded-full px-2.5 py-1 text-xs font-medium`}
                      >
                        {statusLabel[post.status]}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {post.kind === 'weekly' ? 'Weekly' : '文章'}
                      </span>
                      {post.isPinned ? (
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                          置顶
                        </span>
                      ) : null}
                    </div>
                    <Link
                      className="mt-2 block truncate text-base font-semibold hover:text-blue-600 dark:hover:text-blue-400"
                      href={`/admin/posts/${post.id}/edit`}
                    >
                      {post.title}
                    </Link>
                    <p className="mt-1 truncate text-xs text-zinc-500">
                      /posts/{post.canonicalPath} · 更新于 {dateFormatter.format(post.updatedAt)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Link
                      className="rounded-lg border border-zinc-200 px-3 py-2 text-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                      href={`/admin/posts/${post.id}/preview`}
                    >
                      预览
                    </Link>
                    <Link
                      className="rounded-lg bg-zinc-900 px-3 py-2 text-sm text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                      href={`/admin/posts/${post.id}/edit`}
                    >
                      编辑
                    </Link>
                    {post.status !== 'archived' ? (
                      <form action={archivePostAction}>
                        <input name="postId" type="hidden" value={post.id} />
                        <button
                          className="rounded-lg px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                          type="submit"
                        >
                          归档
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
