import { normalizeTagSlug } from '../validation';
import type { MdxImportPlan, PlannedMdxPost } from './planning';

export interface WriteMdxImportOptions {
  databaseUrl: string;
  databasePoolMax?: number;
  now?: Date;
}

export interface MdxImportWriteResult {
  importedPosts: number;
  publishedPosts: number;
  draftPosts: number;
  revisions: number;
  publishedTagLinks: number;
  uniqueTags: number;
}

export class MdxImportCollisionError extends Error {
  readonly canonicalPaths: string[];

  constructor(canonicalPaths: string[]) {
    super(
      `Import aborted: target database already contains canonical path(s): ${canonicalPaths.join(', ')}`
    );
    this.name = 'MdxImportCollisionError';
    this.canonicalPaths = canonicalPaths;
  }
}

const insertPost = async (
  client: import('pg').PoolClient,
  post: PlannedMdxPost,
  importedAt: Date
) => {
  // Insert as a draft first because the immutable revision needs the post id.
  // The whole import is one transaction, so this intermediate state is never public.
  const postResult = await client.query<{ id: string }>(
    `insert into posts
      (kind, canonical_path, source_slug, status, published_on, is_pinned, created_at, updated_at)
     values ($1, $2, $3, 'draft', null, false, $4, $4)
     returning id`,
    [post.kind, post.canonicalPath, post.sourceSlug, importedAt]
  );
  const postId = postResult.rows[0]?.id;
  if (!postId) throw new Error(`Database did not return an id for ${post.canonicalPath}.`);

  await client.query(
    `insert into post_drafts
      (post_id, version, kind, canonical_path, source_slug, title, description, markdown,
       published_on, is_pinned, tag_names, created_at, updated_at)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12, $12)`,
    [
      postId,
      post.draft.version,
      post.draft.kind,
      post.draft.canonicalPath,
      post.draft.sourceSlug,
      post.draft.title,
      post.draft.description,
      post.draft.markdown,
      post.draft.publishedOn,
      post.draft.isPinned,
      JSON.stringify(post.draft.tagNames),
      importedAt,
    ]
  );

  if (!post.revision) return;

  const revisionResult = await client.query<{ id: string }>(
    `insert into post_revisions
      (post_id, revision_number, kind, canonical_path, source_slug, title, description,
       markdown, published_on, is_pinned, tag_names, created_at)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12)
     returning id`,
    [
      postId,
      post.revision.revisionNumber,
      post.revision.kind,
      post.revision.canonicalPath,
      post.revision.sourceSlug,
      post.revision.title,
      post.revision.description,
      post.revision.markdown,
      post.revision.publishedOn,
      post.revision.isPinned,
      JSON.stringify(post.revision.tagNames),
      importedAt,
    ]
  );
  const revisionId = revisionResult.rows[0]?.id;
  if (!revisionId) {
    throw new Error(`Database did not return a revision id for ${post.canonicalPath}.`);
  }

  for (let position = 0; position < post.revision.tagNames.length; position += 1) {
    const name = post.revision.tagNames[position];
    const tagResult = await client.query<{ id: string }>(
      `with inserted as (
         insert into tags (name, slug)
         values ($1, $2)
         on conflict (name) do nothing
         returning id
       )
       select id from inserted
       union all
       select id from tags where name = $1
       limit 1`,
      [name, normalizeTagSlug(name)]
    );
    const tagId = tagResult.rows[0]?.id;
    if (!tagId) throw new Error(`Database did not return a tag id for ${name}.`);

    await client.query(
      `insert into post_tags (post_id, tag_id, position) values ($1, $2, $3)`,
      [postId, tagId, position]
    );
  }

  await client.query(
    `update posts
       set kind = $2,
           source_slug = $3,
           status = 'published',
           published_revision_id = $4,
           published_on = $5,
           published_at = $6,
           is_pinned = $7,
           updated_at = $6
     where id = $1`,
    [
      postId,
      post.kind,
      post.sourceSlug,
      revisionId,
      post.publicPublishedOn,
      importedAt,
      post.publicIsPinned,
    ]
  );
};

/**
 * Writes an already-audited plan in one serializable transaction. Any source
 * path collision or row failure rolls back every imported post.
 */
export async function writeMdxImportPlan(
  plan: MdxImportPlan,
  options: WriteMdxImportOptions
): Promise<MdxImportWriteResult> {
  const databaseUrl = options.databaseUrl.trim();
  if (!databaseUrl) throw new Error('DATABASE_URL is required for --write.');
  const databasePoolMax = options.databasePoolMax ?? 1;
  if (!Number.isInteger(databasePoolMax) || databasePoolMax < 1) {
    throw new Error('DATABASE_POOL_MAX must be a positive integer.');
  }

  const { Pool } = await import('pg');
  const pool = new Pool({
    connectionString: databaseUrl,
    max: databasePoolMax,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
  let client: import('pg').PoolClient | undefined;
  let transactionStarted = false;

  try {
    client = await pool.connect();
    await client.query('begin isolation level serializable');
    transactionStarted = true;

    const canonicalPaths = plan.posts.map((post) => post.canonicalPath);
    const collisionResult = await client.query<{ canonical_path: string }>(
      `select canonical_path
         from posts
        where canonical_path = any($1::text[])
        order by canonical_path`,
      [canonicalPaths]
    );
    if (collisionResult.rows.length > 0) {
      throw new MdxImportCollisionError(
        collisionResult.rows.map((row) => row.canonical_path)
      );
    }

    const importedAt = options.now ?? new Date();
    for (const post of plan.posts) await insertPost(client, post, importedAt);

    await client.query('commit');
    transactionStarted = false;

    return {
      importedPosts: plan.summary.posts,
      publishedPosts: plan.summary.published,
      draftPosts: plan.summary.drafts,
      revisions: plan.summary.revisions,
      publishedTagLinks: plan.summary.publishedTagLinks,
      uniqueTags: plan.summary.uniqueTags,
    };
  } catch (error) {
    if (transactionStarted && client) {
      try {
        await client.query('rollback');
      } catch {
        // Preserve the import failure; closing the client below discards the connection.
      }
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    ) {
      throw new Error(
        'Import aborted by a uniqueness conflict; the transaction was rolled back. No existing row was overwritten.',
        { cause: error }
      );
    }
    throw error;
  } finally {
    client?.release();
    await pool.end();
  }
}

export function formatMdxImportWriteResult(result: MdxImportWriteResult): string {
  return [
    'MDX database import complete (single transaction committed)',
    `Posts: ${result.importedPosts}`,
    `Publication: ${result.publishedPosts} published + ${result.draftPosts} drafts`,
    `Revisions: ${result.revisions}`,
    `Published tag links: ${result.publishedTagLinks}`,
    `Unique source tags: ${result.uniqueTags}`,
  ].join('\n') + '\n';
}
