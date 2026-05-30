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

export type TipoUsuario = "LEITOR" | "BIBLIOTECARIO" | "ADMIN" | "TOTEM";

export type Usuario = {
  id_usuario: number;
  nome_usuario: string;
  email_usuario: string;
  cpf_usuario: string;
  facial_usuario: string | null;
  tipo_usuario: TipoUsuario;
  token_validacao?: string | null;
  token_validacao_ativo?: boolean;
  token_validacao_gerado_em?: string | null;
};

export type Livro = {
  id_livro: number;
  etiqueta_rfid: string;
  nome_livro: string;
  autor_livro?: string | null;
  categoria_livro?: string | null;
  isbn_livro?: string | null;
  status_livro?: CatalogBookStatus;
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

export type CatalogBookStatus =
  | "DISPONIVEL"
  | "EMPRESTADO"
  | "RESERVADO"
  | "MANUTENCAO"
  | "INDISPONIVEL";

export type CatalogBook = Livro & {
  localizacao: LocalizacaoLivro | null;
  status: CatalogBookStatus;
  statusLabel: string;
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

export type Espaco = {
  id_espaco: number;
  nome_espaco: string;
  tipo_espaco: "SALA_ESTUDO" | "MESA_INDIVIDUAL" | "AREA_LEITURA";
  capacidade: number;
  ativo: boolean | number;
};

export type Reserva = {
  id_reserva: number;
  id_usuario: number;
  id_espaco: number;
  nome_espaco?: string;
  data_reserva: string;
  horario_inicio: string;
  horario_fim: string;
  status_reserva: "CONFIRMADA" | "CANCELADA" | "FINALIZADA";
};

export type Notificacao = {
  id_notificacao: number;
  id_usuario: number | null;
  titulo: string;
  mensagem: string;
  tipo: "AVISO" | "RESERVA" | "DEVOLUCAO" | "MULTA" | "SISTEMA";
  lida: boolean | number;
  data_criacao: string;
};

export type Multa = {
  id_multa: number;
  id_usuario: number;
  valor: string | number;
  motivo: string;
  status_multa: "ABERTA" | "PAGA" | "CANCELADA";
  data_criacao: string;
};

export type TokenValidacao = {
  id_usuario: number;
  token_validacao: string | null;
  token_validacao_ativo: boolean;
  token_validacao_gerado_em: string | null;
};

export type RespostaApi<T> = {
  dados: T;
  metadados?: Record<string, unknown>;
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

