import Link from 'next/link';

interface WeeklyLinkProps {
  href: string;
  children: React.ReactNode;
}

export const WeeklyLink = ({ href, children }: WeeklyLinkProps) => {
  return (
    <Link
      href={href}
      className="relative min-w-0 flex-1 text-zinc-900 transition-colors hover:text-blue-600 dark:text-zinc-100 dark:hover:text-blue-400"
    >
      {children}
    </Link>
  );
};
