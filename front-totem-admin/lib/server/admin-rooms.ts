import { query } from "@/lib/server/db";

export type SalaAdmin = {
  id_sala: number;
  id_espaco: number | null;
  nome_sala: string;
  status_sala: "ABERTA" | "FECHADA";
  camera_url: string | null;
  largura_planta: string | null;
  altura_planta: string | null;
  metadata: Record<string, unknown> | null;
  atualizada_em: string;
};

export async function listarSalas() {
  const { rows } = await query<SalaAdmin>(
    "SELECT id_sala, id_espaco, nome_sala, status_sala::text AS status_sala, camera_url, largura_planta::text, altura_planta::text, metadata, atualizada_em FROM salas ORDER BY nome_sala",
  );
  return rows;
}

export async function buscarSala(id: number) {
  const { rows } = await query<SalaAdmin>(
    "SELECT id_sala, id_espaco, nome_sala, status_sala::text AS status_sala, camera_url, largura_planta::text, altura_planta::text, metadata, atualizada_em FROM salas WHERE id_sala = $1 LIMIT 1",
    [id],
  );
  return rows[0] ?? null;
}

export async function fecharSala(id: number, idUsuario?: number | null) {
  const { rows } = await query<SalaAdmin>(
    "UPDATE salas SET status_sala = 'FECHADA', atualizada_em = CURRENT_TIMESTAMP WHERE id_sala = $1 RETURNING id_sala, id_espaco, nome_sala, status_sala::text AS status_sala, camera_url, largura_planta::text, altura_planta::text, metadata, atualizada_em",
    [id],
  );
  if (!rows[0]) throw new Error("Sala não encontrada.");
  await query(
    "INSERT INTO auditoria (id_usuario, acao, entidade, id_entidade, detalhes) VALUES ($1, 'SALA_FECHADA', 'salas', $2, jsonb_build_object('nome_sala', $3))",
    [idUsuario ?? null, id, rows[0].nome_sala],
  );
  return rows[0];
}
