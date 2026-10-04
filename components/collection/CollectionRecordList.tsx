'use client';

import clsx from 'clsx';
import { useMemo, useState } from 'react';
import type {
  CollectionKind,
  CollectionRecord,
  CollectionStatus,
} from './types';

const statusStyles: Record<CollectionStatus, string> = {
  done: 'text-zinc-600 dark:text-zinc-400',
  active: 'text-blue-700 dark:text-blue-300',
  casual: 'text-blue-700 dark:text-blue-300',
  paused: 'text-zinc-600 dark:text-zinc-400',
  retired: 'text-zinc-600 dark:text-zinc-400',
  planned: 'text-zinc-600 dark:text-zinc-400',
};

interface RecordGroup {
  key: string;
  label: string;
  records: CollectionRecord[];
}

function groupRecords(
  records: CollectionRecord[],
  kind: CollectionKind
): RecordGroup[] {
  const groups = new Map<string, RecordGroup>();

  records.forEach((record) => {
    const rawLabel =
      kind === 'games' ? record.category || '其他' : record.time || '待定';
    const label = rawLabel === '待定' ? '计划清单' : rawLabel;
    const existingGroup = groups.get(rawLabel);

    if (existingGroup) {
      existingGroup.records.push(record);
      return;
    }

    groups.set(rawLabel, {
      key: rawLabel,
      label,
      records: [record],
    });
  });

  if (kind === 'games') {
    const otherGroup = groups.get('其他');

    if (otherGroup) {
      groups.delete('其他');
      groups.set('其他', otherGroup);
    }
  }

  return Array.from(groups.values());
}

function matchesQuery(
  record: CollectionRecord,
  query: string,
  statusLabels: Partial<Record<CollectionStatus, string>>
) {
  if (!query) {
    return true;
  }

  return [
    record.title,
    record.category,
    record.meta,
    record.note,
    record.time,
    record.status ? statusLabels[record.status] : undefined,
  ].some((value) => value?.toLocaleLowerCase().includes(query));
}

function RecordItem({
  record,
  statusLabels,
}: {
  record: CollectionRecord;
  statusLabels: Partial<Record<CollectionStatus, string>>;
}) {
  return (
    <li className="group grid min-h-[76px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-xl px-4 py-3 transition-colors duration-200 hover:bg-zinc-100/80 motion-reduce:transition-none sm:px-5 dark:hover:bg-zinc-800/65">
      <div className="min-w-0">
        <h4 className="text-[15px] font-semibold leading-6 text-zinc-900 transition-colors duration-200 group-hover:text-blue-700 motion-reduce:transition-none dark:text-zinc-100 dark:group-hover:text-blue-300">
          {record.title}
        </h4>
        {(record.meta || record.note) && (
          <p className="mt-0.5 truncate text-xs leading-5 text-zinc-600 dark:text-zinc-400">
            {[record.meta, record.note].filter(Boolean).join(' / ')}
          </p>
        )}
      </div>

      <div className="flex min-w-[5.5rem] flex-col items-end gap-1.5 text-right">
        {record.status ? (
          <span
            className={clsx('text-xs font-medium', statusStyles[record.status])}
          >
            {statusLabels[record.status] ?? '未记录'}
          </span>
        ) : (
          <span className="text-xs text-zinc-600 dark:text-zinc-400">
            未记录
          </span>
        )}
      </div>
    </li>
  );
}

const unitLabels: Record<CollectionKind, string> = {
  books: '本',
  films: '部',
  games: '款',
};

export function CollectionRecordList({
  kind,
  records,
  statusLabels,
}: {
  kind: CollectionKind;
  records: CollectionRecord[];
  statusLabels: Partial<Record<CollectionStatus, string>>;
}) {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredRecords = useMemo(
    () =>
      records.filter((record) =>
        matchesQuery(record, normalizedQuery, statusLabels)
      ),
    [normalizedQuery, records, statusLabels]
  );
  const groups = useMemo(
    () => groupRecords(filteredRecords, kind),
    [filteredRecords, kind]
  );

  if (records.length === 0) {
    return (
      <div className="mt-8 rounded-2xl bg-white/55 px-6 py-20 text-center ring-1 ring-zinc-200/80 dark:bg-zinc-900/45 dark:ring-zinc-800">
        <span
          aria-hidden="true"
          className="icon-[ph--tray] mx-auto block size-7 text-zinc-400"
        />
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          这里还没有记录。
        </p>
      </div>
    );
  }

  return (
    <div className="pt-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full sm:max-w-sm">
          <span className="sr-only">搜索收藏</span>
          <span
            aria-hidden="true"
            className="icon-[ph--magnifying-glass] pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-zinc-400"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索收藏"
            className="h-11 w-full rounded-xl bg-white/65 pl-11 pr-11 text-sm text-zinc-900 ring-1 ring-inset ring-zinc-200 transition-shadow placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-600 motion-reduce:transition-none dark:bg-zinc-900/55 dark:text-zinc-100 dark:ring-zinc-800 dark:placeholder:text-zinc-400 dark:focus:ring-blue-400"
          />
          {query && (
            <button
              type="button"
              aria-label="清除搜索"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-600 transition-colors dark:text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:translate-y-[calc(-50%+1px)] motion-reduce:transition-none dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:focus-visible:ring-blue-400"
            >
              <span aria-hidden="true" className="icon-[ph--x] size-4" />
            </button>
          )}
        </label>

        <p
          aria-live="polite"
          className="text-sm text-zinc-600 dark:text-zinc-400"
        >
          {normalizedQuery
            ? `找到 ${filteredRecords.length} 项`
            : `${groups.length} 组收藏`}
        </p>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="mt-8 rounded-2xl bg-white/55 px-6 py-20 text-center ring-1 ring-zinc-200/80 dark:bg-zinc-900/45 dark:ring-zinc-800">
          <span
            aria-hidden="true"
            className="icon-[ph--magnifying-glass] mx-auto block size-7 text-zinc-400"
          />
          <p className="mt-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            没有找到相关收藏
          </p>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            换一个名称、年份或状态试试。
          </p>
        </div>
      ) : (
        <div className="mt-9 space-y-10">
          {groups.map((group, groupIndex) => (
            <section key={`${group.key}-${groupIndex}`}>
              <div className="mb-3 flex items-baseline gap-3 px-1">
                <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {group.label}
                </h3>
                <span className="font-mono text-xs tabular-nums text-zinc-600 dark:text-zinc-400">
                  {group.records.length} {unitLabels[kind]}
                </span>
              </div>

              <ul className="grid gap-1 rounded-2xl bg-white/60 p-2 ring-1 ring-zinc-200/75 sm:grid-cols-2 dark:bg-zinc-900/45 dark:ring-zinc-800">
                {group.records.map((record) => (
                  <RecordItem
                    key={`${record.title}-${record.meta ?? record.time ?? 'record'}`}
                    record={record}
                    statusLabels={statusLabels}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
