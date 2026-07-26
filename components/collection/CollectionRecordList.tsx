'use client';

import clsx from 'clsx';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type {
  CollectionRating,
  CollectionRecord,
  CollectionStatus,
} from './types';

const RECORDS_PER_BATCH = 30;
const LOADING_FEEDBACK_DURATION = 300;

const undatedTimeStyle = clsx(
  'bg-zinc-100 text-zinc-600 ring-zinc-700/10',
  'dark:bg-zinc-800 dark:text-zinc-300 dark:ring-white/10'
);

type TimeColorProperties = CSSProperties & {
  '--time-bg': string;
  '--time-dark-bg': string;
  '--time-dark-ring': string;
  '--time-dark-text': string;
  '--time-ring': string;
  '--time-text': string;
};

const statusStyles: Record<CollectionStatus, string> = {
  done: clsx(
    'bg-emerald-50 text-emerald-700 ring-emerald-700/10',
    'dark:bg-emerald-950/45 dark:text-emerald-300 dark:ring-emerald-300/10'
  ),
  active: clsx(
    'bg-blue-50 text-blue-700 ring-blue-700/10',
    'dark:bg-blue-950/50 dark:text-blue-300 dark:ring-blue-300/10'
  ),
  casual: clsx(
    'bg-cyan-50 text-cyan-700 ring-cyan-700/10',
    'dark:bg-cyan-950/50 dark:text-cyan-300 dark:ring-cyan-300/10'
  ),
  paused: clsx(
    'bg-amber-50 text-amber-700 ring-amber-700/10',
    'dark:bg-amber-950/45 dark:text-amber-300 dark:ring-amber-300/10'
  ),
  retired: clsx(
    'bg-rose-50 text-rose-700 ring-rose-700/10',
    'dark:bg-rose-950/45 dark:text-rose-300 dark:ring-rose-300/10'
  ),
  planned: clsx(
    'bg-zinc-100 text-zinc-600 ring-zinc-700/10',
    'dark:bg-zinc-800 dark:text-zinc-300 dark:ring-white/10'
  ),
};

function hashTime(time: string) {
  let hash = 2166136261;

  for (let index = 0; index < time.length; index += 1) {
    hash ^= time.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  hash ^= hash >>> 16;
  hash = Math.imul(hash, 2246822507);
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 3266489909);
  hash ^= hash >>> 16;

  return hash >>> 0;
}

function getTimeColor(time: string): TimeColorProperties | undefined {
  if (!/^\d{4}$/.test(time)) {
    return undefined;
  }

  const hash = hashTime(time);
  const hue = ((hash & 0xfff) / 0xfff) * 360;
  const chroma = 0.08 + (((hash >>> 12) & 0x3ff) / 0x3ff) * 0.035;
  const textLightness = 0.4 + (((hash >>> 22) & 0x3ff) / 0x3ff) * 0.04;
  const backgroundChroma = chroma * 0.35;
  const darkBackgroundChroma = chroma * 0.55;
  const darkTextChroma = chroma * 0.78;

  return {
    '--time-bg': `oklch(96% ${backgroundChroma.toFixed(4)} ${hue.toFixed(2)})`,
    '--time-text': `oklch(${textLightness.toFixed(4)} ${chroma.toFixed(4)} ${hue.toFixed(2)})`,
    '--time-ring': `oklch(58% ${chroma.toFixed(4)} ${hue.toFixed(2)} / 18%)`,
    '--time-dark-bg': `oklch(27% ${darkBackgroundChroma.toFixed(4)} ${hue.toFixed(2)} / 78%)`,
    '--time-dark-text': `oklch(80% ${darkTextChroma.toFixed(4)} ${hue.toFixed(2)})`,
    '--time-dark-ring': `oklch(72% ${darkTextChroma.toFixed(4)} ${hue.toFixed(2)} / 16%)`,
  };
}

function TimeBadge({ time }: { time: string }) {
  const color = getTimeColor(time);

  return (
    <span
      style={color}
      className={clsx(
        'inline-flex w-fit items-center rounded-full px-2 py-0.5 font-mono text-xs font-medium tabular-nums ring-1 ring-inset',
        color
          ? clsx(
              'bg-[var(--time-bg)] text-[var(--time-text)] ring-[var(--time-ring)]',
              'dark:bg-[var(--time-dark-bg)] dark:text-[var(--time-dark-text)] dark:ring-[var(--time-dark-ring)]'
            )
          : undatedTimeStyle
      )}
    >
      {time}
    </span>
  );
}

function StatusBadge({
  status,
  label,
}: {
  status: CollectionStatus;
  label: string;
}) {
  return (
    <span
      className={clsx(
        'inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        statusStyles[status]
      )}
    >
      {label}
    </span>
  );
}

const ratingLabels: Record<CollectionRating, string> = {
  1: '无感',
  2: '一般',
  3: '喜欢',
  4: '很喜欢',
  5: '最爱',
};

const ratingSteps = [1, 2, 3, 4, 5] as const;

function RatingStars({ rating }: { rating?: CollectionRating }) {
  const accessibleLabel = rating
    ? `${ratingLabels[rating]}，${rating} / 5`
    : '尚未评价';

  return (
    <span
      aria-label={`喜爱程度：${accessibleLabel}`}
      title={accessibleLabel}
      className="inline-flex items-center gap-0.5"
    >
      {ratingSteps.map((step) => (
        <span
          key={step}
          aria-hidden="true"
          className={clsx(
            'h-4 w-4 shrink-0',
            rating && step <= rating
              ? 'icon-[ph--star-fill] text-amber-500 dark:text-amber-400'
              : 'icon-[ph--star] text-zinc-300 dark:text-zinc-700'
          )}
        />
      ))}
    </span>
  );
}

export function CollectionRecordList({
  detailColumn,
  records,
  statusLabels,
}: {
  detailColumn: 'time' | 'rating';
  records: CollectionRecord[];
  statusLabels: Partial<Record<CollectionStatus, string>>;
}) {
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(RECORDS_PER_BATCH, records.length)
  );
  const [isLoading, setIsLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  const loadingTimerRef = useRef<number | null>(null);

  const hasMore = visibleCount < records.length;

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;

    if (!hasMore || !loadMoreElement) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || isLoadingRef.current) {
          return;
        }

        isLoadingRef.current = true;
        setIsLoading(true);
        observer.unobserve(entry.target);

        loadingTimerRef.current = window.setTimeout(() => {
          setVisibleCount((count) =>
            Math.min(count + RECORDS_PER_BATCH, records.length)
          );
          isLoadingRef.current = false;
          setIsLoading(false);
        }, LOADING_FEEDBACK_DURATION);
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreElement);

    return () => {
      observer.disconnect();

      if (loadingTimerRef.current !== null) {
        window.clearTimeout(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
    };
  }, [hasMore, records.length, visibleCount]);

  if (records.length === 0) {
    return (
      <div className="border-b border-zinc-200 py-16 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        这里还没有记录。
      </div>
    );
  }

  const visibleRecords = records.slice(0, visibleCount);

  return (
    <div>
      <div role="table" aria-label="收藏记录">
        <div
          role="row"
          className="hidden grid-cols-[minmax(0,1fr)_7rem_8rem] gap-5 border-b border-zinc-200 px-1 py-2 text-xs font-medium text-zinc-500 md:grid dark:border-zinc-800 dark:text-zinc-400"
        >
          <span role="columnheader">名称</span>
          <span role="columnheader">
            {detailColumn === 'time' ? '时间' : '喜爱程度'}
          </span>
          <span role="columnheader">状态</span>
        </div>

        <div id="collection-records" role="rowgroup">
          {visibleRecords.map((record) => (
            <article
              role="row"
              key={`${record.title}-${record.time ?? record.rating ?? 'unrated'}`}
              className={clsx(
                'group grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2 border-b border-zinc-200 px-1 py-3',
                'transition-colors duration-200 hover:bg-white/70 motion-reduce:transition-none md:grid-cols-[minmax(0,1fr)_7rem_8rem] md:items-center md:gap-5',
                'dark:border-zinc-800 dark:hover:bg-zinc-900/45'
              )}
            >
              <div role="cell" className="min-w-0">
                <h2 className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {record.title}
                </h2>
                {(record.category || record.meta || record.note) && (
                  <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs leading-4 text-zinc-500 dark:text-zinc-400">
                    {record.category && <span>{record.category}</span>}
                    {record.meta && <span>{record.meta}</span>}
                    {record.note && <span>{record.note}</span>}
                  </div>
                )}
              </div>

              <div
                role="cell"
                className="col-start-1 row-start-2 md:col-start-auto md:row-start-auto"
              >
                {detailColumn === 'time' ? (
                  <TimeBadge time={record.time ?? '待定'} />
                ) : (
                  <RatingStars rating={record.rating} />
                )}
              </div>

              <div
                role="cell"
                className="col-start-2 row-span-2 row-start-1 self-center md:col-start-auto md:row-span-1 md:row-start-auto"
              >
                {record.status ? (
                  <StatusBadge
                    status={record.status}
                    label={statusLabels[record.status] ?? '未记录'}
                  />
                ) : (
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    未记录
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>

      {hasMore && (
        <div
          ref={loadMoreRef}
          className="flex min-h-10 items-center justify-center py-2"
        >
          {isLoading && (
            <p
              role="status"
              aria-live="polite"
              className="text-xs text-zinc-500 motion-safe:animate-pulse dark:text-zinc-400"
            >
              正在加载…
            </p>
          )}
        </div>
      )}
    </div>
  );
}
