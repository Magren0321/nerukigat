import 'server-only';

import { getStorageConfig } from '@/lib/env/storage';
import {
  buildPublicObjectUrl,
  StorageValidationError,
} from '@/lib/storage/s3';

import { MediaError } from './errors';
import { sanitizeImage } from './image';
import {
  MediaObjectStore,
  s3MediaObjectStore,
} from './object-store';
import {
  databaseMediaRepository,
  MediaRepository,
} from './repository';
import { withMediaProcessingSlot } from './processing-lock';
import {
  MediaAssetRecord,
  MediaListItem,
  MediaStorageReadiness,
  SanitizedImage,
  SupportedMediaMimeType,
} from './types';
import {
  isMediaId,
  mediaPresignInputSchema,
  normalizeOriginalFilename,
  publicMediaPath,
} from './validation';

export interface PresignMediaResult {
  assetId: string;
  uploadUrl: string;
  headers: Readonly<{ 'Content-Type': string }>;
  expiresAt: string;
}

interface MediaServiceDependencies {
  repository?: MediaRepository;
  objectStore?: MediaObjectStore;
  processImage?: (
    input: Buffer,
    mimeType: SupportedMediaMimeType
  ) => Promise<SanitizedImage>;
}

export async function presignMediaUpload(
  input: unknown,
  dependencies: MediaServiceDependencies = {}
): Promise<PresignMediaResult> {
  const parsed = mediaPresignInputSchema.safeParse(input);

  if (!parsed.success) {
    throw new MediaError(
      'invalid_request',
      400,
      'Filename, supported MIME type, and positive byte size are required'
    );
  }

  const repository = dependencies.repository ?? databaseMediaRepository;
  const objectStore = dependencies.objectStore ?? s3MediaObjectStore;
  const prepared = objectStore.preparePrivateUpload({
    contentType: parsed.data.mimeType,
    contentLength: parsed.data.byteSize,
  });

  // Persist trusted expectations before a usable signed URL leaves the server.
  const asset = await repository.createPending({
    storageKey: prepared.key,
    originalFilename: normalizeOriginalFilename(parsed.data.filename),
    mimeType: prepared.contentType,
    byteSize: prepared.contentLength,
  });
  let upload;

  try {
    upload = await objectStore.presignPrivateUpload(prepared);
  } catch (error) {
    await ignoreFailure(() =>
      repository.rejectPending({
        id: asset.id,
        expectedStorageKey: asset.storageKey,
      })
    );
    throw error;
  }

  return {
    assetId: asset.id,
    uploadUrl: upload.uploadUrl,
    headers: upload.headers,
    expiresAt: upload.expiresAt.toISOString(),
  };
}

export async function finalizeMediaUpload(
  id: string,
  dependencies: MediaServiceDependencies = {}
): Promise<MediaListItem> {
  if (!isMediaId(id)) {
    throw new MediaError('media_not_found', 404, 'Media asset not found');
  }

  return withMediaProcessingSlot(() =>
    finalizeMediaUploadInSlot(id, dependencies)
  );
}

async function finalizeMediaUploadInSlot(
  id: string,
  dependencies: MediaServiceDependencies
): Promise<MediaListItem> {
  const repository = dependencies.repository ?? databaseMediaRepository;
  const objectStore = dependencies.objectStore ?? s3MediaObjectStore;
  const processImage = dependencies.processImage ?? sanitizeImage;
  const asset = await repository.findById(id);

  if (!asset) {
    throw new MediaError('media_not_found', 404, 'Media asset not found');
  }

  if (asset.status === 'active' && asset.visibility === 'public') {
    return toMediaListItem(asset);
  }

  if (asset.status !== 'pending' || asset.visibility !== 'private') {
    throw new MediaError(
      'media_state_conflict',
      409,
      'Media asset is not waiting for finalization'
    );
  }

  if (!mediaPresignInputSchema.shape.mimeType.safeParse(asset.mimeType).success) {
    throw new MediaError(
      'unsupported_media_type',
      415,
      'Pending media has an unsupported MIME type'
    );
  }

  const mimeType = asset.mimeType as SupportedMediaMimeType;
  const privateObject = {
    key: asset.storageKey,
    contentType: mimeType,
    contentLength: asset.byteSize,
  };
  let sanitized: SanitizedImage;

  try {
    const original = await objectStore.readVerifiedPrivate(privateObject);
    sanitized = await processImage(original, mimeType);
  } catch (error) {
    if (error instanceof StorageValidationError || error instanceof MediaError) {
      await Promise.all([
        ignoreFailure(() => objectStore.deletePrivate(asset.storageKey)),
        ignoreFailure(() =>
          repository.rejectPending({
            id: asset.id,
            expectedStorageKey: asset.storageKey,
          })
        ),
      ]);
    }
    throw error;
  }
  const publicKey = objectStore.createPublicKey(sanitized.mimeType);

  await objectStore.putPublic({
    key: publicKey,
    contentType: sanitized.mimeType,
    data: sanitized.data,
  });

  let activated: MediaAssetRecord | null;

  try {
    activated = await repository.activatePending({
      id: asset.id,
      expectedStorageKey: asset.storageKey,
      publicStorageKey: publicKey,
      mimeType: sanitized.mimeType,
      byteSize: sanitized.data.byteLength,
      width: sanitized.width,
      height: sanitized.height,
      sha256: sanitized.sha256,
    });
  } catch (error) {
    await ignoreFailure(() => objectStore.deletePublic(publicKey));
    throw error;
  }

  if (!activated) {
    await ignoreFailure(() => objectStore.deletePublic(publicKey));

    const current = await repository.findById(id);

    if (current?.status === 'active' && current.visibility === 'public') {
      return toMediaListItem(current);
    }

    throw new MediaError(
      'media_state_conflict',
      409,
      'Media asset changed while it was being finalized'
    );
  }

  await ignoreFailure(() => objectStore.deletePrivate(asset.storageKey));
  return toMediaListItem(activated);
}

export async function listActiveMedia(
  dependencies: Pick<MediaServiceDependencies, 'repository'> = {}
): Promise<MediaListItem[]> {
  const repository = dependencies.repository ?? databaseMediaRepository;
  const assets = await repository.listActivePublic(100);

  return assets.map(toMediaListItem);
}

export function getMediaStorageReadiness(): MediaStorageReadiness {
  try {
    const config = getStorageConfig();

    if (!config.privateBucket) {
      return {
        available: false,
        message: '媒体存储尚未配置私有上传桶，请联系管理员完成配置。',
      };
    }

    return { available: true };
  } catch {
    return {
      available: false,
      message: '媒体存储尚未配置完成；博客公开页面仍可正常使用。',
    };
  }
}

export async function resolveActiveMediaUrl(
  id: string,
  dependencies: Pick<MediaServiceDependencies, 'repository'> = {}
): Promise<string | null> {
  if (!isMediaId(id)) {
    return null;
  }

  const repository = dependencies.repository ?? databaseMediaRepository;
  const asset = await repository.findActivePublicById(id);

  if (!asset) {
    return null;
  }

  const config = getStorageConfig();
  return buildPublicObjectUrl(asset.storageKey, config);
}

function toMediaListItem(asset: MediaAssetRecord): MediaListItem {
  return {
    id: asset.id,
    url: publicMediaPath(asset.id),
    originalFilename: asset.originalFilename,
    mimeType: asset.mimeType,
    byteSize: asset.byteSize,
    width: asset.width ?? 0,
    height: asset.height ?? 0,
    createdAt: asset.createdAt.toISOString(),
  };
}

async function ignoreFailure(operation: () => Promise<void>): Promise<void> {
  try {
    await operation();
  } catch {
    // Cleanup is best-effort. Lifecycle rules provide the final safety net.
  }
}
