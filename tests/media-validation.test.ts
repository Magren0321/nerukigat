import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createMediaMarkdown,
  escapeMarkdownAlt,
  isMediaId,
  mediaPresignInputSchema,
  normalizeOriginalFilename,
  publicMediaPath,
} from '../lib/media/validation';

const mediaId = '123e4567-e89b-42d3-a456-426614174000';

test('presign input accepts only supported image MIME types and positive byte sizes', () => {
  assert.deepEqual(
    mediaPresignInputSchema.parse({
      filename: 'cover.png',
      mimeType: 'image/png',
      byteSize: 1024,
    }),
    {
      filename: 'cover.png',
      mimeType: 'image/png',
      byteSize: 1024,
    }
  );

  assert.equal(
    mediaPresignInputSchema.safeParse({
      filename: 'cover.svg',
      mimeType: 'image/svg+xml',
      byteSize: 1024,
    }).success,
    false
  );
  assert.equal(
    mediaPresignInputSchema.safeParse({
      filename: 'empty.png',
      mimeType: 'image/png',
      byteSize: 0,
    }).success,
    false
  );
  assert.equal(
    mediaPresignInputSchema.safeParse({
      filename: '',
      mimeType: 'image/png',
      byteSize: 1,
    }).success,
    false
  );
});

test('original filenames are reduced to a safe display basename', () => {
  assert.equal(
    normalizeOriginalFilename('..\\private\\  hero\u0000.png  '),
    'hero.png'
  );
  assert.equal(
    normalizeOriginalFilename('../drafts/Ｆｏｏ．ｐｎｇ'),
    'Foo.png'
  );
  assert.equal(normalizeOriginalFilename('\u0000\u001f  '), 'upload');
  assert.equal(normalizeOriginalFilename(`/${'a'.repeat(300)}.png`).length, 255);
});

test('stable media paths accept UUIDs and reject arbitrary object paths', () => {
  assert.equal(isMediaId(mediaId), true);
  assert.equal(publicMediaPath(mediaId), `/media/${mediaId}`);
  assert.equal(isMediaId('../../private/object.png'), false);
  assert.throws(() => publicMediaPath('../../private/object.png'), /Invalid media id/);
});

test('Markdown snippets escape alt text without exposing an object-store key', () => {
  const filename = 'a\\b[cover]\nsecond line.png';

  assert.equal(escapeMarkdownAlt(filename), 'a\\\\b\\[cover\\] second line.png');
  assert.equal(
    createMediaMarkdown({ id: mediaId, originalFilename: filename }),
    `![a\\\\b\\[cover\\] second line.png](/media/${mediaId})`
  );
});
