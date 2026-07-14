import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { parseMdxDocument } from './parse';
import type {
  ImportedMdxDocument,
  MdxAuditDocument,
  MdxAuditReport,
  MdxImportError,
} from './types';

export interface MdxDirectoryInspection {
  report: MdxAuditReport;
  /** Full documents, including verbatim Markdown bodies, for the write phase. */
  documents: ImportedMdxDocument[];
}

const listMdxFiles = async (directory: string, prefix = ''): Promise<string[]> => {
  const entries = await readdir(path.join(directory, prefix), { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const relativePath = prefix ? path.join(prefix, entry.name) : entry.name;
    if (entry.isDirectory()) {
      files.push(...(await listMdxFiles(directory, relativePath)));
    } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
      files.push(relativePath.split(path.sep).join('/'));
    }
  }

  return files;
};

const toAuditDocument = (document: ImportedMdxDocument): MdxAuditDocument => ({
  sourcePath: document.sourcePath,
  canonicalPath: document.canonicalPath,
  sourceSlug: document.sourceSlug,
  kind: document.kind,
  title: document.title,
  publishedOn: document.publishedOn,
  description: document.description,
  tags: [...document.tags],
  draft: document.draft,
  top: document.top,
  bodySha256: document.bodySha256,
  bodyBytes: document.bodyBytes,
  incompatibilities: [...document.incompatibilities],
});

export const inspectMdxDirectory = async (
  postsDirectory: string
): Promise<MdxDirectoryInspection> => {
  const absoluteDirectory = path.resolve(postsDirectory);
  const sourcePaths = await listMdxFiles(absoluteDirectory);
  const documents: ImportedMdxDocument[] = [];
  const errors: MdxImportError[] = [];

  for (const sourcePath of sourcePaths) {
    try {
      const source = await readFile(path.join(absoluteDirectory, sourcePath), 'utf8');
      documents.push(parseMdxDocument({ sourcePath, source }));
    } catch (error) {
      errors.push({
        sourcePath,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const tags = Array.from(new Set(documents.flatMap((document) => document.tags))).sort(
    (left, right) => left.localeCompare(right)
  );
  const incompatibleDocuments = documents.filter(
    (document) => document.incompatibilities.length > 0
  );

  const report: MdxAuditReport = {
    mode: 'dry-run',
    postsDirectory: absoluteDirectory,
    summary: {
      total: sourcePaths.length,
      parsed: documents.length,
      posts: documents.filter((document) => document.kind === 'post').length,
      weekly: documents.filter((document) => document.kind === 'weekly').length,
      published: documents.filter((document) => !document.draft).length,
      drafts: documents.filter((document) => document.draft).length,
      pinned: documents.filter((document) => document.top).length,
      uniqueTags: tags.length,
      incompatibleDocuments: incompatibleDocuments.length,
      incompatibilities: incompatibleDocuments.reduce(
        (total, document) => total + document.incompatibilities.length,
        0
      ),
      parseErrors: errors.length,
    },
    tags,
    documents: documents.map(toAuditDocument),
    errors,
  };

  return { report, documents };
};

export const auditMdxDirectory = async (postsDirectory: string): Promise<MdxAuditReport> =>
  (await inspectMdxDirectory(postsDirectory)).report;

export const formatMdxAuditReport = (report: MdxAuditReport) => {
  const { summary } = report;
  const lines = [
    'MDX import audit (dry-run; no database or filesystem writes)',
    `Posts directory: ${report.postsDirectory}`,
    `Total: ${summary.total} (${summary.parsed} parsed)`,
    `Kinds: ${summary.posts} posts + ${summary.weekly} weekly`,
    `Publication: ${summary.published} published + ${summary.drafts} drafts`,
    `Pinned: ${summary.pinned}`,
    `Unique tags: ${summary.uniqueTags}`,
    `Incompatible MDX: ${summary.incompatibilities} issues in ${summary.incompatibleDocuments} documents`,
    `Parse errors: ${summary.parseErrors}`,
  ];

  const incompatibleDocuments = report.documents.filter(
    (document) => document.incompatibilities.length > 0
  );
  if (incompatibleDocuments.length > 0) {
    lines.push('', 'Incompatibility report:');
    for (const document of incompatibleDocuments) {
      for (const issue of document.incompatibilities) {
        lines.push(
          `- ${document.sourcePath}:${issue.line}:${issue.column} [${issue.kind}] ${issue.message}`
        );
      }
    }
  } else {
    lines.push('', 'Incompatibility report: none');
  }

  if (report.errors.length > 0) {
    lines.push('', 'Parse errors:');
    for (const error of report.errors) lines.push(`- ${error.sourcePath}: ${error.message}`);
  }

  return `${lines.join('\n')}\n`;
};
