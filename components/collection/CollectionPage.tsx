import clsx from 'clsx';
import type { ReactNode } from 'react';
import { CollectionRecordList } from './CollectionRecordList';
import { CollectionTabs } from './CollectionTabs';
import type {
  CollectionKind,
  CollectionRecord,
  CollectionStatus,
} from './types';

export type {
  CollectionKind,
  CollectionRating,
  CollectionRecord,
  CollectionStatus,
} from './types';

interface CollectionPageProps {
  kind: CollectionKind;
  icon: string;
  title: string;
  label: string;
  intro: string;
  source: string;
  statusLabels: Partial<Record<CollectionStatus, string>>;
  records: CollectionRecord[];
  headerControl?: ReactNode;
  recordListKey?: string;
}

const sectionLabels: Record<CollectionKind, string> = {
  books: '阅读收藏',
  films: '观影收藏',
  games: '游戏收藏',
};

export function CollectionPage({
  kind,
  icon,
  title,
  label,
  intro,
  source,
  statusLabels,
  records,
  headerControl,
  recordListKey,
}: CollectionPageProps) {
  const completedCount = records.filter(
    (record) => record.status === 'done'
  ).length;
  const activeCount = records.filter(
    (record) => record.status === 'active'
  ).length;
  const detailColumn = kind === 'games' ? 'rating' : 'time';

  return (
    <div className="grid gap-12 pb-20 pt-9 lg:grid-cols-[minmax(16rem,0.72fr)_minmax(0,1.8fr)] lg:gap-16 lg:pt-14 xl:gap-24">
      <header className="self-start lg:sticky lg:top-24">
        <div className="flex items-center gap-3 text-blue-700 dark:text-blue-300">
          <span
            aria-hidden="true"
            className={clsx('size-7 shrink-0 sm:size-8', icon)}
          />
          <span className="text-sm font-semibold">{label}</span>
        </div>

        <h1 className="mt-5 text-5xl font-bold leading-none tracking-[-0.045em] text-zinc-950 sm:text-6xl dark:text-zinc-50">
          {title}
        </h1>

        <blockquote className="mt-7 max-w-md text-base leading-7 text-zinc-600 dark:text-zinc-300">
          <p>“{intro}”</p>
          <cite className="mt-2 block text-sm not-italic text-zinc-400 dark:text-zinc-500">
            {source}
          </cite>
        </blockquote>

        <dl className="mt-10 grid grid-cols-3 gap-5 border-t border-zinc-300/80 pt-5 dark:border-zinc-700/80">
          <div>
            <dt className="text-xs text-zinc-500 dark:text-zinc-400">收录</dt>
            <dd className="mt-1 font-mono text-2xl font-semibold tabular-nums text-zinc-950 dark:text-zinc-50">
              {records.length}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500 dark:text-zinc-400">完成</dt>
            <dd className="mt-1 font-mono text-2xl font-semibold tabular-nums text-zinc-950 dark:text-zinc-50">
              {completedCount}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500 dark:text-zinc-400">进行中</dt>
            <dd className="mt-1 font-mono text-2xl font-semibold tabular-nums text-blue-700 dark:text-blue-300">
              {activeCount}
            </dd>
          </div>
        </dl>

        <div className="mt-8">
          <CollectionTabs activeKind={kind} />
        </div>

        {headerControl && <div className="mt-6">{headerControl}</div>}
      </header>

      <section aria-labelledby="records-heading" className="min-w-0">
        <div className="flex items-end justify-between gap-6 border-b border-zinc-300/80 pb-5 dark:border-zinc-700/80">
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {sectionLabels[kind]}
            </p>
            <h2
              id="records-heading"
              className="mt-1 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl dark:text-zinc-50"
            >
              收藏目录
            </h2>
          </div>
          <span className="shrink-0 font-mono text-sm tabular-nums text-zinc-400 dark:text-zinc-500">
            {records.length} 项
          </span>
        </div>

        <CollectionRecordList
          key={`${kind}-${recordListKey ?? 'all'}`}
          detailColumn={detailColumn}
          kind={kind}
          records={records}
          statusLabels={statusLabels}
        />
      </section>
    </div>
  );
}
