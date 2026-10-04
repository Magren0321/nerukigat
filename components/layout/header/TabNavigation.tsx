import { DialogContext } from '@/providers/dialog/DialogProvider';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { navigationItems } from './navigation';

function isNavigationItemActive(pathname: string, href: string) {
  return href === '/'
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export const Navigation = () => {
  const { closeDialog } = React.useContext(DialogContext);
  const pathname = usePathname();

  return (
    <div className="px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 text-zinc-900 dark:text-zinc-100">
      <div className="flex items-center justify-between px-2 pb-2">
        <p className="text-base font-semibold tracking-tight">Navigation</p>
        <button
          type="button"
          data-mobile-nav-close
          onClick={closeDialog}
          aria-label="Close navigation"
          className="inline-flex size-11 items-center justify-center rounded-full text-zinc-600 transition-[transform,background-color,color] duration-200 hover:bg-zinc-200/70 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:scale-[0.98] motion-reduce:transition-none dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 dark:focus-visible:ring-blue-400"
        >
          <span aria-hidden="true" className="icon-[tabler--x] size-5" />
        </button>
      </div>
      <nav aria-label="Mobile navigation">
        <ul className="grid gap-1">
          {navigationItems.map(({ href, text, icon }) => {
            const isActive = isNavigationItemActive(pathname, href);

            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={closeDialog}
                  className={clsx(
                    'flex min-h-14 items-center gap-3 rounded-2xl px-4 text-base font-medium transition-[transform,background-color,color] duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:scale-[0.98] motion-reduce:transition-none dark:focus-visible:ring-blue-400',
                    isActive
                      ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-zinc-950'
                      : 'text-zinc-700 hover:bg-zinc-200/70 hover:text-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-zinc-50'
                  )}
                >
                  <span aria-hidden="true" className={clsx('size-5', icon)} />
                  <span>{text}</span>
                  {isActive && (
                    <span className="ml-auto text-xs font-medium text-blue-100 dark:text-blue-950">
                      Current
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};
