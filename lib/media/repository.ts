import 'server-only';

import { and, desc, eq } from 'drizzle-orm';

import { mediaAssets } from '@/db/schema';
import { getDatabase } from '@/lib/db';

import { MediaAssetRecord } from './types';

export interface CreatePendingMediaInput {
  storageKey: string;
  originalFilename: string;
  mimeType: string;
  byteSize: number;
}

export interface ActivatePendingMediaInput {
  id: string;
  expectedStorageKey: string;
  publicStorageKey: string;
  mimeType: string;
  byteSize: number;
  width: number;
  height: number;
  sha256: string;
}

export interface MediaRepository {
  createPending(input: CreatePendingMediaInput): Promise<MediaAssetRecord>;
  rejectPending(input: {
    id: string;
    expectedStorageKey: string;
  }): Promise<void>;
  findById(id: string): Promise<MediaAssetRecord | null>;
  findActivePublicById(id: string): Promise<MediaAssetRecord | null>;
  activatePending(
    input: ActivatePendingMediaInput
  ): Promise<MediaAssetRecord | null>;
  listActivePublic(limit?: number): Promise<MediaAssetRecord[]>;
}

export const databaseMediaRepository: MediaRepository = {
  async createPending(input) {
    const [asset] = await getDatabase()
      .insert(mediaAssets)
      .values({
        storageKey: input.storageKey,
        originalFilename: input.originalFilename,
        mimeType: input.mimeType,
        byteSize: input.byteSize,
        status: 'pending',
        visibility: 'private',
      })
      .returning();

    if (!asset) {
      throw new Error('Pending media record was not created');
    }

    return asset;
  },

  async rejectPending(input) {
    await getDatabase()
      .update(mediaAssets)
      .set({
        status: 'deleted',
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(mediaAssets.id, input.id),
          eq(mediaAssets.storageKey, input.expectedStorageKey),
          eq(mediaAssets.status, 'pending'),
          eq(mediaAssets.visibility, 'private')
        )
      );
  },

  async findById(id) {
    const [asset] = await getDatabase()
      .select()
      .from(mediaAssets)
      .where(eq(mediaAssets.id, id))
      .limit(1);

    return asset ?? null;
  },

  async findActivePublicById(id) {
    const [asset] = await getDatabase()
      .select()
      .from(mediaAssets)
      .where(
        and(
          eq(mediaAssets.id, id),
          eq(mediaAssets.status, 'active'),
          eq(mediaAssets.visibility, 'public')
        )
      )
      .limit(1);

    return asset ?? null;
  },

  async activatePending(input) {
    const [asset] = await getDatabase()
      .update(mediaAssets)
      .set({
        storageKey: input.publicStorageKey,
        mimeType: input.mimeType,
        byteSize: input.byteSize,
        width: input.width,
        height: input.height,
        sha256: input.sha256,
        status: 'active',
        visibility: 'public',
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(mediaAssets.id, input.id),
          eq(mediaAssets.storageKey, input.expectedStorageKey),
          eq(mediaAssets.status, 'pending'),
          eq(mediaAssets.visibility, 'private')
        )
      )
      .returning();

    return asset ?? null;
  },

  async listActivePublic(limit = 100) {
    return getDatabase()
      .select()
      .from(mediaAssets)
      .where(
        and(
          eq(mediaAssets.status, 'active'),
          eq(mediaAssets.visibility, 'public')
        )
      )
      .orderBy(desc(mediaAssets.createdAt))
      .limit(limit);
  },
};
