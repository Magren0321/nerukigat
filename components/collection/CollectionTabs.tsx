'use client';

import clsx from 'clsx';
import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
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

export function CollectionTabs({ activeKind }: { activeKind: CollectionKind }) {
  const reduceMotion = useReducedMotion();

  return (
    <nav aria-label="收藏分类">
      <p className="mb-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
        切换收藏
      </p>
      <ul className="grid w-full grid-cols-3 gap-1 rounded-xl bg-zinc-200/65 p-1 dark:bg-zinc-800/70">
        {tabs.map((tab) => {
          const isActive = activeKind === tab.kind;

          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={isActive ? 'page' : undefined}
                className={clsx(
                  'relative isolate inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold',
                  'transition-colors duration-200 active:translate-y-px motion-reduce:transition-none',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-200 dark:focus-visible:ring-blue-400 dark:focus-visible:ring-offset-zinc-800',
                  isActive
                    ? 'text-blue-700 dark:text-blue-200'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="collection-active-tab"
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 rounded-lg bg-white shadow-sm shadow-zinc-400/10 ring-1 ring-zinc-300/60 dark:bg-zinc-900 dark:shadow-none dark:ring-zinc-700"
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
                <span
                  aria-hidden="true"
                  className={clsx('size-[18px]', tab.icon)}
                />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
