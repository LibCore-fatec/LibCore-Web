import mysql, { type Pool, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";

declare global {
  var poolLibCore: Pool | undefined;
}

function sslAtivo() {
  return String(process.env.DB_SSL ?? "").toLowerCase() === "true";
}

export function obterPool() {
  if (!global.poolLibCore) {
    global.poolLibCore = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT ?? 3306),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: sslAtivo() ? { rejectUnauthorized: true } : undefined,
      waitForConnections: true,
      connectionLimit: Number(process.env.DB_CONNECTION_LIMIT ?? 10),
      namedPlaceholders: true
    });
  }

  return global.poolLibCore;
}

export async function consultar<T extends RowDataPacket>(sql: string, parametros: Record<string, unknown> = {}) {
  const [linhas] = await obterPool().execute<T[]>(sql, parametros as never);
  return linhas;
}

export async function consultarUm<T extends RowDataPacket>(sql: string, parametros: Record<string, unknown> = {}) {
  const linhas = await consultar<T>(sql, parametros);
  return linhas[0] ?? null;
}

export async function executar(sql: string, parametros: Record<string, unknown> = {}) {
  const [resultado] = await obterPool().execute<ResultSetHeader>(sql, parametros as never);
  return resultado;
}
