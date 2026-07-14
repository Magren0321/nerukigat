import assert from 'node:assert/strict';
import test from 'node:test';

import { calculateMarkdownReadingStats } from '../lib/posts/reading-stats';
import {
  canonicalPathSchema,
  createPostInputSchema,
  normalizeTagSlug,
  publishedOnSchema,
} from '../lib/posts/validation';

test('canonical paths accept the existing nested ASCII layout', () => {
  assert.equal(
    canonicalPathSchema.parse('2026/weekly/weekly-12'),
    '2026/weekly/weekly-12'
  );
});

test('canonical paths reject absolute, trailing and unsafe paths', () => {
  for (const value of ['/posts/demo', 'posts/demo/', 'posts/hello world']) {
    assert.equal(canonicalPathSchema.safeParse(value).success, false);
  }
});

test('published dates are real calendar dates', () => {
  assert.equal(publishedOnSchema.parse('2024-02-29'), '2024-02-29');
  assert.equal(publishedOnSchema.safeParse('2025-02-29').success, false);
});

test('draft input trims fields and de-duplicates ordered tags', () => {
  const draft = createPostInputSchema.parse({
    kind: 'post',
    canonicalPath: 'notes/hello',
    sourceSlug: ' hello ',
    title: ' Hello ',
    description: ' ',
    markdown: '# Hello',
    publishedOn: '',
    tags: ['React', 'react', 'TypeScript'],
  });

  assert.equal(draft.title, 'Hello');
  assert.equal(draft.sourceSlug, 'hello');
  assert.equal(draft.description, null);
  assert.equal(draft.publishedOn, null);
  assert.equal(draft.isPinned, false);
  assert.deepEqual(draft.tags, ['React', 'TypeScript']);
});

test('tag slugs are deterministic and collision-resistant', () => {
  assert.equal(normalizeTagSlug('Next.js'), normalizeTagSlug('Next.js'));
  assert.match(normalizeTagSlug('Next.js'), /^next\.js-[a-f0-9]{8}$/);
  assert.notEqual(normalizeTagSlug('React'), normalizeTagSlug('react'));
});

test('reading stats ignore Markdown syntax and count mixed text', () => {
  const stats = calculateMarkdownReadingStats(
    '# 标题\n\n你好世界 [hello world](https://example.com) `ignored`'
  );

  assert.equal(stats.wordCount, 8);
  assert.equal(stats.readingMinutes, 2);
});
