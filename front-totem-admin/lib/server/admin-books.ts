import type { CatalogBook } from "@/lib/types";
import { query } from "@/lib/server/db";

type BookRow = {
  id_livro: number;
  etiqueta_rfid: string;
  nome_livro: string;
  autor_livro: string | null;
  id_localizacao: number | null;
  setor: string | null;
  estante: string | null;
  divisoria: string | null;
  numero: number | null;
  status_livro: string;
};

function mapBook(row: BookRow): CatalogBook {
  const status = row.status_livro === "EMPRESTADO" || row.status_livro === "RESERVADO" ? "EMPRESTADO" : "DISPONIVEL";
  const hasLocation = Boolean(row.id_localizacao && row.setor && row.estante && row.divisoria && row.numero !== null);

  return {
    id_livro: row.id_livro,
    rfid_livro: row.etiqueta_rfid,
    etiqueta_rfid: row.etiqueta_rfid,
    nome_livro: row.nome_livro,
    autor_livro: row.autor_livro,
    id_localizacao: row.id_localizacao,
    status,
    statusLabel: status === "DISPONIVEL" ? "Disponível" : "Emprestado",
    locationLabel: hasLocation
      ? `Setor ${row.setor}, Estante ${row.estante}, Divisória ${row.divisoria}, Nº ${row.numero}`
      : "Localização não cadastrada",
    localizacao: hasLocation
      ? {
          id_localizacao: row.id_localizacao ?? 0,
          setor: row.setor ?? "",
          estante: row.estante ?? "",
          divisoria: row.divisoria ?? "",
          numero: row.numero ?? 0,
        }
      : null,
  };
}

const selectBooks = `
  SELECT l.id_livro, l.etiqueta_rfid, l.nome_livro, l.autor_livro,
         l.id_localizacao, l.status_livro::text AS status_livro,
         loc.setor, loc.estante, loc.divisoria, loc.numero
  FROM livros l
  LEFT JOIN localizacao_livro loc ON loc.id_localizacao = l.id_localizacao
`;

export async function listBooks() {
  const { rows } = await query<BookRow>(`${selectBooks} ORDER BY l.nome_livro ASC`);
  return rows.map(mapBook);
}

export async function findBookByRfid(etiquetaRfid: string) {
  const { rows } = await query<BookRow>(
    `${selectBooks} WHERE lower(l.etiqueta_rfid) = lower($1) LIMIT 1`,
    [etiquetaRfid],
  );

  return rows[0] ? mapBook(rows[0]) : null;
}

export async function createBook(input: {
  etiqueta_rfid: string;
  nome_livro: string;
  autor_livro: string | null;
}) {
  const { rows } = await query<BookRow>(
    `INSERT INTO livros (etiqueta_rfid, nome_livro, autor_livro)
     VALUES ($1, $2, $3)
     RETURNING id_livro, etiqueta_rfid, nome_livro, autor_livro, id_localizacao,
       status_livro::text AS status_livro, NULL::varchar AS setor, NULL::varchar AS estante,
       NULL::varchar AS divisoria, NULL::integer AS numero`,
    [input.etiqueta_rfid, input.nome_livro, input.autor_livro],
  );

  await query(
    `INSERT INTO auditoria (acao, entidade, id_entidade, detalhes)
     VALUES ('CADASTRO_RFID', 'livros', $1, jsonb_build_object('etiqueta_rfid', $2))`,
    [rows[0].id_livro, input.etiqueta_rfid],
  );

  return mapBook(rows[0]);
}

export async function updateBook(input: {
  id_livro: number;
  etiqueta_rfid: string;
  nome_livro: string;
  status: CatalogBook["status"];
}) {
  const statusLivro = input.status === "EMPRESTADO" ? "EMPRESTADO" : "DISPONIVEL";
  const { rows } = await query<BookRow>(
    `UPDATE livros SET etiqueta_rfid = $2, nome_livro = $3, status_livro = $4::status_livro_enum
     WHERE id_livro = $1
     RETURNING id_livro, etiqueta_rfid, nome_livro, autor_livro, id_localizacao,
       status_livro::text AS status_livro, NULL::varchar AS setor, NULL::varchar AS estante,
       NULL::varchar AS divisoria, NULL::integer AS numero`,
    [input.id_livro, input.etiqueta_rfid, input.nome_livro, statusLivro],
  );

  return rows[0] ? mapBook(rows[0]) : null;
}
