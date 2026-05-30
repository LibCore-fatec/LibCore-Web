export type SectionId =
  | "academies"
  | "eventos"
  | "extensao"
  | "projetos"
  | "qte"
  | "praticas"
  | "admin-rfid-register"
  | "admin-books-edit"
  | "admin-reservations"
  | "admin-ticket-resolution"
  | "admin-alert-history"
  | "admin-room"
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
  | "globe"
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
  etiqueta_rfid?: string;
  nome_livro: string;
  autor_livro?: string | null;
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

export type AdminRoomStatus = "ABERTA" | "FECHADA" | "MANUTENCAO";

export type AdminRoom = {
  id: number;
  nome: string;
  status_sala: AdminRoomStatus;
  camera_url: string | null;
  largura_planta: number | null;
  altura_planta: number | null;
  metadata: Record<string, unknown> | null;
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

export type AdminNavItem = NavItem & {
  description: string;
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

export type PendingReservation = {
  id: number;
  studentName: string;
  course: string;
  bookTitle: string;
  requestedAt: string;
  pickupWindow: string;
};

export type TotemAlert = {
  id: number;
  title: string;
  source: string;
  severity: "INFO" | "ATENCAO" | "CRITICO";
  createdAt: string;
  status: "NOVO" | "EM_ANALISE" | "RESOLVIDO";
};
