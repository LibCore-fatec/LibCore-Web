export type SectionId =
  | "academies"
  | "eventos"
  | "extensao"
  | "projetos"
  | "qte"
  | "praticas"
  | "biblioteca"
  | "sair";

export type LibraryTab = "acervo" | "historico" | "espacos" | "mapa" | "tickets";

export type IconName =
  | "academy"
  | "alert"
  | "arrowLeft"
  | "bell"
  | "book"
  | "bookSearch"
  | "calendar"
  | "check"
  | "chevronDown"
  | "chevronLeft"
  | "chevronRight"
  | "clock"
  | "external"
  | "home"
  | "lightbulb"
  | "map"
  | "menu"
  | "moon"
  | "rfid"
  | "room"
  | "search"
  | "share"
  | "shield"
  | "signOut"
  | "spark"
  | "sun"
  | "terminal"
  | "ticket"
  | "user";

export type LocalizacaoLivro = {
  id_localizacao: number;
  setor: string;
  estante: string;
  divisoria: string;
  numero: number;
};

export type TipoUsuario = "LEITOR" | "BIBLIOTECARIO" | "ADMIN";

export type Usuario = {
  id_usuario: number;
  nome_usuario: string;
  email_usuario: string;
  cpf_usuario: string;
  facial_usuario: string | null;
  tipo_usuario: TipoUsuario;
};

export type Livro = {
  id_livro: number;
  rfid_livro: string;
  nome_livro: string;
  id_localizacao: number | null;
};

export type TipoTransacao = "EMPRESTIMO" | "DEVOLUCAO" | "RENOVACAO" | "RESERVA";

export type Transacao = {
  id_transacao: number;
  tipo: TipoTransacao;
  data: string;
  id_usuario: number;
  id_livro: number;
};

export type TicketStatus = "ABERTO" | "EM_ANDAMENTO" | "FINALIZADO" | "CANCELADO";

export type Ticket = {
  id_ticket: number;
  data_criacao: string;
  data_finalizacao: string | null;
  status: TicketStatus;
  tipo: string;
  descricao: string | null;
  id_usuario: number;
};

export type CatalogBookStatus = "DISPONIVEL" | "EMPRESTADO";

export type CatalogBook = Livro & {
  localizacao: LocalizacaoLivro | null;
  status: CatalogBookStatus;
  statusLabel: "Disponível" | "Emprestado";
  locationLabel: string;
};

export type LoanRecord = Transacao & {
  livro_nome: string;
  statusLabel: "Em andamento" | "Devolvido" | "Renovado" | "Reserva";
  dateLabel: string;
  dueLabel: string;
};

export type StudySpace = {
  id: string;
  name: string;
  type: string;
  capacity: string;
  time: string;
};

export type NavItem = {
  id: SectionId;
  label: string;
  icon: IconName;
  beta?: boolean;
  external?: boolean;
};

export type LibraryTabItem = {
  id: LibraryTab;
  label: string;
  icon: IconName;
};

export type BookStatusFilter = "TODOS" | CatalogBookStatus;

export type StudentProfile = {
  name: string;
  initials: string;
  course: string;
  semester: string;
  campus: string;
};
