import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import {
  MdxImportValidationError,
  auditMdxCompatibility,
  auditMdxDirectory,
  buildMdxImportPlan,
  inspectMdxDirectory,
  parseMdxDocument,
  resolveMdxImportExecutionMode,
} from '../lib/posts/import';

const repositoryRoot = path.resolve(import.meta.dirname, '..');
const postsDirectory = path.join(repositoryRoot, 'posts');

test('parseMdxDocument maps metadata without losing body bytes', () => {
  const source = [
    '---',
    "title: 'Weekly fixture'",
    'date: 2026/02/08',
    'tags:',
    '  - Weekly',
    '  - 中文',
    'slug: 2026-02-08',
    'description:',
    'draft: true',
    'top: true',
    '---',
    '第一行保留两个空格  ',
    'Unicode：月亮🌙',
    '',
  ].join('\n');
  const expectedBody = '\n第一行保留两个空格  \nUnicode：月亮🌙\n';

  const document = parseMdxDocument({
    sourcePath: 'weekly/2026-02-08.mdx',
    source,
  });

  assert.equal(document.canonicalPath, 'weekly/2026-02-08');
  assert.equal(document.sourceSlug, '2026-02-08');
  assert.equal(document.kind, 'weekly');
  assert.equal(document.publishedOn, '2026-02-08');
  assert.equal(document.description, null);
  assert.deepEqual(document.tags, ['Weekly', '中文']);
  assert.equal(document.draft, true);
  assert.equal(document.top, true);
  assert.equal(document.body, expectedBody);
  assert.equal(document.bodyBytes, Buffer.byteLength(expectedBody, 'utf8'));
  assert.equal(
    document.bodySha256,
    createHash('sha256').update(expectedBody, 'utf8').digest('hex')
  );
});

test('parseMdxDocument preserves case-sensitive canonical paths and defaults flags', () => {
  const source = [
    '---',
    'title: URL fixture',
    'date: 2020/11/08',
    'tags:',
    '  - JavaScript',
    'slug: inputUrl',
    'description: URL fixture',
    '---',
    'body',
  ].join('\n');

  const document = parseMdxDocument({ sourcePath: 'inputUrl.mdx', source });

  assert.equal(document.canonicalPath, 'inputUrl');
  assert.equal(`/posts/${document.canonicalPath}`, '/posts/inputUrl');
  assert.equal(document.sourceSlug, 'inputUrl');
  assert.equal(document.kind, 'post');
  assert.equal(document.draft, false);
  assert.equal(document.top, false);
});

test('parseMdxDocument rejects non-calendar dates and unsafe source paths', () => {
  const source = [
    '---',
    'title: Invalid fixture',
    'date: 2026/02/30',
    'tags:',
    '  - Test',
    'slug: invalid',
    '---',
    'body',
  ].join('\n');

  assert.throws(
    () => parseMdxDocument({ sourcePath: 'invalid.mdx', source }),
    MdxImportValidationError
  );
  assert.throws(
    () =>
      parseMdxDocument({
        sourcePath: '../outside.mdx',
        source: source.replace('2026/02/30', '2026/02/28'),
      }),
    MdxImportValidationError
  );
});

test('compatibility audit ignores examples in code but reports executable MDX', () => {
  const compatible = [
    '```js',
    "import value from './example';",
    'export default value;',
    '<Widget value={value} />',
    '```',
    '',
    'Inline `{ value: true }` stays code.',
    '<del>allowed</del>',
    '<hr/>',
    '<a href="https://example.com" target="_blank" rel="noopener noreferrer">link</a>',
  ].join('\n');
  assert.deepEqual(auditMdxCompatibility(compatible), []);

  const incompatible = [
    "import Widget from './Widget';",
    '{dangerousExpression}',
    '<Widget />',
    '<iframe src="https://example.com"></iframe>',
    '<a onclick="danger()">link</a>',
  ].join('\n');
  const kinds = auditMdxCompatibility(incompatible).map((issue) => issue.kind);

  assert.ok(kinds.includes('mdx-esm'));
  assert.ok(kinds.includes('mdx-expression'));
  assert.ok(kinds.includes('custom-jsx'));
  assert.ok(kinds.includes('unsupported-html'));
  assert.ok(kinds.includes('unsupported-html-attribute'));
});

test('repository audit matches the migration baseline and critical routes', async () => {
  const report = await auditMdxDirectory(postsDirectory);

  assert.deepEqual(report.summary, {
    total: 61,
    parsed: 61,
    posts: 45,
    weekly: 16,
    published: 60,
    drafts: 1,
    pinned: 1,
    uniqueTags: 20,
    incompatibleDocuments: 0,
    incompatibilities: 0,
    parseErrors: 0,
  });

  const bySourcePath = new Map(report.documents.map((document) => [document.sourcePath, document]));
  assert.equal(bySourcePath.get('inputUrl.mdx')?.canonicalPath, 'inputUrl');
  assert.equal(bySourcePath.get('android-eventbuts.mdx')?.canonicalPath, 'android-eventbuts');
  assert.equal(
    bySourcePath.get('weekly/2026-02-15.mdx')?.canonicalPath,
    'weekly/2026-02-15'
  );
  assert.equal(bySourcePath.get('weekly/2026-02-15.mdx')?.sourceSlug, '2026-02-15');
  assert.equal(bySourcePath.get('weekly/2026-02-15.mdx')?.publishedOn, '2026-02-16');
  assert.equal(bySourcePath.get('software-engineer-in-ai-era.mdx')?.draft, true);
  assert.equal(bySourcePath.get('2025-summary.mdx')?.top, true);
});

test('real article body and SHA-256 are derived from verbatim source bytes', async () => {
  const sourcePath = '2025-summary.mdx';
  const source = await readFile(path.join(postsDirectory, sourcePath), 'utf8');
  const closing = /^---[\t ]*(?=\r?$)/gm;
  closing.lastIndex = source.indexOf('\n') + 1;
  const closingMatch = closing.exec(source);
  assert.ok(closingMatch);
  const expectedBody = source.slice(closingMatch.index + closingMatch[0].length);

  const document = parseMdxDocument({ sourcePath, source });

  assert.equal(document.body, expectedBody);
  assert.ok(document.body.includes('代码时间，共1600+h，日均5h+'));
  assert.ok(document.body.includes('   \n'));
  assert.equal(
    document.bodySha256,
    createHash('sha256').update(Buffer.from(expectedBody, 'utf8')).digest('hex')
  );
});

test('write mode requires both independent confirmation flags', () => {
  assert.equal(
    resolveMdxImportExecutionMode({ write: false, confirmWrite: false }),
    'dry-run'
  );
  assert.equal(
    resolveMdxImportExecutionMode({ write: true, confirmWrite: true }),
    'write'
  );
  assert.throws(
    () => resolveMdxImportExecutionMode({ write: true, confirmWrite: false }),
    /both --write and --confirm-write/
  );
  assert.throws(
    () => resolveMdxImportExecutionMode({ write: false, confirmWrite: true }),
    /only valid together/
  );
});

test('import plan preserves drafts and maps only published documents to revisions', async () => {
  const inspection = await inspectMdxDirectory(postsDirectory);
  const plan = buildMdxImportPlan(inspection.report, inspection.documents);
  const expectedPublishedTagLinks = inspection.documents
    .filter((document) => !document.draft)
    .reduce((total, document) => total + document.tags.length, 0);

  assert.deepEqual(plan.summary, {
    posts: 61,
    published: 60,
    drafts: 1,
    revisions: 60,
    publishedTagLinks: expectedPublishedTagLinks,
    uniqueTags: 20,
  });

  const draft = plan.posts.find(
    (post) => post.canonicalPath === 'software-engineer-in-ai-era'
  );
  assert.ok(draft);
  assert.equal(draft.status, 'draft');
  assert.equal(draft.publicPublishedOn, null);
  assert.equal(draft.publicIsPinned, false);
  assert.equal(draft.revision, null);
  assert.equal(draft.draft.version, 1);
  assert.equal(
    draft.draft.markdown,
    inspection.documents.find(
      (document) => document.canonicalPath === draft.canonicalPath
    )?.body
  );

  const pinned = plan.posts.find((post) => post.canonicalPath === '2025-summary');
  assert.ok(pinned);
  assert.equal(pinned.status, 'published');
  assert.equal(pinned.publicIsPinned, true);
  assert.equal(pinned.revision?.revisionNumber, 1);
  assert.deepEqual(pinned.revision?.tagNames, pinned.draft.tagNames);
});

test('write plan rejects audit problems and post-audit body changes', async () => {
  const inspection = await inspectMdxDirectory(postsDirectory);
  const brokenAudit = {
    ...inspection.report,
    summary: {
      ...inspection.report.summary,
      incompatibilities: 1,
      incompatibleDocuments: 1,
    },
  };
  assert.throws(
    () => buildMdxImportPlan(brokenAudit, inspection.documents),
    /zero parse errors, zero incompatibilities/
  );

  const changedDocuments = inspection.documents.map((document, index) =>
    index === 0
      ? { ...document, body: `${document.body}\nchanged`, bodySha256: 'changed-after-audit' }
      : document
  );
  assert.throws(
    () => buildMdxImportPlan(inspection.report, changedDocuments),
    /no longer matches its audit/
  );
});
