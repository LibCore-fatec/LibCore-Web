"use client";

import { useEffect, useState } from "react";
import { adminNavItems } from "@/lib/mock-data";
import { readRfidFromAvailableReader } from "@/lib/webrfid-adapter";
import type { CatalogBook, SectionId } from "@/lib/types";

type Props = {
  activeSection: SectionId;
  activity: string;
  onActivityChange: (message: string) => void;
};

type ReaderState = "idle" | "connecting" | "waiting" | "found" | "unknown" | "error";

const adminIds = new Set<SectionId>(adminNavItems.map((item) => item.id));

async function apiData<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error ?? "Falha na API LibCore.");
  return body.data as T;
}

function Badge({ state }: { state: ReaderState }) {
  const labels = {
    idle: "Aguardando",
    connecting: "Conectando leitor",
    waiting: "Consultando API",
    found: "Livro encontrado",
    unknown: "RFID desconhecido",
    error: "Erro leitor/API",
  };
  const good = state === "found";
  const bad = state === "unknown" || state === "error";
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${good ? "bg-emerald-50 text-emerald-700" : bad ? "bg-red-50 text-red-700" : "bg-[var(--cps-accent-soft)] text-[var(--cps-accent)]"}`}>
      {labels[state]}
    </span>
  );
}

function BookPanel({ book }: { book: CatalogBook | null }) {
  if (!book) {
    return (
      <div className="rounded-2xl border border-[var(--cps-border)] bg-white p-8 text-center shadow-sm">
        <h3 className="text-xl font-bold">Aproxime o livro do leitor RFID/NFC</h3>
        <p className="mt-2 text-sm text-[var(--cps-text-muted)]">A leitura consulta o PostgreSQL por etiqueta_rfid e retorna o livro real.</p>
      </div>
    );
  }

  return (
    <article className="rounded-2xl border border-[var(--cps-border)] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--cps-accent)]">Livro por RFID</p>
          <h3 className="mt-2 text-2xl font-bold text-[var(--cps-text)]">{book.nome_livro}</h3>
          <p className="mt-1 text-sm text-[var(--cps-text-muted)]">{book.autor_livro ?? "Autor não cadastrado"}</p>
        </div>
        <span className="rounded-full bg-[var(--cps-accent-soft)] px-3 py-1 text-xs font-bold text-[var(--cps-accent)]">{book.statusLabel}</span>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-[var(--cps-card-muted)] p-4">
          <p className="text-xs font-bold uppercase text-[var(--cps-text-muted)]">Etiqueta</p>
          <p className="mt-1 break-all font-mono text-sm font-bold">{book.etiqueta_rfid ?? book.rfid_livro}</p>
        </div>
        <div className="rounded-xl bg-[var(--cps-card-muted)] p-4">
          <p className="text-xs font-bold uppercase text-[var(--cps-text-muted)]">Localização</p>
          <p className="mt-1 text-sm font-bold">{book.locationLabel}</p>
        </div>
      </div>
    </article>
  );
}

export function AdminContent({ activeSection, activity, onActivityChange }: Props) {
  const section = adminIds.has(activeSection) ? activeSection : "admin-rfid-register";
  const currentItem = adminNavItems.find((item) => item.id === section) ?? adminNavItems[0];

  const [state, setState] = useState<ReaderState>("idle");
  const [rfid, setRfid] = useState("");
  const [manualRfid, setManualRfid] = useState("");
  const [book, setBook] = useState<CatalogBook | null>(null);
  const [books, setBooks] = useState<CatalogBook[]>([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiData<CatalogBook[]>("/api/v1/livros").then(setBooks).catch((err) => setError(err instanceof Error ? err.message : "Falha ao carregar livros."));
  }, []);

  async function findByRfid(value: string) {
    const clean = value.trim();
    if (!clean) return;
    setRfid(clean);
    setBook(null);
    setError("");
    setState("waiting");
    onActivityChange(`Consultando RFID ${clean} no PostgreSQL.`);
    try {
      const found = await apiData<CatalogBook>(`/api/v1/livros/rfid/${encodeURIComponent(clean)}`);
      setBook(found);
      setState("found");
      onActivityChange(`Livro encontrado: ${found.nome_livro}.`);
    } catch (err) {
      setState("unknown");
      setError(err instanceof Error ? err.message : "RFID desconhecido.");
      onActivityChange(`RFID ${clean} não encontrado.`);
    }
  }

  async function scan() {
    setLoading(true);
    setError("");
    setState("connecting");
    try {
      const reading = await readRfidFromAvailableReader();
      await findByRfid(reading.etiqueta_rfid);
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Leitor indisponível.");
      onActivityChange("Leitor WebRFID/NFC indisponível.");
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
      setBook(created);
      setBooks((current) => [created, ...current]);
      setState("found");
      setTitle("");
      setAuthor("");
      onActivityChange(`Livro cadastrado: ${created.nome_livro}.`);
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Falha ao cadastrar livro.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="px-5 py-6 md:px-8 lg:px-10">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--cps-accent)]">Admin biblioteca CPS</p>
          <h2 className="mt-1 text-3xl font-bold text-[var(--cps-text)]">{currentItem.label}</h2>
          <p className="mt-2 max-w-3xl text-sm text-[var(--cps-text-muted)]">{currentItem.description}</p>
        </div>
        <div className="rounded-2xl border border-[var(--cps-border)] bg-[var(--cps-card-layer)] px-4 py-3 text-sm text-[var(--cps-text-muted)] shadow-sm">{activity}</div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[440px_1fr]">
        <div className="cps-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xl font-bold">RFID funcional</h3>
            <Badge state={state} />
          </div>
          <p className="mt-2 text-sm text-[var(--cps-text-muted)]">Sem mock: WebRFID/NFC consulta /api/v1/livros/rfid/:etiqueta no PostgreSQL.</p>
          <button className="mt-5 h-11 w-full rounded-xl bg-[var(--cps-accent)] px-6 text-sm font-bold text-white shadow-sm disabled:opacity-60" disabled={loading} onClick={scan} type="button">
            {loading ? "Processando..." : "Ler RFID do livro"}
          </button>
          <div className="mt-5 rounded-2xl border border-dashed border-[var(--cps-border-strong)] bg-[var(--cps-card-muted)] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--cps-text-muted)]">Modo manual técnico</p>
            <div className="mt-3 flex gap-2">
              <input className="h-10 min-w-0 flex-1 rounded-lg border border-[var(--cps-border)] bg-white px-3 text-sm outline-none" value={manualRfid} onChange={(event) => setManualRfid(event.target.value)} placeholder="RFID para diagnóstico" />
              <button className="rounded-lg border border-[var(--cps-border-strong)] px-4 text-sm font-bold" onClick={() => findByRfid(manualRfid)} type="button">Buscar</button>
            </div>
          </div>
          {rfid && <p className="mt-4 break-all rounded-xl bg-[var(--cps-accent-soft)] p-3 font-mono text-sm font-bold text-[var(--cps-accent)]">{rfid}</p>}
          {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
        </div>

        <div className="space-y-5">
          <BookPanel book={book} />
          <form className="rounded-2xl border border-[var(--cps-border)] bg-white p-5 shadow-sm" onSubmit={(event) => event.preventDefault()}>
            <h3 className="text-xl font-bold">Cadastrar etiqueta no banco</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input className="h-10 rounded-lg border border-[var(--cps-border)] px-3 text-sm outline-none" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Título do livro" />
              <input className="h-10 rounded-lg border border-[var(--cps-border)] px-3 text-sm outline-none" value={author} onChange={(event) => setAuthor(event.target.value)} placeholder="Autor" />
            </div>
            <button className="mt-4 h-10 rounded-xl bg-[var(--cps-accent)] px-6 text-sm font-bold text-white disabled:opacity-60" disabled={loading} onClick={createBook} type="button">Cadastrar no PostgreSQL</button>
          </form>
        </div>
      </div>

      <div className="mt-6 cps-card p-5">
        <h3 className="text-xl font-bold">Livros do PostgreSQL</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {books.slice(0, 9).map((item) => (
            <div className="rounded-xl border border-[var(--cps-border)] bg-white p-4" key={item.id_livro}>
              <p className="font-bold">{item.nome_livro}</p>
              <p className="mt-1 break-all font-mono text-xs text-[var(--cps-text-muted)]">{item.etiqueta_rfid ?? item.rfid_livro}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
