"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionPlaceholder } from "@/components/layout/section-placeholder";
import { LibraryContent } from "@/components/library/library-content";
import { StudentRfidPanel } from "@/components/student/student-rfid-panel";
import {
  catalogBooks as mockCatalogBooks,
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

async function apiData<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error ?? "API LibCore indisponível.");
  return payload.data as T;
}

async function auditAluno(acao: string, detalhes: Record<string, unknown>) {
  await fetch("/api/v1/auditoria", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_usuario: 1, acao, entidade: "aluno_web", detalhes }),
  }).catch(() => undefined);
}

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
  const [catalogBooks, setCatalogBooks] = useState<CatalogBook[]>(mockCatalogBooks);
  const [selectedBookId, setSelectedBookId] = useState(1);
  const [reservedSpaceIds, setReservedSpaceIds] = useState<string[]>([]);
  const [renewedLoanIds, setRenewedLoanIds] = useState<number[]>([]);
  const [ticketDescription, setTicketDescription] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [activity, setActivity] = useState(
    "Biblioteca carregada. RFID/NFC pronto para consulta.",
  );

  useEffect(() => {
    auditAluno("USUARIO_ENTROU", { origem: "front-totem-aluno" });
    apiData<CatalogBook[]>("/api/v1/livros")
      .then((books) => {
        if (books.length > 0) {
          setCatalogBooks(books);
          setSelectedBookId(books[0].id_livro);
          setActivity("Acervo carregado da API LibCore/PostgreSQL.");
        }
      })
      .catch(() => {
        setCatalogBooks(mockCatalogBooks);
        setActivity("Modo apresentação: acervo mockado carregado para celular.");
      });
  }, []);

  const selectedBook =
    catalogBooks.find((book) => book.id_livro === selectedBookId) ??
    catalogBooks[0] ??
    mockCatalogBooks[0];

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
  }, [catalogBooks, searchTerm, setor, statusFilter]);

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
      setActivity("Biblioteca aberta. Acervo e RFID prontos para consulta.");
      return;
    }

    if (sectionId === "sair") {
      auditAluno("USUARIO_SAIU", { origem: "front-totem-aluno" });
      setActivity("Saída registrada para o administrador.");
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
        setActivity("Notificações do aluno carregadas para apresentação.")
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
        <>
          <div className="px-5 pt-6 md:px-8 lg:px-10">
            <StudentRfidPanel />
          </div>
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
        </>
      ) : (
        <SectionPlaceholder
          activeSection={activeSection}
          activity={activity}
        />
      )}
    </AppShell>
  );
}
