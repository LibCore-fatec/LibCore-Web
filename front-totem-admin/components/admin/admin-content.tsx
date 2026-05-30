"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import {
  adminNavItems,
  catalogBooks as fallbackCatalogBooks,
  pendingReservations,
  tickets as mockTickets,
  totemAlerts,
} from "@/lib/mock-data";
import { readRfidFromAvailableReader, type WebRfidReading } from "@/lib/webrfid-adapter";
import type { CatalogBook, SectionId, Ticket, TicketStatus } from "@/lib/types";

type Props = {
  activeSection: SectionId;
  activity: string;
  onActivityChange: (message: string) => void;
};

type ReaderState = "idle" | "connecting" | "waiting" | "found" | "unknown" | "error";
type ApiMode = "postgres" | "demo";

type ApiPayload<T> = {
  data?: T;
  error?: string;
  mode?: ApiMode;
};

type AuditLog = {
  id_auditoria: number;
  acao: string;
  entidade: string;
  detalhes: Record<string, unknown> | null;
  data_evento: string;
};

type Sala = {
  id_sala: number;
  nome_sala: string;
  status_sala: string;
  camera_url: string | null;
  metadata: Record<string, unknown> | null;
};

const adminIds = new Set<SectionId>(adminNavItems.map((item) => item.id));
const ADMIN_USER_ID = Number(process.env.NEXT_PUBLIC_ADMIN_USER_ID ?? 1);

const fallbackLogs: AuditLog[] = [
  {
    id_auditoria: 9001,
    acao: "USUARIO_ENTROU",
    entidade: "admin_web",
    detalhes: { origem: "totem-admin" },
    data_evento: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
  {
    id_auditoria: 9002,
    acao: "LEITURA_RFID",
    entidade: "livros",
    detalhes: { etiqueta_rfid: "53:fd:3a:38:63:00:01", livro: "Livro 1" },
    data_evento: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id_auditoria: 9003,
    acao: "EMPRESTIMO_RFID",
    entidade: "livros",
    detalhes: { etiqueta_rfid: "RFID-TEC-1842", livro: "Engenharia de Software Moderna" },
    data_evento: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
];

const sourceLabel: Record<WebRfidReading["source"], string> = {
  demo: "Demonstração",
  http: "Ponte local",
  keyboard: "Teclado HID",
  manual: "Manual",
  webnfc: "Web NFC",
  webrfid: "WebRFID",
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

async function apiRequest<T>(url: string, init?: RequestInit): Promise<ApiPayload<T>> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const body = (await response.json().catch(() => ({}))) as ApiPayload<T>;
  if (!response.ok) throw new Error(body.error ?? "Falha na API LibCore.");
  return body;
}

function upsertBook(list: CatalogBook[], book: CatalogBook) {
  const found = list.some((item) => item.id_livro === book.id_livro);
  if (!found) return [book, ...list];
  return list.map((item) => (item.id_livro === book.id_livro ? book : item));
}

function StatusBadge({ state }: { state: ReaderState }) {
  const labels = {
    idle: "Pronto",
    connecting: "Conectando",
    waiting: "Consultando",
    found: "Encontrado",
    unknown: "Desconhecido",
    error: "Falha",
  };
  const tone =
    state === "found"
      ? "bg-emerald-50 text-emerald-700"
      : state === "unknown" || state === "error"
        ? "bg-red-50 text-red-700"
        : "bg-[var(--cps-accent-soft)] text-[var(--cps-accent)]";

  return <span className={`rounded-md px-3 py-1 text-xs font-bold uppercase ${tone}`}>{labels[state]}</span>;
}

function PageHeader({ title, description, activity }: { title: string; description: string; activity: string }) {
  return (
    <div className="mb-5 grid gap-4 lg:grid-cols-[1fr_360px] lg:items-end">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--cps-accent)]">Admin biblioteca CPS</p>
        <h2 className="mt-1 text-3xl font-bold text-[var(--cps-text)]">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm text-[var(--cps-text-muted)]">{description}</p>
      </div>
      <div className="rounded-lg border border-[var(--cps-border)] bg-[var(--cps-card-layer)] px-4 py-3 text-sm text-[var(--cps-text-muted)] shadow-sm">
        {activity}
      </div>
    </div>
  );
}

function StatTile({ label, value, icon }: { label: string; value: string | number; icon: "alert" | "book" | "calendar" | "check" | "rfid" | "ticket" }) {
  return (
    <div className="rounded-lg border border-[var(--cps-border)] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--cps-text-muted)]">{label}</p>
        <Icon name={icon} className="h-5 w-5 text-[var(--cps-accent)]" />
      </div>
      <p className="mt-3 text-2xl font-bold text-[var(--cps-text)]">{value}</p>
    </div>
  );
}

function BookSummary({ book, compact = false }: { book: CatalogBook; compact?: boolean }) {
  return (
    <article className="rounded-lg border border-[var(--cps-border)] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="break-all text-xs font-bold uppercase text-[var(--cps-accent)]">{book.etiqueta_rfid ?? book.rfid_livro}</p>
          <h4 className="mt-1 font-bold text-[var(--cps-text)]">{book.nome_livro}</h4>
          {!compact && <p className="mt-1 text-sm text-[var(--cps-text-muted)]">{book.autor_livro ?? "Autor não informado"}</p>}
        </div>
        <span className="shrink-0 rounded-md bg-[var(--cps-accent-soft)] px-3 py-1 text-xs font-bold text-[var(--cps-accent)]">
          {book.statusLabel}
        </span>
      </div>
      <p className="mt-3 text-sm text-[var(--cps-text-muted)]">{book.locationLabel}</p>
    </article>
  );
}

function EmptyPanel({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--cps-border-strong)] bg-white p-8 text-center shadow-sm">
      <h3 className="font-bold text-[var(--cps-text)]">{title}</h3>
      <p className="mt-2 text-sm text-[var(--cps-text-muted)]">{text}</p>
    </div>
  );
}

export function AdminContent({ activeSection, activity, onActivityChange }: Props) {
  const section = adminIds.has(activeSection) ? activeSection : "admin-rfid-register";
  const currentItem = adminNavItems.find((item) => item.id === section) ?? adminNavItems[0];

  const [readerState, setReaderState] = useState<ReaderState>("idle");
  const [apiMode, setApiMode] = useState<ApiMode>("demo");
  const [source, setSource] = useState<WebRfidReading["source"] | null>(null);
  const [rfid, setRfid] = useState("");
  const [manualRfid, setManualRfid] = useState("");
  const [selectedBook, setSelectedBook] = useState<CatalogBook | null>(null);
  const [books, setBooks] = useState<CatalogBook[]>(fallbackCatalogBooks);
  const [logs, setLogs] = useState<AuditLog[]>(fallbackLogs);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [bookQuery, setBookQuery] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [reservationStatus, setReservationStatus] = useState<Record<number, string>>({});
  const [ticketStatus, setTicketStatus] = useState<Record<number, TicketStatus>>({});

  const tickets = useMemo<Ticket[]>(
    () => mockTickets.map((ticket) => ({ ...ticket, status: ticketStatus[ticket.id_ticket] ?? ticket.status })),
    [ticketStatus],
  );

  const filteredBooks = useMemo(() => {
    const normalized = bookQuery.trim().toLowerCase();
    if (!normalized) return books;

    return books.filter((book) =>
      `${book.nome_livro} ${book.autor_livro ?? ""} ${book.rfid_livro} ${book.locationLabel}`.toLowerCase().includes(normalized),
    );
  }, [bookQuery, books]);

  const availableCount = books.filter((book) => book.status === "DISPONIVEL").length;
  const loanedCount = books.length - availableCount;
  const rfidCount = books.filter((book) => book.etiqueta_rfid || book.rfid_livro).length;

  async function refreshBooks() {
    try {
      const payload = await apiRequest<CatalogBook[]>("/api/v1/livros");
      setBooks(payload.data?.length ? payload.data : fallbackCatalogBooks);
      setApiMode(payload.mode ?? "postgres");
    } catch {
      setBooks(fallbackCatalogBooks);
      setApiMode("demo");
    }
  }

  async function loadLogs() {
    try {
      const payload = await apiRequest<AuditLog[]>("/api/v1/admin/auditoria?limit=16");
      setLogs(payload.data?.length ? payload.data : fallbackLogs);
    } catch {
      setLogs(fallbackLogs);
    }
  }

  async function loadSalas() {
    try {
      const payload = await apiRequest<Sala[]>("/api/v1/admin/salas");
      setSalas(payload.data ?? []);
    } catch {
      setSalas([]);
    }
  }

  async function logEvent(acao: string, detalhes: Record<string, unknown>, entidade = "admin_web", idEntidade?: number | null) {
    try {
      await apiRequest<AuditLog>("/api/v1/admin/auditoria", {
        method: "POST",
        body: JSON.stringify({ id_usuario: ADMIN_USER_ID, acao, entidade, id_entidade: idEntidade ?? null, detalhes }),
      });
      await loadLogs();
    } catch {
      setLogs((current) => [
        { id_auditoria: Date.now(), acao, entidade, detalhes, data_evento: new Date().toISOString() },
        ...current,
      ]);
    }
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void refreshBooks();
      void loadLogs();
      void loadSalas();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  async function findByRfid(value: string, readingSource: WebRfidReading["source"] | null = null) {
    const clean = value.trim();
    if (!clean) return;

    setRfid(clean);
    setSelectedBook(null);
    setError("");
    setReaderState("waiting");
    if (readingSource) setSource(readingSource);
    onActivityChange(`RFID ${clean} em consulta.`);

    try {
      const payload = await apiRequest<CatalogBook>(`/api/v1/livros/rfid/${encodeURIComponent(clean)}`);
      if (!payload.data) throw new Error("RFID sem livro retornado.");
      setSelectedBook(payload.data);
      setBooks((current) => upsertBook(current, payload.data as CatalogBook));
      setApiMode(payload.mode ?? "postgres");
      setReaderState("found");
      onActivityChange(`Livro localizado: ${payload.data.nome_livro}.`);
      await logEvent("LEITURA_RFID", { etiqueta_rfid: clean, nome_livro: payload.data.nome_livro }, "livros", payload.data.id_livro);
    } catch (lookupError) {
      setReaderState("unknown");
      setError(lookupError instanceof Error ? lookupError.message : "RFID desconhecido.");
      await logEvent("RFID_DESCONHECIDO", { etiqueta_rfid: clean }, "livros");
    }
  }

  async function scan() {
    setLoading(true);
    setError("");
    setReaderState("connecting");
    setSource(null);

    try {
      const reading = await readRfidFromAvailableReader();
      await findByRfid(reading.etiqueta_rfid, reading.source);
    } catch (scanError) {
      setReaderState("error");
      setError(scanError instanceof Error ? scanError.message : "Leitor RFID indisponível.");
      await logEvent("LEITOR_RFID_INDISPONIVEL", { origem: "admin", mensagem: String(scanError) });
    } finally {
      setLoading(false);
    }
  }

  async function createBook() {
    const etiqueta = rfid.trim() || manualRfid.trim();
    const nomeLivro = title.trim();

    if (!etiqueta || !nomeLivro) {
      setError("Informe RFID e título para cadastrar.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const payload = await apiRequest<CatalogBook>("/api/v1/livros", {
        method: "POST",
        body: JSON.stringify({ etiqueta_rfid: etiqueta, nome_livro: nomeLivro, autor_livro: author.trim() || null }),
      });
      if (!payload.data) throw new Error("Cadastro sem livro retornado.");
      setSelectedBook(payload.data);
      setBooks((current) => upsertBook(current, payload.data as CatalogBook));
      setApiMode(payload.mode ?? "postgres");
      setTitle("");
      setAuthor("");
      onActivityChange(`Etiqueta ${etiqueta} vinculada ao acervo.`);
      await loadLogs();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Falha ao cadastrar RFID.");
    } finally {
      setLoading(false);
    }
  }

  async function loan(action: "emprestimo" | "devolucao") {
    const etiqueta = rfid.trim() || manualRfid.trim() || selectedBook?.etiqueta_rfid || selectedBook?.rfid_livro;
    if (!etiqueta) {
      setError("Leia ou informe uma etiqueta RFID antes da ação.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const payload = await apiRequest<CatalogBook>(`/api/v1/rfid/${action}`, {
        method: "POST",
        body: JSON.stringify({ etiqueta_rfid: etiqueta, id_usuario: ADMIN_USER_ID }),
      });
      if (payload.data) {
        setSelectedBook(payload.data);
        setBooks((current) => upsertBook(current, payload.data as CatalogBook));
      }
      setApiMode(payload.mode ?? "postgres");
      setReaderState("found");
      onActivityChange(action === "emprestimo" ? "Empréstimo RFID registrado." : "Devolução RFID registrada.");
      await loadLogs();
    } catch (loanError) {
      setReaderState("error");
      setError(loanError instanceof Error ? loanError.message : "Falha na operação RFID.");
    } finally {
      setLoading(false);
    }
  }

  async function closeRoom(id: number) {
    try {
      await apiRequest(`/api/v1/admin/salas/${id}/fechar`, {
        method: "PATCH",
        body: JSON.stringify({ id_usuario: ADMIN_USER_ID }),
      });
      await loadSalas();
    } catch {
      setSalas((current) => current.map((sala) => (sala.id_sala === id ? { ...sala, status_sala: "FECHADA" } : sala)));
    }
    await logEvent("SALA_FECHADA", { id_sala: id }, "salas", id);
  }

  async function exitAdmin() {
    await logEvent("USUARIO_SAIU", { origem: "admin_web", tela: section, etiqueta_rfid: rfid || null });
    onActivityChange("Saída registrada em auditoria para o administrador.");
  }

  function setReservation(id: number, status: "Confirmada" | "Recusada") {
    setReservationStatus((current) => ({ ...current, [id]: status }));
    logEvent(status === "Confirmada" ? "RESERVA_CONFIRMADA" : "RESERVA_RECUSADA", { reserva: id }, "reservas", id);
  }

  function setTicket(id: number, status: TicketStatus) {
    setTicketStatus((current) => ({ ...current, [id]: status }));
    const actionByStatus: Record<TicketStatus, string> = {
      ABERTO: "TICKET_REABERTO",
      CANCELADO: "TICKET_CANCELADO",
      EM_ANDAMENTO: "TICKET_EM_ANALISE",
      FINALIZADO: "TICKET_RESOLVIDO",
    };
    logEvent(actionByStatus[status], { ticket: id }, "tickets", id);
  }

  return (
    <section className="px-5 py-6 md:px-8 lg:px-10">
      <PageHeader title={currentItem.label} description={currentItem.description} activity={activity} />

      {section === "admin-rfid-register" && (
        <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
          <div className="space-y-5">
            <div className="cps-card p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-md bg-[var(--cps-accent-soft)] text-[var(--cps-accent)]">
                    <Icon name="rfid" className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold">Leitor RFID</h3>
                    <p className="text-xs font-bold uppercase text-[var(--cps-text-muted)]">
                      {source ? sourceLabel[source] : apiMode === "postgres" ? "PostgreSQL" : "Modo demo"}
                    </p>
                  </div>
                </div>
                <StatusBadge state={readerState} />
              </div>

              <button
                className="mt-5 h-11 w-full rounded-md bg-[var(--cps-accent)] px-6 text-sm font-bold text-white shadow-sm disabled:opacity-60"
                disabled={loading}
                onClick={scan}
                type="button"
              >
                {loading ? "Processando..." : "Ler etiqueta RFID/NFC"}
              </button>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <button
                  className="h-10 rounded-md bg-[var(--cps-brand)] px-4 text-sm font-bold text-white disabled:opacity-60"
                  disabled={loading}
                  onClick={() => loan("emprestimo")}
                  type="button"
                >
                  Emprestar
                </button>
                <button
                  className="h-10 rounded-md border border-[var(--cps-border-strong)] bg-white px-4 text-sm font-bold text-[var(--cps-accent)] disabled:opacity-60"
                  disabled={loading}
                  onClick={() => loan("devolucao")}
                  type="button"
                >
                  Devolver
                </button>
              </div>

              <div className="mt-5 rounded-lg border border-dashed border-[var(--cps-border-strong)] bg-[var(--cps-card-muted)] p-4">
                <label className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--cps-text-muted)]" htmlFor="manual-rfid">
                  RFID manual
                </label>
                <div className="mt-3 flex gap-2">
                  <input
                    className="h-10 min-w-0 flex-1 rounded-md border border-[var(--cps-border)] bg-white px-3 text-sm outline-none"
                    id="manual-rfid"
                    value={manualRfid}
                    onChange={(event) => setManualRfid(event.target.value)}
                    placeholder="RFID-TEC-1842"
                  />
                  <button
                    className="rounded-md border border-[var(--cps-border-strong)] px-4 text-sm font-bold"
                    onClick={() => findByRfid(manualRfid, "manual")}
                    type="button"
                  >
                    Buscar
                  </button>
                </div>
              </div>

              {rfid && <p className="mt-4 break-all rounded-md bg-[var(--cps-accent-soft)] p-3 font-mono text-sm font-bold text-[var(--cps-accent)]">{rfid}</p>}
              {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
            </div>

            <form className="cps-card p-5" onSubmit={(event) => event.preventDefault()}>
              <h3 className="text-lg font-bold">Cadastro por etiqueta</h3>
              <div className="mt-4 grid gap-3">
                <input
                  className="h-10 rounded-md border border-[var(--cps-border)] px-3 text-sm outline-none"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Título do livro"
                />
                <input
                  className="h-10 rounded-md border border-[var(--cps-border)] px-3 text-sm outline-none"
                  value={author}
                  onChange={(event) => setAuthor(event.target.value)}
                  placeholder="Autor"
                />
              </div>
              <button
                className="mt-4 h-10 rounded-md bg-[var(--cps-accent)] px-6 text-sm font-bold text-white disabled:opacity-60"
                disabled={loading}
                onClick={createBook}
                type="button"
              >
                Cadastrar livro
              </button>
            </form>
          </div>

          <div className="space-y-5">
            <div className="grid gap-3 md:grid-cols-3">
              <StatTile icon="rfid" label="Etiquetas" value={rfidCount} />
              <StatTile icon="check" label="Disponíveis" value={availableCount} />
              <StatTile icon="book" label="Emprestados" value={loanedCount} />
            </div>
            {selectedBook ? (
              <div className="cps-card p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--cps-accent)]">Livro ativo no leitor</p>
                <div className="mt-4">
                  <BookSummary book={selectedBook} />
                </div>
              </div>
            ) : (
              <EmptyPanel title="Nenhuma etiqueta ativa" text="O próximo livro lido aparecerá aqui com status, localização e ações RFID." />
            )}
            <div className="cps-card p-5">
              <h3 className="text-lg font-bold">Últimos registros</h3>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {books.slice(0, 4).map((book) => (
                  <button
                    className="text-left"
                    key={book.id_livro}
                    onClick={() => findByRfid(book.etiqueta_rfid ?? book.rfid_livro, "manual")}
                    type="button"
                  >
                    <BookSummary book={book} compact />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {section === "admin-books-edit" && (
        <div className="grid gap-5">
          <div className="grid gap-3 md:grid-cols-4">
            <StatTile icon="book" label="Total" value={books.length} />
            <StatTile icon="check" label="Disponíveis" value={availableCount} />
            <StatTile icon="rfid" label="Com RFID" value={rfidCount} />
            <StatTile icon="alert" label="Pendências" value={tickets.filter((ticket) => ticket.status !== "FINALIZADO").length} />
          </div>
          <div className="cps-card p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h3 className="text-xl font-bold">Gestão do acervo</h3>
                <p className="mt-1 text-sm text-[var(--cps-text-muted)]">Lista operacional de livros, etiquetas e localização física.</p>
              </div>
              <label className="w-full max-w-sm text-sm font-bold" htmlFor="book-query">
                Buscar
                <input
                  className="mt-2 h-10 w-full rounded-md border border-[var(--cps-border)] px-3 text-sm outline-none"
                  id="book-query"
                  value={bookQuery}
                  onChange={(event) => setBookQuery(event.target.value)}
                  placeholder="Título, RFID, autor ou setor"
                />
              </label>
            </div>
            <div className="mt-5 overflow-hidden rounded-lg border border-[var(--cps-border)]">
              {filteredBooks.map((book) => (
                <div className="grid gap-3 border-b border-[var(--cps-border)] bg-white p-4 last:border-b-0 md:grid-cols-[1fr_auto] md:items-center" key={book.id_livro}>
                  <div>
                    <p className="font-bold">{book.nome_livro}</p>
                    <p className="mt-1 text-sm text-[var(--cps-text-muted)]">{book.rfid_livro} · {book.locationLabel}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button className="rounded-md border border-[var(--cps-border-strong)] px-4 py-2 text-xs font-bold" onClick={() => findByRfid(book.rfid_livro, "manual")} type="button">
                      Abrir no RFID
                    </button>
                    <span className="rounded-md bg-[var(--cps-accent-soft)] px-4 py-2 text-xs font-bold text-[var(--cps-accent)]">{book.statusLabel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {section === "admin-reservations" && (
        <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
          <div className="cps-card p-5">
            <h3 className="text-xl font-bold">Fila de reservas</h3>
            <div className="mt-5 space-y-3">
              <StatTile icon="calendar" label="Pendentes" value={pendingReservations.filter((item) => !reservationStatus[item.id]).length} />
              <StatTile icon="check" label="Confirmadas" value={Object.values(reservationStatus).filter((item) => item === "Confirmada").length} />
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-3">
            {pendingReservations.map((reservation) => (
              <article className="rounded-lg border border-[var(--cps-border)] bg-white p-4 shadow-sm" key={reservation.id}>
                <p className="text-xs font-bold uppercase text-[var(--cps-accent)]">{reservationStatus[reservation.id] ?? "Pendente"}</p>
                <h4 className="mt-2 font-bold">{reservation.studentName}</h4>
                <p className="text-sm text-[var(--cps-text-muted)]">{reservation.course}</p>
                <p className="mt-3 font-semibold">{reservation.bookTitle}</p>
                <p className="mt-1 text-sm text-[var(--cps-text-muted)]">Retirada: {reservation.pickupWindow}</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button className="rounded-md bg-[var(--cps-accent)] px-3 py-2 text-xs font-bold text-white" onClick={() => setReservation(reservation.id, "Confirmada")} type="button">Confirmar</button>
                  <button className="rounded-md border border-[var(--cps-border-strong)] px-3 py-2 text-xs font-bold text-[var(--cps-accent)]" onClick={() => setReservation(reservation.id, "Recusada")} type="button">Recusar</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {section === "admin-ticket-resolution" && (
        <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="grid gap-3 lg:grid-cols-2">
            {tickets.map((ticket) => (
              <article className="rounded-lg border border-[var(--cps-border)] bg-white p-4 shadow-sm" key={ticket.id_ticket}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase text-[var(--cps-accent)]">{ticket.tipo}</p>
                    <h4 className="mt-2 font-bold">Ticket #{ticket.id_ticket}</h4>
                  </div>
                  <span className="rounded-md bg-[var(--cps-accent-soft)] px-3 py-1 text-xs font-bold text-[var(--cps-accent)]">{ticket.status}</span>
                </div>
                <p className="mt-3 text-sm text-[var(--cps-text-muted)]">{ticket.descricao}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="rounded-md border border-[var(--cps-border-strong)] px-3 py-2 text-xs font-bold" onClick={() => setTicket(ticket.id_ticket, "EM_ANDAMENTO")} type="button">Em análise</button>
                  <button className="rounded-md bg-[var(--cps-accent)] px-3 py-2 text-xs font-bold text-white" onClick={() => setTicket(ticket.id_ticket, "FINALIZADO")} type="button">Resolver</button>
                  <button className="rounded-md border border-red-200 px-3 py-2 text-xs font-bold text-red-700" onClick={() => setTicket(ticket.id_ticket, "CANCELADO")} type="button">Cancelar</button>
                </div>
              </article>
            ))}
          </div>
          <div className="cps-card p-5">
            <h3 className="text-xl font-bold">Triagem</h3>
            <div className="mt-5 space-y-3">
              <StatTile icon="ticket" label="Abertos" value={tickets.filter((ticket) => ticket.status === "ABERTO").length} />
              <StatTile icon="alert" label="Em análise" value={tickets.filter((ticket) => ticket.status === "EM_ANDAMENTO").length} />
              <StatTile icon="check" label="Finalizados" value={tickets.filter((ticket) => ticket.status === "FINALIZADO").length} />
            </div>
          </div>
        </div>
      )}

      {section === "admin-alert-history" && (
        <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
          <div className="cps-card p-5">
            <h3 className="text-xl font-bold">Alertas dos totens</h3>
            <div className="mt-4 space-y-3">
              {totemAlerts.map((alert) => (
                <article className="rounded-lg border border-[var(--cps-border)] bg-white p-4 shadow-sm" key={alert.id}>
                  <p className="text-xs font-bold uppercase text-[var(--cps-accent)]">{alert.severity} · {alert.status}</p>
                  <h4 className="mt-2 font-bold">{alert.title}</h4>
                  <p className="mt-1 text-sm text-[var(--cps-text-muted)]">{alert.source}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="cps-card p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-bold">Auditoria RFID e Admin</h3>
              <button className="rounded-md border border-[var(--cps-border-strong)] px-4 py-2 text-xs font-bold" onClick={loadLogs} type="button">Atualizar</button>
            </div>
            <div className="mt-5 space-y-3">
              {logs.map((log) => (
                <article className="grid gap-3 rounded-lg border border-[var(--cps-border)] bg-white p-4 shadow-sm md:grid-cols-[160px_1fr] md:items-center" key={log.id_auditoria}>
                  <div>
                    <p className="text-xs font-bold uppercase text-[var(--cps-accent)]">{log.acao}</p>
                    <p className="mt-1 text-xs text-[var(--cps-text-muted)]">{formatDateTime(log.data_evento)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--cps-text)]">{log.entidade}</p>
                    <p className="mt-1 text-sm text-[var(--cps-text-muted)]">{log.detalhes ? JSON.stringify(log.detalhes) : "Sem detalhes"}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}

      {section === "admin-room" && (
        <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="relative min-h-[430px] overflow-hidden rounded-lg border border-[var(--cps-border)] bg-[linear-gradient(135deg,rgba(176,0,32,0.08),white,rgba(0,92,110,0.08))] p-5 shadow-sm">
            <div className="grid h-full min-h-[390px] grid-cols-4 grid-rows-[80px_1fr_80px] gap-4">
              {["Entrada", "Balcão", "Sala estudo", "Câmera"].map((item) => (
                <div key={item} className="rounded-lg border border-[var(--cps-border)] bg-white/90 p-4 text-center shadow-sm">
                  <p className="text-xs font-bold uppercase text-[var(--cps-accent)]">{item}</p>
                </div>
              ))}
              {["A Tecnologia", "B Banco", "C IA", "D Leitura"].map((item, index) => (
                <div key={item} className={`rounded-lg border p-4 shadow-sm ${index === 0 ? "border-[var(--cps-accent)] bg-[var(--cps-accent-soft)] text-[var(--cps-accent)]" : "border-[var(--cps-border)] bg-white/90"}`}>
                  <p className="text-xs font-bold uppercase">Setor {item}</p>
                  <div className="mt-8 space-y-3">
                    <div className="h-4 rounded-sm bg-current opacity-20" />
                    <div className="h-4 rounded-sm bg-current opacity-20" />
                    <div className="h-4 rounded-sm bg-current opacity-20" />
                  </div>
                </div>
              ))}
              <div className="col-span-4 rounded-lg border border-dashed border-[var(--cps-border-strong)] bg-white/80 p-4 text-center text-sm font-bold text-[var(--cps-accent)]">
                Rota: Entrada → Setor A → Estante 04
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {(salas.length ? salas : [{ id_sala: 1, nome_sala: "Sala de estudo 01", status_sala: "ABERTA", camera_url: null, metadata: { mapa: "2d" } }]).map((sala) => (
              <div key={sala.id_sala} className="rounded-lg border border-[var(--cps-border)] bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold">{sala.nome_sala}</h4>
                    <p className="text-xs font-bold uppercase text-[var(--cps-accent)]">{sala.status_sala}</p>
                  </div>
                  <button className="rounded-md bg-[var(--cps-accent)] px-3 py-2 text-xs font-bold text-white" onClick={() => closeRoom(sala.id_sala)} type="button">Fechar</button>
                </div>
                {sala.camera_url ? (
                  <iframe className="mt-3 h-40 w-full rounded-lg border" src={sala.camera_url} title={`Câmera ${sala.nome_sala}`} />
                ) : (
                  <div className="mt-3 rounded-lg bg-[var(--cps-card-muted)] p-5 text-center text-sm text-[var(--cps-text-muted)]">Câmera offline</div>
                )}
              </div>
            ))}
            <button className="w-full rounded-md border border-[var(--cps-border-strong)] bg-white px-4 py-3 text-sm font-bold text-[var(--cps-accent)]" onClick={exitAdmin} type="button">
              Registrar saída do admin
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
