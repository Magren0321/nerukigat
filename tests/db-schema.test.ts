import assert from "node:assert/strict";
import test from "node:test";

import { getTableConfig } from "drizzle-orm/pg-core";

import {
  mediaAssets,
  mediaStatusEnum,
  mediaVisibilityEnum,
  postDrafts,
  postMedia,
  postRevisions,
  posts,
  postTags,
  tags,
} from "../db/schema";

function columnNames(table: Parameters<typeof getTableConfig>[0]): string[] {
  return getTableConfig(table).columns.map((column) => column.name);
}

test("content schema contains every required table", () => {
  assert.deepEqual(
    [posts, postDrafts, postRevisions, tags, postTags, mediaAssets, postMedia]
      .map((table) => getTableConfig(table).name)
      .sort(),
    [
      "media_assets",
      "post_drafts",
      "post_media",
      "post_revisions",
      "post_tags",
      "posts",
      "tags",
    ],
  );
});

test("post identity preserves canonical and source slugs", () => {
  assert.ok(columnNames(posts).includes("canonical_path"));
  assert.ok(columnNames(posts).includes("source_slug"));
  assert.equal(posts.canonicalPath.notNull, true);
  assert.equal(posts.publishedOn.getSQLType(), "date");
});

test("drafts use optimistic versions and revisions are dated snapshots", () => {
  assert.ok(columnNames(postDrafts).includes("version"));
  assert.equal(postDrafts.version.notNull, true);
  assert.equal(postDrafts.publishedOn.getSQLType(), "date");
  assert.equal(postRevisions.publishedOn.getSQLType(), "date");
});

test("published tags and media references retain explicit ordering", () => {
  assert.equal(postTags.position.notNull, true);
  assert.equal(postMedia.position.notNull, true);

  const postTagIndexNames = getTableConfig(postTags).indexes.map(
    (index) => index.config.name,
  );
  assert.ok(postTagIndexNames.includes("post_tags_post_position_unique"));
});

test("media lifecycle includes status and visibility", () => {
  assert.deepEqual(mediaStatusEnum.enumValues, [
    "pending",
    "active",
    "detached",
    "deleted",
  ]);
  assert.deepEqual(mediaVisibilityEnum.enumValues, ["private", "public"]);
  assert.equal(mediaAssets.status.notNull, true);
  assert.equal(mediaAssets.visibility.notNull, true);
});
