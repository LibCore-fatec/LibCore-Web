"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionPlaceholder } from "@/components/layout/section-placeholder";
import { LibraryContent } from "@/components/library/library-content";
import {
  books,
  initialTickets,
  navItems,
  studentProfile,
} from "@/lib/mock-data";
import type { Book, LibraryTab, SectionId, Ticket } from "@/lib/types";

export function StudentDashboard() {
  const [activeSection, setActiveSection] =
    useState<SectionId>("biblioteca");
  const [activeTab, setActiveTab] = useState<LibraryTab>("acervo");
  const [collapsed, setCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("Todas");
  const [selectedBookId, setSelectedBookId] = useState("b1");
  const [reservedBookIds, setReservedBookIds] = useState<string[]>([]);
  const [reservedSpaceIds, setReservedSpaceIds] = useState<string[]>([]);
  const [renewedLoanIds, setRenewedLoanIds] = useState<string[]>([]);
  const [ticketDescription, setTicketDescription] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [activity, setActivity] = useState(
    "Biblioteca carregada com dados mockados do aluno João.",
  );

  const selectedBook =
    books.find((book) => book.id === selectedBookId) ?? books[0];

  const filteredBooks = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();

    return books.filter((book) => {
      const matchesCategory = category === "Todas" || book.category === category;
      const searchable =
        `${book.title} ${book.author} ${book.category} ${book.location}`.toLowerCase();

      return matchesCategory && (!normalized || searchable.includes(normalized));
    });
  }, [category, searchTerm]);

  const availableCount = books.filter(
    (book) =>
      book.status === "Disponível" && !reservedBookIds.includes(book.id),
  ).length;

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

  function reserveBook(book: Book) {
    if (book.status !== "Disponível" || reservedBookIds.includes(book.id)) {
      setActivity(`"${book.title}" não está disponível para nova reserva.`);
      return;
    }

    setReservedBookIds((current) => [...current, book.id]);
    setSelectedBookId(book.id);
    setActivity(
      `Reserva criada para "${book.title}". Retire no totem RFID até 18:00.`,
    );
  }

  function openMap(book: Book) {
    setSelectedBookId(book.id);
    setActiveTab("mapa");
    setActivity(`Mapa atualizado para localizar "${book.title}".`);
  }

  function reserveSpace(spaceId: string, spaceName: string) {
    if (reservedSpaceIds.includes(spaceId)) {
      setActivity(`${spaceName} já está na sua agenda de reservas.`);
      return;
    }

    setReservedSpaceIds((current) => [...current, spaceId]);
    setActivity(`Reserva confirmada para ${spaceName}.`);
  }

  function renewLoan(loanId: string, title: string) {
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
        id: `t${current.length + 1}`,
        title: description,
        status: "Aberto",
        updatedAt: "Criado agora",
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
          category={category}
          filteredBooks={filteredBooks}
          isReserved={(bookId) => reservedBookIds.includes(bookId)}
          renewedLoanIds={renewedLoanIds}
          reservedBookIds={reservedBookIds}
          reservedSpaceIds={reservedSpaceIds}
          searchTerm={searchTerm}
          selectedBook={selectedBook}
          ticketDescription={ticketDescription}
          tickets={tickets}
          onCategoryChange={setCategory}
          onCreateTicket={createTicket}
          onOpenMap={openMap}
          onReserveBook={reserveBook}
          onReserveSpace={reserveSpace}
          onRenewLoan={renewLoan}
          onSearchChange={setSearchTerm}
          onSelectBook={setSelectedBookId}
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
