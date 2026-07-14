import 'server-only';

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';

import { getStorageConfig } from '@/lib/env/storage';
import {
  createObjectKey,
  createPresignedPutForKey,
  createS3Client,
  headAndValidateUpload,
  selectStorageBucket,
  StorageValidationError,
} from '@/lib/storage/s3';

import { MediaError } from './errors';
import {
  MEDIA_MAX_INPUT_BYTES,
  SupportedMediaMimeType,
} from './types';

export interface PreparedPrivateUpload {
  key: string;
  contentType: SupportedMediaMimeType;
  contentLength: number;
}

export interface MediaUploadTarget {
  uploadUrl: string;
  headers: Readonly<{ 'Content-Type': string }>;
  expiresAt: Date;
}

export interface MediaObjectStore {
  preparePrivateUpload(input: {
    contentType: SupportedMediaMimeType;
    contentLength: number;
  }): PreparedPrivateUpload;
  presignPrivateUpload(input: PreparedPrivateUpload): Promise<MediaUploadTarget>;
  readVerifiedPrivate(input: PreparedPrivateUpload): Promise<Buffer>;
  createPublicKey(contentType: SupportedMediaMimeType): string;
  putPublic(input: {
    key: string;
    contentType: SupportedMediaMimeType;
    data: Buffer;
  }): Promise<void>;
  deletePrivate(key: string): Promise<void>;
  deletePublic(key: string): Promise<void>;
}

export const s3MediaObjectStore: MediaObjectStore = {
  preparePrivateUpload(input) {
    const config = getStorageConfig();
    selectStorageBucket(config, 'private');

    if (
      !Number.isSafeInteger(input.contentLength) ||
      input.contentLength <= 0 ||
      input.contentLength > Math.min(config.maxUploadBytes, MEDIA_MAX_INPUT_BYTES)
    ) {
      throw new MediaError(
        'upload_too_large',
        413,
        `Image must be between 1 byte and ${Math.min(config.maxUploadBytes, MEDIA_MAX_INPUT_BYTES)} bytes`
      );
    }

    if (!config.allowedMimeTypes.includes(input.contentType)) {
      throw new MediaError(
        'unsupported_media_type',
        415,
        'This image type is not enabled for object storage'
      );
    }

    return {
      key: createObjectKey({
        visibility: 'private',
        contentType: input.contentType,
        keyPrefix: config.keyPrefix,
      }),
      contentType: input.contentType,
      contentLength: input.contentLength,
    };
  },

  async presignPrivateUpload(input) {
    const signed = await createPresignedPutForKey({
      key: input.key,
      visibility: 'private',
      contentType: input.contentType,
      contentLength: input.contentLength,
    });

    return {
      uploadUrl: signed.url,
      headers: signed.headers,
      expiresAt: signed.expiresAt,
    };
  },

  async readVerifiedPrivate(input) {
    const config = getStorageConfig();
    const client = createS3Client(config);

    await headAndValidateUpload(
      {
        key: input.key,
        visibility: 'private',
        contentType: input.contentType,
        contentLength: input.contentLength,
      },
      { config, client }
    );

    const result = await client.send(
      new GetObjectCommand({
        Bucket: selectStorageBucket(config, 'private'),
        Key: input.key,
      })
    );

    if (result.ContentLength !== input.contentLength) {
      throw new StorageValidationError(
        'content_length_mismatch',
        'Downloaded object length does not match the pending media record'
      );
    }

    if (result.ContentType?.trim().toLowerCase() !== input.contentType) {
      throw new StorageValidationError(
        'content_type_mismatch',
        'Downloaded object content type does not match the pending media record'
      );
    }

    if (!result.Body || typeof result.Body.transformToByteArray !== 'function') {
      throw new MediaError(
        'invalid_image',
        422,
        'Uploaded object did not contain a readable body'
      );
    }

    const data = Buffer.from(await result.Body.transformToByteArray());

    if (data.byteLength !== input.contentLength) {
      throw new StorageValidationError(
        'content_length_mismatch',
        'Downloaded bytes do not match the pending media record'
      );
    }

    return data;
  },

  createPublicKey(contentType) {
    const config = getStorageConfig();

    return createObjectKey({
      visibility: 'public',
      contentType,
      keyPrefix: config.keyPrefix,
    });
  },

  async putPublic(input) {
    const config = getStorageConfig();
    const client = createS3Client(config);

    await client.send(
      new PutObjectCommand({
        Bucket: selectStorageBucket(config, 'public'),
        Key: input.key,
        Body: input.data,
        ContentType: input.contentType,
        ContentLength: input.data.byteLength,
        CacheControl: 'public, max-age=31536000, immutable',
      })
    );
  },

  async deletePrivate(key) {
    const config = getStorageConfig();

    await createS3Client(config).send(
      new DeleteObjectCommand({
        Bucket: selectStorageBucket(config, 'private'),
        Key: key,
      })
    );
  },

  async deletePublic(key) {
    const config = getStorageConfig();

    await createS3Client(config).send(
      new DeleteObjectCommand({
        Bucket: selectStorageBucket(config, 'public'),
        Key: key,
      })
    );
  },
};
