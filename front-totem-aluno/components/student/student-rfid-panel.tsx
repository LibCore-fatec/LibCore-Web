"use client";

import { useState } from "react";
import { readRfidFromAvailableReader } from "@/lib/webrfid-adapter";
import type { CatalogBook } from "@/lib/types";

const DEMO_BOOKS: CatalogBook[] = [
  {
    id_livro: 1,
    rfid_livro: "53:fd:3a:38:63:00:01",
    nome_livro: "Livro 1",
    id_localizacao: 1,
    status: "DISPONIVEL",
    statusLabel: "Disponível",
    locationLabel: "Setor A, Estante 01, Divisória 01, Nº 1",
    localizacao: { id_localizacao: 1, setor: "A", estante: "01", divisoria: "01", numero: 1 },
  },
  {
    id_livro: 2,
    rfid_livro: "RFID-TEC-1842",
    nome_livro: "Engenharia de Software Moderna",
    id_localizacao: 1,
    status: "DISPONIVEL",
    statusLabel: "Disponível",
    locationLabel: "Setor A, Estante 04, Divisória 02, Nº 12",
    localizacao: { id_localizacao: 1, setor: "A", estante: "04", divisoria: "02", numero: 12 },
  },
  {
    id_livro: 3,
    rfid_livro: "RFID-TEC-2145",
    nome_livro: "Banco de Dados",
    id_localizacao: 2,
    status: "EMPRESTADO",
    statusLabel: "Emprestado",
    locationLabel: "Setor B, Estante 02, Divisória 01, Nº 8",
    localizacao: { id_localizacao: 2, setor: "B", estante: "02", divisoria: "01", numero: 8 },
  },
];

type ApiPayload<T> = { data?: T; error?: string };

async function getJson<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const payload = (await response.json().catch(() => ({}))) as ApiPayload<T>;
  if (!response.ok) throw new Error(payload.error ?? "API indisponível");
  return payload.data as T;
}

function demoBookFor(tag: string) {
  return DEMO_BOOKS.find((book) => book.rfid_livro.toLowerCase() === tag.toLowerCase()) ?? DEMO_BOOKS[0];
}

export function StudentRfidPanel() {
  const [status, setStatus] = useState("Pronto para ler RFID/NFC");
  const [tag, setTag] = useState("");
  const [book, setBook] = useState<CatalogBook | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [loading, setLoading] = useState(false);

  async function lookup(etiqueta: string, fromDemo = false) {
    setTag(etiqueta);
    setStatus("Consultando livro na API LibCore...");
    try {
      const found = await getJson<CatalogBook>(`/api/v1/livros/rfid/${encodeURIComponent(etiqueta)}`);
      setBook(found);
      setDemoMode(false);
      setStatus(`Livro encontrado no PostgreSQL: ${found.nome_livro}`);
    } catch {
      const demo = demoBookFor(etiqueta);
      setBook(demo);
      setDemoMode(true);
      setStatus(fromDemo ? "Modo apresentação: RFID simulado no celular." : "API indisponível: exibindo RFID mockado para apresentação.");
    }
  }

  async function scan() {
    setLoading(true);
    setStatus("Aguardando leitura WebRFID/NFC...");
    try {
      const reading = await readRfidFromAvailableReader({ allowDemo: true });
      await lookup(reading.etiqueta_rfid, reading.source === "demo");
    } finally {
      setLoading(false);
    }
  }

  async function action(type: "emprestimo" | "devolucao") {
    const etiqueta = tag || book?.rfid_livro;
    if (!etiqueta) {
      setStatus("Leia um RFID antes de executar a ação.");
      return;
    }
    setLoading(true);
    try {
      const updated = await getJson<CatalogBook>(`/api/v1/rfid/${type}`, {
        method: "POST",
        body: JSON.stringify({ etiqueta_rfid: etiqueta, id_usuario: 1 }),
      });
      setBook(updated);
      setDemoMode(false);
      setStatus(type === "emprestimo" ? "Empréstimo registrado no PostgreSQL." : "Devolução registrada no PostgreSQL.");
    } catch {
      const demo = demoBookFor(etiqueta);
      setBook({ ...demo, status: type === "emprestimo" ? "EMPRESTADO" : "DISPONIVEL", statusLabel: type === "emprestimo" ? "Emprestado" : "Disponível" });
      setDemoMode(true);
      setStatus(type === "emprestimo" ? "Modo apresentação: empréstimo simulado." : "Modo apresentação: devolução simulada.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mb-5 rounded-3xl border border-[var(--cps-border)] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--cps-accent)]">RFID/NFC do aluno</p>
          <h2 className="mt-1 text-2xl font-bold text-[var(--cps-text)]">Leitura de livro por RFID</h2>
          <p className="mt-1 text-sm text-[var(--cps-text-muted)]">Funciona com WebRFID/NFC real; se o celular não tiver leitor/API, mostra dados mockados para apresentação.</p>
        </div>
        <button className="h-11 rounded-xl bg-[var(--cps-accent)] px-6 text-sm font-bold text-white disabled:opacity-60" disabled={loading} onClick={scan} type="button">
          {loading ? "Lendo..." : "Ler RFID/NFC"}
        </button>
      </div>

      <div className="mt-4 rounded-2xl bg-[var(--cps-card-muted)] p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[var(--cps-accent-soft)] px-3 py-1 text-xs font-bold text-[var(--cps-accent)]">{demoMode ? "Modo apresentação" : "API real"}</span>
          <span className="text-sm font-semibold text-[var(--cps-text-muted)]">{status}</span>
        </div>
        {tag && <p className="mt-3 break-all font-mono text-sm font-bold text-[var(--cps-text)]">{tag}</p>}
      </div>

      {book && (
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="rounded-2xl border border-[var(--cps-border)] p-4">
            <h3 className="text-xl font-bold text-[var(--cps-text)]">{book.nome_livro}</h3>
            <p className="mt-1 text-sm text-[var(--cps-text-muted)]">{book.locationLabel}</p>
            <span className="mt-3 inline-flex rounded-full bg-[var(--cps-accent-soft)] px-3 py-1 text-xs font-bold text-[var(--cps-accent)]">{book.statusLabel}</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:w-72 lg:grid-cols-1">
            <button className="h-10 rounded-xl bg-[var(--cps-accent)] px-4 text-sm font-bold text-white" onClick={() => action("emprestimo")} type="button">Emprestar</button>
            <button className="h-10 rounded-xl border border-[var(--cps-border-strong)] bg-white px-4 text-sm font-bold text-[var(--cps-accent)]" onClick={() => action("devolucao")} type="button">Devolver</button>
          </div>
        </div>
      )}
    </section>
  );
}
