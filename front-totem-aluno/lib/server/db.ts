import { Pool, type QueryResultRow } from "pg";

const connectionString = process.env.DATABASE_URL || "postgres://localhost/libcore";

const globalForPg = globalThis as unknown as { libcoreAlunoPgPool?: Pool };

export const pool =
  globalForPg.libcoreAlunoPgPool ??
  new Pool({
    connectionString,
    ssl: process.env.POSTGRES_SSL === "true" ? { rejectUnauthorized: false } : false,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.libcoreAlunoPgPool = pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []) {
  return pool.query<T>(text, params);
}
