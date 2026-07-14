import 'server-only';

import { createHash } from 'node:crypto';

import sharp, { type Metadata, type Sharp } from 'sharp';

import { MediaError } from './errors';
import {
  MEDIA_MAX_OUTPUT_BYTES,
  SanitizedImage,
  SupportedMediaMimeType,
} from './types';

export const DEFAULT_MAX_MEDIA_PIXELS = 40_000_000;

const expectedFormats: Readonly<
  Record<SupportedMediaMimeType, readonly string[]>
> = {
  'image/jpeg': ['jpeg'],
  'image/png': ['png'],
  'image/webp': ['webp'],
  'image/gif': ['gif'],
  'image/avif': ['heif', 'avif'],
};

export async function sanitizeImage(
  input: Buffer,
  declaredMimeType: SupportedMediaMimeType,
  options: {
    maxPixels?: number;
    maxOutputBytes?: number;
    timeoutSeconds?: number;
  } = {}
): Promise<SanitizedImage> {
  const maxPixels = options.maxPixels ?? DEFAULT_MAX_MEDIA_PIXELS;
  const maxOutputBytes = options.maxOutputBytes ?? MEDIA_MAX_OUTPUT_BYTES;
  const timeoutSeconds = options.timeoutSeconds ?? 20;

  try {
    const metadata = await sharp(input, {
      animated: true,
      failOn: 'warning',
      limitInputPixels: maxPixels,
      sequentialRead: true,
    })
      .timeout({ seconds: timeoutSeconds })
      .metadata();

    validateMetadata(metadata, declaredMimeType, maxPixels);

    let pipeline = sharp(input, {
      animated: true,
      failOn: 'warning',
      limitInputPixels: maxPixels,
      sequentialRead: true,
    })
      .timeout({ seconds: timeoutSeconds })
      .rotate();

    pipeline = selectEncoder(pipeline, declaredMimeType);

    const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });

    if (data.byteLength > maxOutputBytes) {
      throw new MediaError(
        'image_too_large',
        422,
        'Sanitized image exceeds the configured output-size limit'
      );
    }

    if (!info.width || !info.height || info.width * info.height > maxPixels) {
      throw new MediaError(
        'image_too_large',
        422,
        'Image dimensions exceed the configured pixel limit'
      );
    }

    return {
      data,
      mimeType: declaredMimeType,
      width: info.width,
      height: info.height,
      sha256: createHash('sha256').update(data).digest('hex'),
    };
  } catch (error) {
    if (error instanceof MediaError) {
      throw error;
    }

    if (error instanceof Error && /pixel limit/i.test(error.message)) {
      throw new MediaError(
        'image_too_large',
        422,
        'Image dimensions exceed the configured pixel limit'
      );
    }

    throw new MediaError(
      'invalid_image',
      422,
      'The uploaded file could not be decoded as a valid image'
    );
  }
}

function validateMetadata(
  metadata: Metadata,
  declaredMimeType: SupportedMediaMimeType,
  maxPixels: number
): void {
  if (
    !metadata.format ||
    !expectedFormats[declaredMimeType].includes(metadata.format) ||
    (declaredMimeType === 'image/avif' &&
      metadata.format === 'heif' &&
      metadata.compression !== 'av1')
  ) {
    throw new MediaError(
      'invalid_image',
      422,
      'The decoded image format does not match its declared MIME type'
    );
  }

  if ((metadata.pages ?? 1) > 1) {
    throw new MediaError(
      'animated_image_not_supported',
      422,
      'Animated images are not supported; upload a still frame instead'
    );
  }

  const width = metadata.width ?? 0;
  const pageHeight = metadata.pageHeight ?? metadata.height ?? 0;
  const pageCount = metadata.pages ?? 1;

  if (
    width <= 0 ||
    pageHeight <= 0 ||
    width * pageHeight * pageCount > maxPixels
  ) {
    throw new MediaError(
      'image_too_large',
      422,
      'Image dimensions exceed the configured pixel limit'
    );
  }
}

function selectEncoder(
  pipeline: Sharp,
  mimeType: SupportedMediaMimeType
): Sharp {
  switch (mimeType) {
    case 'image/jpeg':
      return pipeline.jpeg({ quality: 90, mozjpeg: true });
    case 'image/png':
      return pipeline.png({ compressionLevel: 9, adaptiveFiltering: true });
    case 'image/webp':
      return pipeline.webp({ quality: 88, effort: 4 });
    case 'image/gif':
      return pipeline.gif({ effort: 7 });
    case 'image/avif':
      return pipeline.avif({ quality: 65, effort: 4 });
  }
}
