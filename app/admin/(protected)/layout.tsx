import Link from 'next/link';

import { LogoutButton } from '@/components/admin/LogoutButton';
import { requireOwner } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireOwner();

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-6">
            <Link className="font-bold" href="/admin">
              Nerukigat Admin
            </Link>
            <nav className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
              <Link className="hover:text-zinc-950 dark:hover:text-white" href="/admin/posts">
                文章
              </Link>
              <Link className="hover:text-zinc-950 dark:hover:text-white" href="/admin/media">
                媒体库
              </Link>
              <Link className="hover:text-zinc-950 dark:hover:text-white" href="/">
                查看博客
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-xs text-zinc-500 sm:inline">
              {session.user.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
    </div>
  );
}
