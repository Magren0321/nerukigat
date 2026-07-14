import type {
  ImportedMdxDocument,
  ImportedPostKind,
  MdxAuditReport,
} from './types';

export type MdxImportExecutionMode = 'dry-run' | 'write';

export interface MdxImportCliSafetyOptions {
  write: boolean;
  confirmWrite: boolean;
}

export interface PlannedPostContent {
  kind: ImportedPostKind;
  canonicalPath: string;
  sourceSlug: string;
  title: string;
  description: string | null;
  markdown: string;
  publishedOn: string;
  isPinned: boolean;
  tagNames: string[];
}

export interface PlannedMdxPost {
  sourcePath: string;
  canonicalPath: string;
  sourceSlug: string;
  kind: ImportedPostKind;
  status: 'draft' | 'published';
  /** Public identity fields stay empty until a document is published. */
  publicPublishedOn: string | null;
  publicIsPinned: boolean;
  draft: PlannedPostContent & { version: 1 };
  revision: (PlannedPostContent & { revisionNumber: 1 }) | null;
}

export interface MdxImportPlan {
  posts: PlannedMdxPost[];
  summary: {
    posts: number;
    published: number;
    drafts: number;
    revisions: number;
    publishedTagLinks: number;
    uniqueTags: number;
  };
}

export class MdxImportSafetyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MdxImportSafetyError';
  }
}

/**
 * Database writes require two independent, explicit switches. This function is
 * intentionally pure so the safety contract can be tested without a database.
 */
export function resolveMdxImportExecutionMode(
  options: MdxImportCliSafetyOptions
): MdxImportExecutionMode {
  if (options.confirmWrite && !options.write) {
    throw new MdxImportSafetyError('--confirm-write is only valid together with --write.');
  }
  if (options.write && !options.confirmWrite) {
    throw new MdxImportSafetyError(
      'Refusing to write: pass both --write and --confirm-write after reviewing a dry-run.'
    );
  }
  return options.write ? 'write' : 'dry-run';
}

export function assertMdxAuditIsWritable(report: MdxAuditReport): void {
  if (report.summary.total === 0) {
    throw new MdxImportSafetyError(
      'Refusing to write an empty import. Check --posts-dir and run the dry-run again.'
    );
  }
  if (
    report.errors.length > 0 ||
    report.summary.parseErrors > 0 ||
    report.summary.incompatibleDocuments > 0 ||
    report.summary.incompatibilities > 0 ||
    report.summary.parsed !== report.summary.total
  ) {
    throw new MdxImportSafetyError(
      'Refusing to write: the audit must have zero parse errors, zero incompatibilities, and parse every source file.'
    );
  }
}

const toContent = (document: ImportedMdxDocument): PlannedPostContent => ({
  kind: document.kind,
  canonicalPath: document.canonicalPath,
  sourceSlug: document.sourceSlug,
  title: document.title,
  description: document.description,
  markdown: document.body,
  publishedOn: document.publishedOn,
  isPinned: document.top,
  tagNames: [...document.tags],
});

export function buildMdxImportPlan(
  report: MdxAuditReport,
  documents: ImportedMdxDocument[]
): MdxImportPlan {
  assertMdxAuditIsWritable(report);

  if (documents.length !== report.summary.parsed) {
    throw new MdxImportSafetyError(
      'Refusing to write: full document count does not match the audited document count.'
    );
  }

  const auditedByPath = new Map(
    report.documents.map((document) => [document.canonicalPath, document.bodySha256])
  );
  const seenPaths = new Set<string>();
  const uniqueTags = new Set<string>();
  const plannedPosts: PlannedMdxPost[] = [];

  if (report.documents.length !== report.summary.parsed) {
    throw new MdxImportSafetyError(
      'Refusing to write: audit document count does not match its summary.'
    );
  }

  for (const document of documents) {
    if (document.incompatibilities.length > 0) {
      throw new MdxImportSafetyError(
        `Refusing to write: ${document.sourcePath} contains incompatible MDX.`
      );
    }
    if (seenPaths.has(document.canonicalPath)) {
      throw new MdxImportSafetyError(
        `Refusing to write duplicate canonical path: ${document.canonicalPath}`
      );
    }
    if (auditedByPath.get(document.canonicalPath) !== document.bodySha256) {
      throw new MdxImportSafetyError(
        `Refusing to write: ${document.sourcePath} no longer matches its audit.`
      );
    }

    const tagNames = new Set<string>();
    for (const tag of document.tags) {
      if (tagNames.has(tag)) {
        throw new MdxImportSafetyError(
          `Refusing to write: ${document.sourcePath} contains duplicate tag ${JSON.stringify(tag)}.`
        );
      }
      tagNames.add(tag);
      uniqueTags.add(tag);
    }

    seenPaths.add(document.canonicalPath);
    const content = toContent(document);
    plannedPosts.push({
      sourcePath: document.sourcePath,
      canonicalPath: document.canonicalPath,
      sourceSlug: document.sourceSlug,
      kind: document.kind,
      status: document.draft ? 'draft' : 'published',
      publicPublishedOn: document.draft ? null : document.publishedOn,
      publicIsPinned: document.draft ? false : document.top,
      draft: { ...content, version: 1 },
      revision: document.draft ? null : { ...content, revisionNumber: 1 },
    });
  }

  const published = plannedPosts.filter((post) => post.status === 'published');
  return {
    posts: plannedPosts,
    summary: {
      posts: plannedPosts.length,
      published: published.length,
      drafts: plannedPosts.length - published.length,
      revisions: published.length,
      publishedTagLinks: published.reduce(
        (total, post) => total + (post.revision?.tagNames.length ?? 0),
        0
      ),
      uniqueTags: uniqueTags.size,
    },
  };
}
