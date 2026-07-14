import { relations, sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

export const postKindEnum = pgEnum("post_kind", ["post", "weekly"]);

export const postStatusEnum = pgEnum("post_status", [
  "draft",
  "published",
  "archived",
]);

export const mediaStatusEnum = pgEnum("media_status", [
  "pending",
  "active",
  "detached",
  "deleted",
]);

export const mediaVisibilityEnum = pgEnum("media_visibility", [
  "private",
  "public",
]);

export const postMediaRoleEnum = pgEnum("post_media_role", [
  "body",
  "cover",
]);

/**
 * Stable post identity and the currently published pointer.
 *
 * Editable content lives in post_drafts. Public readers follow
 * published_revision_id, so saving a draft never changes live content.
 */
export const posts = pgTable(
  "posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    kind: postKindEnum("kind").notNull().default("post"),
    canonicalPath: text("canonical_path").notNull(),
    sourceSlug: text("source_slug"),
    status: postStatusEnum("status").notNull().default("draft"),
    publishedRevisionId: uuid("published_revision_id").references(
      (): AnyPgColumn => postRevisions.id,
      { onDelete: "set null" },
    ),
    publishedOn: date("published_on", { mode: "string" }),
    publishedAt: timestamp("published_at", {
      withTimezone: true,
      mode: "date",
    }),
    isPinned: boolean("is_pinned").notNull().default(false),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("posts_canonical_path_unique").on(table.canonicalPath),
    index("posts_public_listing_idx").on(
      table.status,
      table.kind,
      table.publishedOn,
    ),
    check(
      "posts_canonical_path_not_blank",
      sql`length(trim(${table.canonicalPath})) > 0`,
    ),
  ],
);

/** The owner's mutable working copy. */
export const postDrafts = pgTable(
  "post_drafts",
  {
    postId: uuid("post_id")
      .primaryKey()
      .references(() => posts.id, { onDelete: "cascade" }),
    version: integer("version").notNull().default(1),
    kind: postKindEnum("kind").notNull().default("post"),
    canonicalPath: text("canonical_path").notNull(),
    sourceSlug: text("source_slug"),
    title: text("title").notNull().default(""),
    description: text("description"),
    markdown: text("markdown").notNull().default(""),
    publishedOn: date("published_on", { mode: "string" }),
    isPinned: boolean("is_pinned").notNull().default(false),
    tagNames: jsonb("tag_names").$type<string[]>().notNull().default([]),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("post_drafts_updated_at_idx").on(table.updatedAt),
    check("post_drafts_version_positive", sql`${table.version} > 0`),
    check(
      "post_drafts_canonical_path_not_blank",
      sql`length(trim(${table.canonicalPath})) > 0`,
    ),
  ],
);

/** Immutable content captured by each successful publish transaction. */
export const postRevisions = pgTable(
  "post_revisions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    revisionNumber: integer("revision_number").notNull(),
    kind: postKindEnum("kind").notNull(),
    canonicalPath: text("canonical_path").notNull(),
    sourceSlug: text("source_slug"),
    title: text("title").notNull(),
    description: text("description"),
    markdown: text("markdown").notNull(),
    publishedOn: date("published_on", { mode: "string" }).notNull(),
    isPinned: boolean("is_pinned").notNull().default(false),
    tagNames: jsonb("tag_names").$type<string[]>().notNull().default([]),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("post_revisions_post_number_unique").on(
      table.postId,
      table.revisionNumber,
    ),
    index("post_revisions_post_created_at_idx").on(
      table.postId,
      table.createdAt,
    ),
    check(
      "post_revisions_revision_number_positive",
      sql`${table.revisionNumber} > 0`,
    ),
    check(
      "post_revisions_canonical_path_not_blank",
      sql`length(trim(${table.canonicalPath})) > 0`,
    ),
  ],
);

export const tags = pgTable(
  "tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("tags_name_unique").on(table.name),
    uniqueIndex("tags_slug_unique").on(table.slug),
    check("tags_name_not_blank", sql`length(trim(${table.name})) > 0`),
    check("tags_slug_not_blank", sql`length(trim(${table.slug})) > 0`),
  ],
);

/** Current published tag order. Draft order remains in post_drafts.tag_names. */
export const postTags = pgTable(
  "post_tags",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
  },
  (table) => [
    primaryKey({
      name: "post_tags_post_id_tag_id_pk",
      columns: [table.postId, table.tagId],
    }),
    uniqueIndex("post_tags_post_position_unique").on(
      table.postId,
      table.position,
    ),
    index("post_tags_tag_id_idx").on(table.tagId),
    check("post_tags_position_nonnegative", sql`${table.position} >= 0`),
  ],
);

export const mediaAssets = pgTable(
  "media_assets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storageKey: text("storage_key").notNull(),
    originalFilename: text("original_filename").notNull(),
    mimeType: text("mime_type").notNull(),
    byteSize: bigint("byte_size", { mode: "number" }).notNull(),
    width: integer("width"),
    height: integer("height"),
    sha256: varchar("sha256", { length: 64 }),
    alt: text("alt").notNull().default(""),
    caption: text("caption"),
    dominantColor: varchar("dominant_color", { length: 32 }),
    blurDataUrl: text("blur_data_url"),
    status: mediaStatusEnum("status").notNull().default("pending"),
    visibility: mediaVisibilityEnum("visibility")
      .notNull()
      .default("private"),
    legacyPath: text("legacy_path"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", {
      withTimezone: true,
      mode: "date",
    }),
  },
  (table) => [
    uniqueIndex("media_assets_storage_key_unique").on(table.storageKey),
    uniqueIndex("media_assets_legacy_path_unique").on(table.legacyPath),
    index("media_assets_sha256_idx").on(table.sha256),
    index("media_assets_listing_idx").on(
      table.status,
      table.visibility,
      table.createdAt,
    ),
    check("media_assets_byte_size_nonnegative", sql`${table.byteSize} >= 0`),
    check(
      "media_assets_width_positive",
      sql`${table.width} is null or ${table.width} > 0`,
    ),
    check(
      "media_assets_height_positive",
      sql`${table.height} is null or ${table.height} > 0`,
    ),
  ],
);

/** Current published media references and their stable document order. */
export const postMedia = pgTable(
  "post_media",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    mediaAssetId: uuid("media_asset_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "restrict" }),
    role: postMediaRoleEnum("role").notNull().default("body"),
    position: integer("position").notNull(),
  },
  (table) => [
    primaryKey({
      name: "post_media_post_id_media_asset_id_pk",
      columns: [table.postId, table.mediaAssetId],
    }),
    uniqueIndex("post_media_post_position_unique").on(
      table.postId,
      table.position,
    ),
    index("post_media_media_asset_id_idx").on(table.mediaAssetId),
    check("post_media_position_nonnegative", sql`${table.position} >= 0`),
  ],
);

export const postsRelations = relations(posts, ({ one, many }) => ({
  draft: one(postDrafts, {
    fields: [posts.id],
    references: [postDrafts.postId],
  }),
  publishedRevision: one(postRevisions, {
    relationName: "publishedRevision",
    fields: [posts.publishedRevisionId],
    references: [postRevisions.id],
  }),
  revisions: many(postRevisions, { relationName: "postRevisions" }),
  tags: many(postTags),
  media: many(postMedia),
}));

export const postDraftsRelations = relations(postDrafts, ({ one }) => ({
  post: one(posts, {
    fields: [postDrafts.postId],
    references: [posts.id],
  }),
}));
export const postRevisionsRelations = relations(postRevisions, ({ one }) => ({
  post: one(posts, {
    relationName: "postRevisions",
    fields: [postRevisions.postId],
    references: [posts.id],
  }),
  publishedBy: one(posts, {
    relationName: "publishedRevision",
    fields: [postRevisions.id],
    references: [posts.publishedRevisionId],
  }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  posts: many(postTags),
}));

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, {
    fields: [postTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postTags.tagId],
    references: [tags.id],
  }),
}));

export const mediaAssetsRelations = relations(mediaAssets, ({ many }) => ({
  posts: many(postMedia),
}));

export const postMediaRelations = relations(postMedia, ({ one }) => ({
  post: one(posts, {
    fields: [postMedia.postId],
    references: [posts.id],
  }),
  mediaAsset: one(mediaAssets, {
    fields: [postMedia.mediaAssetId],
    references: [mediaAssets.id],
  }),
}));
