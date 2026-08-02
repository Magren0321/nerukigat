'use client';

import clsx from 'clsx';
import { motion, useReducedMotion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { CollectionPage } from './CollectionPage';
import type { CollectionRecord } from './types';

const platforms = [
  {
    id: 'PC',
    label: 'PC',
  },
  {
    id: 'Nintendo Switch',
    label: 'Nintendo Switch',
  },
] as const;

type GamePlatform = (typeof platforms)[number]['id'];

function matchesPlatform(record: CollectionRecord, platform: GamePlatform) {
  return platform === 'PC'
    ? record.meta?.startsWith('PC')
    : record.meta === platform;
}

export function GameCollectionPage({
  records,
}: {
  records: CollectionRecord[];
}) {
  const [platform, setPlatform] = useState<GamePlatform>('PC');
  const reduceMotion = useReducedMotion();
  const platformCounts = useMemo(
    () =>
      Object.fromEntries(
        platforms.map(({ id }) => [
          id,
          records.filter((record) => matchesPlatform(record, id)).length,
        ])
      ) as Record<GamePlatform, number>,
    [records]
  );
  const visibleRecords = useMemo(
    () => records.filter((record) => matchesPlatform(record, platform)),
    [platform, records]
  );

  const platformControl = (
    <div
      role="group"
      aria-label="选择游戏平台"
      className="grid w-full max-w-sm grid-cols-2 gap-1 rounded-xl bg-zinc-200/65 p-1 dark:bg-zinc-800/70"
    >
      {platforms.map(({ id, label }) => {
        const isActive = id === platform;

        return (
          <button
            key={id}
            type="button"
            aria-pressed={isActive}
            onClick={() => setPlatform(id)}
            className={clsx(
              'relative isolate inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold',
              'transition-colors duration-200 motion-reduce:transition-none',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-200 dark:focus-visible:ring-blue-400 dark:focus-visible:ring-offset-zinc-800',
              isActive
                ? 'text-zinc-950 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
            )}
          >
            {isActive && (
              <motion.span
                layoutId="game-platform-selection"
                aria-hidden="true"
                className="absolute inset-0 -z-10 rounded-lg bg-white shadow-sm shadow-zinc-400/10 ring-1 ring-zinc-300/60 dark:bg-zinc-900 dark:shadow-none dark:ring-zinc-700"
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : {
                        type: 'spring',
                        stiffness: 500,
                        damping: 38,
                        mass: 0.55,
                      }
                }
              />
            )}
            <span>{label}</span>
            <span
              className={clsx(
                'font-mono text-xs tabular-nums',
                isActive
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-zinc-400 dark:text-zinc-500'
              )}
            >
              {platformCounts[id]}
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <CollectionPage
      kind="games"
      icon="icon-[ph--game-controller]"
      label="Games"
      title="游戏"
      intro="即使引导早已破碎，也请您当上艾尔登之王。"
      source="《艾尔登法环》"
      statusLabels={{
        done: '已通关',
        active: '正在玩',
        casual: '偶尔玩',
        paused: '暂时搁置',
        retired: '已退坑',
        planned: '未开始',
      }}
      records={visibleRecords}
      headerControl={platformControl}
      recordListKey={platform}
    />
  );
}
