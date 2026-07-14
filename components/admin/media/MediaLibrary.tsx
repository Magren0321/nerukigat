'use client';

/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { MediaListItem } from '@/lib/media';

const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
] as const;

const ACCEPT_ATTRIBUTE = ACCEPTED_IMAGE_TYPES.join(',');

type UploadStatus =
  | 'presigning'
  | 'uploading'
  | 'finalizing'
  | 'completed'
  | 'error';

type UploadTask = {
  id: string;
  filename: string;
  byteSize: number;
  progress: number;
  status: UploadStatus;
  error?: string;
};

type StorageReadiness = {
  available: boolean;
  message?: string;
};

type MediaLibraryProps = {
  initialMedia: MediaListItem[];
  storageReadiness: StorageReadiness;
};

type PresignResponse = {
  data: {
    assetId: string;
    uploadUrl: string;
    headers: Record<string, string>;
    expiresAt: string;
  };
};

type FinalizeResponse = {
  data: {
    asset: MediaListItem;
  };
};

const statusLabel: Record<UploadStatus, string> = {
  presigning: '准备上传',
  uploading: '上传中',
  finalizing: '正在确认',
  completed: '上传完成',
  error: '上传失败',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function extractApiError(payload: unknown, fallback: string): string {
  if (!isRecord(payload)) return fallback;

  if (typeof payload.message === 'string' && payload.message.trim()) {
    return payload.message;
  }

  if (typeof payload.error === 'string' && payload.error.trim()) {
    return payload.error;
  }

  if (
    isRecord(payload.error) &&
    typeof payload.error.message === 'string' &&
    payload.error.message.trim()
  ) {
    return payload.error.message;
  }

  return fallback;
}

async function readApiResponse<T>(
  response: Response,
  fallbackError: string
): Promise<T> {
  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(extractApiError(payload, fallbackError));
  }

  if (!payload) {
    throw new Error(fallbackError);
  }

  return payload as T;
}

function putFileWithProgress({
  file,
  headers,
  onProgress,
  uploadUrl,
}: {
  file: File;
  headers: Record<string, string>;
  onProgress: (progress: number) => void;
  uploadUrl: string;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open('PUT', uploadUrl);
    Object.entries(headers).forEach(([name, value]) => {
      request.setRequestHeader(name, value);
    });

    request.upload.addEventListener('progress', (event) => {
      const total = event.lengthComputable ? event.total : file.size;

      if (total > 0) {
        onProgress(Math.min(100, Math.round((event.loaded / total) * 100)));
      }
    });

    request.addEventListener('load', () => {
      if (request.status >= 200 && request.status < 300) {
        onProgress(100);
        resolve();
        return;
      }

      reject(new Error(`对象存储返回了 ${request.status || '未知'} 状态码。`));
    });
    request.addEventListener('error', () => {
      reject(new Error('上传连接失败，请检查网络后重试。'));
    });
    request.addEventListener('abort', () => {
      reject(new Error('上传已取消。'));
    });

    request.send(file);
  });
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;

  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value >= 10 ? value.toFixed(0) : value.toFixed(1)} ${units[unitIndex]}`;
}

function formatCreatedAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Shanghai',
  }).format(date);
}

function escapeMarkdownAlt(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/[\r\n]+/g, ' ');
}

async function writeClipboard(value: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  const copied = document.execCommand('copy');
  textarea.remove();

  if (!copied) throw new Error('浏览器未允许访问剪贴板。');
}

export function MediaLibrary({
  initialMedia,
  storageReadiness,
}: MediaLibraryProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const uploadQueueRef = useRef<Promise<void>>(Promise.resolve());
  const [uploadedMedia, setUploadedMedia] = useState<MediaListItem[]>([]);
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedMediaId, setCopiedMediaId] = useState<string>();
  const [clipboardError, setClipboardError] = useState('');

  const media = useMemo(() => {
    const uploadedIds = new Set(uploadedMedia.map((item) => item.id));
    return [
      ...uploadedMedia,
      ...initialMedia.filter((item) => !uploadedIds.has(item.id)),
    ];
  }, [initialMedia, uploadedMedia]);

  useEffect(
    () => () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    },
    []
  );

  const updateTask = useCallback(
    (id: string, changes: Partial<Omit<UploadTask, 'id'>>) => {
      setTasks((current) =>
        current.map((task) =>
          task.id === id ? { ...task, ...changes } : task
        )
      );
    },
    []
  );

  const uploadFile = useCallback(
    async (file: File, taskId: string) => {
      try {
        const presignRequest = await fetch('/api/admin/media/presign', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            mimeType: file.type,
            byteSize: file.size,
          }),
        });
        const presign = await readApiResponse<PresignResponse>(
          presignRequest,
          '无法准备上传，请稍后重试。'
        );

        updateTask(taskId, { status: 'uploading', progress: 0 });
        await putFileWithProgress({
          file,
          uploadUrl: presign.data.uploadUrl,
          headers: presign.data.headers,
          onProgress: (progress) => updateTask(taskId, { progress }),
        });

        updateTask(taskId, { status: 'finalizing', progress: 100 });
        const finalizeRequest = await fetch(
          `/api/admin/media/${encodeURIComponent(presign.data.assetId)}/finalize`,
          {
            method: 'POST',
            credentials: 'same-origin',
          }
        );
        const finalized = await readApiResponse<FinalizeResponse>(
          finalizeRequest,
          '图片已上传，但媒体记录确认失败。'
        );

        setUploadedMedia((current) => [
          finalized.data.asset,
          ...current.filter((item) => item.id !== finalized.data.asset.id),
        ]);
        updateTask(taskId, {
          status: 'completed',
          progress: 100,
          error: undefined,
        });
      } catch (error) {
        updateTask(taskId, {
          status: 'error',
          error: error instanceof Error ? error.message : '上传失败，请重试。',
        });
      }
    },
    [updateTask]
  );

  const enqueueFiles = useCallback(
    (selectedFiles: FileList | File[]) => {
      if (!storageReadiness.available) return;

      const files = Array.from(selectedFiles);
      const validUploads: Array<{ file: File; taskId: string }> = [];
      const nextTasks: UploadTask[] = files.map((file) => {
        const taskId = crypto.randomUUID();

        if (
          !ACCEPTED_IMAGE_TYPES.includes(
            file.type as (typeof ACCEPTED_IMAGE_TYPES)[number]
          )
        ) {
          return {
            id: taskId,
            filename: file.name,
            byteSize: file.size,
            progress: 0,
            status: 'error',
            error: '仅支持 JPEG、PNG、WebP、GIF 和 AVIF 图片。',
          };
        }

        validUploads.push({ file, taskId });
        return {
          id: taskId,
          filename: file.name,
          byteSize: file.size,
          progress: 0,
          status: 'presigning',
        };
      });

      if (nextTasks.length === 0) return;

      setTasks((current) => [...nextTasks, ...current]);
      for (const { file, taskId } of validUploads) {
        uploadQueueRef.current = uploadQueueRef.current.then(() =>
          uploadFile(file, taskId)
        );
      }
      void uploadQueueRef.current.then(() => router.refresh());
    },
    [router, storageReadiness.available, uploadFile]
  );

  const copyMarkdown = useCallback(async (item: MediaListItem) => {
    const markdown = `![${escapeMarkdownAlt(item.originalFilename)}](/media/${item.id})`;

    try {
      await writeClipboard(markdown);
      setClipboardError('');
      setCopiedMediaId(item.id);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopiedMediaId(undefined), 1800);
    } catch (error) {
      setCopiedMediaId(undefined);
      setClipboardError(
        error instanceof Error ? error.message : '复制失败，请稍后重试。'
      );
    }
  }, []);

  const activeUploadCount = tasks.filter((task) =>
    ['presigning', 'uploading', 'finalizing'].includes(task.status)
  ).length;

  return (
    <div className="space-y-10">
      <section aria-labelledby="media-upload-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold" id="media-upload-heading">
              媒体库
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              上传图片并复制 Markdown，即可插入文章正文。
            </p>
          </div>
          {activeUploadCount > 0 ? (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
              {activeUploadCount} 个文件处理中
            </span>
          ) : null}
        </div>

        {!storageReadiness.available ? (
          <div
            className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-200"
            role="status"
          >
            <p className="font-medium">图片上传暂不可用</p>
            <p className="mt-1 text-amber-800 dark:text-amber-300">
              {storageReadiness.message ||
                '对象存储尚未配置。配置完成后即可在这里上传图片，现有媒体仍可浏览。'}
            </p>
          </div>
        ) : null}

        <div
          className={`mt-6 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
            storageReadiness.available
              ? isDragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                : 'border-zinc-300 bg-white hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600'
              : 'cursor-not-allowed border-zinc-200 bg-zinc-100 opacity-70 dark:border-zinc-800 dark:bg-zinc-900'
          }`}
          onDragEnter={(event) => {
            event.preventDefault();
            if (storageReadiness.available) setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDragging(false);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            enqueueFiles(event.dataTransfer.files);
          }}
        >
          <input
            accept={ACCEPT_ATTRIBUTE}
            className="sr-only"
            disabled={!storageReadiness.available}
            multiple
            onChange={(event) => {
              if (event.target.files) enqueueFiles(event.target.files);
              event.target.value = '';
            }}
            ref={fileInputRef}
            type="file"
          />
          <p className="font-medium">
            {storageReadiness.available
              ? '把图片拖到这里，或从设备中选择'
              : '配置对象存储后即可上传'}
          </p>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            支持 JPEG、PNG、WebP、静态 GIF、AVIF，可一次选择多张
          </p>
          <button
            className="mt-5 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            disabled={!storageReadiness.available}
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            选择图片
          </button>
        </div>

        {tasks.length > 0 ? (
          <div
            aria-label="上传队列"
            aria-live="polite"
            className="mt-5 space-y-3"
          >
            {tasks.map((task) => (
              <div
                className="rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
                key={task.id}
              >
                <div className="flex items-start justify-between gap-4 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{task.filename}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {formatBytes(task.byteSize)}
                    </p>
                  </div>
                  <span
                    className={
                      task.status === 'error'
                        ? 'shrink-0 text-xs font-medium text-red-600 dark:text-red-400'
                        : task.status === 'completed'
                          ? 'shrink-0 text-xs font-medium text-emerald-600 dark:text-emerald-400'
                          : 'shrink-0 text-xs font-medium text-blue-600 dark:text-blue-400'
                    }
                  >
                    {statusLabel[task.status]}
                  </span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className={`h-full rounded-full transition-[width] ${
                      task.status === 'error'
                        ? 'bg-red-500'
                        : task.status === 'completed'
                          ? 'bg-emerald-500'
                          : 'bg-blue-500'
                    }`}
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
                {task.error ? (
                  <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                    {task.error}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section aria-labelledby="media-list-heading">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold" id="media-list-heading">
            已上传图片
          </h2>
          <span className="text-sm text-zinc-500">{media.length} 张</span>
        </div>

        {clipboardError ? (
          <p
            className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
            role="alert"
          >
            {clipboardError}
          </p>
        ) : null}

        {media.length > 0 ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {media.map((item) => (
              <article
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                key={item.id}
              >
                <div className="aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <img
                    alt={item.originalFilename}
                    className="h-full w-full object-cover"
                    decoding="async"
                    loading="lazy"
                    src={item.url}
                  />
                </div>
                <div className="p-4">
                  <p className="truncate font-medium" title={item.originalFilename}>
                    {item.originalFilename}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                    <span>{formatBytes(item.byteSize)}</span>
                    <span>{item.mimeType.replace(/^image\//, '').toUpperCase()}</span>
                    {item.width && item.height ? (
                      <span>
                        {item.width} × {item.height}
                      </span>
                    ) : null}
                    <time dateTime={item.createdAt}>
                      {formatCreatedAt(item.createdAt)}
                    </time>
                  </div>
                  <button
                    className="mt-4 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                    onClick={() => void copyMarkdown(item)}
                    type="button"
                  >
                    {copiedMediaId === item.id
                      ? '已复制 Markdown'
                      : '复制 Markdown'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-zinc-200 bg-white px-6 py-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <p className="font-medium">媒体库还是空的</p>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              上传第一张图片后，它会出现在这里。
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
