import "server-only";

import { Pool } from "pg";

const globalForPg = globalThis as typeof globalThis & { pgPool?: Pool };

export function getDbPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to access learner records.");
  }

  globalForPg.pgPool ??= new Pool({ connectionString, max: 10 });
  return globalForPg.pgPool;
}
