"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import {
  adminNavItems,
  catalogBooks,
  pendingReservations,
  tickets,
  totemAlerts,
} from "@/lib/mock-data";
import type { CatalogBook, SectionId, Ticket, TotemAlert } from "@/lib/types";

type AdminContentProps = {
  activeSection: SectionId;
  activity: string;
  onActivityChange: (message: string) => void;
};

type NDEFReadingEvent = Event & {
  serialNumber?: string;
};

type NDEFReaderInstance = {
  scan: () => Promise<void>;
  onreading: ((event: NDEFReadingEvent) => void) | null;
  onreadingerror: (() => void) | null;
};

declare global {
  interface Window {
    NDEFReader?: new () => NDEFReaderInstance;
  }
}

const adminIds = new Set<SectionId>(adminNavItems.map((item) => item.id));

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function severityClasses(severity: TotemAlert["severity"]) {
  const classes = {
    INFO: "bg-sky-500/12 text-sky-800",
    ATENCAO: "bg-amber-500/16 text-amber-800",
    CRITICO: "bg-red-500/14 text-red-800",
  };

  return classes[severity];
}

function ticketStatusLabel(status: Ticket["status"]) {
  const labels = {
    ABERTO: "Aberto",
    EM_ANDAMENTO: "Em andamento",
    FINALIZADO: "Finalizado",
    CANCELADO: "Cancelado",
  };

  return labels[status];
}

export function AdminContent({
  activeSection,
  activity,
  onActivityChange,
}: AdminContentProps) {
  const section = adminIds.has(activeSection)
    ? activeSection
    : "admin-rfid-register";
  const currentItem =
    adminNavItems.find((item) => item.id === section) ?? adminNavItems[0];
  const [rfidTag, setRfidTag] = useState("RFID-LIB-9034");
  const [isScanning, setIsScanning] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookSearch, setBookSearch] = useState("");
  const [isSearchScanning, setIsSearchScanning] = useState(false);
  const [bookSearchError, setBookSearchError] = useState("");
  const [displayBooks, setDisplayBooks] = useState<CatalogBook[]>(catalogBooks);
  const [selectedBook, setSelectedBook] = useState<CatalogBook | null>(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isEditingBook, setIsEditingBook] = useState(false);
  const [editableBook, setEditableBook] = useState({
    title: "",
    rfid: "",
    location: "",
    status: "DISPONIVEL" as CatalogBook["status"],
  });
  const [resolvedTicketIds, setResolvedTicketIds] = useState<number[]>([]);
  const [reservationStatus, setReservationStatus] = useState<
    Record<number, "CONFIRMADA" | "RECUSADA">
  >({});

  const filteredBooks = useMemo(() => {
    const normalized = bookSearch.trim().toLowerCase();

    if (!normalized) {
      return displayBooks;
    }

    return displayBooks.filter((book) =>
      `${book.nome_livro} ${book.rfid_livro} ${book.locationLabel}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [bookSearch, displayBooks]);

  function openBookDetails(book: CatalogBook) {
    setSelectedBook(book);
    setEditableBook({
      title: book.nome_livro,
      rfid: book.rfid_livro,
      location: book.locationLabel,
      status: book.status,
    });
    setIsEditingBook(false);
    setIsBookModalOpen(true);
    setBookSearchError("");
    onActivityChange(`Livro "${book.nome_livro}" localizado pela etiqueta RFID.`);
  }

  function openBookDetailsByRfid(rfid: string) {
    const normalized = rfid.trim().toLowerCase();
    const book = displayBooks.find(
      (item) => item.rfid_livro.toLowerCase() === normalized,
    );

    if (!book) {
      setBookSearchError("Nenhum livro foi encontrado para esta etiqueta RFID.");
      onActivityChange(`Nenhum livro encontrado para a etiqueta ${rfid}.`);
      return;
    }

    openBookDetails(book);
  }

  function handleBookSearchChange(value: string) {
    setBookSearch(value);
    const normalized = value.trim().toLowerCase();

    if (!normalized) {
      setBookSearchError("");
      return;
    }

    const exactBook = displayBooks.find(
      (book) => book.rfid_livro.toLowerCase() === normalized,
    );

    if (exactBook && selectedBook?.id_livro !== exactBook.id_livro) {
      openBookDetails(exactBook);
    }
  }

  function closeBookModal() {
    setIsBookModalOpen(false);
    setIsEditingBook(false);
    setSelectedBook(null);
  }

  function saveBookEdit() {
    if (!selectedBook) {
      return;
    }

    const statusLabel =
      editableBook.status === "DISPONIVEL" ? "Disponível" : "Emprestado";

    const updatedBook: CatalogBook = {
      ...selectedBook,
      nome_livro: editableBook.title.trim() || selectedBook.nome_livro,
      rfid_livro: editableBook.rfid.trim() || selectedBook.rfid_livro,
      locationLabel: editableBook.location.trim() || selectedBook.locationLabel,
      status: editableBook.status,
      statusLabel,
    };

    setDisplayBooks((current) =>
      current.map((book) =>
        book.id_livro === selectedBook.id_livro ? updatedBook : book,
      ),
    );
    setSelectedBook(updatedBook);
    setBookSearch(updatedBook.rfid_livro);
    setIsEditingBook(false);
    onActivityChange(`Informações de "${updatedBook.nome_livro}" atualizadas.`);
  }

  async function iniciarLeituraNFC(target: "register" | "search" = "register") {
    const setTargetError =
      target === "register" ? setMensagemErro : setBookSearchError;
    const setTargetScanning =
      target === "register" ? setIsScanning : setIsSearchScanning;
    const successMessage =
      target === "register"
        ? "Etiqueta RFID lida para cadastro."
        : "Etiqueta RFID lida para busca.";

    setTargetError("");

    if (!("NDEFReader" in window) || !window.NDEFReader) {
      setTargetError("Seu dispositivo/navegador não suporta NFC.");
      return;
    }

    try {
      setTargetScanning(true);
      onActivityChange("Aproxime a etiqueta RFID/NFC do celular.");

      const ndef = new window.NDEFReader();
      await ndef.scan();

      ndef.onreading = (event) => {
        const serialNumber = event.serialNumber;

        if (!serialNumber) {
          setTargetError("Etiqueta lida, mas o ID não foi identificado.");
          setTargetScanning(false);
          return;
        }

        if (target === "register") {
          setRfidTag(serialNumber);
        } else {
          setBookSearch(serialNumber);
          openBookDetailsByRfid(serialNumber);
        }

        setTargetError("");
        setTargetScanning(false);
        onActivityChange(`${successMessage} ID: ${serialNumber}`);
      };

      ndef.onreadingerror = () => {
        setTargetError("Não foi possível ler a etiqueta. Tente novamente.");
        setTargetScanning(false);
      };
    } catch {
      setTargetError(
        "Não foi possível iniciar a leitura NFC. Verifique as permissões e tente novamente.",
      );
      setTargetScanning(false);
    }
  }

  function registerBook() {
    const title = bookTitle.trim();
    const author = bookAuthor.trim();
    const tag = rfidTag.trim();

    if (!title || !author || !tag) {
      onActivityChange("Preencha RFID, título e autor antes de registrar.");
      return;
    }

    onActivityChange(`Livro "${title}" registrado com a etiqueta ${tag}.`);
    setBookTitle("");
    setBookAuthor("");
  }

  function updateBook(book: CatalogBook) {
    openBookDetails(book);
  }

  function setReservation(id: number, status: "CONFIRMADA" | "RECUSADA") {
    setReservationStatus((current) => ({ ...current, [id]: status }));
    onActivityChange(
      status === "CONFIRMADA"
        ? "Reserva confirmada para retirada no período indicado."
        : "Reserva recusada e aluno será notificado.",
    );
  }

  function resolveTicket(ticket: Ticket) {
    setResolvedTicketIds((current) =>
      current.includes(ticket.id_ticket)
        ? current
        : [...current, ticket.id_ticket],
    );
    onActivityChange(`Ticket #${ticket.id_ticket} marcado como resolvido.`);
  }

  return (
    <section className="px-5 py-6 md:px-8 lg:px-10">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-[var(--cps-accent)]">
            Admin biblioteca
          </p>
          <h2 className="mt-1 text-3xl font-semibold text-[var(--cps-text)]">
            {currentItem.label}
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-[var(--cps-text-muted)]">
            {currentItem.description}
          </p>
        </div>

        <div className="rounded-lg border border-[var(--cps-border)] bg-[var(--cps-card-layer)] px-4 py-3 text-sm text-[var(--cps-text-muted)] shadow-sm">
          {activity}
        </div>
      </div>

      {section === "admin-rfid-register" && (
        <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
          <form className="cps-card p-5" onSubmit={(event) => event.preventDefault()}>
            <h3 className="text-xl font-semibold">Novo cadastro RFID</h3>
            <p className="mt-1 text-sm text-[var(--cps-text-muted)]">
              Vincule a etiqueta física ao livro antes de liberar o exemplar.
            </p>

            <label className="mt-5 block text-sm font-semibold" htmlFor="rfid-tag">
              Etiqueta RFID
            </label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                className="h-9 min-w-0 flex-1 rounded-sm border border-[var(--cps-border)] bg-[var(--cps-card-muted)] px-3 text-sm outline-none read-only:text-[var(--cps-text-muted)]"
                id="rfid-tag"
                readOnly={isScanning}
                value={rfidTag}
                onChange={(event) => setRfidTag(event.target.value)}
              />
              <button
                className={`h-9 rounded-md px-8 text-sm font-semibold text-white transition disabled:cursor-not-allowed ${
                  isScanning
                    ? "animate-pulse bg-[var(--cps-brand)] opacity-85"
                    : "bg-[var(--cps-accent)] hover:opacity-90"
                }`}
                disabled={isScanning}
                onClick={() => iniciarLeituraNFC("register")}
                type="button"
              >
                {isScanning ? "Aproxime a tag..." : "Escanear"}
              </button>
            </div>
            {mensagemErro && (
              <p className="mt-2 text-sm font-semibold text-red-700">
                {mensagemErro}
              </p>
            )}

            <label className="mt-4 block text-sm font-semibold" htmlFor="book-title">
              Título do livro
            </label>
            <input
              className="mt-2 h-9 w-full rounded-sm border border-[var(--cps-border)] bg-[var(--cps-card-muted)] px-3 text-sm outline-none"
              id="book-title"
              value={bookTitle}
              onChange={(event) => setBookTitle(event.target.value)}
            />

            <label className="mt-4 block text-sm font-semibold" htmlFor="book-author">
              Autor
            </label>
            <input
              className="mt-2 h-9 w-full rounded-sm border border-[var(--cps-border)] bg-[var(--cps-card-muted)] px-3 text-sm outline-none"
              id="book-author"
              value={bookAuthor}
              onChange={(event) => setBookAuthor(event.target.value)}
            />

            <button
              className="mt-5 h-9 rounded-md bg-[var(--cps-accent)] px-10 text-sm font-semibold text-white transition hover:opacity-90"
              onClick={registerBook}
              type="button"
            >
              Registrar livro
            </button>
          </form>

          <div className="cps-card p-5">
            <h3 className="text-xl font-semibold">Ultimas etiquetas lidas</h3>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {displayBooks.slice(0, 4).map((book) => (
                <div
                  className="rounded-lg border border-[var(--cps-border)] bg-[var(--cps-card-muted)] p-4"
                  key={book.id_livro}
                >
                  <p className="text-sm font-semibold text-[var(--cps-accent)]">
                    {book.rfid_livro}
                  </p>
                  <p className="mt-1 font-semibold">{book.nome_livro}</p>
                  <p className="mt-2 text-sm text-[var(--cps-text-muted)]">
                    {book.locationLabel}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {section === "admin-books-edit" && (
        <div className="cps-card p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h3 className="text-xl font-semibold">Livros cadastrados</h3>
              <p className="mt-1 text-sm text-[var(--cps-text-muted)]">
                Busque por título, RFID ou localização para editar o registro.
              </p>
            </div>
            <div className="w-full max-w-sm">
              <label className="block text-sm font-semibold" htmlFor="book-search">
                Buscar livro
              </label>
              <input
                className="mt-2 h-9 w-full rounded-sm border border-[var(--cps-border)] bg-[var(--cps-card-muted)] px-3 text-sm outline-none"
                id="book-search"
                readOnly={isSearchScanning}
                value={bookSearch}
                onChange={(event) => handleBookSearchChange(event.target.value)}
              />
              <button
                className={`mt-2 h-9 w-full rounded-md px-8 text-sm font-semibold text-white transition disabled:cursor-not-allowed ${
                  isSearchScanning
                    ? "animate-pulse bg-[var(--cps-brand)] opacity-85"
                    : "bg-[var(--cps-accent)] hover:opacity-90"
                }`}
                disabled={isSearchScanning}
                onClick={() => iniciarLeituraNFC("search")}
                type="button"
              >
                {isSearchScanning ? "Aproxime a tag..." : "Escanear"}
              </button>
              {bookSearchError && (
                <p className="mt-2 text-sm font-semibold text-red-700">
                  {bookSearchError}
                </p>
              )}
            </div>
          </div>

          <div className="mt-5 divide-y divide-[var(--cps-border)] overflow-hidden rounded-lg border border-[var(--cps-border)]">
            {filteredBooks.map((book) => (
              <div
                className="grid gap-3 bg-[var(--cps-card-layer)] p-4 md:grid-cols-[1fr_auto] md:items-center"
                key={book.id_livro}
              >
                <div>
                  <p className="font-semibold">{book.nome_livro}</p>
                  <p className="mt-1 text-sm text-[var(--cps-text-muted)]">
                    {book.rfid_livro} · {book.locationLabel}
                  </p>
                </div>
                <button
                  className="h-9 rounded-md border border-[var(--cps-border-strong)] px-8 text-sm font-semibold transition hover:bg-[var(--cps-card-muted)]"
                  onClick={() => updateBook(book)}
                  type="button"
                >
                  Editar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {section === "admin-reservations" && (
        <div className="grid gap-4 xl:grid-cols-3">
          {pendingReservations.map((reservation) => {
            const status = reservationStatus[reservation.id];

            return (
              <article className="cps-card p-5" key={reservation.id}>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--cps-accent-soft)] text-[var(--cps-accent)]">
                  <Icon name="calendar" className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-[var(--cps-accent)]">
                  {reservation.studentName}
                </p>
                <h3 className="mt-1 text-xl font-semibold">
                  {reservation.bookTitle}
                </h3>
                <p className="mt-3 text-sm text-[var(--cps-text-muted)]">
                  {reservation.course}
                </p>
                <p className="mt-2 text-sm text-[var(--cps-text-muted)]">
                  Pedido em {formatDateTime(reservation.requestedAt)} ·{" "}
                  {reservation.pickupWindow}
                </p>
                <div className="mt-5 flex gap-2">
                  <button
                    className="h-9 flex-1 rounded-md bg-[var(--cps-accent)] text-sm font-semibold text-white"
                    onClick={() => setReservation(reservation.id, "CONFIRMADA")}
                    type="button"
                  >
                    Confirmar
                  </button>
                  <button
                    className="h-9 flex-1 rounded-md border border-[var(--cps-border-strong)] text-sm font-semibold"
                    onClick={() => setReservation(reservation.id, "RECUSADA")}
                    type="button"
                  >
                    Recusar
                  </button>
                </div>
                {status && (
                  <p className="mt-4 rounded-full bg-[var(--cps-card-muted)] px-3 py-1 text-center text-xs font-semibold text-[var(--cps-accent)]">
                    {status === "CONFIRMADA" ? "Reserva confirmada" : "Reserva recusada"}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}

      {section === "admin-ticket-resolution" && (
        <div className="grid gap-4 lg:grid-cols-2">
          {tickets.map((ticket) => {
            const resolved = resolvedTicketIds.includes(ticket.id_ticket);

            return (
              <article className="cps-card p-5" key={ticket.id_ticket}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-[var(--cps-accent)]">
                      Ticket #{ticket.id_ticket} · {ticket.tipo}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold">
                      {ticket.descricao ?? "Reclamação sem descrição"}
                    </h3>
                  </div>
                  <span className="shrink-0 rounded-full bg-[var(--cps-card-muted)] px-3 py-1 text-xs font-semibold text-[var(--cps-accent)]">
                    {resolved ? "Resolvido" : ticketStatusLabel(ticket.status)}
                  </span>
                </div>
                <p className="mt-4 text-sm text-[var(--cps-text-muted)]">
                  Recebido em {formatDateTime(ticket.data_criacao)}. Analise a
                  reclamação do aluno e registre o encerramento.
                </p>
                <button
                  className="mt-5 h-9 rounded-md bg-[var(--cps-accent)] px-8 text-sm font-semibold text-white disabled:opacity-55"
                  disabled={resolved}
                  onClick={() => resolveTicket(ticket)}
                  type="button"
                >
                  Marcar como resolvido
                </button>
              </article>
            );
          })}
        </div>
      )}

      {section === "admin-alert-history" && (
        <div className="cps-card overflow-hidden">
          <div className="border-b border-[var(--cps-border)] p-5">
            <h3 className="text-xl font-semibold">Alertas dos totens</h3>
            <p className="mt-1 text-sm text-[var(--cps-text-muted)]">
              Histórico operacional gerado automaticamente pelos equipamentos.
            </p>
          </div>
          <div className="divide-y divide-[var(--cps-border)]">
            {totemAlerts.map((alert) => (
              <div
                className="grid gap-3 p-5 lg:grid-cols-[1fr_auto] lg:items-center"
                key={alert.id}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${severityClasses(
                        alert.severity,
                      )}`}
                    >
                      {alert.severity === "ATENCAO" ? "Atenção" : alert.severity}
                    </span>
                    <span className="text-sm text-[var(--cps-text-muted)]">
                      {formatDateTime(alert.createdAt)}
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold">{alert.title}</h3>
                  <p className="mt-1 text-sm text-[var(--cps-text-muted)]">
                    {alert.source}
                  </p>
                </div>
                <span className="w-fit rounded-full bg-[var(--cps-card-muted)] px-3 py-1 text-xs font-semibold text-[var(--cps-accent)]">
                  {alert.status === "EM_ANALISE" ? "Em análise" : alert.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isBookModalOpen && selectedBook && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/62 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="book-details-title"
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg border border-[var(--cps-border)] bg-[var(--cps-card-layer)] p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--cps-border)] pb-4">
              <div>
                <p className="text-sm font-semibold uppercase text-[var(--cps-accent)]">
                  Livro localizado por RFID
                </p>
                <h3
                  className="mt-1 text-2xl font-semibold text-[var(--cps-text)]"
                  id="book-details-title"
                >
                  {selectedBook.nome_livro}
                </h3>
              </div>
              <button
                className="grid h-9 w-9 place-items-center rounded-md border border-[var(--cps-border-strong)] text-xl font-semibold"
                onClick={closeBookModal}
                type="button"
                aria-label="Fechar detalhes do livro"
              >
                ×
              </button>
            </div>

            {!isEditingBook ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-[var(--cps-border)] bg-[var(--cps-card-muted)] p-4">
                  <p className="text-xs font-semibold uppercase text-[var(--cps-text-muted)]">
                    ID do livro
                  </p>
                  <p className="mt-1 font-semibold">{selectedBook.id_livro}</p>
                </div>
                <div className="rounded-lg border border-[var(--cps-border)] bg-[var(--cps-card-muted)] p-4">
                  <p className="text-xs font-semibold uppercase text-[var(--cps-text-muted)]">
                    Etiqueta RFID
                  </p>
                  <p className="mt-1 font-semibold">{selectedBook.rfid_livro}</p>
                </div>
                <div className="rounded-lg border border-[var(--cps-border)] bg-[var(--cps-card-muted)] p-4">
                  <p className="text-xs font-semibold uppercase text-[var(--cps-text-muted)]">
                    Título
                  </p>
                  <p className="mt-1 font-semibold">{selectedBook.nome_livro}</p>
                </div>
                <div className="rounded-lg border border-[var(--cps-border)] bg-[var(--cps-card-muted)] p-4">
                  <p className="text-xs font-semibold uppercase text-[var(--cps-text-muted)]">
                    Status
                  </p>
                  <p className="mt-1 font-semibold">{selectedBook.statusLabel}</p>
                </div>
                <div className="rounded-lg border border-[var(--cps-border)] bg-[var(--cps-card-muted)] p-4 sm:col-span-2">
                  <p className="text-xs font-semibold uppercase text-[var(--cps-text-muted)]">
                    Localização
                  </p>
                  <p className="mt-1 font-semibold">
                    {selectedBook.locationLabel}
                  </p>
                </div>
              </div>
            ) : (
              <form
                className="mt-5 grid gap-4"
                onSubmit={(event) => event.preventDefault()}
              >
                <label className="block text-sm font-semibold" htmlFor="edit-title">
                  Título
                  <input
                    className="mt-2 h-9 w-full rounded-sm border border-[var(--cps-border)] bg-[var(--cps-card-muted)] px-3 text-sm outline-none"
                    id="edit-title"
                    value={editableBook.title}
                    onChange={(event) =>
                      setEditableBook((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="block text-sm font-semibold" htmlFor="edit-rfid">
                  Etiqueta RFID
                  <input
                    className="mt-2 h-9 w-full rounded-sm border border-[var(--cps-border)] bg-[var(--cps-card-muted)] px-3 text-sm outline-none"
                    id="edit-rfid"
                    value={editableBook.rfid}
                    onChange={(event) =>
                      setEditableBook((current) => ({
                        ...current,
                        rfid: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="block text-sm font-semibold" htmlFor="edit-location">
                  Localização
                  <input
                    className="mt-2 h-9 w-full rounded-sm border border-[var(--cps-border)] bg-[var(--cps-card-muted)] px-3 text-sm outline-none"
                    id="edit-location"
                    value={editableBook.location}
                    onChange={(event) =>
                      setEditableBook((current) => ({
                        ...current,
                        location: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="block text-sm font-semibold" htmlFor="edit-status">
                  Status
                  <select
                    className="mt-2 h-9 w-full rounded-sm border border-[var(--cps-border)] bg-[var(--cps-card-muted)] px-3 text-sm outline-none"
                    id="edit-status"
                    value={editableBook.status}
                    onChange={(event) =>
                      setEditableBook((current) => ({
                        ...current,
                        status: event.target.value as CatalogBook["status"],
                      }))
                    }
                  >
                    <option value="DISPONIVEL">Disponível</option>
                    <option value="EMPRESTADO">Emprestado</option>
                  </select>
                </label>
              </form>
            )}

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                className="h-9 rounded-md border border-[var(--cps-border-strong)] px-8 text-sm font-semibold"
                onClick={closeBookModal}
                type="button"
              >
                Fechar
              </button>
              {isEditingBook ? (
                <button
                  className="h-9 rounded-md bg-[var(--cps-accent)] px-8 text-sm font-semibold text-white"
                  onClick={saveBookEdit}
                  type="button"
                >
                  Salvar alterações
                </button>
              ) : (
                <button
                  className="h-9 rounded-md bg-[var(--cps-accent)] px-8 text-sm font-semibold text-white"
                  onClick={() => setIsEditingBook(true)}
                  type="button"
                >
                  Editar informações
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
