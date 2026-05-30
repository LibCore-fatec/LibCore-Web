import { Pool, type QueryResultRow } from "pg";

const connectionString = process.env.DATABASE_URL;

const globalForPg = globalThis as unknown as {
  libcorePgPool?: Pool;
};

export const pool =
  globalForPg.libcorePgPool ??
  new Pool({
    connectionString,
    ssl: process.env.POSTGRES_SSL === "true" ? { rejectUnauthorized: false } : false,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.libcorePgPool = pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
) {
  if (!connectionString) {
    throw new Error("DATABASE_URL não configurada para PostgreSQL.");
  }

  return pool.query<T>(text, params);
}

export async function withTransaction<T>(
  callback: (client: import("pg").PoolClient) => Promise<T>,
) {
  if (!connectionString) {
    throw new Error("DATABASE_URL não configurada para PostgreSQL.");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
