"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionPlaceholder } from "@/components/layout/section-placeholder";
import { LibraryContent } from "@/components/library/library-content";
import {
  catalogBooks as fallbackBooks,
  loanRecords as fallbackLoanRecords,
  navItems,
  studentProfile,
  studySpaces as fallbackStudySpaces,
  tickets as fallbackTickets,
} from "@/lib/mock-data";
import {
  emprestimosApi,
  livrosApi,
  reservasApi,
  ticketsApi,
  usuariosApi,
} from "@/lib/api";
import type {
  BookStatusFilter,
  CatalogBook,
  LibraryTab,
  LoanRecord,
  SectionId,
  StudySpace,
  Ticket,
} from "@/lib/types";

export function StudentDashboard() {
  const [activeSection, setActiveSection] =
    useState<SectionId>("biblioteca");
  const [activeTab, setActiveTab] = useState<LibraryTab>("acervo");
  const [collapsed, setCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [setor, setSetor] = useState("Todos");
  const [statusFilter, setStatusFilter] =
    useState<BookStatusFilter>("TODOS");
  const [books, setBooks] = useState<CatalogBook[]>(fallbackBooks);
  const [loanRecords, setLoanRecords] = useState<LoanRecord[]>(fallbackLoanRecords);
  const [studySpaces, setStudySpaces] = useState<StudySpace[]>(fallbackStudySpaces);
  const [selectedBookId, setSelectedBookId] = useState(fallbackBooks[0]?.id_livro ?? 0);
  const [reservedSpaceIds, setReservedSpaceIds] = useState<string[]>([]);
  const [renewedLoanIds, setRenewedLoanIds] = useState<number[]>([]);
  const [ticketDescription, setTicketDescription] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>(fallbackTickets);
  const [tokenValidacao, setTokenValidacao] = useState<string | null>(null);
  const [activity, setActivity] = useState(
    "Biblioteca pronta para sincronizar com a API LibCore.",
  );

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      try {
        const [livros, emprestimos, espacos, ticketsApiDados, token] = await Promise.all([
          livrosApi.listar(),
          emprestimosApi.meus(),
          reservasApi.listarEspacos(),
          ticketsApi.listar(),
          usuariosApi.meuToken().catch(() => null),
        ]);

        if (!ativo) return;
        setBooks(livros.length ? livros : fallbackBooks);
        setLoanRecords(emprestimos.length ? emprestimos : fallbackLoanRecords);
        setStudySpaces(espacos.length ? espacos : fallbackStudySpaces);
        setTickets(ticketsApiDados.length ? ticketsApiDados : fallbackTickets);
        setTokenValidacao(token?.token_validacao_ativo ? token.token_validacao : null);
        setActivity("Dados sincronizados com a API LibCore.");
      } catch {
        if (!ativo) return;
        setActivity("API indisponível ou sem login. Usando dados locais de desenvolvimento.");
      }
    }

    carregarDados();
    return () => {
      ativo = false;
    };
  }, []);

  const selectedBook =
    books.find((book) => book.id_livro === selectedBookId) ??
    books[0] ??
    fallbackBooks[0];

  const setores = useMemo(
    () => ["Todos", ...Array.from(new Set(books.map((book) => book.localizacao?.setor).filter(Boolean))) as string[]],
    [books],
  );

  const filteredBooks = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();

    return books.filter((book) => {
      const matchesSetor = setor === "Todos" || book.localizacao?.setor === setor;
      const matchesStatus =
        statusFilter === "TODOS" || book.status === statusFilter;
      const searchable =
        `${book.nome_livro} ${book.etiqueta_rfid} ${book.locationLabel}`.toLowerCase();

      return (
        matchesSetor &&
        matchesStatus &&
        (!normalized || searchable.includes(normalized))
      );
    });
  }, [books, searchTerm, setor, statusFilter]);

  const availableCount = books.filter(
    (book) => book.status === "DISPONIVEL",
  ).length;
  const loanedCount = books.filter((book) => book.status === "EMPRESTADO").length;

  function selectSection(sectionId: SectionId) {
    setActiveSection(sectionId);
    const label =
      navItems.find((item) => item.id === sectionId)?.label ?? "Biblioteca";

    if (sectionId === "biblioteca") {
      setActiveTab("acervo");
      setActivity("Biblioteca aberta. Acervo e reservas prontos para consulta.");
      return;
    }

    if (sectionId === "sair") {
      setActivity("Sessão encerrada localmente. Remova o token salvo para sair completamente.");
      return;
    }

    setActivity(`${label} aberto com conteúdo demonstrativo.`);
  }

  function openMap(book: CatalogBook) {
    setSelectedBookId(book.id_livro);
    setActiveTab("mapa");
    setActivity(`Mapa atualizado para localizar "${book.nome_livro}".`);
  }

  async function reserveSpace(spaceId: string, spaceName: string) {
    if (reservedSpaceIds.includes(spaceId)) {
      setActivity(`${spaceName} já está na sua agenda de reservas.`);
      return;
    }

    try {
      await reservasApi.criar(Number(spaceId));
      setReservedSpaceIds((current) => [...current, spaceId]);
      setActivity(`Reserva confirmada para ${spaceName}.`);
    } catch {
      setReservedSpaceIds((current) => [...current, spaceId]);
      setActivity(`Reserva local registrada para ${spaceName}; sincronize quando a API estiver disponível.`);
    }
  }

  function renewLoan(loanId: number, title: string) {
    if (renewedLoanIds.includes(loanId)) {
      setActivity(`A renovação de "${title}" já foi solicitada.`);
      return;
    }

    setRenewedLoanIds((current) => [...current, loanId]);
    setActivity(`Renovação solicitada para "${title}".`);
  }

  async function createTicket() {
    const description = ticketDescription.trim();

    if (!description) {
      setActivity("Descreva o problema antes de registrar um ticket.");
      return;
    }

    try {
      const novoTicket = await ticketsApi.criar(description);
      setTickets((current) => [novoTicket, ...current]);
      setActivity("Ticket registrado pela API para acompanhamento da biblioteca.");
    } catch {
      setTickets((current) => [
        {
          id_ticket: current.length + 1,
          data_criacao: new Date().toISOString(),
          data_finalizacao: null,
          status: "ABERTO",
          tipo: "GERAL",
          descricao: description,
          id_usuario: 1,
        },
        ...current,
      ]);
      setActivity("Ticket registrado localmente; sincronize quando a API estiver disponível.");
    }

    setTicketDescription("");
  }

  async function generateToken() {
    try {
      const token = await usuariosApi.gerarToken();
      setTokenValidacao(token.token_validacao);
      setActivity("Token do aluno gerado. Use este código no Mobile Totem Principal.");
    } catch {
      setActivity("Não foi possível gerar token. Faça login no mobile aluno e tente novamente.");
    }
  }

  return (
    <AppShell
      activeSection={activeSection}
      collapsed={collapsed}
      isDark={isDark}
      student={studentProfile}
      onHomeClick={() => selectSection("biblioteca")}
      onNotificationsClick={() =>
        setActivity("Notificações serão carregadas pela API LibCore.")
      }
      onProfileClick={() =>
        setActivity(
          `Perfil: ${studentProfile.name}, ${studentProfile.course}, ${studentProfile.semester}.`,
        )
      }
      onSelectSection={selectSection}
      onToggleCollapsed={() => setCollapsed((current) => !current)}
      onToggleTheme={() => setIsDark((current) => !current)}
    >
      {activeSection === "biblioteca" ? (
        <LibraryContent
          activeTab={activeTab}
          activity={activity}
          availableCount={availableCount}
          filteredBooks={filteredBooks}
          loanedCount={loanedCount}
          loanRecords={loanRecords}
          renewedLoanIds={renewedLoanIds}
          reservedSpaceIds={reservedSpaceIds}
          searchTerm={searchTerm}
          selectedBook={selectedBook}
          setor={setor}
          setores={setores}
          statusFilter={statusFilter}
          studySpaces={studySpaces}
          ticketDescription={ticketDescription}
          tickets={tickets}
          tokenValidacao={tokenValidacao}
          onCreateTicket={createTicket}
          onGenerateToken={generateToken}
          onOpenMap={openMap}
          onReserveSpace={reserveSpace}
          onRenewLoan={renewLoan}
          onSearchChange={setSearchTerm}
          onSelectBook={setSelectedBookId}
          onSetorChange={setSetor}
          onStatusFilterChange={setStatusFilter}
          onTabChange={setActiveTab}
          onTicketDescriptionChange={setTicketDescription}
        />
      ) : (
        <SectionPlaceholder
          activeSection={activeSection}
          activity={activity}
        />
      )}
    </AppShell>
  );
}
