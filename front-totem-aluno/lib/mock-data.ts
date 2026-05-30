import type {
  Book,
  LibraryTabItem,
  LoanRecord,
  NavItem,
  StudentProfile,
  StudySpace,
  Ticket,
} from "@/lib/types";

export const studentProfile: StudentProfile = {
  name: "João",
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
  { id: "biblioteca", label: "Biblioteca", icon: "book" },
  { id: "sair", label: "Sair", icon: "signOut" },
];

export const libraryTabs: LibraryTabItem[] = [
  { id: "acervo", label: "Acervo", icon: "bookSearch" },
  { id: "historico", label: "Histórico", icon: "clock" },
  { id: "espacos", label: "Espaços", icon: "room" },
  { id: "mapa", label: "Mapa", icon: "map" },
  { id: "tickets", label: "Tickets", icon: "ticket" },
];

export const books: Book[] = [
  {
    id: "b1",
    title: "Engenharia de Software Moderna",
    author: "Marco Tulio Valente",
    category: "Tecnologia",
    status: "Disponível",
    location: "Corredor A, Estante 04, Prateleira 02",
    isbn: "978-65-990971-0-1",
    rfid: "RFID-TEC-1842",
    coverFrom: "#005c6e",
    coverTo: "#48a2b4",
    summary: "Arquitetura, testes, versionamento e práticas modernas.",
  },
  {
    id: "b2",
    title: "Banco de Dados",
    author: "Carlos A. Heuser",
    category: "Tecnologia",
    status: "Emprestado",
    location: "Corredor B, Estante 02, Prateleira 01",
    isbn: "978-85-352-4453-9",
    rfid: "RFID-TEC-2145",
    coverFrom: "#394150",
    coverTo: "#7b8794",
    summary: "Modelagem conceitual, relacional e SQL aplicado.",
  },
  {
    id: "b3",
    title: "Design Centrado no Usuário",
    author: "Travis Lowdermilk",
    category: "Design",
    status: "Disponível",
    location: "Corredor C, Estante 01, Prateleira 03",
    isbn: "978-85-7522-376-1",
    rfid: "RFID-DES-0931",
    coverFrom: "#b20000",
    coverTo: "#e35b5b",
    summary: "Pesquisa, prototipação e validação de interfaces digitais.",
  },
  {
    id: "b4",
    title: "Redes de Computadores",
    author: "Andrew S. Tanenbaum",
    category: "Redes",
    status: "Disponível",
    location: "Corredor A, Estante 07, Prateleira 04",
    isbn: "978-85-430-1443-2",
    rfid: "RFID-RED-7710",
    coverFrom: "#365a68",
    coverTo: "#1c2f3a",
    summary: "Protocolos, camadas, segurança e comunicação em redes.",
  },
  {
    id: "b5",
    title: "Inteligência Artificial",
    author: "Stuart Russell e Peter Norvig",
    category: "Tecnologia",
    status: "Reservado",
    location: "Corredor D, Estante 05, Prateleira 02",
    isbn: "978-85-352-3701-6",
    rfid: "RFID-IA-4098",
    coverFrom: "#1f6f50",
    coverTo: "#8bc7a6",
    summary: "Agentes inteligentes, busca, aprendizado e inferência.",
  },
  {
    id: "b6",
    title: "Gestão de Projetos",
    author: "Harold Kerzner",
    category: "Gestão",
    status: "Disponível",
    location: "Corredor E, Estante 03, Prateleira 01",
    isbn: "978-85-221-1814-0",
    rfid: "RFID-GES-6612",
    coverFrom: "#775f22",
    coverTo: "#d4b15f",
    summary: "Planejamento, escopo, riscos e indicadores de projetos.",
  },
];

export const loanRecords: LoanRecord[] = [
  {
    id: "l1",
    title: "Banco de Dados",
    status: "Em andamento",
    date: "Retirado em 23/05/2026",
    due: "Devolução em 06/06/2026",
  },
  {
    id: "l2",
    title: "Algoritmos: Teoria e Prática",
    status: "Devolvido",
    date: "Retirado em 02/05/2026",
    due: "Devolvido em 14/05/2026",
  },
  {
    id: "l3",
    title: "Comunicação Técnica",
    status: "Multa quitada",
    date: "Retirado em 12/04/2026",
    due: "Atraso de 1 dia resolvido",
  },
];

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

export const categories = ["Todas", "Tecnologia", "Design", "Redes", "Gestão"];

export const initialTickets: Ticket[] = [
  {
    id: "t1",
    title: "Livro de redes fora da prateleira indicada",
    status: "Em análise",
    updatedAt: "Atualizado hoje às 08:32",
  },
  {
    id: "t2",
    title: "Leitor RFID do totem 02 indisponível",
    status: "Encaminhado",
    updatedAt: "Atualizado ontem às 17:15",
  },
];
