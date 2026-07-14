import 'server-only';

import { randomUUID } from 'node:crypto';

import {
  HeadObjectCommand,
  HeadObjectCommandOutput,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { getStorageConfig, StorageConfig } from '../env/storage';

export type StorageVisibility = 'public' | 'private';

export type StorageValidationErrorCode =
  | 'invalid_visibility'
  | 'invalid_content_length'
  | 'unsupported_content_type'
  | 'invalid_object_key'
  | 'private_bucket_not_configured'
  | 'content_length_mismatch'
  | 'content_type_mismatch'
  | 'missing_etag';

export class StorageValidationError extends Error {
  constructor(
    readonly code: StorageValidationErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'StorageValidationError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export interface PresignUploadInput {
  visibility: StorageVisibility;
  contentType: string;
  contentLength: number;
}

export interface PresignedUpload {
  key: string;
  visibility: StorageVisibility;
  url: string;
  headers: Readonly<{ 'Content-Type': string }>;
  expiresAt: Date;
  expectedContentLength: number;
}

export interface FinalizeUploadInput extends PresignUploadInput {
  key: string;
}

export type PresignExistingUploadInput = FinalizeUploadInput;

export interface FinalizedUpload {
  key: string;
  visibility: StorageVisibility;
  contentType: string;
  contentLength: number;
  etag: string;
  lastModified?: Date;
  publicUrl?: string;
}

type PutObjectSigner = (
  client: S3Client,
  command: PutObjectCommand,
  options: { expiresIn: number; signableHeaders?: Set<string> }
) => Promise<string>;

type HeadObjectLoader = (
  client: S3Client,
  command: HeadObjectCommand
) => Promise<HeadObjectCommandOutput>;

interface SharedDependencies {
  config?: StorageConfig;
  client?: S3Client;
}

export interface PresignDependencies extends SharedDependencies {
  now?: Date;
  uuid?: () => string;
  signer?: PutObjectSigner;
}

export interface FinalizeDependencies extends SharedDependencies {
  headObject?: HeadObjectLoader;
}

const extensionByMimeType: Readonly<Record<string, string>> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
  'application/pdf': 'pdf',
  'text/plain': 'txt',
};

const uuidV4Pattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const defaultSigner: PutObjectSigner = (client, command, options) =>
  getSignedUrl(client, command, options);

const defaultHeadObject: HeadObjectLoader = (client, command) =>
  client.send(command);

export function createS3Client(config: StorageConfig = getStorageConfig()): S3Client {
  return new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: config.forcePathStyle,
    // New AWS SDK releases otherwise add a CRC32 for the empty presign-time
    // body. R2 then rejects the browser's non-empty upload with BadDigest.
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  });
}

export function selectStorageBucket(
  config: StorageConfig,
  visibility: StorageVisibility
): string {
  assertStorageVisibility(visibility);

  if (visibility === 'public') {
    return config.publicBucket;
  }

  if (!config.privateBucket) {
    throw new StorageValidationError(
      'private_bucket_not_configured',
      'S3_PRIVATE_BUCKET must be configured before private uploads are allowed'
    );
  }

  return config.privateBucket;
}

export function createObjectKey({
  visibility,
  contentType,
  keyPrefix,
  now = new Date(),
  uuid = randomUUID,
}: {
  visibility: StorageVisibility;
  contentType: string;
  keyPrefix: string;
  now?: Date;
  uuid?: () => string;
}): string {
  assertStorageVisibility(visibility);

  const id = uuid();

  if (!uuidV4Pattern.test(id)) {
    throw new StorageValidationError(
      'invalid_object_key',
      'The object key generator must return a UUID v4 value'
    );
  }

  const extension = extensionByMimeType[normalizeContentType(contentType)] ?? 'bin';
  const year = String(now.getUTCFullYear()).padStart(4, '0');
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');

  return `${keyPrefix}/${visibility}/${year}/${month}/${id}.${extension}`;
}

export function buildPublicObjectUrl(
  key: string,
  config: Pick<StorageConfig, 'keyPrefix' | 'publicBaseUrl'>
): string {
  assertManagedObjectKey(key, config.keyPrefix, 'public');

  const encodedKey = key
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  return `${config.publicBaseUrl.replace(/\/+$/, '')}/${encodedKey}`;
}

export async function createPresignedPutUpload(
  input: PresignUploadInput,
  dependencies: PresignDependencies = {}
): Promise<PresignedUpload> {
  const config = dependencies.config ?? getStorageConfig();
  const validated = validateUploadInput(input, config);
  const now = dependencies.now ?? new Date();
  const key = createObjectKey({
    visibility: validated.visibility,
    contentType: validated.contentType,
    keyPrefix: config.keyPrefix,
    now,
    uuid: dependencies.uuid,
  });
  const bucket = selectStorageBucket(config, validated.visibility);
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: validated.contentType,
    ContentLength: validated.contentLength,
  });
  const client = dependencies.client ?? createS3Client(config);
  const signer = dependencies.signer ?? defaultSigner;
  const url = await signer(client, command, {
    expiresIn: config.presignTtlSeconds,
    signableHeaders: new Set(['content-type']),
  });

  return {
    key,
    visibility: validated.visibility,
    url,
    headers: { 'Content-Type': validated.contentType },
    expiresAt: new Date(now.getTime() + config.presignTtlSeconds * 1000),
    expectedContentLength: validated.contentLength,
  };
}

/**
 * Signs a server-generated key that has already been persisted. This is used by
 * workflows that must create a pending database record before the browser ever
 * receives a usable upload URL.
 */
export async function createPresignedPutForKey(
  input: PresignExistingUploadInput,
  dependencies: PresignDependencies = {}
): Promise<PresignedUpload> {
  const config = dependencies.config ?? getStorageConfig();
  const validated = validateUploadInput(input, config);
  assertManagedObjectKey(input.key, config.keyPrefix, validated.visibility);

  const now = dependencies.now ?? new Date();
  const bucket = selectStorageBucket(config, validated.visibility);
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: input.key,
    ContentType: validated.contentType,
    ContentLength: validated.contentLength,
  });
  const client = dependencies.client ?? createS3Client(config);
  const signer = dependencies.signer ?? defaultSigner;
  const url = await signer(client, command, {
    expiresIn: config.presignTtlSeconds,
    signableHeaders: new Set(['content-type']),
  });

  return {
    key: input.key,
    visibility: validated.visibility,
    url,
    headers: { 'Content-Type': validated.contentType },
    expiresAt: new Date(now.getTime() + config.presignTtlSeconds * 1000),
    expectedContentLength: validated.contentLength,
  };
}

/**
 * HEADs an uploaded object and verifies the fields that a presigned PUT cannot
 * safely enforce on its own. The expected values must come from trusted server
 * state, not directly from the finalize request body.
 */
export async function headAndValidateUpload(
  input: FinalizeUploadInput,
  dependencies: FinalizeDependencies = {}
): Promise<FinalizedUpload> {
  const config = dependencies.config ?? getStorageConfig();
  const validated = validateUploadInput(input, config);
  assertManagedObjectKey(input.key, config.keyPrefix, validated.visibility);

  const bucket = selectStorageBucket(config, validated.visibility);
  const client = dependencies.client ?? createS3Client(config);
  const loadHead = dependencies.headObject ?? defaultHeadObject;
  const head = await loadHead(
    client,
    new HeadObjectCommand({ Bucket: bucket, Key: input.key })
  );

  return validateUploadedObjectHead({
    head,
    key: input.key,
    visibility: validated.visibility,
    expectedContentType: validated.contentType,
    expectedContentLength: validated.contentLength,
    publicBaseUrl: config.publicBaseUrl,
    keyPrefix: config.keyPrefix,
  });
}

export function validateUploadedObjectHead({
  head,
  key,
  visibility,
  expectedContentType,
  expectedContentLength,
  publicBaseUrl,
  keyPrefix,
}: {
  head: Pick<HeadObjectCommandOutput, 'ContentLength' | 'ContentType' | 'ETag' | 'LastModified'>;
  key: string;
  visibility: StorageVisibility;
  expectedContentType: string;
  expectedContentLength: number;
  publicBaseUrl: string;
  keyPrefix: string;
}): FinalizedUpload {
  if (head.ContentLength !== expectedContentLength) {
    throw new StorageValidationError(
      'content_length_mismatch',
      `Uploaded object length does not match the expected ${expectedContentLength} bytes`
    );
  }

  const actualContentType = head.ContentType
    ? normalizeContentType(head.ContentType)
    : undefined;

  if (actualContentType !== expectedContentType) {
    throw new StorageValidationError(
      'content_type_mismatch',
      'Uploaded object content type does not match the signed content type'
    );
  }

  const etag = head.ETag?.trim().replace(/^"|"$/g, '');

  if (!etag) {
    throw new StorageValidationError(
      'missing_etag',
      'Uploaded object did not return an ETag'
    );
  }

  return {
    key,
    visibility,
    contentType: actualContentType,
    contentLength: head.ContentLength,
    etag,
    lastModified: head.LastModified,
    publicUrl:
      visibility === 'public'
        ? buildPublicObjectUrl(key, { publicBaseUrl, keyPrefix })
        : undefined,
  };
}

function validateUploadInput(
  input: PresignUploadInput,
  config: StorageConfig
): {
  visibility: StorageVisibility;
  contentType: string;
  contentLength: number;
} {
  assertStorageVisibility(input.visibility);

  if (
    !Number.isSafeInteger(input.contentLength) ||
    input.contentLength <= 0 ||
    input.contentLength > config.maxUploadBytes
  ) {
    throw new StorageValidationError(
      'invalid_content_length',
      `Upload size must be an integer between 1 and ${config.maxUploadBytes} bytes`
    );
  }

  const contentType = normalizeContentType(input.contentType);

  if (!config.allowedMimeTypes.includes(contentType)) {
    throw new StorageValidationError(
      'unsupported_content_type',
      `Content type ${contentType || '(empty)'} is not allowed`
    );
  }

  return {
    visibility: input.visibility,
    contentType,
    contentLength: input.contentLength,
  };
}

function normalizeContentType(contentType: string): string {
  return contentType.trim().toLowerCase();
}

function assertManagedObjectKey(
  key: string,
  keyPrefix: string,
  visibility: StorageVisibility
): void {
  const escapedPrefix = escapeRegularExpression(keyPrefix);
  const pattern = new RegExp(
    `^${escapedPrefix}/${visibility}/\\d{4}/(?:0[1-9]|1[0-2])/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\\.[a-z0-9]{1,10}$`,
    'i'
  );

  if (!pattern.test(key)) {
    throw new StorageValidationError(
      'invalid_object_key',
      'Object key was not generated by the managed upload flow'
    );
  }
}

function assertStorageVisibility(
  visibility: unknown
): asserts visibility is StorageVisibility {
  if (visibility !== 'public' && visibility !== 'private') {
    throw new StorageValidationError(
      'invalid_visibility',
      'Storage visibility must be public or private'
    );
  }
}

function escapeRegularExpression(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
