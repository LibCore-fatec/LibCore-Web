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

export type BookStatus = "Disponível" | "Emprestado";

export type Book = {
  id: string;
  title: string;
  author: string;
  category: string;
  status: BookStatus;
  location: string;
  isbn: string;
  rfid: string;
  coverFrom: string;
  coverTo: string;
  summary: string;
};

export type LoanRecord = {
  id: string;
  title: string;
  status: "Em andamento" | "Devolvido" | "Multa quitada";
  date: string;
  due: string;
};

export type StudySpace = {
  id: string;
  name: string;
  type: string;
  capacity: string;
  time: string;
};

export type Ticket = {
  id: string;
  title: string;
  status: string;
  updatedAt: string;
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

export type BookStatusFilter = "Todos" | BookStatus;

export type StudentProfile = {
  name: string;
  initials: string;
  course: string;
  semester: string;
  campus: string;
};
