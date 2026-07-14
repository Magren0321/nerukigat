'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import { authClient } from '@/lib/auth/client';

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');

    try {
      const result = await authClient.signIn.email({
        email,
        password,
        callbackURL: '/admin',
      });

      if (result.error) {
        setError('邮箱或密码不正确。');
        setIsSubmitting(false);
        return;
      }

      router.replace('/admin');
      router.refresh();
    } catch {
      setError('登录请求失败，请检查网络后重试。');
      setIsSubmitting(false);
    }
  };

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
      <label className="block space-y-2">
        <span className="text-sm font-medium">邮箱</span>
        <input
          autoComplete="email"
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none ring-blue-500 transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          name="email"
          required
          type="email"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-medium">密码</span>
        <input
          autoComplete="current-password"
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none ring-blue-500 transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          minLength={12}
          name="password"
          required
          type="password"
        />
      </label>
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <button
        className="w-full rounded-xl bg-zinc-900 px-4 py-3 font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? '登录中…' : '登录'}
      </button>
    </form>
  );
}
