import assert from 'node:assert/strict';
import test from 'node:test';

import { MediaError } from '../lib/media/errors';
import type {
  MediaObjectStore,
  PreparedPrivateUpload,
} from '../lib/media/object-store';
import type { MediaRepository } from '../lib/media/repository';
import {
  finalizeMediaUpload,
  presignMediaUpload,
} from '../lib/media/service';
import type {
  MediaAssetRecord,
  SanitizedImage,
} from '../lib/media/types';

const mediaId = '123e4567-e89b-42d3-a456-426614174000';
const createdAt = new Date('2026-07-14T10:00:00.000Z');

function pendingAsset(
  overrides: Partial<MediaAssetRecord> = {}
): MediaAssetRecord {
  return {
    id: mediaId,
    storageKey: 'uploads/private/2026/07/raw.png',
    originalFilename: 'cover.png',
    mimeType: 'image/png',
    byteSize: 8,
    width: null,
    height: null,
    sha256: null,
    alt: '',
    status: 'pending',
    visibility: 'private',
    createdAt,
    updatedAt: createdAt,
    ...overrides,
  };
}

function activeAsset(
  overrides: Partial<MediaAssetRecord> = {}
): MediaAssetRecord {
  return pendingAsset({
    storageKey: 'uploads/public/2026/07/sanitized.png',
    mimeType: 'image/png',
    byteSize: 6,
    width: 1200,
    height: 800,
    sha256: 'sanitized-sha256',
    status: 'active',
    visibility: 'public',
    updatedAt: new Date('2026-07-14T10:01:00.000Z'),
    ...overrides,
  });
}

function fakeRepository(
  overrides: Partial<MediaRepository> = {}
): MediaRepository {
  return {
    async createPending(input) {
      return pendingAsset({
        storageKey: input.storageKey,
        originalFilename: input.originalFilename,
        mimeType: input.mimeType,
        byteSize: input.byteSize,
      });
    },
    async rejectPending() {},
    async findById() {
      return pendingAsset();
    },
    async findActivePublicById() {
      return null;
    },
    async activatePending(input) {
      return activeAsset({
        storageKey: input.publicStorageKey,
        mimeType: input.mimeType,
        byteSize: input.byteSize,
        width: input.width,
        height: input.height,
        sha256: input.sha256,
      });
    },
    async listActivePublic() {
      return [];
    },
    ...overrides,
  };
}

function fakeObjectStore(
  overrides: Partial<MediaObjectStore> = {}
): MediaObjectStore {
  return {
    preparePrivateUpload(input) {
      return {
        key: 'uploads/private/2026/07/raw.png',
        contentType: input.contentType,
        contentLength: input.contentLength,
      };
    },
    async presignPrivateUpload(input) {
      return {
        uploadUrl: 'https://signed.example.test/private-upload',
        headers: { 'Content-Type': input.contentType },
        expiresAt: new Date('2026-07-14T10:05:00.000Z'),
      };
    },
    async readVerifiedPrivate() {
      return Buffer.from('original');
    },
    createPublicKey() {
      return 'uploads/public/2026/07/sanitized.png';
    },
    async putPublic() {},
    async deletePrivate() {},
    async deletePublic() {},
    ...overrides,
  };
}

const sanitizedImage: SanitizedImage = {
  data: Buffer.from('public'),
  mimeType: 'image/png',
  width: 1200,
  height: 800,
  sha256: 'sanitized-sha256',
};

test('presign persists server expectations before returning a usable URL', async () => {
  const calls: string[] = [];
  const prepared: PreparedPrivateUpload = {
    key: 'uploads/private/2026/07/raw.png',
    contentType: 'image/png',
    contentLength: 512,
  };

  const result = await presignMediaUpload(
    {
      filename: '../drafts/ cover.png ',
      mimeType: 'image/png',
      byteSize: 512,
    },
    {
      objectStore: fakeObjectStore({
        preparePrivateUpload(input) {
          calls.push('prepare');
          assert.deepEqual(input, {
            contentType: 'image/png',
            contentLength: 512,
          });
          return prepared;
        },
        async presignPrivateUpload(input) {
          calls.push('sign');
          assert.deepEqual(input, prepared);
          return {
            uploadUrl: 'https://signed.example.test/private-upload',
            headers: { 'Content-Type': 'image/png' },
            expiresAt: new Date('2026-07-14T10:05:00.000Z'),
          };
        },
      }),
      repository: fakeRepository({
        async createPending(input) {
          calls.push('persist');
          assert.deepEqual(input, {
            storageKey: prepared.key,
            originalFilename: 'cover.png',
            mimeType: 'image/png',
            byteSize: 512,
          });
          return pendingAsset({
            storageKey: input.storageKey,
            originalFilename: input.originalFilename,
            mimeType: input.mimeType,
            byteSize: input.byteSize,
          });
        },
      }),
    }
  );

  assert.deepEqual(calls, ['prepare', 'persist', 'sign']);
  assert.deepEqual(result, {
    assetId: mediaId,
    uploadUrl: 'https://signed.example.test/private-upload',
    headers: { 'Content-Type': 'image/png' },
    expiresAt: '2026-07-14T10:05:00.000Z',
  });
});

test('presign does not sign an upload when pending-state persistence fails', async () => {
  let signWasCalled = false;
  const databaseFailure = new Error('database unavailable');

  await assert.rejects(
    () =>
      presignMediaUpload(
        {
          filename: 'cover.png',
          mimeType: 'image/png',
          byteSize: 512,
        },
        {
          objectStore: fakeObjectStore({
            async presignPrivateUpload(input) {
              signWasCalled = true;
              return {
                uploadUrl: 'https://signed.example.test/private-upload',
                headers: { 'Content-Type': input.contentType },
                expiresAt: createdAt,
              };
            },
          }),
          repository: fakeRepository({
            async createPending() {
              throw databaseFailure;
            },
          }),
        }
      ),
    databaseFailure
  );

  assert.equal(signWasCalled, false);
});

test('presign marks its pending record deleted when signing fails', async () => {
  const storageFailure = new Error('signer unavailable');
  let rejectedPending = false;

  await assert.rejects(
    () =>
      presignMediaUpload(
        {
          filename: 'cover.png',
          mimeType: 'image/png',
          byteSize: 512,
        },
        {
          repository: fakeRepository({
            async rejectPending(input) {
              rejectedPending = true;
              assert.deepEqual(input, {
                id: mediaId,
                expectedStorageKey: 'uploads/private/2026/07/raw.png',
              });
            },
          }),
          objectStore: fakeObjectStore({
            async presignPrivateUpload() {
              throw storageFailure;
            },
          }),
        }
      ),
    storageFailure
  );

  assert.equal(rejectedPending, true);
});

test('finalize trusts pending DB metadata, publishes sanitized bytes, then removes the private object', async () => {
  const calls: string[] = [];
  const pending = pendingAsset();

  const result = await finalizeMediaUpload(mediaId, {
    repository: fakeRepository({
      async findById(id) {
        calls.push('find');
        assert.equal(id, mediaId);
        return pending;
      },
      async activatePending(input) {
        calls.push('activate');
        assert.deepEqual(input, {
          id: mediaId,
          expectedStorageKey: pending.storageKey,
          publicStorageKey: 'uploads/public/2026/07/sanitized.png',
          mimeType: 'image/png',
          byteSize: sanitizedImage.data.byteLength,
          width: 1200,
          height: 800,
          sha256: 'sanitized-sha256',
        });
        return activeAsset();
      },
    }),
    objectStore: fakeObjectStore({
      async readVerifiedPrivate(input) {
        calls.push('read-private');
        assert.deepEqual(input, {
          key: pending.storageKey,
          contentType: pending.mimeType,
          contentLength: pending.byteSize,
        });
        return Buffer.from('untrusted-original');
      },
      createPublicKey(contentType) {
        calls.push('create-public-key');
        assert.equal(contentType, 'image/png');
        return 'uploads/public/2026/07/sanitized.png';
      },
      async putPublic(input) {
        calls.push('put-public');
        assert.deepEqual(input, {
          key: 'uploads/public/2026/07/sanitized.png',
          contentType: 'image/png',
          data: sanitizedImage.data,
        });
      },
      async deletePrivate(key) {
        calls.push('delete-private');
        assert.equal(key, pending.storageKey);
      },
      async deletePublic() {
        assert.fail('a successful finalize must not delete the public object');
      },
    }),
    async processImage(input, mimeType) {
      calls.push('sanitize');
      assert.deepEqual(input, Buffer.from('untrusted-original'));
      assert.equal(mimeType, 'image/png');
      return sanitizedImage;
    },
  });

  assert.deepEqual(calls, [
    'find',
    'read-private',
    'sanitize',
    'create-public-key',
    'put-public',
    'activate',
    'delete-private',
  ]);
  assert.deepEqual(result, {
    id: mediaId,
    url: `/media/${mediaId}`,
    originalFilename: 'cover.png',
    mimeType: 'image/png',
    byteSize: 6,
    width: 1200,
    height: 800,
    createdAt: createdAt.toISOString(),
  });
});

test('finalize removes and rejects a deterministic invalid image upload', async () => {
  let deletedPrivate = false;
  let rejectedPending = false;
  const invalidImage = new MediaError(
    'invalid_image',
    422,
    'invalid image fixture'
  );

  await assert.rejects(
    () =>
      finalizeMediaUpload(mediaId, {
        repository: fakeRepository({
          async rejectPending(input) {
            rejectedPending = true;
            assert.equal(input.id, mediaId);
          },
        }),
        objectStore: fakeObjectStore({
          async deletePrivate() {
            deletedPrivate = true;
          },
        }),
        async processImage() {
          throw invalidImage;
        },
      }),
    invalidImage
  );

  assert.equal(deletedPrivate, true);
  assert.equal(rejectedPending, true);
});

test('a finalize race deletes this attempt public object and returns the winning active record', async () => {
  const deletedPublicKeys: string[] = [];
  const winner = activeAsset({
    storageKey: 'uploads/public/2026/07/winner.png',
    byteSize: 99,
  });
  let findCount = 0;

  const result = await finalizeMediaUpload(mediaId, {
    repository: fakeRepository({
      async findById() {
        findCount += 1;
        return findCount === 1 ? pendingAsset() : winner;
      },
      async activatePending() {
        return null;
      },
    }),
    objectStore: fakeObjectStore({
      async deletePublic(key) {
        deletedPublicKeys.push(key);
      },
      async deletePrivate() {
        assert.fail('the losing finalize attempt must not delete the shared private object');
      },
    }),
    async processImage() {
      return sanitizedImage;
    },
  });

  assert.deepEqual(deletedPublicKeys, [
    'uploads/public/2026/07/sanitized.png',
  ]);
  assert.equal(result.byteSize, 99);
  assert.equal(result.url, `/media/${mediaId}`);
});

test('a stale finalize cleans its public object and reports a state conflict', async () => {
  const deletedPublicKeys: string[] = [];

  await assert.rejects(
    () =>
      finalizeMediaUpload(mediaId, {
        repository: fakeRepository({
          async findById() {
            return pendingAsset();
          },
          async activatePending() {
            return null;
          },
        }),
        objectStore: fakeObjectStore({
          async deletePublic(key) {
            deletedPublicKeys.push(key);
          },
        }),
        async processImage() {
          return sanitizedImage;
        },
      }),
    (error: unknown) =>
      error instanceof MediaError &&
      error.code === 'media_state_conflict' &&
      error.status === 409
  );

  assert.deepEqual(deletedPublicKeys, [
    'uploads/public/2026/07/sanitized.png',
  ]);
});
