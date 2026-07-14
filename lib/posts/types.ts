export type PostKind = 'post' | 'weekly';
export type PostStatus = 'draft' | 'published' | 'archived';

export interface PostDraftData {
  kind: PostKind;
  canonicalPath: string;
  sourceSlug: string | null;
  title: string;
  description: string | null;
  markdown: string;
  publishedOn: string | null;
  isPinned: boolean;
  tags: string[];
}

export interface AdminPostSummary {
  id: string;
  status: PostStatus;
  kind: PostKind;
  canonicalPath: string;
  title: string;
  publishedOn: string | null;
  isPinned: boolean;
  version: number;
  updatedAt: Date;
}

export interface AdminPostDetail extends AdminPostSummary {
  sourceSlug: string | null;
  description: string | null;
  markdown: string;
  tags: string[];
  publishedRevisionId: string | null;
  publishedAt: Date | null;
}

export interface PublicPost {
  id: string;
  kind: PostKind;
  canonicalPath: string;
  url: string;
  title: string;
  description: string | null;
  markdown: string;
  publishedOn: string;
  publishedAt: Date | null;
  isPinned: boolean;
  tags: string[];
}

export interface PublicPostSummary
  extends Omit<PublicPost, 'markdown' | 'publishedAt'> {
  wordCount: number;
  readingMinutes: number;
}
