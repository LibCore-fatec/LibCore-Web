import type {
  BookStatusFilter,
  CatalogBook,
  LibraryTabItem,
  LoanRecord,
  LocalizacaoLivro,
  Livro,
  NavItem,
  StudentProfile,
  StudySpace,
  Ticket,
  TipoTransacao,
  Transacao,
  Usuario,
} from "@/lib/types";

export const usuarios: Usuario[] = [
  {
    id_usuario: 1,
    nome_usuario: "JoÃ£o",
    email_usuario: "joao.pereira@fatec.sp.gov.br",
    cpf_usuario: "12345678901",
    facial_usuario: null,
    tipo_usuario: "LEITOR",
  },
];

const currentUser = usuarios[0];

export const studentProfile: StudentProfile = {
  name: currentUser.nome_usuario,
  initials: "JP",
  course: "ADS",
  semester: "4Âº semestre",
  campus: "Fatec Registro",
};

export const navItems: NavItem[] = [
  { id: "academies", label: "Academies", icon: "academy", external: true },
  { id: "eventos", label: "Eventos", icon: "calendar" },
  { id: "extensao", label: "ExtensÃ£o", icon: "spark" },
  { id: "projetos", label: "Projetos", icon: "lightbulb", beta: true },
  { id: "qte", label: "QTE", icon: "academy", beta: true },
  { id: "praticas", label: "PrÃ¡ticas", icon: "terminal", beta: true },
  { id: "biblioteca", label: "Biblioteca", icon: "book" },
  { id: "sair", label: "Sair", icon: "signOut" },
];

export const libraryTabs: LibraryTabItem[] = [
  { id: "acervo", label: "Acervo", icon: "bookSearch" },
  { id: "historico", label: "HistÃ³rico", icon: "clock" },
  { id: "espacos", label: "EspaÃ§os", icon: "room" },
  { id: "mapa", label: "Mapa", icon: "map" },
  { id: "tickets", label: "Tickets", icon: "ticket" },
];

export const localizacaoLivro: LocalizacaoLivro[] = [
  { id_localizacao: 1, setor: "A", estante: "04", divisoria: "02", numero: 12 },
  { id_localizacao: 2, setor: "B", estante: "02", divisoria: "01", numero: 8 },
  { id_localizacao: 3, setor: "C", estante: "01", divisoria: "03", numero: 21 },
  { id_localizacao: 4, setor: "A", estante: "07", divisoria: "04", numero: 4 },
  { id_localizacao: 5, setor: "D", estante: "05", divisoria: "02", numero: 16 },
  { id_localizacao: 6, setor: "E", estante: "03", divisoria: "01", numero: 9 },
];

export const livros: Livro[] = [
  {
    id_livro: 1,
    etiqueta_rfid: "RFID-TEC-1842",
    nome_livro: "Engenharia de Software Moderna",
    id_localizacao: 1,
  },
  {
    id_livro: 2,
    etiqueta_rfid: "RFID-TEC-2145",
    nome_livro: "Banco de Dados",
    id_localizacao: 2,
  },
  {
    id_livro: 3,
    etiqueta_rfid: "RFID-DES-0931",
    nome_livro: "Design Centrado no UsuÃ¡rio",
    id_localizacao: 3,
  },
  {
    id_livro: 4,
    etiqueta_rfid: "RFID-RED-7710",
    nome_livro: "Redes de Computadores",
    id_localizacao: 4,
  },
  {
    id_livro: 5,
    etiqueta_rfid: "RFID-IA-4098",
    nome_livro: "InteligÃªncia Artificial",
    id_localizacao: 5,
  },
  {
    id_livro: 6,
    etiqueta_rfid: "RFID-GES-6612",
    nome_livro: "GestÃ£o de Projetos",
    id_localizacao: 6,
  },
];

export const transacoes: Transacao[] = [
  {
    id_transacao: 1,
    tipo: "EMPRESTIMO",
    data: "2026-05-23T09:00:00",
    id_usuario: 1,
    id_livro: 2,
  },
  {
    id_transacao: 2,
    tipo: "DEVOLUCAO",
    data: "2026-05-14T16:20:00",
    id_usuario: 1,
    id_livro: 4,
  },
  {
    id_transacao: 3,
    tipo: "RESERVA",
    data: "2026-05-29T10:40:00",
    id_usuario: 1,
    id_livro: 5,
  },
];

export const tickets: Ticket[] = [
  {
    id_ticket: 1,
    data_criacao: "2026-05-30T08:32:00",
    data_finalizacao: null,
    status: "EM_ANDAMENTO",
    tipo: "LOCALIZACAO",
    descricao: "Livro de redes fora da prateleira indicada",
    id_usuario: 1,
  },
  {
    id_ticket: 2,
    data_criacao: "2026-05-29T17:15:00",
    data_finalizacao: null,
    status: "ABERTO",
    tipo: "RFID",
    descricao: "Leitor RFID do totem 02 indisponÃ­vel",
    id_usuario: 1,
  },
];

function getLocation(id_localizacao: number | null) {
  return (
    localizacaoLivro.find(
      (localizacao) => localizacao.id_localizacao === id_localizacao,
    ) ?? null
  );
}

export function formatLocation(localizacao: LocalizacaoLivro | null) {
  if (!localizacao) {
    return "LocalizaÃ§Ã£o nÃ£o cadastrada";
  }

  return `Setor ${localizacao.setor}, Estante ${localizacao.estante}, DivisÃ³ria ${localizacao.divisoria}, NÂº ${localizacao.numero}`;
}

function getLatestTransaction(id_livro: number) {
  return transacoes
    .filter((transacao) => transacao.id_livro === id_livro)
    .sort((a, b) => b.data.localeCompare(a.data))[0];
}

function getCatalogStatus(tipo?: TipoTransacao) {
  return tipo === "EMPRESTIMO" || tipo === "RESERVA"
    ? { status: "EMPRESTADO" as const, statusLabel: "Emprestado" as const }
    : { status: "DISPONIVEL" as const, statusLabel: "DisponÃ­vel" as const };
}

export const catalogBooks: CatalogBook[] = livros.map((livro) => {
  const localizacao = getLocation(livro.id_localizacao);
  const latestTransaction = getLatestTransaction(livro.id_livro);
  const catalogStatus = getCatalogStatus(latestTransaction?.tipo);

  return {
    ...livro,
    ...catalogStatus,
    localizacao,
    locationLabel: formatLocation(localizacao),
  };
});

export const loanRecords: LoanRecord[] = transacoes
  .filter((transacao) => transacao.id_usuario === currentUser.id_usuario)
  .map((transacao) => {
    const livro = livros.find((item) => item.id_livro === transacao.id_livro);
    const statusByType = {
      EMPRESTIMO: "Em andamento",
      DEVOLUCAO: "Devolvido",
      RENOVACAO: "Renovado",
      RESERVA: "Reserva",
    } as const;

    return {
      ...transacao,
      livro_nome: livro?.nome_livro ?? "Livro nÃ£o encontrado",
      statusLabel: statusByType[transacao.tipo],
      dateLabel: new Date(transacao.data).toLocaleDateString("pt-BR"),
      dueLabel:
        transacao.tipo === "EMPRESTIMO"
          ? "DevoluÃ§Ã£o em 06/06/2026"
          : statusByType[transacao.tipo],
    };
  })
  .sort((a, b) => b.data.localeCompare(a.data));

export const studySpaces: StudySpace[] = [
  {
    id: "s1",
    name: "Sala de estudo 01",
    type: "Grupo",
    capacity: "6 pessoas",
    time: "Hoje, 14:00-16:00",
  },
  {
    id: "s2",
    name: "Mesa individual 12",
    type: "Individual",
    capacity: "1 pessoa",
    time: "Hoje, 18:00-19:00",
  },
  {
    id: "s3",
    name: "Ãrea de leitura",
    type: "Silenciosa",
    capacity: "12 lugares",
    time: "AmanhÃ£, 09:00-11:00",
  },
];

export const setores = [
  "Todos",
  ...Array.from(new Set(localizacaoLivro.map((localizacao) => localizacao.setor))),
];

export const bookStatusFilters: {
  label: string;
  value: BookStatusFilter;
}[] = [
  { label: "Todos", value: "TODOS" },
  { label: "DisponÃ­vel", value: "DISPONIVEL" },
  { label: "Emprestado", value: "EMPRESTADO" },
];

export function formatTicketStatus(status: Ticket["status"]) {
  const labels = {
    ABERTO: "Aberto",
    EM_ANDAMENTO: "Em andamento",
    FINALIZADO: "Finalizado",
    CANCELADO: "Cancelado",
  };

  return labels[status];
}

