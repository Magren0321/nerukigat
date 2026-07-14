CREATE TYPE "public"."media_status" AS ENUM('pending', 'active', 'detached', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."media_visibility" AS ENUM('private', 'public');--> statement-breakpoint
CREATE TYPE "public"."post_kind" AS ENUM('post', 'weekly');--> statement-breakpoint
CREATE TYPE "public"."post_media_role" AS ENUM('body', 'cover');--> statement-breakpoint
CREATE TYPE "public"."post_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"storage_key" text NOT NULL,
	"original_filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"byte_size" bigint NOT NULL,
	"width" integer,
	"height" integer,
	"sha256" varchar(64),
	"alt" text DEFAULT '' NOT NULL,
	"caption" text,
	"dominant_color" varchar(32),
	"blur_data_url" text,
	"status" "media_status" DEFAULT 'pending' NOT NULL,
	"visibility" "media_visibility" DEFAULT 'private' NOT NULL,
	"legacy_path" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "media_assets_byte_size_nonnegative" CHECK ("media_assets"."byte_size" >= 0),
	CONSTRAINT "media_assets_width_positive" CHECK ("media_assets"."width" is null or "media_assets"."width" > 0),
	CONSTRAINT "media_assets_height_positive" CHECK ("media_assets"."height" is null or "media_assets"."height" > 0)
);
--> statement-breakpoint
CREATE TABLE "post_drafts" (
	"post_id" uuid PRIMARY KEY NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"kind" "post_kind" DEFAULT 'post' NOT NULL,
	"canonical_path" text NOT NULL,
	"source_slug" text,
	"title" text DEFAULT '' NOT NULL,
	"description" text,
	"markdown" text DEFAULT '' NOT NULL,
	"published_on" date,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"tag_names" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "post_drafts_version_positive" CHECK ("post_drafts"."version" > 0),
	CONSTRAINT "post_drafts_canonical_path_not_blank" CHECK (length(trim("post_drafts"."canonical_path")) > 0)
);
--> statement-breakpoint
CREATE TABLE "post_media" (
	"post_id" uuid NOT NULL,
	"media_asset_id" uuid NOT NULL,
	"role" "post_media_role" DEFAULT 'body' NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "post_media_post_id_media_asset_id_pk" PRIMARY KEY("post_id","media_asset_id"),
	CONSTRAINT "post_media_position_nonnegative" CHECK ("post_media"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "post_revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"revision_number" integer NOT NULL,
	"kind" "post_kind" NOT NULL,
	"canonical_path" text NOT NULL,
	"source_slug" text,
	"title" text NOT NULL,
	"description" text,
	"markdown" text NOT NULL,
	"published_on" date NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"tag_names" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "post_revisions_revision_number_positive" CHECK ("post_revisions"."revision_number" > 0),
	CONSTRAINT "post_revisions_canonical_path_not_blank" CHECK (length(trim("post_revisions"."canonical_path")) > 0)
);
--> statement-breakpoint
CREATE TABLE "post_tags" (
	"post_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "post_tags_post_id_tag_id_pk" PRIMARY KEY("post_id","tag_id"),
	CONSTRAINT "post_tags_position_nonnegative" CHECK ("post_tags"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" "post_kind" DEFAULT 'post' NOT NULL,
	"canonical_path" text NOT NULL,
	"source_slug" text,
	"status" "post_status" DEFAULT 'draft' NOT NULL,
	"published_revision_id" uuid,
	"published_on" date,
	"published_at" timestamp with time zone,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "posts_canonical_path_not_blank" CHECK (length(trim("posts"."canonical_path")) > 0)
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tags_name_not_blank" CHECK (length(trim("tags"."name")) > 0),
	CONSTRAINT "tags_slug_not_blank" CHECK (length(trim("tags"."slug")) > 0)
);
--> statement-breakpoint
ALTER TABLE "post_drafts" ADD CONSTRAINT "post_drafts_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_media" ADD CONSTRAINT "post_media_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_media" ADD CONSTRAINT "post_media_media_asset_id_media_assets_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_revisions" ADD CONSTRAINT "post_revisions_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_published_revision_id_post_revisions_id_fk" FOREIGN KEY ("published_revision_id") REFERENCES "public"."post_revisions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "media_assets_storage_key_unique" ON "media_assets" USING btree ("storage_key");--> statement-breakpoint
CREATE UNIQUE INDEX "media_assets_legacy_path_unique" ON "media_assets" USING btree ("legacy_path");--> statement-breakpoint
CREATE INDEX "media_assets_sha256_idx" ON "media_assets" USING btree ("sha256");--> statement-breakpoint
CREATE INDEX "media_assets_listing_idx" ON "media_assets" USING btree ("status","visibility","created_at");--> statement-breakpoint
CREATE INDEX "post_drafts_updated_at_idx" ON "post_drafts" USING btree ("updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "post_media_post_position_unique" ON "post_media" USING btree ("post_id","position");--> statement-breakpoint
CREATE INDEX "post_media_media_asset_id_idx" ON "post_media" USING btree ("media_asset_id");--> statement-breakpoint
CREATE UNIQUE INDEX "post_revisions_post_number_unique" ON "post_revisions" USING btree ("post_id","revision_number");--> statement-breakpoint
CREATE INDEX "post_revisions_post_created_at_idx" ON "post_revisions" USING btree ("post_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "post_tags_post_position_unique" ON "post_tags" USING btree ("post_id","position");--> statement-breakpoint
CREATE INDEX "post_tags_tag_id_idx" ON "post_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "posts_canonical_path_unique" ON "posts" USING btree ("canonical_path");--> statement-breakpoint
CREATE INDEX "posts_public_listing_idx" ON "posts" USING btree ("status","kind","published_on");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_name_unique" ON "tags" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_slug_unique" ON "tags" USING btree ("slug");