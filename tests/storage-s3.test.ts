import assert from 'node:assert/strict';
import test from 'node:test';

import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

import type { StorageConfig } from '../lib/env/storage';
import {
  buildPublicObjectUrl,
  createObjectKey,
  createPresignedPutUpload,
  headAndValidateUpload,
  selectStorageBucket,
  StorageValidationError,
} from '../lib/storage/s3';

const uuid = '123e4567-e89b-42d3-a456-426614174000';

const config: StorageConfig = {
  endpoint: 'http://127.0.0.1:9000',
  region: 'us-east-1',
  accessKeyId: 'access-key',
  secretAccessKey: 'secret-key',
  publicBucket: 'blog-public',
  privateBucket: 'blog-private',
  publicBaseUrl: 'https://img.example.com',
  forcePathStyle: true,
  keyPrefix: 'uploads',
  presignTtlSeconds: 300,
  maxUploadBytes: 1024,
  allowedMimeTypes: ['image/png', 'image/jpeg'],
};

const unusedClient = {} as S3Client;

test('object keys contain a server-generated UUID instead of a user filename', () => {
  const key = createObjectKey({
    visibility: 'public',
    contentType: 'image/png',
    keyPrefix: 'uploads',
    now: new Date('2026-07-14T12:00:00.000Z'),
    uuid: () => uuid,
  });

  assert.equal(key, `uploads/public/2026/07/${uuid}.png`);
  assert.doesNotMatch(key, /avatar|filename/i);
});

test('presigned PUT fixes the bucket, key, content type, and short expiry', async () => {
  let signedCommand: PutObjectCommand | undefined;
  let signedExpiry: number | undefined;

  const upload = await createPresignedPutUpload(
    {
      visibility: 'public',
      contentType: 'IMAGE/PNG',
      contentLength: 512,
    },
    {
      config,
      client: unusedClient,
      now: new Date('2026-07-14T12:00:00.000Z'),
      uuid: () => uuid,
      signer: async (_client, command, options) => {
        signedCommand = command;
        signedExpiry = options.expiresIn;
        return 'https://signed.example.test/upload';
      },
    }
  );

  assert.equal(signedCommand?.input.Bucket, 'blog-public');
  assert.equal(signedCommand?.input.Key, upload.key);
  assert.equal(signedCommand?.input.ContentType, 'image/png');
  assert.equal(signedCommand?.input.ContentLength, 512);
  assert.equal(signedExpiry, 300);
  assert.deepEqual(upload.headers, { 'Content-Type': 'image/png' });
  assert.equal(upload.expectedContentLength, 512);
  assert.equal(upload.expiresAt.toISOString(), '2026-07-14T12:05:00.000Z');
});

test('real presigner is R2 compatible and signs the browser content type', async () => {
  const r2Config: StorageConfig = {
    ...config,
    endpoint: 'https://example-account.r2.cloudflarestorage.com',
    region: 'auto',
    forcePathStyle: false,
  };
  const upload = await createPresignedPutUpload(
    {
      visibility: 'public',
      contentType: 'image/png',
      contentLength: 512,
    },
    {
      config: r2Config,
      now: new Date('2026-07-14T12:00:00.000Z'),
      uuid: () => uuid,
    }
  );
  const url = new URL(upload.url);

  assert.equal(url.searchParams.has('x-amz-checksum-crc32'), false);
  assert.equal(url.searchParams.has('x-amz-sdk-checksum-algorithm'), false);
  assert.match(
    url.searchParams.get('X-Amz-SignedHeaders') ?? '',
    /^content-length;content-type;host$/
  );
});

test('private uploads select the private bucket', async () => {
  let bucket: string | undefined;

  const upload = await createPresignedPutUpload(
    {
      visibility: 'private',
      contentType: 'image/jpeg',
      contentLength: 100,
    },
    {
      config,
      client: unusedClient,
      now: new Date('2026-07-14T12:00:00.000Z'),
      uuid: () => uuid,
      signer: async (_client, command) => {
        bucket = command.input.Bucket;
        return 'https://signed.example.test/private-upload';
      },
    }
  );

  assert.equal(bucket, 'blog-private');
  assert.equal(upload.visibility, 'private');
});

test('private operations fail closed when no private bucket is configured', () => {
  assert.throws(
    () => selectStorageBucket({ ...config, privateBucket: undefined }, 'private'),
    (error: unknown) =>
      error instanceof StorageValidationError &&
      error.code === 'private_bucket_not_configured'
  );
});

test('finalize uses HeadObject and accepts only matching trusted metadata', async () => {
  let headCommand: HeadObjectCommand | undefined;
  const key = `uploads/public/2026/07/${uuid}.png`;

  const result = await headAndValidateUpload(
    {
      key,
      visibility: 'public',
      contentType: 'image/png',
      contentLength: 512,
    },
    {
      config,
      client: unusedClient,
      headObject: async (_client, command) => {
        headCommand = command;
        return {
          $metadata: {},
          ContentLength: 512,
          ContentType: 'image/png',
          ETag: '"etag-value"',
          LastModified: new Date('2026-07-14T12:00:01.000Z'),
        };
      },
    }
  );

  assert.equal(headCommand?.input.Bucket, 'blog-public');
  assert.equal(headCommand?.input.Key, key);
  assert.equal(result.etag, 'etag-value');
  assert.equal(result.publicUrl, `https://img.example.com/${key}`);
});

test('finalize rejects a different object size', async () => {
  const key = `uploads/public/2026/07/${uuid}.png`;

  await assert.rejects(
    () =>
      headAndValidateUpload(
        {
          key,
          visibility: 'public',
          contentType: 'image/png',
          contentLength: 512,
        },
        {
          config,
          client: unusedClient,
          headObject: async () => ({
            $metadata: {},
            ContentLength: 513,
            ContentType: 'image/png',
            ETag: '"etag-value"',
          }),
        }
      ),
    (error: unknown) =>
      error instanceof StorageValidationError && error.code === 'content_length_mismatch'
  );
});

test('public URLs encode object key segments safely', () => {
  assert.equal(
    buildPublicObjectUrl(`uploads/public/2026/07/${uuid}.png`, {
      keyPrefix: 'uploads',
      publicBaseUrl: 'https://img.example.com/',
    }),
    `https://img.example.com/uploads/public/2026/07/${uuid}.png`
  );
});

test('public URL helper refuses private object keys', () => {
  assert.throws(
    () =>
      buildPublicObjectUrl(`uploads/private/2026/07/${uuid}.png`, {
        keyPrefix: 'uploads',
        publicBaseUrl: 'https://img.example.com',
      }),
    (error: unknown) =>
      error instanceof StorageValidationError && error.code === 'invalid_object_key'
  );
});

test('runtime visibility validation rejects untrusted values', async () => {
  await assert.rejects(
    () =>
      createPresignedPutUpload(
        {
          visibility: 'untrusted' as 'public',
          contentType: 'image/png',
          contentLength: 100,
        },
        { config, client: unusedClient }
      ),
    (error: unknown) =>
      error instanceof StorageValidationError && error.code === 'invalid_visibility'
  );
});
