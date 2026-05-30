import { query } from "@/lib/server/db";
import { findBookByRfid } from "@/lib/server/admin-books";

export async function emprestarLivroPorRfid(input: { etiqueta_rfid: string; id_usuario: number }) {
  const livro = await query<{ id_livro: number }>(
    "SELECT id_livro FROM livros WHERE lower(etiqueta_rfid) = lower($1) LIMIT 1",
    [input.etiqueta_rfid],
  );
  if (!livro.rows[0]) throw new Error("Livro não encontrado para esta etiqueta RFID.");
  const idLivro = livro.rows[0].id_livro;
  await query("UPDATE livros SET status_livro = 'EMPRESTADO' WHERE id_livro = $1", [idLivro]);
  await query("INSERT INTO transacoes (tipo, id_usuario, id_livro) VALUES ('EMPRESTIMO', $1, $2)", [input.id_usuario, idLivro]);
  await query("INSERT INTO auditoria (id_usuario, acao, entidade, id_entidade, detalhes) VALUES ($1, 'EMPRESTIMO_RFID', 'livros', $2, jsonb_build_object('etiqueta_rfid', $3))", [input.id_usuario, idLivro, input.etiqueta_rfid]);
  const updated = await findBookByRfid(input.etiqueta_rfid);
  return updated ?? { id_livro: idLivro, status_livro: "EMPRESTADO" };
}

export async function devolverLivroPorRfid(input: { etiqueta_rfid: string; id_usuario: number }) {
  const livro = await query<{ id_livro: number }>(
    "SELECT id_livro FROM livros WHERE lower(etiqueta_rfid) = lower($1) LIMIT 1",
    [input.etiqueta_rfid],
  );
  if (!livro.rows[0]) throw new Error("Livro não encontrado para esta etiqueta RFID.");
  const idLivro = livro.rows[0].id_livro;
  await query("UPDATE livros SET status_livro = 'DISPONIVEL' WHERE id_livro = $1", [idLivro]);
  await query("INSERT INTO transacoes (tipo, id_usuario, id_livro) VALUES ('DEVOLUCAO', $1, $2)", [input.id_usuario, idLivro]);
  await query("INSERT INTO auditoria (id_usuario, acao, entidade, id_entidade, detalhes) VALUES ($1, 'DEVOLUCAO_RFID', 'livros', $2, jsonb_build_object('etiqueta_rfid', $3))", [input.id_usuario, idLivro, input.etiqueta_rfid]);
  const updated = await findBookByRfid(input.etiqueta_rfid);
  return updated ?? { id_livro: idLivro, status_livro: "DISPONIVEL" };
}
