'use client';

import clsx from 'clsx';
import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { CollectionKind } from './types';

const tabs: Array<{
  href: string;
  label: string;
  kind: CollectionKind;
  icon: string;
}> = [
  {
    href: '/collection/books',
    label: '书籍',
    kind: 'books',
    icon: 'icon-[ph--book-open-text]',
  },
  {
    href: '/collection/films',
    label: '影视',
    kind: 'films',
    icon: 'icon-[ph--film-slate]',
  },
  {
    href: '/collection/games',
    label: '游戏',
    kind: 'games',
    icon: 'icon-[ph--game-controller]',
  },
];

export function CollectionTabs() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  return (
    <nav
      aria-label="收藏分类"
      className="border-b border-zinc-200 dark:border-zinc-800"
    >
      <ul className="flex items-center gap-6">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;

          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={isActive ? 'page' : undefined}
                className={clsx(
                  'relative inline-flex min-h-11 items-center gap-2 py-3 text-sm font-semibold',
                  'transition-colors duration-200 active:translate-y-px motion-reduce:transition-none',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-4 focus-visible:ring-offset-bgColor',
                  isActive
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                )}
              >
                <span
                  aria-hidden="true"
                  className={clsx('size-[18px]', tab.icon)}
                />
                {tab.label}
                {isActive && (
                  <motion.span
                    layoutId="collection-active-tab"
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-px h-0.5 bg-blue-600 dark:bg-blue-400"
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : {
                            type: 'spring',
                            stiffness: 520,
                            damping: 38,
                            mass: 0.55,
                          }
                    }
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
