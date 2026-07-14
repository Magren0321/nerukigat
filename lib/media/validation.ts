import { z } from 'zod';

import { SUPPORTED_MEDIA_MIME_TYPES } from './types';

export const mediaPresignInputSchema = z.object({
  filename: z.string().min(1).max(1024),
  mimeType: z.enum(SUPPORTED_MEDIA_MIME_TYPES),
  byteSize: z.number().int().positive(),
});

export type MediaPresignInput = z.output<typeof mediaPresignInputSchema>;

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isMediaId(value: string): boolean {
  return uuidPattern.test(value);
}

export function normalizeOriginalFilename(value: string): string {
  const basename = value.split(/[\\/]/).pop() ?? '';
  const normalized = basename
    .normalize('NFKC')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim()
    .slice(0, 255);

  return normalized || 'upload';
}

export function publicMediaPath(id: string): string {
  if (!isMediaId(id)) {
    throw new Error('Invalid media id');
  }

  return `/media/${id}`;
}

export function escapeMarkdownAlt(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/([\[\]])/g, '\\$1')
    .replace(/[\r\n]+/g, ' ');
}

export function createMediaMarkdown(
  asset: Pick<MediaListItemShape, 'id' | 'originalFilename'>
): string {
  return `![${escapeMarkdownAlt(asset.originalFilename)}](${publicMediaPath(asset.id)})`;
}

interface MediaListItemShape {
  id: string;
  originalFilename: string;
}
