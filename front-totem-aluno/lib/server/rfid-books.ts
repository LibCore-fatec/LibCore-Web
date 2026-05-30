import { query } from "@/lib/server/db";
import { ensureLocalSchema } from "@/lib/server/bootstrap";

type BookRow = {
  id_livro: number;
  etiqueta_rfid: string;
  nome_livro: string;
  autor_livro: string | null;
  id_localizacao: number | null;
  status_livro: string;
  setor: string | null;
  estante: string | null;
  divisoria: string | null;
  numero: number | null;
};

function mapBook(row: BookRow) {
  const status = row.status_livro === "EMPRESTADO" || row.status_livro === "RESERVADO" ? "EMPRESTADO" : "DISPONIVEL";
  return {
    id_livro: row.id_livro,
    rfid_livro: row.etiqueta_rfid,
    etiqueta_rfid: row.etiqueta_rfid,
    nome_livro: row.nome_livro,
    autor_livro: row.autor_livro,
    id_localizacao: row.id_localizacao,
    status,
    statusLabel: status === "DISPONIVEL" ? "Disponível" : "Emprestado",
    locationLabel: row.setor ? `Setor ${row.setor}, Estante ${row.estante}, Divisória ${row.divisoria}, Nº ${row.numero}` : "Localização não cadastrada",
    localizacao: row.setor ? { id_localizacao: row.id_localizacao ?? 0, setor: row.setor, estante: row.estante ?? "", divisoria: row.divisoria ?? "", numero: row.numero ?? 0 } : null,
  };
}

const selectBooks = `SELECT l.id_livro, l.etiqueta_rfid, l.nome_livro, l.autor_livro, l.id_localizacao, l.status_livro::text AS status_livro, loc.setor, loc.estante, loc.divisoria, loc.numero FROM livros l LEFT JOIN localizacao_livro loc ON loc.id_localizacao = l.id_localizacao`;

export async function listBooks() {
  await ensureLocalSchema();
  const { rows } = await query<BookRow>(`${selectBooks} ORDER BY l.nome_livro`);
  return rows.map(mapBook);
}

export async function findBookByRfid(etiqueta: string) {
  await ensureLocalSchema();
  const { rows } = await query<BookRow>(`${selectBooks} WHERE lower(l.etiqueta_rfid) = lower($1) LIMIT 1`, [etiqueta]);
  return rows[0] ? mapBook(rows[0]) : null;
}

export async function audit(input: { id_usuario?: number | null; acao: string; entidade: string; id_entidade?: number | null; detalhes?: Record<string, unknown> | null }) {
  await ensureLocalSchema();
  await query("INSERT INTO auditoria (id_usuario, acao, entidade, id_entidade, detalhes) VALUES ($1, $2, $3, $4, $5::jsonb)", [input.id_usuario ?? null, input.acao, input.entidade, input.id_entidade ?? null, JSON.stringify(input.detalhes ?? null)]);
}

export async function emprestar(etiqueta: string, idUsuario: number) {
  const livro = await findBookByRfid(etiqueta);
  if (!livro) throw new Error("RFID desconhecido.");
  await query("UPDATE livros SET status_livro = 'EMPRESTADO' WHERE id_livro = $1", [livro.id_livro]);
  await query("INSERT INTO transacoes (tipo, id_usuario, id_livro) VALUES ('EMPRESTIMO', $1, $2)", [idUsuario, livro.id_livro]);
  await audit({ id_usuario: idUsuario, acao: "ALUNO_EMPRESTOU_RFID", entidade: "livros", id_entidade: livro.id_livro, detalhes: { etiqueta_rfid: etiqueta } });
  return { ...livro, status: "EMPRESTADO", statusLabel: "Emprestado" };
}

export async function devolver(etiqueta: string, idUsuario: number) {
  const livro = await findBookByRfid(etiqueta);
  if (!livro) throw new Error("RFID desconhecido.");
  await query("UPDATE livros SET status_livro = 'DISPONIVEL' WHERE id_livro = $1", [livro.id_livro]);
  await query("INSERT INTO transacoes (tipo, id_usuario, id_livro) VALUES ('DEVOLUCAO', $1, $2)", [idUsuario, livro.id_livro]);
  await audit({ id_usuario: idUsuario, acao: "ALUNO_DEVOLVEU_RFID", entidade: "livros", id_entidade: livro.id_livro, detalhes: { etiqueta_rfid: etiqueta } });
  return { ...livro, status: "DISPONIVEL", statusLabel: "Disponível" };
}
