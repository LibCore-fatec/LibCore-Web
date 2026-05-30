import { query } from "@/lib/server/db";

export type AuditLog = {
  id_auditoria: number;
  id_usuario: number | null;
  acao: string;
  entidade: string;
  id_entidade: number | null;
  detalhes: Record<string, unknown> | null;
  data_evento: string;
};

export async function listAuditLogs(limit = 50) {
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const { rows } = await query<AuditLog>(
    `SELECT id_auditoria, id_usuario, acao, entidade, id_entidade, detalhes, data_evento
     FROM auditoria
     ORDER BY data_evento DESC
     LIMIT $1`,
    [safeLimit],
  );
  return rows;
}

export async function createAuditLog(input: {
  id_usuario?: number | null;
  acao: string;
  entidade: string;
  id_entidade?: number | null;
  detalhes?: Record<string, unknown> | null;
}) {
  const { rows } = await query<AuditLog>(
    `INSERT INTO auditoria (id_usuario, acao, entidade, id_entidade, detalhes)
     VALUES ($1, $2, $3, $4, $5::jsonb)
     RETURNING id_auditoria, id_usuario, acao, entidade, id_entidade, detalhes, data_evento`,
    [
      input.id_usuario ?? null,
      input.acao,
      input.entidade,
      input.id_entidade ?? null,
      JSON.stringify(input.detalhes ?? null),
    ],
  );
  return rows[0];
}
