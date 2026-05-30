"use client";

import { useEffect, useMemo, useState } from "react";
import {
  adminNavItems,
  pendingReservations,
  tickets as mockTickets,
  totemAlerts,
} from "@/lib/mock-data";
import { readRfidFromAvailableReader } from "@/lib/webrfid-adapter";
import type { CatalogBook, SectionId, Ticket, TicketStatus } from "@/lib/types";

type Props = {
  activeSection: SectionId;
  activity: string;
  onActivityChange: (message: string) => void;
};

type ReaderState = "idle" | "connecting" | "waiting" | "found" | "unknown" | "error";
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

const fallbackBooks: CatalogBook[] = [
  {
    id_livro: 1,
    rfid_livro: "53:fd:3a:38:63:00:01",
    etiqueta_rfid: "53:fd:3a:38:63:00:01",
    nome_livro: "Livro 1",
    autor_livro: "LibCore",
    id_localizacao: 1,
    status: "DISPONIVEL",
    statusLabel: "Disponível",
    locationLabel: "Setor A · Estante 01 · Divisória 01 · Nº 1",
    localizacao: { id_localizacao: 1, setor: "A", estante: "01", divisoria: "01", numero: 1 },
  },
  {
    id_livro: 2,
    rfid_livro: "RFID-TEC-1842",
    etiqueta_rfid: "RFID-TEC-1842",
    nome_livro: "Engenharia de Software Moderna",
    autor_livro: "Ian Sommerville",
    id_localizacao: 2,
    status: "DISPONIVEL",
    statusLabel: "Disponível",
    locationLabel: "Setor A · Estante 04 · Divisória 02 · Nº 12",
    localizacao: { id_localizacao: 2, setor: "A", estante: "04", divisoria: "02", numero: 12 },
  },
  {
    id_livro: 3,
    rfid_livro: "RFID-TEC-2145",
    etiqueta_rfid: "RFID-TEC-2145",
    nome_livro: "Banco de Dados",
    autor_livro: "Elmasri & Navathe",
    id_localizacao: 3,
    status: "EMPRESTADO",
    statusLabel: "Emprestado",
    locationLabel: "Setor B · Estante 02 · Divisória 01 · Nº 8",
    localizacao: { id_localizacao: 3, setor: "B", estante: "02", divisoria: "01", numero: 8 },
  },
];

const fallbackLogs: AuditLog[] = [
  {
    id_auditoria: 9001,
    acao: "USUARIO_ENTROU",
    entidade: "aluno_web",
    detalhes: { nome: "João", origem: "totem-aluno" },
    data_evento: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
  {
    id_auditoria: 9002,
    acao: "LEITURA_RFID",
    entidade: "livros",
    detalhes: { etiqueta_rfid: "53:fd:3a:38:63:00:01", livro: "Livro 1" },
    data_evento: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
  },
  {
    id_auditoria: 9003,
    acao: "EMPRESTIMO_RFID",
    entidade: "livros",
    detalhes: { etiqueta_rfid: "RFID-TEC-1842", livro: "Engenharia de Software Moderna" },
    data_evento: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
  },
  {
    id_auditoria: 9004,
    acao: "SALA_FECHADA",
    entidade: "salas",
    detalhes: { nome_sala: "Sala de estudo 01" },
    data_evento: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
];

async function apiData<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error ?? "Falha na API LibCore.");
  return body.data as T;
}

function StatusBadge({ state }: { state: ReaderState }) {
  const labels = {
    idle: "Aguardando",
    connecting: "Conectando leitor",
    waiting: "Consultando API",
    found: "Livro encontrado",
    unknown: "RFID desconhecido",
    error: "Erro leitor/API",
  };
  const tone =
    state === "found"
      ? "bg-emerald-50 text-emerald-700"
      : state === "unknown" || state === "error"
        ? "bg-red-50 text-red-700"
        : "bg-[var(--cps-accent-soft)] text-[var(--cps-accent)]";
  return <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${tone}`}>{labels[state]}</span>;
}

function SectionShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="cps-card p-5">
      <div className="mb-5 border-b border-[var(--cps-border)] pb-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--cps-accent)]">Admin LibCore</p>
        <h3 className="mt-1 text-2xl font-bold text-[var(--cps-text)]">{title}</h3>
        <p className="mt-1 text-sm text-[var(--cps-text-muted)]">{description}</p>
      </div>
      {children}
    </div>
  );
}

function BookCard({ book }: { book: CatalogBook }) {
  return (
    <article className="rounded-2xl border border-[var(--cps-border)] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-[var(--cps-accent)]">{book.etiqueta_rfid ?? book.rfid_livro}</p>
          <h4 className="mt-1 font-bold text-[var(--cps-text)]">{book.nome_livro}</h4>
          <p className="mt-1 text-sm text-[var(--cps-text-muted)]">{book.locationLabel}</p>
        </div>
        <span className="rounded-full bg-[var(--cps-accent-soft)] px-3 py-1 text-xs font-bold text-[var(--cps-accent)]">{book.statusLabel}</span>
      </div>
    </article>
  );
}

function RoomMap({ salas, onCloseRoom }: { salas: Sala[]; onCloseRoom: (id: number) => void }) {
  const safeSalas = salas.length
    ? salas
    : [{ id_sala: 1, nome_sala: "Sala de estudo 01", status_sala: "ABERTA", camera_url: null, metadata: { mapa: "2d", blender_ready: true } }];

  return (
    <SectionShell title="Sala, câmera e mapa" description="Visual 2D inicial da biblioteca com sala, acervo e pontos de localização.">
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="relative min-h-[420px] overflow-hidden rounded-3xl border border-[var(--cps-border)] bg-[linear-gradient(135deg,rgba(176,0,32,0.08),white,rgba(32,44,57,0.08))] p-5">
          <div className="grid h-full min-h-[380px] grid-cols-4 grid-rows-[80px_1fr_80px] gap-4">
            {['Entrada', 'Balcão', 'Sala estudo', 'Câmera'].map((item) => (
              <div key={item} className="rounded-2xl border border-[var(--cps-border)] bg-white/90 p-4 text-center shadow-sm">
                <p className="text-xs font-bold uppercase text-[var(--cps-accent)]">{item}</p>
              </div>
            ))}
            {['A Tecnologia', 'B Banco', 'C IA', 'D Leitura'].map((item, index) => (
              <div key={item} className={`rounded-3xl border p-4 shadow-sm ${index === 0 ? 'border-[var(--cps-accent)] bg-[var(--cps-accent-soft)] text-[var(--cps-accent)]' : 'border-[var(--cps-border)] bg-white/90'}`}>
                <p className="text-xs font-bold uppercase">Setor {item}</p>
                <div className="mt-8 space-y-3">
                  <div className="h-4 rounded-full bg-current opacity-20" />
                  <div className="h-4 rounded-full bg-current opacity-20" />
                  <div className="h-4 rounded-full bg-current opacity-20" />
                </div>
              </div>
            ))}
            <div className="col-span-4 rounded-3xl border border-dashed border-[var(--cps-border-strong)] bg-white/80 p-4 text-center text-sm font-bold text-[var(--cps-accent)]">
              Rota mockada: Entrada → Setor A → Estante 04 · pronto para evolução 3D/Blender
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {safeSalas.map((sala) => (
            <div key={sala.id_sala} className="rounded-2xl border border-[var(--cps-border)] bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-bold">{sala.nome_sala}</h4>
                  <p className="text-xs font-bold uppercase text-[var(--cps-accent)]">{sala.status_sala}</p>
                </div>
                <button className="rounded-lg bg-[var(--cps-accent)] px-3 py-2 text-xs font-bold text-white" onClick={() => onCloseRoom(sala.id_sala)} type="button">Fechar</button>
              </div>
              {sala.camera_url ? (
                <iframe className="mt-3 h-40 w-full rounded-xl border" src={sala.camera_url} title={`Câmera ${sala.nome_sala}`} />
              ) : (
                <div className="mt-3 rounded-xl bg-[var(--cps-card-muted)] p-5 text-center text-sm text-[var(--cps-text-muted)]">Câmera mockada/offline</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

export function AdminContent({ activeSection, activity, onActivityChange }: Props) {
  const section = adminIds.has(activeSection) ? activeSection : "admin-rfid-register";
  const currentItem = adminNavItems.find((item) => item.id === section) ?? adminNavItems[0];

  const [readerState, setReaderState] = useState<ReaderState>("idle");
  const [rfid, setRfid] = useState("");
  const [manualRfid, setManualRfid] = useState("");
  const [selectedBook, setSelectedBook] = useState<CatalogBook | null>(null);
  const [books, setBooks] = useState<CatalogBook[]>(fallbackBooks);
  const [logs, setLogs] = useState<AuditLog[]>(fallbackLogs);
  const [salas, setSalas] = useState<Sala[]>([]);
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

  async function loadLogs() {
    try {
      const data = await apiData<AuditLog[]>("/api/v1/admin/auditoria?limit=12");
      setLogs(data.length ? data : fallbackLogs);
    } catch {
      setLogs(fallbackLogs);
    }
  }

  async function loadSalas() {
    try {
      setSalas(await apiData<Sala[]>("/api/v1/admin/salas"));
    } catch {
      setSalas([]);
    }
  }

  async function logEvent(acao: string, detalhes: Record<string, unknown>) {
    try {
      await apiData<AuditLog>("/api/v1/admin/auditoria", {
        method: "POST",
        body: JSON.stringify({ id_usuario: ADMIN_USER_ID, acao, entidade: "admin_web", detalhes }),
      });
      await loadLogs();
    } catch {
      setLogs((current) => [{ ...fallbackLogs[0], id_auditoria: Date.now(), acao, detalhes, data_evento: new Date().toISOString() }, ...current]);
    }
  }

  useEffect(() => {
    apiData<CatalogBook[]>("/api/v1/livros").then((data) => setBooks(data.length ? data : fallbackBooks)).catch(() => setBooks(fallbackBooks));
    loadLogs();
    loadSalas();
  }, []);

  async function findByRfid(value: string) {
    const clean = value.trim();
    if (!clean) return;
    setRfid(clean);
    setSelectedBook(null);
    setError("");
    setReaderState("waiting");
    onActivityChange(`Consultando RFID ${clean}.`);
    try {
      const found = await apiData<CatalogBook>(`/api/v1/livros/rfid/${encodeURIComponent(clean)}`);
      setSelectedBook(found);
      setReaderState("found");
      await logEvent("LEITURA_RFID", { etiqueta_rfid: clean, nome_livro: found.nome_livro });
    } catch {
      const fallback = fallbackBooks.find((book) => (book.etiqueta_rfid ?? book.rfid_livro).toLowerCase() === clean.toLowerCase());
      if (fallback) {
        setSelectedBook(fallback);
        setReaderState("found");
        await logEvent("LEITURA_RFID_MOCK", { etiqueta_rfid: clean, nome_livro: fallback.nome_livro });
      } else {
        setReaderState("unknown");
        setError("RFID desconhecido.");
        await logEvent("RFID_DESCONHECIDO", { etiqueta_rfid: clean });
      }
    }
  }

  async function scan() {
    setLoading(true);
    setError("");
    setReaderState("connecting");
    try {
      const reading = await readRfidFromAvailableReader();
      await findByRfid(reading.etiqueta_rfid);
    } catch {
      setReaderState("error");
      setError("Leitor indisponível. Use o modo manual para apresentação.");
      await logEvent("LEITOR_RFID_INDISPONIVEL", { origem: "admin" });
    } finally {
      setLoading(false);
    }
  }

  async function createBook() {
    const etiqueta = rfid.trim() || manualRfid.trim();
    if (!etiqueta || !title.trim()) {
      setError("Informe RFID e título para cadastrar.");
      return;
    }
    setLoading(true);
    try {
      const created = await apiData<CatalogBook>("/api/v1/livros", {
        method: "POST",
        body: JSON.stringify({ etiqueta_rfid: etiqueta, nome_livro: title.trim(), autor_livro: author.trim() || null }),
      });
      setSelectedBook(created);
      setBooks((current) => [created, ...current]);
      setTitle("");
      setAuthor("");
      await loadLogs();
    } catch {
      const created: CatalogBook = {
        id_livro: Date.now(),
        rfid_livro: etiqueta,
        etiqueta_rfid: etiqueta,
        nome_livro: title.trim(),
        autor_livro: author.trim() || null,
        id_localizacao: null,
        status: "DISPONIVEL",
        statusLabel: "Disponível",
        locationLabel: "Localização não cadastrada",
        localizacao: null,
      };
      setSelectedBook(created);
      setBooks((current) => [created, ...current]);
      await logEvent("CADASTRO_RFID_MOCK", { etiqueta_rfid: etiqueta, nome_livro: title.trim() });
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
    try {
      await apiData(`/api/v1/rfid/${action}`, { method: "POST", body: JSON.stringify({ etiqueta_rfid: etiqueta, id_usuario: ADMIN_USER_ID }) });
      await findByRfid(etiqueta);
      await loadLogs();
    } catch {
      await logEvent(action === "emprestimo" ? "EMPRESTIMO_RFID_MOCK" : "DEVOLUCAO_RFID_MOCK", { etiqueta_rfid: etiqueta });
    } finally {
      setLoading(false);
    }
  }

  async function closeRoom(id: number) {
    try {
      await apiData(`/api/v1/admin/salas/${id}/fechar`, { method: "PATCH", body: JSON.stringify({ id_usuario: ADMIN_USER_ID }) });
      await loadSalas();
    } catch {
      setSalas((current) => current.map((sala) => (sala.id_sala === id ? { ...sala, status_sala: "FECHADA" } : sala)));
    }
    await logEvent("SALA_FECHADA", { id_sala: id });
  }

  async function exitAdmin() {
    await logEvent("USUARIO_SAIU", { origem: "admin_web", tela: section, etiqueta_rfid: rfid || null });
    onActivityChange("Saída registrada em auditoria para o administrador.");
  }

  const header = (
    <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--cps-accent)]">Admin biblioteca CPS</p>
        <h2 className="mt-1 text-3xl font-bold text-[var(--cps-text)]">{currentItem.label}</h2>
        <p className="mt-2 max-w-3xl text-sm text-[var(--cps-text-muted)]">{currentItem.description}</p>
      </div>
      <div className="flex flex-col gap-2">
        <div className="rounded-2xl border border-[var(--cps-border)] bg-[var(--cps-card-layer)] px-4 py-3 text-sm text-[var(--cps-text-muted)] shadow-sm">{activity}</div>
        <button className="rounded-xl border border-[var(--cps-border-strong)] bg-white px-4 py-2 text-sm font-bold text-[var(--cps-accent)]" onClick={exitAdmin} type="button">Sair e registrar log</button>
      </div>
    </div>
  );

  return (
    <section className="px-5 py-6 md:px-8 lg:px-10">
      {header}

      {section === "admin-rfid-register" && (
        <div className="grid gap-5 xl:grid-cols-[440px_1fr]">
          <div className="cps-card p-5">
            <div className="flex items-center justify-between gap-3"><h3 className="text-xl font-bold">RFID funcional</h3><StatusBadge state={readerState} /></div>
            <p className="mt-2 text-sm text-[var(--cps-text-muted)]">WebRFID/NFC consulta a API real; se falhar, o modo manual permite apresentação.</p>
            <button className="mt-5 h-11 w-full rounded-xl bg-[var(--cps-accent)] px-6 text-sm font-bold text-white shadow-sm disabled:opacity-60" disabled={loading} onClick={scan} type="button">{loading ? "Processando..." : "Ler RFID do livro"}</button>
            <div className="mt-5 rounded-2xl border border-dashed border-[var(--cps-border-strong)] bg-[var(--cps-card-muted)] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--cps-text-muted)]">Modo manual técnico</p>
              <div className="mt-3 flex gap-2"><input className="h-10 min-w-0 flex-1 rounded-lg border border-[var(--cps-border)] bg-white px-3 text-sm outline-none" value={manualRfid} onChange={(event) => setManualRfid(event.target.value)} placeholder="RFID para diagnóstico" /><button className="rounded-lg border border-[var(--cps-border-strong)] px-4 text-sm font-bold" onClick={() => findByRfid(manualRfid)} type="button">Buscar</button></div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2"><button className="h-10 rounded-xl bg-[var(--cps-accent)] px-4 text-sm font-bold text-white disabled:opacity-60" disabled={loading} onClick={() => loan("emprestimo")} type="button">Emprestar RFID</button><button className="h-10 rounded-xl border border-[var(--cps-border-strong)] bg-white px-4 text-sm font-bold text-[var(--cps-accent)] disabled:opacity-60" disabled={loading} onClick={() => loan("devolucao")} type="button">Devolver RFID</button></div>
            {rfid && <p className="mt-4 break-all rounded-xl bg-[var(--cps-accent-soft)] p-3 font-mono text-sm font-bold text-[var(--cps-accent)]">{rfid}</p>}
            {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
          </div>
          <div className="space-y-5">
            {selectedBook ? <BookCard book={selectedBook} /> : <div className="rounded-2xl border border-[var(--cps-border)] bg-white p-8 text-center shadow-sm"><h3 className="text-xl font-bold">Aproxime um livro do leitor</h3><p className="mt-2 text-sm text-[var(--cps-text-muted)]">Ou use o modo manual com RFID-TEC-1842 para apresentar.</p></div>}
            <form className="rounded-2xl border border-[var(--cps-border)] bg-white p-5 shadow-sm" onSubmit={(event) => event.preventDefault()}><h3 className="text-xl font-bold">Cadastrar etiqueta</h3><div className="mt-4 grid gap-3 md:grid-cols-2"><input className="h-10 rounded-lg border border-[var(--cps-border)] px-3 text-sm outline-none" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Título do livro" /><input className="h-10 rounded-lg border border-[var(--cps-border)] px-3 text-sm outline-none" value={author} onChange={(event) => setAuthor(event.target.value)} placeholder="Autor" /></div><button className="mt-4 h-10 rounded-xl bg-[var(--cps-accent)] px-6 text-sm font-bold text-white disabled:opacity-60" disabled={loading} onClick={createBook} type="button">Cadastrar</button></form>
          </div>
        </div>
      )}

      {section === "admin-books-edit" && (
        <SectionShell title="Modificar livros" description="Acervo real com fallback mockado para apresentação.">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{books.map((book) => <BookCard book={book} key={book.id_livro} />)}</div>
        </SectionShell>
      )}

      {section === "admin-reservations" && (
        <SectionShell title="Confirmar reservas" description="Aprovar ou recusar reservas dos alunos.">
          <div className="grid gap-3 lg:grid-cols-3">{pendingReservations.map((reservation) => <article className="rounded-2xl border border-[var(--cps-border)] bg-white p-4 shadow-sm" key={reservation.id}><p className="text-xs font-bold uppercase text-[var(--cps-accent)]">{reservationStatus[reservation.id] ?? "Pendente"}</p><h4 className="mt-2 font-bold">{reservation.studentName}</h4><p className="text-sm text-[var(--cps-text-muted)]">{reservation.course}</p><p className="mt-3 font-semibold">{reservation.bookTitle}</p><p className="mt-1 text-sm text-[var(--cps-text-muted)]">Retirada: {reservation.pickupWindow}</p><div className="mt-4 grid grid-cols-2 gap-2"><button className="rounded-xl bg-[var(--cps-accent)] px-3 py-2 text-xs font-bold text-white" onClick={() => { setReservationStatus((current) => ({ ...current, [reservation.id]: "Confirmada" })); logEvent("RESERVA_CONFIRMADA", { reserva: reservation.id }); }} type="button">Confirmar</button><button className="rounded-xl border border-[var(--cps-border-strong)] px-3 py-2 text-xs font-bold text-[var(--cps-accent)]" onClick={() => { setReservationStatus((current) => ({ ...current, [reservation.id]: "Recusada" })); logEvent("RESERVA_RECUSADA", { reserva: reservation.id }); }} type="button">Recusar</button></div></article>)}</div>
        </SectionShell>
      )}

      {section === "admin-ticket-resolution" && (
        <SectionShell title="Resolver tickets" description="Triagem e resolução de reclamações dos alunos.">
          <div className="grid gap-3 lg:grid-cols-2">{tickets.map((ticket) => <article className="rounded-2xl border border-[var(--cps-border)] bg-white p-4 shadow-sm" key={ticket.id_ticket}><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase text-[var(--cps-accent)]">{ticket.tipo}</p><h4 className="mt-2 font-bold">Ticket #{ticket.id_ticket}</h4></div><span className="rounded-full bg-[var(--cps-accent-soft)] px-3 py-1 text-xs font-bold text-[var(--cps-accent)]">{ticket.status}</span></div><p className="mt-3 text-sm text-[var(--cps-text-muted)]">{ticket.descricao}</p><div className="mt-4 flex flex-wrap gap-2"><button className="rounded-xl border border-[var(--cps-border-strong)] px-3 py-2 text-xs font-bold" onClick={() => { setTicketStatus((current) => ({ ...current, [ticket.id_ticket]: "EM_ANDAMENTO" })); logEvent("TICKET_EM_ANALISE", { ticket: ticket.id_ticket }); }} type="button">Em análise</button><button className="rounded-xl bg-[var(--cps-accent)] px-3 py-2 text-xs font-bold text-white" onClick={() => { setTicketStatus((current) => ({ ...current, [ticket.id_ticket]: "FINALIZADO" })); logEvent("TICKET_RESOLVIDO", { ticket: ticket.id_ticket }); }} type="button">Resolver</button><button className="rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-700" onClick={() => { setTicketStatus((current) => ({ ...current, [ticket.id_ticket]: "CANCELADO" })); logEvent("TICKET_CANCELADO", { ticket: ticket.id_ticket }); }} type="button">Cancelar</button></div></article>)}</div>
        </SectionShell>
      )}

      {section === "admin-alert-history" && (
        <SectionShell title="Histórico de alertas" description="Eventos dos totens, RFID, logs administrativos e alertas críticos.">
          <div className="grid gap-5 xl:grid-cols-2"><div className="space-y-3">{totemAlerts.map((alert) => <article className="rounded-2xl border border-[var(--cps-border)] bg-white p-4 shadow-sm" key={alert.id}><p className="text-xs font-bold uppercase text-[var(--cps-accent)]">{alert.severity} · {alert.status}</p><h4 className="mt-2 font-bold">{alert.title}</h4><p className="mt-1 text-sm text-[var(--cps-text-muted)]">{alert.source}</p></article>)}</div><div className="space-y-3">{logs.map((log) => <article className="rounded-2xl border border-[var(--cps-border)] bg-white p-4 shadow-sm" key={log.id_auditoria}><p className="text-xs font-bold uppercase text-[var(--cps-accent)]">{log.acao}</p><p className="mt-1 text-sm text-[var(--cps-text-muted)]">{new Date(log.data_evento).toLocaleString("pt-BR")} · {log.entidade}</p></article>)}</div></div>
        </SectionShell>
      )}

      {section === "admin-room" && <RoomMap salas={salas} onCloseRoom={closeRoom} />}
    </section>
  );
}
