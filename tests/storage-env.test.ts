import assert from 'node:assert/strict';
import test from 'node:test';

import {
  parseStorageConfig,
  StorageConfigurationError,
} from '../lib/env/storage';

const completeEnvironment = {
  S3_ENDPOINT: 'http://127.0.0.1:9000',
  S3_REGION: 'us-east-1',
  S3_ACCESS_KEY_ID: 'local-access-key',
  S3_SECRET_ACCESS_KEY: 'local-secret-key',
  S3_PUBLIC_BUCKET: 'blog-public',
  S3_PRIVATE_BUCKET: 'blog-private',
  S3_PUBLIC_BASE_URL: 'http://127.0.0.1:9000/blog-public/',
  S3_FORCE_PATH_STYLE: 'true',
  S3_KEY_PREFIX: 'blog/uploads',
  S3_PRESIGN_TTL_SECONDS: '120',
  S3_MAX_UPLOAD_BYTES: '2048',
  S3_ALLOWED_MIME_TYPES: 'image/png, IMAGE/JPEG, image/png',
};

test('storage config is parsed lazily into normalized server-side values', () => {
  const config = parseStorageConfig(completeEnvironment);

  assert.equal(config.endpoint, 'http://127.0.0.1:9000');
  assert.equal(config.publicBaseUrl, 'http://127.0.0.1:9000/blog-public');
  assert.equal(config.forcePathStyle, true);
  assert.equal(config.publicBucket, 'blog-public');
  assert.equal(config.privateBucket, 'blog-private');
  assert.equal(config.presignTtlSeconds, 120);
  assert.equal(config.maxUploadBytes, 2048);
  assert.deepEqual(config.allowedMimeTypes, ['image/png', 'image/jpeg']);
});

test('private bucket stays optional until a private operation is requested', () => {
  const config = parseStorageConfig({
    ...completeEnvironment,
    S3_PRIVATE_BUCKET: '',
  });

  assert.equal(config.privateBucket, undefined);
});

test('storage defaults allow existing large blog images to migrate', () => {
  const config = parseStorageConfig({
    S3_ENDPOINT: completeEnvironment.S3_ENDPOINT,
    S3_REGION: completeEnvironment.S3_REGION,
    S3_ACCESS_KEY_ID: completeEnvironment.S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY: completeEnvironment.S3_SECRET_ACCESS_KEY,
    S3_PUBLIC_BUCKET: completeEnvironment.S3_PUBLIC_BUCKET,
    S3_PUBLIC_BASE_URL: completeEnvironment.S3_PUBLIC_BASE_URL,
  });

  assert.equal(config.maxUploadBytes, 20 * 1024 * 1024);
});

test('configuration errors list variable names without leaking secret values', () => {
  const secret = 'do-not-print-this-secret';

  assert.throws(
    () =>
      parseStorageConfig({
        ...completeEnvironment,
        S3_SECRET_ACCESS_KEY: secret,
        S3_PRESIGN_TTL_SECONDS: '9999',
      }),
    (error: unknown) => {
      assert.ok(error instanceof StorageConfigurationError);
      assert.match(error.message, /S3_PRESIGN_TTL_SECONDS/);
      assert.doesNotMatch(error.message, new RegExp(secret));
      return true;
    }
  );
});

test('wildcard MIME types and unsafe key prefixes are rejected', () => {
  assert.throws(() =>
    parseStorageConfig({
      ...completeEnvironment,
      S3_KEY_PREFIX: '../uploads',
      S3_ALLOWED_MIME_TYPES: 'image/*',
    })
  );
});

test('public and private buckets must be separate', () => {
  assert.throws(
    () =>
      parseStorageConfig({
        ...completeEnvironment,
        S3_PRIVATE_BUCKET: completeEnvironment.S3_PUBLIC_BUCKET,
      }),
    (error: unknown) => {
      assert.ok(error instanceof StorageConfigurationError);
      assert.match(error.message, /S3_PRIVATE_BUCKET/);
      return true;
    }
  );
});
