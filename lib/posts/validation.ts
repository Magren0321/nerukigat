import { createHash } from 'node:crypto';

import { z } from 'zod';

const canonicalSegmentPattern = /^[A-Za-z0-9][A-Za-z0-9._~-]*$/;
const publishedOnPattern = /^(\d{4})-(\d{2})-(\d{2})$/;

export const postKindSchema = z.enum(['post', 'weekly']);

export const canonicalPathSchema = z
  .string()
  .trim()
  .min(1)
  .max(240)
  .refine((value) => !value.startsWith('/') && !value.endsWith('/'), {
    message: '文章路径不能以 / 开头或结尾。',
  })
  .refine(
    (value) =>
      value.split('/').every((segment) => canonicalSegmentPattern.test(segment)),
    { message: '文章路径只能包含 ASCII 字母、数字、点、下划线、波浪线和连字符。' }
  );

export const publishedOnSchema = z
  .string()
  .regex(publishedOnPattern, '发布日期必须使用 YYYY-MM-DD。')
  .refine((value) => {
    const match = value.match(publishedOnPattern);
    if (!match) return false;
    const [, year, month, day] = match;
    const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    return (
      date.getUTCFullYear() === Number(year) &&
      date.getUTCMonth() === Number(month) - 1 &&
      date.getUTCDate() === Number(day)
    );
  }, '发布日期不是有效的日历日期。');

const optionalTrimmedString = (maximum: number) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => {
      const normalized = value?.trim();
      return normalized ? normalized : null;
    })
    .refine((value) => value === null || value.length <= maximum, {
      message: `内容不能超过 ${maximum} 个字符。`,
    });

const orderedTagsSchema = z
  .array(z.string().trim().min(1).max(60))
  .min(1, '至少需要一个标签。')
  .max(30)
  .transform((tags) => {
    const seen = new Set<string>();
    return tags.filter((tag) => {
      const key = tag.toLocaleLowerCase('en-US');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  });

export const postDraftDataSchema = z.object({
  kind: postKindSchema,
  canonicalPath: canonicalPathSchema,
  sourceSlug: optionalTrimmedString(240),
  title: z.string().trim().min(1, '标题不能为空。').max(240),
  description: optionalTrimmedString(500),
  markdown: z.string().max(900_000, '正文过大。'),
  publishedOn: z
    .union([publishedOnSchema, z.literal(''), z.null(), z.undefined()])
    .transform((value) => value || null),
  isPinned: z.boolean().default(false),
  tags: orderedTagsSchema,
});

export const createPostInputSchema = postDraftDataSchema;

export const saveDraftInputSchema = postDraftDataSchema.extend({
  expectedVersion: z.number().int().positive(),
});

export const publishPostInputSchema = z.object({
  postId: z.string().uuid(),
  expectedVersion: z.number().int().positive(),
});

export type CreatePostInput = z.input<typeof createPostInputSchema>;
export type SaveDraftInput = z.input<typeof saveDraftInputSchema>;

export function normalizeTagSlug(tag: string): string {
  const readable = tag
    .trim()
    .toLocaleLowerCase('en-US')
    .replace(/\s+/g, '-')
    .replace(/[^A-Za-z0-9\u00c0-\uffff._~-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  const fingerprint = createHash('sha256').update(tag).digest('hex').slice(0, 8);
  return `${readable || 'tag'}-${fingerprint}`;
}
