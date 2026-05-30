"use client";

import { useEffect, useState } from "react";
import { adminNavItems } from "@/lib/mock-data";
import { readRfidFromAvailableReader } from "@/lib/webrfid-adapter";
import type { CatalogBook, SectionId } from "@/lib/types";

type Props = { activeSection: SectionId; activity: string; onActivityChange: (message: string) => void };
type ReaderState = "idle" | "connecting" | "waiting" | "found" | "unknown" | "error";
type AuditLog = { id_auditoria: number; acao: string; entidade: string; detalhes: Record<string, unknown> | null; data_evento: string };
type Sala = { id_sala: number; nome_sala: string; status_sala: string; camera_url: string | null; metadata: Record<string, unknown> | null };

const adminIds = new Set<SectionId>(adminNavItems.map((item) => item.id));
const ADMIN_USER_ID = Number(process.env.NEXT_PUBLIC_ADMIN_USER_ID ?? 1);

async function apiData<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error ?? "Falha na API LibCore.");
  return body.data as T;
}

function Badge({ state }: { state: ReaderState }) {
  const labels = { idle: "Aguardando", connecting: "Conectando leitor", waiting: "Consultando API", found: "Livro encontrado", unknown: "RFID desconhecido", error: "Erro leitor/API" };
  const good = state === "found";
  const bad = state === "unknown" || state === "error";
  return <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${good ? "bg-emerald-50 text-emerald-700" : bad ? "bg-red-50 text-red-700" : "bg-[var(--cps-accent-soft)] text-[var(--cps-accent)]"}`}>{labels[state]}</span>;
}

function BookPanel({ book }: { book: CatalogBook | null }) {
  if (!book) return <div className="rounded-2xl border border-[var(--cps-border)] bg-white p-8 text-center shadow-sm"><h3 className="text-xl font-bold">Aproxime o livro do leitor RFID/NFC</h3><p className="mt-2 text-sm text-[var(--cps-text-muted)]">A leitura consulta o PostgreSQL por etiqueta_rfid e retorna o livro real.</p></div>;
  return <article className="rounded-2xl border border-[var(--cps-border)] bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--cps-accent)]">Livro por RFID</p><h3 className="mt-2 text-2xl font-bold text-[var(--cps-text)]">{book.nome_livro}</h3><p className="mt-1 text-sm text-[var(--cps-text-muted)]">{book.autor_livro ?? "Autor não cadastrado"}</p></div><span className="rounded-full bg-[var(--cps-accent-soft)] px-3 py-1 text-xs font-bold text-[var(--cps-accent)]">{book.statusLabel}</span></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-[var(--cps-card-muted)] p-4"><p className="text-xs font-bold uppercase text-[var(--cps-text-muted)]">Etiqueta</p><p className="mt-1 break-all font-mono text-sm font-bold">{book.etiqueta_rfid ?? book.rfid_livro}</p></div><div className="rounded-xl bg-[var(--cps-card-muted)] p-4"><p className="text-xs font-bold uppercase text-[var(--cps-text-muted)]">Localização</p><p className="mt-1 text-sm font-bold">{book.locationLabel}</p></div></div></article>;
}

export function AdminContent({ activeSection, activity, onActivityChange }: Props) {
  const section = adminIds.has(activeSection) ? activeSection : "admin-rfid-register";
  const currentItem = adminNavItems.find((item) => item.id === section) ?? adminNavItems[0];
  const [state, setState] = useState<ReaderState>("idle");
  const [rfid, setRfid] = useState("");
  const [manualRfid, setManualRfid] = useState("");
  const [book, setBook] = useState<CatalogBook | null>(null);
  const [books, setBooks] = useState<CatalogBook[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadLogs() { setLogs(await apiData<AuditLog[]>("/api/v1/admin/auditoria?limit=12")); }
  async function loadSalas() { setSalas(await apiData<Sala[]>("/api/v1/admin/salas")); }
  async function logEvent(acao: string, detalhes: Record<string, unknown>) { await apiData<AuditLog>("/api/v1/admin/auditoria", { method: "POST", body: JSON.stringify({ id_usuario: ADMIN_USER_ID, acao, entidade: "admin_web", detalhes }) }); await loadLogs(); }

  useEffect(() => { apiData<CatalogBook[]>("/api/v1/livros").then(setBooks).catch((err) => setError(err instanceof Error ? err.message : "Falha ao carregar livros.")); loadLogs().catch(() => undefined); loadSalas().catch(() => undefined); }, []);

  async function findByRfid(value: string) {
    const clean = value.trim(); if (!clean) return;
    setRfid(clean); setBook(null); setError(""); setState("waiting"); onActivityChange(`Consultando RFID ${clean} no PostgreSQL.`);
    try { const found = await apiData<CatalogBook>(`/api/v1/livros/rfid/${encodeURIComponent(clean)}`); setBook(found); setState("found"); onActivityChange(`Livro encontrado: ${found.nome_livro}.`); await logEvent("LEITURA_RFID", { etiqueta_rfid: clean, id_livro: found.id_livro, nome_livro: found.nome_livro }); }
    catch (err) { setState("unknown"); setError(err instanceof Error ? err.message : "RFID desconhecido."); onActivityChange(`RFID ${clean} não encontrado.`); await logEvent("RFID_DESCONHECIDO", { etiqueta_rfid: clean }); }
  }

  async function scan() {
    setLoading(true); setError(""); setState("connecting");
    try { const reading = await readRfidFromAvailableReader(); await findByRfid(reading.etiqueta_rfid); }
    catch (err) { setState("error"); setError(err instanceof Error ? err.message : "Leitor indisponível."); onActivityChange("Leitor WebRFID/NFC indisponível."); await logEvent("LEITOR_RFID_INDISPONIVEL", { erro: err instanceof Error ? err.message : "erro desconhecido" }); }
    finally { setLoading(false); }
  }

  async function createBook() {
    const etiqueta = rfid.trim() || manualRfid.trim(); if (!etiqueta || !title.trim()) { setError("Informe RFID e título para cadastrar."); return; }
    setLoading(true);
    try { const created = await apiData<CatalogBook>("/api/v1/livros", { method: "POST", body: JSON.stringify({ etiqueta_rfid: etiqueta, nome_livro: title.trim(), autor_livro: author.trim() || null }) }); setBook(created); setBooks((current) => [created, ...current]); setState("found"); setTitle(""); setAuthor(""); onActivityChange(`Livro cadastrado: ${created.nome_livro}.`); await loadLogs(); }
    catch (err) { setState("error"); setError(err instanceof Error ? err.message : "Falha ao cadastrar livro."); }
    finally { setLoading(false); }
  }

  async function loan(action: "emprestimo" | "devolucao") {
    const etiqueta = rfid.trim() || manualRfid.trim(); if (!etiqueta) { setError("Leia ou informe uma etiqueta RFID antes da ação."); return; }
    setLoading(true);
    try { await apiData(`/api/v1/rfid/${action}`, { method: "POST", body: JSON.stringify({ etiqueta_rfid: etiqueta, id_usuario: ADMIN_USER_ID }) }); await findByRfid(etiqueta); await loadLogs(); onActivityChange(action === "emprestimo" ? "Empréstimo registrado por RFID." : "Devolução registrada por RFID."); }
    catch (err) { setError(err instanceof Error ? err.message : "Falha na ação RFID."); }
    finally { setLoading(false); }
  }

  async function closeRoom(id: number) { await apiData(`/api/v1/admin/salas/${id}/fechar`, { method: "PATCH", body: JSON.stringify({ id_usuario: ADMIN_USER_ID }) }); await loadSalas(); await loadLogs(); onActivityChange("Sala fechada e auditada."); }
  async function exitAdmin() { await logEvent("USUARIO_SAIU", { origem: "admin_web", tela: section, etiqueta_rfid: rfid || null }); onActivityChange("Saída registrada em auditoria para o administrador."); }

  return <section className="px-5 py-6 md:px-8 lg:px-10"><div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--cps-accent)]">Admin biblioteca CPS</p><h2 className="mt-1 text-3xl font-bold text-[var(--cps-text)]">{currentItem.label}</h2><p className="mt-2 max-w-3xl text-sm text-[var(--cps-text-muted)]">{currentItem.description}</p></div><div className="flex flex-col gap-2"><div className="rounded-2xl border border-[var(--cps-border)] bg-[var(--cps-card-layer)] px-4 py-3 text-sm text-[var(--cps-text-muted)] shadow-sm">{activity}</div><button className="rounded-xl border border-[var(--cps-border-strong)] bg-white px-4 py-2 text-sm font-bold text-[var(--cps-accent)]" onClick={exitAdmin} type="button">Sair e registrar log</button></div></div><div className="grid gap-5 xl:grid-cols-[440px_1fr]"><div className="cps-card p-5"><div className="flex items-center justify-between gap-3"><h3 className="text-xl font-bold">RFID funcional</h3><Badge state={state} /></div><p className="mt-2 text-sm text-[var(--cps-text-muted)]">Sem mock: WebRFID/NFC consulta /api/v1/livros/rfid/:etiqueta no PostgreSQL.</p><button className="mt-5 h-11 w-full rounded-xl bg-[var(--cps-accent)] px-6 text-sm font-bold text-white shadow-sm disabled:opacity-60" disabled={loading} onClick={scan} type="button">{loading ? "Processando..." : "Ler RFID do livro"}</button><div className="mt-5 rounded-2xl border border-dashed border-[var(--cps-border-strong)] bg-[var(--cps-card-muted)] p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--cps-text-muted)]">Modo manual técnico</p><div className="mt-3 flex gap-2"><input className="h-10 min-w-0 flex-1 rounded-lg border border-[var(--cps-border)] bg-white px-3 text-sm outline-none" value={manualRfid} onChange={(event) => setManualRfid(event.target.value)} placeholder="RFID para diagnóstico" /><button className="rounded-lg border border-[var(--cps-border-strong)] px-4 text-sm font-bold" onClick={() => findByRfid(manualRfid)} type="button">Buscar</button></div></div><div className="mt-4 grid gap-2 sm:grid-cols-2"><button className="h-10 rounded-xl bg-[var(--cps-accent)] px-4 text-sm font-bold text-white disabled:opacity-60" disabled={loading} onClick={() => loan("emprestimo")} type="button">Emprestar RFID</button><button className="h-10 rounded-xl border border-[var(--cps-border-strong)] bg-white px-4 text-sm font-bold text-[var(--cps-accent)] disabled:opacity-60" disabled={loading} onClick={() => loan("devolucao")} type="button">Devolver RFID</button></div>{rfid && <p className="mt-4 break-all rounded-xl bg-[var(--cps-accent-soft)] p-3 font-mono text-sm font-bold text-[var(--cps-accent)]">{rfid}</p>}{error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}</div><div className="space-y-5"><BookPanel book={book} /><form className="rounded-2xl border border-[var(--cps-border)] bg-white p-5 shadow-sm" onSubmit={(event) => event.preventDefault()}><h3 className="text-xl font-bold">Cadastrar etiqueta no banco</h3><div className="mt-4 grid gap-3 md:grid-cols-2"><input className="h-10 rounded-lg border border-[var(--cps-border)] px-3 text-sm outline-none" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Título do livro" /><input className="h-10 rounded-lg border border-[var(--cps-border)] px-3 text-sm outline-none" value={author} onChange={(event) => setAuthor(event.target.value)} placeholder="Autor" /></div><button className="mt-4 h-10 rounded-xl bg-[var(--cps-accent)] px-6 text-sm font-bold text-white disabled:opacity-60" disabled={loading} onClick={createBook} type="button">Cadastrar no PostgreSQL</button></form></div></div><div className="mt-6 grid gap-5 xl:grid-cols-3"><div className="cps-card p-5"><h3 className="text-xl font-bold">Sala, câmera e mapa</h3><div className="mt-4 space-y-3">{salas.map((sala) => <div className="rounded-xl border border-[var(--cps-border)] bg-white p-4" key={sala.id_sala}><div className="flex items-start justify-between gap-3"><div><p className="font-bold">{sala.nome_sala}</p><p className="text-xs font-bold uppercase text-[var(--cps-accent)]">{sala.status_sala}</p></div><button className="rounded-lg bg-[var(--cps-accent)] px-3 py-2 text-xs font-bold text-white" onClick={() => closeRoom(sala.id_sala)} type="button">Fechar</button></div>{sala.camera_url ? <iframe className="mt-3 h-44 w-full rounded-xl border" src={sala.camera_url} title={`Câmera ${sala.nome_sala}`} /> : <div className="mt-3 rounded-xl bg-[var(--cps-card-muted)] p-6 text-center text-sm text-[var(--cps-text-muted)]">Câmera não configurada</div>}<div className="mt-3 h-24 rounded-xl border border-dashed border-[var(--cps-border-strong)] bg-[var(--cps-card-muted)] p-3 text-xs font-bold text-[var(--cps-text-muted)]">Mapa 2D preparado para evolução Blender/3D · metadata: {JSON.stringify(sala.metadata ?? {})}</div></div>)}</div></div><div className="cps-card p-5"><h3 className="text-xl font-bold">Logs para o Admin</h3><div className="mt-4 space-y-3">{logs.map((log) => <div className="rounded-xl border border-[var(--cps-border)] bg-white p-3" key={log.id_auditoria}><p className="text-sm font-bold text-[var(--cps-accent)]">{log.acao}</p><p className="text-xs text-[var(--cps-text-muted)]">{new Date(log.data_evento).toLocaleString("pt-BR")} · {log.entidade}</p></div>)}</div></div><div className="cps-card p-5"><h3 className="text-xl font-bold">Livros do PostgreSQL</h3><div className="mt-4 grid gap-3">{books.slice(0, 8).map((item) => <div className="rounded-xl border border-[var(--cps-border)] bg-white p-4" key={item.id_livro}><p className="font-bold">{item.nome_livro}</p><p className="mt-1 break-all font-mono text-xs text-[var(--cps-text-muted)]">{item.etiqueta_rfid ?? item.rfid_livro}</p></div>)}</div></div></div></section>;
}
