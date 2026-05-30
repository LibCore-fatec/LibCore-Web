import type { CatalogBook } from "@/lib/types";

type DemoAuditLog = {
  id_auditoria: number;
  id_usuario: number | null;
  acao: string;
  entidade: string;
  id_entidade: number | null;
  detalhes: Record<string, unknown> | null;
  data_evento: string;
};

const initialDemoBooks: CatalogBook[] = [
  {
    id_livro: 1,
    rfid_livro: "53:fd:3a:38:63:00:01",
    etiqueta_rfid: "53:fd:3a:38:63:00:01",
    nome_livro: "Livro 1",
    autor_livro: "LibCore",
    id_localizacao: 1,
    status: "DISPONIVEL",
    statusLabel: "Disponível",
    locationLabel: "Setor A · Estante 01 · Divisória 01 · Nº 1",
    localizacao: { id_localizacao: 1, setor: "A", estante: "01", divisoria: "01", numero: 1 },
  },
  {
    id_livro: 2,
    rfid_livro: "RFID-TEC-1842",
    etiqueta_rfid: "RFID-TEC-1842",
    nome_livro: "Engenharia de Software Moderna",
    autor_livro: "Ian Sommerville",
    id_localizacao: 2,
    status: "DISPONIVEL",
    statusLabel: "Disponível",
    locationLabel: "Setor A · Estante 04 · Divisória 02 · Nº 12",
    localizacao: { id_localizacao: 2, setor: "A", estante: "04", divisoria: "02", numero: 12 },
  },
  {
    id_livro: 3,
    rfid_livro: "RFID-TEC-2145",
    etiqueta_rfid: "RFID-TEC-2145",
    nome_livro: "Banco de Dados",
    autor_livro: "Elmasri & Navathe",
    id_localizacao: 3,
    status: "EMPRESTADO",
    statusLabel: "Emprestado",
    locationLabel: "Setor B · Estante 02 · Divisória 01 · Nº 8",
    localizacao: { id_localizacao: 3, setor: "B", estante: "02", divisoria: "01", numero: 8 },
  },
  {
    id_livro: 4,
    rfid_livro: "RFID-IA-9001",
    etiqueta_rfid: "RFID-IA-9001",
    nome_livro: "Inteligência Artificial",
    autor_livro: "Russell & Norvig",
    id_localizacao: 4,
    status: "DISPONIVEL",
    statusLabel: "Disponível",
    locationLabel: "Setor C · Estante 01 · Divisória 03 · Nº 21",
    localizacao: { id_localizacao: 4, setor: "C", estante: "01", divisoria: "03", numero: 21 },
  },
];

const initialDemoLogs: DemoAuditLog[] = [
  {
    id_auditoria: 9001,
    id_usuario: 1,
    acao: "USUARIO_ENTROU",
    entidade: "aluno_web",
    id_entidade: 1,
    detalhes: { nome: "João", origem: "totem-aluno" },
    data_evento: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
  {
    id_auditoria: 9002,
    id_usuario: 1,
    acao: "LEITURA_RFID",
    entidade: "livros",
    id_entidade: 1,
    detalhes: { etiqueta_rfid: "53:fd:3a:38:63:00:01", livro: "Livro 1" },
    data_evento: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
  },
  {
    id_auditoria: 9003,
    id_usuario: 1,
    acao: "EMPRESTIMO_RFID",
    entidade: "livros",
    id_entidade: 2,
    detalhes: { etiqueta_rfid: "RFID-TEC-1842", livro: "Engenharia de Software Moderna" },
    data_evento: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
  },
  {
    id_auditoria: 9004,
    id_usuario: 1,
    acao: "DEVOLUCAO_RFID",
    entidade: "livros",
    id_entidade: 3,
    detalhes: { etiqueta_rfid: "RFID-TEC-2145", livro: "Banco de Dados" },
    data_evento: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
  {
    id_auditoria: 9005,
    id_usuario: 1,
    acao: "SALA_FECHADA",
    entidade: "salas",
    id_entidade: 1,
    detalhes: { nome_sala: "Sala de estudo 01", motivo: "Encerramento do período" },
    data_evento: new Date().toISOString(),
  },
];

const globalForDemo = globalThis as unknown as {
  libcoreDemoBooks?: CatalogBook[];
  libcoreDemoLogs?: DemoAuditLog[];
};

function cloneBook(book: CatalogBook): CatalogBook {
  return {
    ...book,
    localizacao: book.localizacao ? { ...book.localizacao } : null,
  };
}

function demoState() {
  if (!globalForDemo.libcoreDemoBooks) {
    globalForDemo.libcoreDemoBooks = initialDemoBooks.map(cloneBook);
  }
  if (!globalForDemo.libcoreDemoLogs) {
    globalForDemo.libcoreDemoLogs = [...initialDemoLogs];
  }

  return {
    books: globalForDemo.libcoreDemoBooks,
    logs: globalForDemo.libcoreDemoLogs,
  };
}

function normalizeRfid(value: string) {
  return value.replace(/[\r\n\t ]+/g, "").trim().toLowerCase();
}

function statusLabel(status: CatalogBook["status"]): CatalogBook["statusLabel"] {
  return status === "DISPONIVEL" ? "Disponível" : "Emprestado";
}

export function getDemoBooks() {
  return demoState().books.map(cloneBook);
}

export function findDemoBookByRfid(etiquetaRfid: string) {
  const normalized = normalizeRfid(etiquetaRfid);
  const book = demoState().books.find(
    (item) => normalizeRfid(item.etiqueta_rfid ?? item.rfid_livro) === normalized,
  );

  return book ? cloneBook(book) : null;
}

export function createDemoBook(input: {
  etiqueta_rfid: string;
  nome_livro: string;
  autor_livro?: string | null;
}) {
  const state = demoState();
  const existing = findDemoBookByRfid(input.etiqueta_rfid);

  if (existing) {
    return existing;
  }

  const created: CatalogBook = {
    id_livro: Date.now(),
    rfid_livro: input.etiqueta_rfid,
    etiqueta_rfid: input.etiqueta_rfid,
    nome_livro: input.nome_livro,
    autor_livro: input.autor_livro ?? null,
    id_localizacao: null,
    status: "DISPONIVEL",
    statusLabel: "Disponível",
    locationLabel: "Localização não cadastrada",
    localizacao: null,
  };

  state.books.unshift(created);
  return cloneBook(created);
}

export function setDemoBookStatus(etiquetaRfid: string, status: CatalogBook["status"]) {
  const state = demoState();
  const normalized = normalizeRfid(etiquetaRfid);
  const index = state.books.findIndex(
    (item) => normalizeRfid(item.etiqueta_rfid ?? item.rfid_livro) === normalized,
  );

  if (index === -1) {
    return null;
  }

  const updated: CatalogBook = {
    ...state.books[index],
    status,
    statusLabel: statusLabel(status),
  };
  state.books[index] = updated;
  return cloneBook(updated);
}

export function getDemoLogs(limit = 50) {
  return demoState().logs.slice(0, Math.min(Math.max(limit, 1), 100));
}

export function createDemoLog(input: {
  id_usuario?: number | null;
  acao: string;
  entidade: string;
  id_entidade?: number | null;
  detalhes?: Record<string, unknown> | null;
}) {
  const state = demoState();
  const log: DemoAuditLog = {
    id_auditoria: Date.now(),
    id_usuario: input.id_usuario ?? null,
    acao: input.acao,
    entidade: input.entidade,
    id_entidade: input.id_entidade ?? null,
    detalhes: input.detalhes ?? null,
    data_evento: new Date().toISOString(),
  };

  state.logs.unshift(log);
  return log;
}

export const demoBooks = getDemoBooks();
export const demoLogs = getDemoLogs();
