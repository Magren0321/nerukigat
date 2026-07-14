import assert from 'node:assert/strict';
import test from 'node:test';

import {
  normalizePublishedDate,
  publishedDateToInstant,
} from '../lib/content/date';

test('Contentlayer instants normalize to the original Shanghai calendar date', () => {
  assert.equal(
    normalizePublishedDate('2026-07-04T16:00:00.000Z'),
    '2026-07-05'
  );
  assert.equal(normalizePublishedDate('2026-07-05'), '2026-07-05');
});

test('RSS dates use midnight in the blog timezone', () => {
  assert.equal(
    publishedDateToInstant('2026-07-05').toISOString(),
    '2026-07-04T16:00:00.000Z'
  );
});

test('invalid published dates fail closed', () => {
  assert.throws(() => normalizePublishedDate('not-a-date'));
});
