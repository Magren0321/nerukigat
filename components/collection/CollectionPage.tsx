import {
  SplitLayout,
  SplitSidebar,
} from '@/components/layout/container/SplitPageLayout';
import { SplitPageHeading } from '@/components/layout/container/SplitPageHeading';
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
  CollectionRecord,
  CollectionStatus,
} from './types';

interface CollectionPageProps {
  kind: CollectionKind;
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

  return (
    <SplitLayout>
      <SplitSidebar>
        <SplitPageHeading label={label} title={title} />

        <blockquote className="mt-7 max-w-md text-base leading-7 text-zinc-600 dark:text-zinc-300">
          <p>“{intro}”</p>
          <cite className="mt-2 block text-sm not-italic text-zinc-600 dark:text-zinc-400">
            {source}
          </cite>
        </blockquote>

        <dl className="mt-10 grid grid-cols-3 gap-5 border-t border-zinc-300/80 pt-5 dark:border-zinc-700/80">
          <div>
            <dt className="text-xs text-zinc-600 dark:text-zinc-400">收录</dt>
            <dd className="mt-1 font-mono text-2xl font-semibold tabular-nums text-zinc-950 dark:text-zinc-50">
              {records.length}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-600 dark:text-zinc-400">完成</dt>
            <dd className="mt-1 font-mono text-2xl font-semibold tabular-nums text-zinc-950 dark:text-zinc-50">
              {completedCount}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-600 dark:text-zinc-400">进行中</dt>
            <dd className="mt-1 font-mono text-2xl font-semibold tabular-nums text-blue-700 dark:text-blue-300">
              {activeCount}
            </dd>
          </div>
        </dl>

        <div className="mt-8">
          <CollectionTabs activeKind={kind} />
        </div>

        {headerControl && <div className="mt-6">{headerControl}</div>}
      </SplitSidebar>

      <section aria-labelledby="records-heading" className="min-w-0">
        <div className="flex items-end justify-between gap-6 border-b border-zinc-300/80 pb-5 dark:border-zinc-700/80">
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {sectionLabels[kind]}
            </p>
            <h2
              id="records-heading"
              className="mt-1 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl dark:text-zinc-50"
            >
              收藏目录
            </h2>
          </div>
          <span className="shrink-0 font-mono text-sm tabular-nums text-zinc-600 dark:text-zinc-400">
            {records.length} 项
          </span>
        </div>

        <CollectionRecordList
          key={`${kind}-${recordListKey ?? 'all'}`}
          kind={kind}
          records={records}
          statusLabels={statusLabels}
        />
      </section>
    </SplitLayout>
  );
}
