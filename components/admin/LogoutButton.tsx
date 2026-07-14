'use client';

import { useRouter } from 'next/navigation';

import { authClient } from '@/lib/auth/client';

export function LogoutButton() {
  const router = useRouter();

  return (
    <button
      className="text-sm text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
      onClick={async () => {
        await authClient.signOut();
        router.replace('/admin/login');
        router.refresh();
      }}
      type="button"
    >
      退出登录
    </button>
  );
}
