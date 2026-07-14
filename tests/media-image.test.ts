import assert from 'node:assert/strict';
import test from 'node:test';

import sharp from 'sharp';

import { MediaError } from '../lib/media/errors';
import { sanitizeImage } from '../lib/media/image';

function isMediaError(code: MediaError['code']) {
  return (error: unknown): boolean =>
    error instanceof MediaError && error.code === code && error.status === 422;
}

test('image sanitizer rejects a decoded format that differs from the declared MIME type', async () => {
  const png = await sharp({
    create: {
      width: 2,
      height: 2,
      channels: 4,
      background: '#ff0000',
    },
  })
    .png()
    .toBuffer();

  await assert.rejects(
    () => sanitizeImage(png, 'image/jpeg'),
    isMediaError('invalid_image')
  );
});

test('image sanitizer rejects dimensions above the configured pixel limit', async () => {
  const png = await sharp({
    create: {
      width: 11,
      height: 11,
      channels: 4,
      background: '#ff0000',
    },
  })
    .png()
    .toBuffer();

  await assert.rejects(
    () => sanitizeImage(png, 'image/png', { maxPixels: 100 }),
    isMediaError('image_too_large')
  );
});

test('image sanitizer enforces a hard limit on the re-encoded output', async () => {
  const png = await sharp({
    create: {
      width: 2,
      height: 2,
      channels: 4,
      background: '#ff0000',
    },
  })
    .png()
    .toBuffer();

  await assert.rejects(
    () => sanitizeImage(png, 'image/png', { maxOutputBytes: 1 }),
    isMediaError('image_too_large')
  );
});

test('image sanitizer rejects animated images instead of accidentally preserving frames', async () => {
  const twoFrames = Buffer.from([
    255, 0, 0, 255,
    0, 0, 255, 255,
  ]);
  // libvips accepts page metadata for vertically stacked raw frames even
  // though sharp's CreateRaw type does not currently spell out those fields.
  const rawFrames = {
    width: 1,
    height: 2,
    channels: 4 as const,
    pageHeight: 1,
    pages: 2,
  };
  const animatedGif = await sharp(twoFrames, {
    raw: rawFrames,
  })
    .gif({ loop: 0, delay: [100, 100] })
    .toBuffer();

  assert.equal((await sharp(animatedGif, { animated: true }).metadata()).pages, 2);
  await assert.rejects(
    () => sanitizeImage(animatedGif, 'image/gif'),
    isMediaError('animated_image_not_supported')
  );
});

test('image sanitizer applies orientation while stripping EXIF and embedded profiles', async () => {
  const source = await sharp({
    create: {
      width: 2,
      height: 1,
      channels: 3,
      background: '#ff0000',
    },
  })
    .jpeg()
    .withMetadata({ orientation: 6 })
    .toBuffer();
  const sourceMetadata = await sharp(source).metadata();

  assert.ok(sourceMetadata.exif);
  assert.equal(sourceMetadata.orientation, 6);

  const sanitized = await sanitizeImage(source, 'image/jpeg');
  const sanitizedMetadata = await sharp(sanitized.data).metadata();

  assert.equal(sanitized.width, 1);
  assert.equal(sanitized.height, 2);
  assert.equal(sanitizedMetadata.exif, undefined);
  assert.equal(sanitizedMetadata.icc, undefined);
  assert.equal(sanitizedMetadata.xmp, undefined);
  assert.equal(sanitizedMetadata.iptc, undefined);
  assert.equal(sanitizedMetadata.orientation, undefined);
  assert.match(sanitized.sha256, /^[0-9a-f]{64}$/);
});
