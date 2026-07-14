import type {
  MdxIncompatibility,
  MdxIncompatibilityKind,
} from './types';

const ALLOWED_RAW_HTML_ATTRIBUTES: Readonly<Record<string, ReadonlySet<string>>> = {
  a: new Set(['href', 'target', 'rel']),
  del: new Set(),
  hr: new Set(),
};

const FENCE_START = /^ {0,3}(`{3,}|~{3,})(?:[^\r\n]*)$/;

const maskRange = (value: string) => value.replace(/[^\r\n]/g, ' ');

/**
 * Masks fenced and inline code while preserving offsets and line endings.
 * MDX-looking examples inside code must remain inert and must not block import.
 */
const maskCode = (body: string) => {
  const lines = body.match(/.*(?:\r\n|\n|\r|$)/g)?.filter(Boolean) ?? [];
  let fence: { marker: '`' | '~'; length: number } | null = null;

  const fencedMasked = lines
    .map((line) => {
      const content = line.replace(/[\r\n]+$/, '');

      if (fence) {
        const closingPattern = new RegExp(
          `^ {0,3}${fence.marker === '`' ? '`' : '~'}{${fence.length},}\\s*$`
        );
        const masked = maskRange(line);
        if (closingPattern.test(content)) fence = null;
        return masked;
      }

      const opening = content.match(FENCE_START);
      if (opening) {
        fence = {
          marker: opening[1][0] as '`' | '~',
          length: opening[1].length,
        };
        return maskRange(line);
      }

      return line;
    })
    .join('');

  const chars = Array.from(fencedMasked);
  let index = 0;

  while (index < chars.length) {
    if (chars[index] !== '`') {
      index += 1;
      continue;
    }

    let openerEnd = index;
    while (chars[openerEnd] === '`') openerEnd += 1;
    const runLength = openerEnd - index;
    let cursor = openerEnd;
    let closer = -1;

    while (cursor < chars.length) {
      if (chars[cursor] !== '`') {
        cursor += 1;
        continue;
      }

      let runEnd = cursor;
      while (chars[runEnd] === '`') runEnd += 1;
      if (runEnd - cursor === runLength) {
        closer = cursor;
        break;
      }
      cursor = runEnd;
    }

    if (closer < 0) {
      index = openerEnd;
      continue;
    }

    for (let maskedIndex = index; maskedIndex < closer + runLength; maskedIndex += 1) {
      if (chars[maskedIndex] !== '\n' && chars[maskedIndex] !== '\r') {
        chars[maskedIndex] = ' ';
      }
    }
    index = closer + runLength;
  }

  return chars.join('');
};

const getLocation = (source: string, offset: number) => {
  const before = source.slice(0, offset);
  const lines = before.split(/\r\n|\n|\r/);
  return {
    line: lines.length,
    column: (lines.at(-1)?.length ?? 0) + 1,
  };
};

const getExcerpt = (source: string, offset: number) => {
  const lineStart = Math.max(source.lastIndexOf('\n', offset - 1) + 1, 0);
  const nextLineBreak = source.indexOf('\n', offset);
  const lineEnd = nextLineBreak < 0 ? source.length : nextLineBreak;
  return source.slice(lineStart, lineEnd).replace(/\r$/, '').trim();
};

const createIssue = (
  source: string,
  offset: number,
  kind: MdxIncompatibilityKind,
  message: string
): MdxIncompatibility => ({
  kind,
  ...getLocation(source, offset),
  message,
  excerpt: getExcerpt(source, offset),
});

const isEscaped = (source: string, offset: number) => {
  let backslashes = 0;
  for (let index = offset - 1; index >= 0 && source[index] === '\\'; index -= 1) {
    backslashes += 1;
  }
  return backslashes % 2 === 1;
};

const findAttributeNames = (rawTag: string, tagName: string) => {
  const withoutTag = rawTag
    .replace(new RegExp(`^<\\/?${tagName}\\b`, 'i'), '')
    .replace(/\/?>$/, '');
  const attributes: Array<{ name: string; offset: number }> = [];
  const attributePattern = /(?:^|\s)([A-Za-z_:][\w:.-]*)(?=\s|=|$)/g;
  let match: RegExpExecArray | null;

  while ((match = attributePattern.exec(withoutTag))) {
    attributes.push({
      name: match[1],
      offset: rawTag.indexOf(match[1]),
    });
  }
  return attributes;
};

/**
 * Reports constructs that cannot be represented by the target safe-Markdown
 * renderer. The current corpus is expected to contain no such constructs.
 */
export const auditMdxCompatibility = (body: string): MdxIncompatibility[] => {
  const masked = maskCode(body);
  const issues: MdxIncompatibility[] = [];

  const esmPattern = /^(\s*)(import|export)\b/gm;
  let esmMatch: RegExpExecArray | null;
  while ((esmMatch = esmPattern.exec(masked))) {
    const offset = esmMatch.index + esmMatch[1].length;
    issues.push(
      createIssue(
        body,
        offset,
        'mdx-esm',
        `Executable MDX ${esmMatch[2]} statements are not supported.`
      )
    );
  }

  for (let offset = 0; offset < masked.length; offset += 1) {
    if (masked[offset] === '{' && !isEscaped(masked, offset)) {
      issues.push(
        createIssue(
          body,
          offset,
          'mdx-expression',
          'Executable MDX expressions are not supported.'
        )
      );
    }
  }

  const tagPattern = /<\/?([A-Za-z][\w.-]*)(?:\s[^<>]*?)?\s*\/?>/g;
  let tagMatch: RegExpExecArray | null;
  while ((tagMatch = tagPattern.exec(masked))) {
    const tagName = tagMatch[1];
    const normalizedTagName = tagName.toLowerCase();
    const allowedAttributes = ALLOWED_RAW_HTML_ATTRIBUTES[normalizedTagName];

    if (!allowedAttributes) {
      issues.push(
        createIssue(
          body,
          tagMatch.index,
          /^[A-Z]/.test(tagName) ? 'custom-jsx' : 'unsupported-html',
          /^[A-Z]/.test(tagName)
            ? `Custom JSX component <${tagName}> is not supported.`
            : `Raw HTML element <${tagName}> is not allowlisted.`
        )
      );
      continue;
    }

    if (tagMatch[0].startsWith('</')) continue;
    for (const attribute of findAttributeNames(tagMatch[0], tagName)) {
      if (!allowedAttributes.has(attribute.name.toLowerCase())) {
        issues.push(
          createIssue(
            body,
            tagMatch.index + attribute.offset,
            'unsupported-html-attribute',
            `Attribute ${attribute.name} is not allowlisted on <${tagName}>.`
          )
        );
      }
    }
  }

  return issues.sort((left, right) => left.line - right.line || left.column - right.column);
};
