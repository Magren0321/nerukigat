import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import test from 'node:test';

// The existing Image client component imports its spinner CSS. Node's focused
// renderer test has no CSS loader, so provide the same inert treatment a JS
// bundler gives non-JS side effects before loading the Server Component.
const require = createRequire(import.meta.url);
require.extensions['.css'] = () => undefined;
const markdownContentModule = import('../components/MarkdownContent');

const renderMarkdown = async (markdown: string) => {
  const { MarkdownContent } = await markdownContentModule;
  return renderToStaticMarkup(createElement(MarkdownContent, { markdown }));
};

test('renders GFM and retained raw HTML through the compatibility pipeline', async () => {
  const html = await renderMarkdown([
    '# 中文标题',
    '',
    '~~GFM delete~~',
    '',
    '<del>raw delete</del>',
    '',
    '<hr/>',
    '',
    'first line  ',
    'second line',
    '',
    '| A | B |',
    '| - | - |',
    '| 1 | 2 |',
  ].join('\n'));

  assert.match(html, /<h1[^>]*id="中文标题"[^>]*>中文标题<\/h1>/);
  assert.match(html, /<del>GFM delete<\/del>/);
  assert.match(html, /<del>raw delete<\/del>/);
  assert.match(html, /<hr\/?>(?:<\/hr>)?/);
  assert.match(html, /first line<br\/>\nsecond line/);
  assert.match(html, /<table>/);
  assert.match(html, /<th>A<\/th>/);
});

test('hardens target blank links while retaining safe link attributes', async () => {
  const html = await renderMarkdown(
    '<a href="https://example.com" target="_blank" rel="nofollow">external</a>'
  );

  assert.match(html, /href="https:\/\/example\.com"/);
  assert.match(html, /target="_blank"/);
  assert.match(html, /rel="nofollow noopener noreferrer"/);
});

test('removes scripts, event handlers, and javascript URLs', async () => {
  const html = await renderMarkdown([
    '<script>alert("script")</script>',
    '<div onclick="alert(1)">safe text</div>',
    '<a href="javascript:alert(2)" onmouseover="alert(3)">unsafe link</a>',
  ].join('\n'));

  assert.doesNotMatch(html, /<script/i);
  assert.doesNotMatch(html, /onclick|onmouseover/i);
  assert.doesNotMatch(html, /javascript:/i);
  assert.doesNotMatch(html, /alert\(/i);
  assert.match(html, /safe text/);
  assert.match(html, />unsafe link<\/a>/);
});

test('keeps relative post links and GFM literal autolinks', async () => {
  const html = await renderMarkdown([
    '[历史文章](/posts/inputUrl/)',
    '',
    'https://example.com/path',
  ].join('\n'));

  assert.match(html, /href="\/posts\/inputUrl\/"/);
  assert.match(html, /href="https:\/\/example\.com\/path"/);
});

test('reuses the existing image renderer for local Markdown images', async () => {
  const [{ MarkdownContent }, { PhotoProvider }] = await Promise.all([
    markdownContentModule,
    import('../components/ui/img/PreviewImage'),
  ]);
  const html = renderToStaticMarkup(
    createElement(
      PhotoProvider,
      null,
      createElement(MarkdownContent, { markdown: '![图片说明](/postImg/example.JPG)' })
    )
  );

  assert.match(html, /%2FpostImg%2Fexample\.JPG/);
  assert.match(html, /alt="图片说明"/);
  assert.match(html, /◭ 图片说明/);
});

test('does not treat fenced executable-looking examples as HTML or JavaScript', async () => {
  const html = await renderMarkdown([
    '```js',
    "import Widget from './Widget';",
    '<script>alert(1)</script>',
    '```',
  ].join('\n'));

  assert.match(html, /<pre><code class="language-js">/);
  assert.match(html, /import Widget from/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(html, /<script>/i);
});
