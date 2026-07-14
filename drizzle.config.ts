import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

loadEnvConfig(process.cwd());

const localDatabaseUrl =
  "postgresql://nerukigat:nerukigat-local@127.0.0.1:5432/nerukigat";

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema/index.ts",
  out: "./db/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? localDatabaseUrl,
  },
  migrations: {
    table: "__drizzle_migrations",
    schema: "public",
  },
  strict: true,
  verbose: true,
});
