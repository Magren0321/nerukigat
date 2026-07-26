import clsx from 'clsx';
import type { ReactNode } from 'react';
import { CollectionRecordList } from './CollectionRecordList';
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
  intro: string;
  statusLabels: Partial<Record<CollectionStatus, string>>;
  records: CollectionRecord[];
  headerControl?: ReactNode;
  recordListKey?: string;
}

export function CollectionPage({
  kind,
  icon,
  title,
  intro,
  statusLabels,
  records,
  headerControl,
  recordListKey,
}: CollectionPageProps) {
  const detailColumn = kind === 'games' ? 'rating' : 'time';

  return (
    <>
      <header className="border-b border-zinc-200 pb-6 pt-7 sm:pb-7 sm:pt-9 dark:border-zinc-800">
        <span
          aria-hidden="true"
          className={clsx(
            'block size-8 text-zinc-700 dark:text-zinc-200',
            icon
          )}
        />
        <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-zinc-950 sm:text-4xl dark:text-zinc-50">
          {title}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-8 gap-y-3">
          <p className="max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {intro}
          </p>
          {headerControl && (
            <div className="shrink-0 sm:ml-auto">{headerControl}</div>
          )}
        </div>
      </header>

      <section aria-labelledby="records-heading" className="pt-6">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2
            id="records-heading"
            className="text-lg font-bold text-zinc-950 dark:text-zinc-50"
          >
            全部记录
          </h2>
        </div>

        <CollectionRecordList
          key={`${kind}-${recordListKey ?? 'all'}`}
          detailColumn={detailColumn}
          records={records}
          statusLabels={statusLabels}
        />
      </section>
    </>
  );
}
