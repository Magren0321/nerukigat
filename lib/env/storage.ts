import 'server-only';

import { z } from 'zod';

export const DEFAULT_STORAGE_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
] as const;

const mimeTypePattern =
  /^[a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*$/;

const serviceUrl = z
  .string()
  .trim()
  .min(1)
  .url()
  .superRefine((value, context) => {
    let url: URL;

    try {
      url = new URL(value);
    } catch {
      return;
    }

    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      context.addIssue({
        code: 'custom',
        message: 'must use the http or https protocol',
      });
    }

    if (url.username || url.password) {
      context.addIssue({
        code: 'custom',
        message: 'must not contain embedded credentials',
      });
    }

    if (url.search || url.hash) {
      context.addIssue({
        code: 'custom',
        message: 'must not contain a query string or fragment',
      });
    }
  })
  .transform((value) => value.replace(/\/+$/, ''));

const positiveIntegerString = (defaultValue: number, maximum: number) =>
  z
    .string()
    .trim()
    .default(String(defaultValue))
    .refine((value) => /^\d+$/.test(value), 'must be a positive integer')
    .transform(Number)
    .refine(
      (value) => Number.isSafeInteger(value) && value > 0 && value <= maximum,
      `must be between 1 and ${maximum}`
    );

const bucketName = z
  .string()
  .trim()
  .regex(
    /^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/,
    'must be a valid lowercase S3-compatible bucket name'
  );

const rawStorageEnvironment = z
  .object({
    S3_ENDPOINT: serviceUrl,
    S3_REGION: z.string().trim().min(1),
    S3_ACCESS_KEY_ID: z.string().trim().min(1),
    S3_SECRET_ACCESS_KEY: z.string().min(1),
    S3_PUBLIC_BUCKET: bucketName,
    S3_PRIVATE_BUCKET: z.preprocess(
      (value) =>
        typeof value === 'string' && value.trim() === '' ? undefined : value,
      bucketName.optional()
    ),
    S3_PUBLIC_BASE_URL: serviceUrl,
    S3_FORCE_PATH_STYLE: z
      .enum(['true', 'false'])
      .default('false')
      .transform((value) => value === 'true'),
    S3_KEY_PREFIX: z
      .string()
      .trim()
      .default('uploads')
      .refine(
        (value) =>
          value.split('/').every((segment) => /^[A-Za-z0-9_-]+$/.test(segment)),
        'must contain only non-empty alphanumeric, underscore, or hyphen path segments'
      ),
    S3_PRESIGN_TTL_SECONDS: positiveIntegerString(300, 900),
    S3_MAX_UPLOAD_BYTES: positiveIntegerString(20 * 1024 * 1024, 1024 * 1024 * 1024),
    S3_ALLOWED_MIME_TYPES: z
      .string()
      .trim()
      .default(DEFAULT_STORAGE_ALLOWED_MIME_TYPES.join(','))
      .transform((value) =>
        Array.from(
          new Set(
            value
              .split(',')
              .map((item) => item.trim().toLowerCase())
              .filter(Boolean)
          )
        )
      )
      .refine((value) => value.length > 0, 'must contain at least one MIME type')
      .refine(
        (value) => value.every((item) => mimeTypePattern.test(item)),
        'must contain exact MIME types separated by commas; wildcards are not allowed'
      ),
  })
  .superRefine((environment, context) => {
    if (
      environment.S3_PRIVATE_BUCKET &&
      environment.S3_PRIVATE_BUCKET === environment.S3_PUBLIC_BUCKET
    ) {
      context.addIssue({
        code: 'custom',
        path: ['S3_PRIVATE_BUCKET'],
        message:
          'must differ from S3_PUBLIC_BUCKET so original files and EXIF are never publicly addressable',
      });
    }
  })
  .transform((environment) => ({
    endpoint: environment.S3_ENDPOINT,
    region: environment.S3_REGION,
    accessKeyId: environment.S3_ACCESS_KEY_ID,
    secretAccessKey: environment.S3_SECRET_ACCESS_KEY,
    publicBucket: environment.S3_PUBLIC_BUCKET,
    privateBucket: environment.S3_PRIVATE_BUCKET,
    publicBaseUrl: environment.S3_PUBLIC_BASE_URL,
    forcePathStyle: environment.S3_FORCE_PATH_STYLE,
    keyPrefix: environment.S3_KEY_PREFIX,
    presignTtlSeconds: environment.S3_PRESIGN_TTL_SECONDS,
    maxUploadBytes: environment.S3_MAX_UPLOAD_BYTES,
    allowedMimeTypes: environment.S3_ALLOWED_MIME_TYPES,
  }));

export type StorageConfig = z.output<typeof rawStorageEnvironment>;

export class StorageConfigurationError extends Error {
  readonly issues: ReadonlyArray<{ path: string; message: string }>;

  constructor(error: z.ZodError) {
    const issues = error.issues.map((issue) => ({
      path: issue.path.join('.') || 'storage',
      message: issue.message,
    }));

    super(
      `Invalid storage configuration: ${issues
        .map((issue) => `${issue.path}: ${issue.message}`)
        .join('; ')}`
    );
    this.name = 'StorageConfigurationError';
    this.issues = issues;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Parses storage configuration only when a server-side storage operation asks
 * for it. Importing this module does not require S3 variables, so the existing
 * static blog can still build without object storage configured.
 */
export function parseStorageConfig(
  source: Readonly<Record<string, string | undefined>>
): StorageConfig {
  const result = rawStorageEnvironment.safeParse(source);

  if (!result.success) {
    throw new StorageConfigurationError(result.error);
  }

  return result.data;
}

export function getStorageConfig(): StorageConfig {
  return parseStorageConfig(process.env);
}
