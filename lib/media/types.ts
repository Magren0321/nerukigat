export const SUPPORTED_MEDIA_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
] as const;

// These hard limits are intentionally independent from generic S3 settings.
// The finalizer buffers the source and sanitized output, so a configuration
// mistake must not turn a single image into a multi-gigabyte allocation.
export const MEDIA_MAX_INPUT_BYTES = 25 * 1024 * 1024;
export const MEDIA_MAX_OUTPUT_BYTES = 25 * 1024 * 1024;

export type SupportedMediaMimeType =
  (typeof SUPPORTED_MEDIA_MIME_TYPES)[number];

export interface MediaAssetRecord {
  id: string;
  storageKey: string;
  originalFilename: string;
  mimeType: string;
  byteSize: number;
  width: number | null;
  height: number | null;
  sha256: string | null;
  alt: string;
  status: 'pending' | 'active' | 'detached' | 'deleted';
  visibility: 'private' | 'public';
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaListItem {
  id: string;
  url: string;
  originalFilename: string;
  mimeType: string;
  byteSize: number;
  width: number;
  height: number;
  createdAt: string;
}

export interface MediaStorageReadiness {
  available: boolean;
  message?: string;
}

export interface SanitizedImage {
  data: Buffer;
  mimeType: SupportedMediaMimeType;
  width: number;
  height: number;
  sha256: string;
}
