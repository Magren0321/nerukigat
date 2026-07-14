import { createHash } from 'node:crypto';
import matter from 'gray-matter';
import { auditMdxCompatibility } from './compatibility';
import type { ImportedMdxDocument } from './types';

const DATE_PATTERN = /^(\d{4})\/(\d{2})\/(\d{2})$/;
const FRONTMATTER_OPENING = /^(?:\uFEFF)?---[\t ]*(?:\r\n|\n|\r|$)/;

export class MdxImportValidationError extends Error {
  readonly sourcePath: string;

  constructor(sourcePath: string, message: string) {
    super(`${sourcePath}: ${message}`);
    this.name = 'MdxImportValidationError';
    this.sourcePath = sourcePath;
  }
}

const normalizeSourcePath = (sourcePath: string) => {
  const normalized = sourcePath.replaceAll('\\', '/').replace(/^\.\//, '');
  const segments = normalized.split('/');
  if (
    normalized.startsWith('/') ||
    segments.some((segment) => segment === '' || segment === '.' || segment === '..') ||
    !normalized.endsWith('.mdx')
  ) {
    throw new MdxImportValidationError(
      sourcePath,
      'sourcePath must be a relative .mdx path inside the posts directory.'
    );
  }
  return normalized;
};

/**
 * gray-matter intentionally removes the newline following the closing
 * delimiter from `content`. The existing Contentlayer body retains it, so the
 * body is sliced from the original source after gray-matter parses metadata.
 */
const extractBodyVerbatim = (source: string, sourcePath: string) => {
  const opening = source.match(FRONTMATTER_OPENING);
  if (!opening) {
    throw new MdxImportValidationError(sourcePath, 'missing opening frontmatter delimiter.');
  }

  const closingPattern = /^---[\t ]*(?=\r?$)/gm;
  closingPattern.lastIndex = opening[0].length;
  const closing = closingPattern.exec(source);
  if (!closing) {
    throw new MdxImportValidationError(sourcePath, 'missing closing frontmatter delimiter.');
  }

  return source.slice(closing.index + closing[0].length);
};

const requireString = (value: unknown, field: string, sourcePath: string) => {
  if (typeof value !== 'string' || value.length === 0) {
    throw new MdxImportValidationError(sourcePath, `${field} must be a non-empty string.`);
  }
  return value;
};

const parseSourceSlug = (value: unknown, sourcePath: string) => {
  if (typeof value === 'string' && value.length > 0) return value;

  // js-yaml (used by gray-matter) resolves an unquoted YYYY-MM-DD scalar as a
  // Date. Convert it back to the exact calendar slug instead of serializing an
  // ISO timestamp.
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  throw new MdxImportValidationError(sourcePath, 'slug must be a non-empty string.');
};

const parsePublishedOn = (value: unknown, sourcePath: string) => {
  const rawDate = requireString(value, 'date', sourcePath);
  const match = rawDate.match(DATE_PATTERN);
  if (!match) {
    throw new MdxImportValidationError(sourcePath, 'date must use YYYY/MM/DD.');
  }

  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day)
  ) {
    throw new MdxImportValidationError(sourcePath, `date ${rawDate} is not a real calendar date.`);
  }

  return `${year}-${month}-${day}`;
};

const parseDescription = (value: unknown, sourcePath: string) => {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') {
    throw new MdxImportValidationError(sourcePath, 'description must be a string or empty.');
  }
  return value;
};

const parseBoolean = (value: unknown, field: string, sourcePath: string) => {
  if (value === undefined || value === null) return false;
  if (typeof value !== 'boolean') {
    throw new MdxImportValidationError(sourcePath, `${field} must be a boolean.`);
  }
  return value;
};

const parseTags = (value: unknown, sourcePath: string) => {
  if (!Array.isArray(value) || value.length === 0) {
    throw new MdxImportValidationError(sourcePath, 'tags must be a non-empty ordered list.');
  }
  return value.map((tag, index) => {
    if (typeof tag !== 'string' || tag.length === 0) {
      throw new MdxImportValidationError(
        sourcePath,
        `tags[${index}] must be a non-empty string.`
      );
    }
    return tag;
  });
};

export interface ParseMdxDocumentInput {
  sourcePath: string;
  source: string;
}

export const parseMdxDocument = ({
  sourcePath,
  source,
}: ParseMdxDocumentInput): ImportedMdxDocument => {
  const normalizedSourcePath = normalizeSourcePath(sourcePath);
  const parsed = matter(source);
  const body = extractBodyVerbatim(source, normalizedSourcePath);
  const canonicalPath = normalizedSourcePath.slice(0, -'.mdx'.length);
  const bodyBuffer = Buffer.from(body, 'utf8');

  return {
    sourcePath: normalizedSourcePath,
    canonicalPath,
    sourceSlug: parseSourceSlug(parsed.data.slug, normalizedSourcePath),
    kind:
      canonicalPath === 'weekly' || canonicalPath.startsWith('weekly/')
        ? 'weekly'
        : 'post',
    title: requireString(parsed.data.title, 'title', normalizedSourcePath),
    publishedOn: parsePublishedOn(parsed.data.date, normalizedSourcePath),
    description: parseDescription(parsed.data.description, normalizedSourcePath),
    tags: parseTags(parsed.data.tags, normalizedSourcePath),
    draft: parseBoolean(parsed.data.draft, 'draft', normalizedSourcePath),
    top: parseBoolean(parsed.data.top, 'top', normalizedSourcePath),
    body,
    bodySha256: createHash('sha256').update(bodyBuffer).digest('hex'),
    bodyBytes: bodyBuffer.byteLength,
    incompatibilities: auditMdxCompatibility(body),
  };
};
