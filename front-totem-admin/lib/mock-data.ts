import type {
  BookStatusFilter,
  CatalogBook,
  LibraryTabItem,
  LoanRecord,
  LocalizacaoLivro,
  Livro,
  AdminNavItem,
  NavItem,
  PendingReservation,
  StudentProfile,
  StudySpace,
  Ticket,
  TotemAlert,
  TipoTransacao,
  Transacao,
  Usuario,
} from "@/lib/types";

export const usuarios: Usuario[] = [
  {
    id_usuario: 1,
    nome_usuario: "João",
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
  semester: "4º semestre",
  campus: "Fatec Registro",
};

export const navItems: NavItem[] = [
  { id: "academies", label: "Academies", icon: "academy", external: true },
  { id: "eventos", label: "Eventos", icon: "calendar" },
  { id: "extensao", label: "Extensão", icon: "spark" },
  { id: "projetos", label: "Projetos", icon: "lightbulb", beta: true },
  { id: "qte", label: "QTE", icon: "academy", beta: true },
  { id: "praticas", label: "Práticas", icon: "terminal", beta: true },
  { id: "sair", label: "Sair", icon: "signOut" },
];

export const adminNavItems: AdminNavItem[] = [
  {
    id: "admin-rfid-register",
    label: "Registrar livro por RFID",
    icon: "rfid",
    description: "Cadastrar livro e vincular etiqueta RFID ao acervo.",
  },
  {
    id: "admin-books-edit",
    label: "Modificar livros",
    icon: "book",
    description: "Alterar dados de livros já cadastrados.",
  },
  {
    id: "admin-reservations",
    label: "Confirmar reservas",
    icon: "calendar",
    description: "Aprovar ou recusar pedidos de reserva dos alunos.",
  },
  {
    id: "admin-ticket-resolution",
    label: "Resolver tickets",
    icon: "ticket",
    description: "Receber reclamações dos alunos e registrar resoluções.",
  },
  {
    id: "admin-alert-history",
    label: "Histórico de alertas",
    icon: "alert",
    description: "Visualizar alertas gerados pelos totens da biblioteca.",
  },
  {
    id: "admin-room",
    label: "Sala, câmera e mapa",
    icon: "room",
    description: "Acompanhar sala de estudo, câmera e mapa operacional da biblioteca.",
  },
];

export const conectaCards = [
  {
    id: 1,
    title: "Workshop FTX - GitHub no desenvolvimento de produtos",
    date: "29/05 das 19:00 as 22:00",
    author: "Giovana Albanes",
    tag: "FINALIZADO",
  },
  {
    id: 2,
    title: "Workshop FTX - Ética em inteligência artificial",
    date: "29/05 das 19:00 as 22:00",
    author: "Gustavo Kletelinger",
    tag: "FINALIZADO",
  },
  {
    id: 3,
    title: "Workshop FTX - Fundamentos no desenvolvimento de games",
    date: "29/05 das 19:00 as 22:00",
    author: "Raphael Pedretti",
    tag: "FINALIZADO",
  },
  {
    id: 4,
    title: "Workshop FTX - Python para iniciantes",
    date: "29/05 das 19:00 as 22:00",
    author: "Ana Kunzendorff",
    tag: "FINALIZADO",
  },
  {
    id: 5,
    title: "FTX 2026",
    date: "de 28/05 a 30/05 das 19:00 as 22:00",
    author: "Fatec Registro",
    tag: "FINALIZADO",
  },
  {
    id: 6,
    title: "Workshop FTX - IoT com MQTT e fluxos Node-RED",
    date: "28/05 das 19:00 as 22:00",
    author: "Isabela Chaves",
    tag: "FINALIZADO",
  },
];

export const libraryTabs: LibraryTabItem[] = [
  { id: "acervo", label: "Acervo", icon: "bookSearch" },
  { id: "historico", label: "Histórico", icon: "clock" },
  { id: "espacos", label: "Espaços", icon: "room" },
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
    rfid_livro: "RFID-TEC-1842",
    nome_livro: "Engenharia de Software Moderna",
    id_localizacao: 1,
  },
  {
    id_livro: 2,
    rfid_livro: "RFID-TEC-2145",
    nome_livro: "Banco de Dados",
    id_localizacao: 2,
  },
  {
    id_livro: 3,
    rfid_livro: "RFID-DES-0931",
    nome_livro: "Design Centrado no Usuário",
    id_localizacao: 3,
  },
  {
    id_livro: 4,
    rfid_livro: "RFID-RED-7710",
    nome_livro: "Redes de Computadores",
    id_localizacao: 4,
  },
  {
    id_livro: 5,
    rfid_livro: "RFID-IA-4098",
    nome_livro: "Inteligência Artificial",
    id_localizacao: 5,
  },
  {
    id_livro: 6,
    rfid_livro: "RFID-GES-6612",
    nome_livro: "Gestão de Projetos",
    id_localizacao: 6,
  },
  {
    id_livro: 7,
    rfid_livro: "53:fd:3a:38:63:00:01",
    nome_livro: "Livro 1",
    id_localizacao: 1,
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
    descricao: "Leitor RFID do totem 02 indisponível",
    id_usuario: 1,
  },
];

export const pendingReservations: PendingReservation[] = [
  {
    id: 1,
    studentName: "Marina Alves",
    course: "ADS - 3º semestre",
    bookTitle: "Inteligência Artificial",
    requestedAt: "2026-05-30T09:15:00",
    pickupWindow: "Hoje, 14:00-18:00",
  },
  {
    id: 2,
    studentName: "Rafael Souza",
    course: "Logística - 2º semestre",
    bookTitle: "Gestão de Projetos",
    requestedAt: "2026-05-30T10:30:00",
    pickupWindow: "Amanha, 08:00-12:00",
  },
  {
    id: 3,
    studentName: "Bianca Lima",
    course: "ADS - 5º semestre",
    bookTitle: "Banco de Dados",
    requestedAt: "2026-05-29T16:05:00",
    pickupWindow: "Hoje, 18:00-21:00",
  },
];

export const totemAlerts: TotemAlert[] = [
  {
    id: 1,
    title: "Leitor RFID com falha de sincronização",
    source: "Totem 02 - Entrada principal",
    severity: "CRITICO",
    createdAt: "2026-05-30T11:42:00",
    status: "NOVO",
  },
  {
    id: 2,
    title: "Livro devolvido sem localização confirmada",
    source: "Totem 01 - Balcão autônomo",
    severity: "ATENCAO",
    createdAt: "2026-05-30T10:18:00",
    status: "EM_ANALISE",
  },
  {
    id: 3,
    title: "Reconhecimento facial indisponível por 3 minutos",
    source: "Totem 03 - Sala de estudos",
    severity: "INFO",
    createdAt: "2026-05-29T18:37:00",
    status: "RESOLVIDO",
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
    return "Localização não cadastrada";
  }

  return `Setor ${localizacao.setor}, Estante ${localizacao.estante}, Divisória ${localizacao.divisoria}, Nº ${localizacao.numero}`;
}

function getLatestTransaction(id_livro: number) {
  return transacoes
    .filter((transacao) => transacao.id_livro === id_livro)
    .sort((a, b) => b.data.localeCompare(a.data))[0];
}

function getCatalogStatus(tipo?: TipoTransacao) {
  return tipo === "EMPRESTIMO" || tipo === "RESERVA"
    ? { status: "EMPRESTADO" as const, statusLabel: "Emprestado" as const }
    : { status: "DISPONIVEL" as const, statusLabel: "Disponível" as const };
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
      livro_nome: livro?.nome_livro ?? "Livro não encontrado",
      statusLabel: statusByType[transacao.tipo],
      dateLabel: new Date(transacao.data).toLocaleDateString("pt-BR"),
      dueLabel:
        transacao.tipo === "EMPRESTIMO"
          ? "Devolução em 06/06/2026"
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
    name: "Área de leitura",
    type: "Silenciosa",
    capacity: "12 lugares",
    time: "Amanhã, 09:00-11:00",
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
  { label: "Disponível", value: "DISPONIVEL" },
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
