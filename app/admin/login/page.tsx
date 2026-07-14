import { redirect } from 'next/navigation';

import { LoginForm } from '@/components/admin/LoginForm';
import { getOwnerSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  if (await getOwnerSession()) {
    redirect('/admin');
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <section className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white/80 p-7 shadow-xl shadow-zinc-900/5 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
          Nerukigat Admin
        </p>
        <h1 className="mt-2 text-2xl font-bold">登录管理后台</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          仅站主账号可以访问内容和媒体管理功能。
        </p>
        <LoginForm />
      </section>
    </main>
  );
}
