'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { mutatePostAction } from '@/app/admin/(protected)/posts/actions';
import type { AdminPostDetail } from '@/lib/posts/types';

type EditorIntent = 'save' | 'preview' | 'publish' | 'archive';

interface PostEditorProps {
  post?: AdminPostDetail;
}

const fieldClassName =
  'w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-950 outline-none ring-blue-500 transition placeholder:text-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100';

function ActionButton({
  intent,
  children,
  className,
  confirmMessage,
}: {
  intent: EditorIntent;
  children: React.ReactNode;
  className: string;
  confirmMessage?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      className={`${className} rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50`}
      disabled={pending}
      name="intent"
      onClick={(event) => {
        if (confirmMessage && !window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
      type="submit"
      value={intent}
    >
      {pending ? '处理中…' : children}
    </button>
  );
}

export function PostEditor({ post }: PostEditorProps) {
  const [state, action] = useActionState(mutatePostAction, { error: '' });
  const isExisting = Boolean(post);
  const tags = post?.tags.join(', ') ?? '';

  return (
    <form action={action} className="space-y-6">
      {post ? (
        <>
          <input name="postId" type="hidden" value={post.id} />
          <input name="expectedVersion" type="hidden" value={post.version} />
        </>
      ) : null}

      {state.error ? (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
          role="alert"
        >
          {state.error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
          <label className="block space-y-2">
            <span className="text-sm font-medium">标题</span>
            <input
              autoFocus={!isExisting}
              className={fieldClassName}
              defaultValue={post?.title ?? ''}
              maxLength={240}
              name="title"
              placeholder="这篇文章讲什么？"
              required
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium">固定路径</span>
              <input
                className={`${fieldClassName} read-only:cursor-not-allowed read-only:bg-zinc-100 read-only:text-zinc-500 dark:read-only:bg-zinc-950`}
                defaultValue={post?.canonicalPath ?? ''}
                maxLength={240}
                name="canonicalPath"
                placeholder="weekly/2026-07-14"
                readOnly={isExisting}
                required
              />
              <span className="block text-xs text-zinc-500">
                {isExisting
                  ? '为保持旧链接稳定，创建后不可直接改址。'
                  : '不含开头 /，可使用多级路径。'}
              </span>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium">源 slug</span>
              <input
                className={fieldClassName}
                defaultValue={post?.sourceSlug ?? ''}
                maxLength={240}
                name="sourceSlug"
                placeholder="留空时使用路径末段"
              />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium">描述</span>
            <textarea
              className={fieldClassName}
              defaultValue={post?.description ?? ''}
              maxLength={500}
              name="description"
              placeholder="用于文章列表和 SEO 的简短摘要"
              rows={3}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">标签</span>
            <input
              className={fieldClassName}
              defaultValue={tags}
              name="tags"
              placeholder="Blog, Next.js, 随笔"
              required
            />
            <span className="block text-xs text-zinc-500">
              使用中文或英文逗号分隔，顺序会保留。
            </span>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Markdown 正文</span>
            <textarea
              className={`${fieldClassName} min-h-[52vh] resize-y font-mono leading-7`}
              defaultValue={post?.markdown ?? ''}
              name="markdown"
              placeholder="# 开始写作"
              spellCheck={false}
            />
          </label>
        </section>

        <aside className="space-y-5">
          <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="font-semibold">发布设置</h2>

            <label className="block space-y-2">
              <span className="text-sm font-medium">类型</span>
              <select
                className={fieldClassName}
                defaultValue={post?.kind ?? 'post'}
                name="kind"
              >
                <option value="post">普通文章</option>
                <option value="weekly">Weekly</option>
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium">发布日期</span>
              <input
                className={fieldClassName}
                defaultValue={post?.publishedOn ?? ''}
                name="publishedOn"
                type="date"
              />
            </label>

            <label className="flex items-center gap-3 text-sm">
              <input
                className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                defaultChecked={post?.isPinned ?? false}
                name="isPinned"
                type="checkbox"
              />
              置顶展示
            </label>

            {post ? (
              <dl className="grid grid-cols-2 gap-2 border-t border-zinc-100 pt-4 text-xs dark:border-zinc-800">
                <dt className="text-zinc-500">状态</dt>
                <dd className="text-right font-medium">{post.status}</dd>
                <dt className="text-zinc-500">草稿版本</dt>
                <dd className="text-right font-medium">v{post.version}</dd>
              </dl>
            ) : null}
          </section>

          <section className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <ActionButton
              className="w-full bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              intent="save"
            >
              保存草稿
            </ActionButton>
            <ActionButton
              className="w-full border border-zinc-300 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              intent="preview"
            >
              保存并预览
            </ActionButton>
            <ActionButton
              className="w-full bg-blue-600 text-white hover:bg-blue-500"
              intent="publish"
            >
              {post?.status === 'published' ? '重新发布' : '发布文章'}
            </ActionButton>
            {post ? (
              <ActionButton
                className="w-full text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                confirmMessage="归档后文章将从公开博客隐藏，确定继续吗？"
                intent="archive"
              >
                归档文章
              </ActionButton>
            ) : null}
            <Link
              className="block pt-1 text-center text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              href="/admin/posts"
            >
              返回文章列表
            </Link>
          </section>
        </aside>
      </div>
    </form>
  );
}
