"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionPlaceholder } from "@/components/layout/section-placeholder";
import { LibraryContent } from "@/components/library/library-content";
import {
  catalogBooks,
  tickets as initialTickets,
  navItems,
  studentProfile,
} from "@/lib/mock-data";
import type {
  BookStatusFilter,
  CatalogBook,
  LibraryTab,
  SectionId,
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
  const [selectedBookId, setSelectedBookId] = useState(1);
  const [reservedSpaceIds, setReservedSpaceIds] = useState<string[]>([]);
  const [renewedLoanIds, setRenewedLoanIds] = useState<number[]>([]);
  const [ticketDescription, setTicketDescription] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [activity, setActivity] = useState(
    "Biblioteca carregada com dados mockados do aluno João.",
  );

  const selectedBook =
    catalogBooks.find((book) => book.id_livro === selectedBookId) ??
    catalogBooks[0];

  const filteredBooks = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();

    return catalogBooks.filter((book) => {
      const matchesSetor = setor === "Todos" || book.localizacao?.setor === setor;
      const matchesStatus =
        statusFilter === "TODOS" || book.status === statusFilter;
      const searchable =
        `${book.nome_livro} ${book.rfid_livro} ${book.locationLabel}`.toLowerCase();

      return (
        matchesSetor &&
        matchesStatus &&
        (!normalized || searchable.includes(normalized))
      );
    });
  }, [searchTerm, setor, statusFilter]);

  const availableCount = catalogBooks.filter(
    (book) => book.status === "DISPONIVEL",
  ).length;
  const loanedCount = catalogBooks.length - availableCount;

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
      setActivity("Sessão de demonstração encerrada em modo mockado.");
      return;
    }

    setActivity(`${label} aberto com conteúdo demonstrativo.`);
  }

  function openMap(book: CatalogBook) {
    setSelectedBookId(book.id_livro);
    setActiveTab("mapa");
    setActivity(`Mapa atualizado para localizar "${book.nome_livro}".`);
  }

  function reserveSpace(spaceId: string, spaceName: string) {
    if (reservedSpaceIds.includes(spaceId)) {
      setActivity(`${spaceName} já está na sua agenda de reservas.`);
      return;
    }

    setReservedSpaceIds((current) => [...current, spaceId]);
    setActivity(`Reserva confirmada para ${spaceName}.`);
  }

  function renewLoan(loanId: number, title: string) {
    if (renewedLoanIds.includes(loanId)) {
      setActivity(`A renovação de "${title}" já foi solicitada.`);
      return;
    }

    setRenewedLoanIds((current) => [...current, loanId]);
    setActivity(`Renovação solicitada para "${title}".`);
  }

  function createTicket() {
    const description = ticketDescription.trim();

    if (!description) {
      setActivity("Descreva o problema antes de registrar um ticket.");
      return;
    }

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
    setTicketDescription("");
    setActivity("Ticket registrado para acompanhamento da biblioteca.");
  }

  return (
    <AppShell
      activeSection={activeSection}
      collapsed={collapsed}
      isDark={isDark}
      student={studentProfile}
      onHomeClick={() => selectSection("biblioteca")}
      onNotificationsClick={() =>
        setActivity("3 notificações mockadas aguardam leitura.")
      }
      onProfileClick={() =>
        setActivity(
          `Perfil mockado: ${studentProfile.name}, ${studentProfile.course}, ${studentProfile.semester}.`,
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
          renewedLoanIds={renewedLoanIds}
          reservedSpaceIds={reservedSpaceIds}
          searchTerm={searchTerm}
          selectedBook={selectedBook}
          setor={setor}
          statusFilter={statusFilter}
          ticketDescription={ticketDescription}
          tickets={tickets}
          onCreateTicket={createTicket}
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
