export type ImportedPostKind = 'post' | 'weekly';

export type MdxIncompatibilityKind =
  | 'mdx-esm'
  | 'mdx-expression'
  | 'custom-jsx'
  | 'unsupported-html'
  | 'unsupported-html-attribute';

export interface MdxIncompatibility {
  kind: MdxIncompatibilityKind;
  line: number;
  column: number;
  message: string;
  excerpt: string;
}

export interface ImportedMdxDocument {
  sourcePath: string;
  canonicalPath: string;
  sourceSlug: string;
  kind: ImportedPostKind;
  title: string;
  publishedOn: string;
  description: string | null;
  tags: string[];
  draft: boolean;
  top: boolean;
  body: string;
  bodySha256: string;
  bodyBytes: number;
  incompatibilities: MdxIncompatibility[];
}

export interface MdxImportError {
  sourcePath: string;
  message: string;
}

export interface MdxAuditDocument {
  sourcePath: string;
  canonicalPath: string;
  sourceSlug: string;
  kind: ImportedPostKind;
  title: string;
  publishedOn: string;
  description: string | null;
  tags: string[];
  draft: boolean;
  top: boolean;
  bodySha256: string;
  bodyBytes: number;
  incompatibilities: MdxIncompatibility[];
}

export interface MdxAuditSummary {
  total: number;
  parsed: number;
  posts: number;
  weekly: number;
  published: number;
  drafts: number;
  pinned: number;
  uniqueTags: number;
  incompatibleDocuments: number;
  incompatibilities: number;
  parseErrors: number;
}

export interface MdxAuditReport {
  mode: 'dry-run';
  postsDirectory: string;
  summary: MdxAuditSummary;
  tags: string[];
  documents: MdxAuditDocument[];
  errors: MdxImportError[];
}
