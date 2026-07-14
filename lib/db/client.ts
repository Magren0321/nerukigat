import "server-only";

import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "../../db/schema";

type Database = NodePgDatabase<typeof schema> & { $client: Pool };

type DatabaseGlobals = typeof globalThis & {
  __nerukigatDatabase?: Database;
  __nerukigatPool?: Pool;
};

const databaseGlobals = globalThis as DatabaseGlobals;

function requireDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is required when a database operation is performed.",
    );
  }

  return databaseUrl;
}

/**
 * Creates no socket and reads no required environment variable until called.
 * Importing this module is therefore safe during builds that still use Contentlayer.
 */
export function getDatabasePool(): Pool {
  if (databaseGlobals.__nerukigatPool) {
    return databaseGlobals.__nerukigatPool;
  }

  const pool = new Pool({
    connectionString: requireDatabaseUrl(),
    max: Number(process.env.DATABASE_POOL_MAX ?? 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

  databaseGlobals.__nerukigatPool = pool;
  return pool;
}

export function getDatabase(): Database {
  if (databaseGlobals.__nerukigatDatabase) {
    return databaseGlobals.__nerukigatDatabase;
  }

  const database = drizzle(getDatabasePool(), { schema });
  databaseGlobals.__nerukigatDatabase = database;
  return database;
}

/** Used by scripts and tests that need a deterministic shutdown. */
export async function closeDatabase(): Promise<void> {
  const pool = databaseGlobals.__nerukigatPool;

  databaseGlobals.__nerukigatDatabase = undefined;
  databaseGlobals.__nerukigatPool = undefined;

  if (pool) {
    await pool.end();
  }
}

export type { Database };
