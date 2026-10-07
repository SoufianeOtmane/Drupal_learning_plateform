import "server-only";

import { Pool } from "pg";

const globalForPg = globalThis as typeof globalThis & { pgPool?: Pool };

export function getDbPool() {
  const connectionString =
    process.env.DATABASE_URL ??
    (process.env.NODE_ENV === "development"
      ? `postgresql://${encodeURIComponent(process.env.POSTGRES_USER ?? "drupalmentor")}:${encodeURIComponent(process.env.POSTGRES_PASSWORD ?? "local-dev-password")}@127.0.0.1:${process.env.DB_PORT ?? "5434"}/${encodeURIComponent(process.env.POSTGRES_DB ?? "drupalmentor")}`
      : undefined);
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to access learner records outside local development.");
  }

  globalForPg.pgPool ??= new Pool({ connectionString, max: 10 });
  return globalForPg.pgPool;
}
