import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Client } = pg;
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set before applying database migrations.");
}

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const migrationsDirectory = join(projectRoot, "db", "migrations");
const migrationFiles = (await readdir(migrationsDirectory))
  .filter((file) => /^\d+_[a-z0-9_-]+\.sql$/.test(file))
  .sort();

const client = new Client({ connectionString: databaseUrl });
await client.connect();

try {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  for (const name of migrationFiles) {
    const { rowCount } = await client.query(
      "SELECT 1 FROM schema_migrations WHERE name = $1",
      [name],
    );
    if (rowCount) continue;

    const migration = await readFile(join(migrationsDirectory, name), "utf8");
    await client.query("BEGIN");
    try {
      await client.query(migration);
      await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [name]);
      await client.query("COMMIT");
      console.log(`Applied database migration: ${name}`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  }
} finally {
  await client.end();
}
