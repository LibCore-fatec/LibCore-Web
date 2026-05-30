"use client";

import { useMemo, useState } from "react";

type Book = {
  id_livro: number;
  etiqueta_rfid: string;
  nome_livro: string;
  autor_livro: string;
  statusLabel: "Disponível" | "Emprestado";
  locationLabel: string;
  setor: string;
  estante: string;
  divisoria: string;
};

const demoBooks: Book[] = [
  { id_livro: 1, etiqueta_rfid: "53:fd:3a:38:63:00:01", nome_livro: "Livro 1", autor_livro: "LibCore", statusLabel: "Disponível", locationLabel: "Setor A · Estante 01 · Divisória 01 · Nº 1", setor: "A", estante: "01", divisoria: "01" },
  { id_livro: 2, etiqueta_rfid: "RFID-TEC-1842", nome_livro: "Engenharia de Software Moderna", autor_livro: "Ian Sommerville", statusLabel: "Disponível", locationLabel: "Setor A · Estante 04 · Divisória 02 · Nº 12", setor: "A", estante: "04", divisoria: "02" },
  { id_livro: 3, etiqueta_rfid: "RFID-TEC-2145", nome_livro: "Banco de Dados", autor_livro: "Elmasri & Navathe", statusLabel: "Emprestado", locationLabel: "Setor B · Estante 02 · Divisória 01 · Nº 8", setor: "B", estante: "02", divisoria: "01" },
  { id_livro: 4, etiqueta_rfid: "RFID-IA-9001", nome_livro: "Inteligência Artificial", autor_livro: "Russell & Norvig", statusLabel: "Disponível", locationLabel: "Setor C · Estante 01 · Divisória 03 · Nº 21", setor: "C", estante: "01", divisoria: "03" },
];

const sectors = ["A", "B", "C", "D"];

function pickDemoTag() {
  return demoBooks[Math.floor(Date.now() / 1000) % demoBooks.length].etiqueta_rfid;
}

async function readRfid(): Promise<{ etiqueta_rfid: string; source: string }> {
  const win = window as unknown as {
    WebRFID?: { read?: () => Promise<string>; connect?: () => Promise<void> };
    webRFID?: { read?: () => Promise<string>; connect?: () => Promise<void> };
    NDEFReader?: new () => { scan: () => Promise<void>; onreading: ((event: { serialNumber?: string }) => void) | null; onreadingerror: (() => void) | null };
  };

  const reader = win.WebRFID ?? win.webRFID;
  if (reader?.read) {
    await reader.connect?.();
    const value = await reader.read();
    if (value) return { etiqueta_rfid: value.trim(), source: "WebRFID" };
  }

  if (win.NDEFReader && window.isSecureContext) {
    return new Promise((resolve, reject) => {
      const nfc = new win.NDEFReader!();
      const timeout = window.setTimeout(() => reject(new Error("timeout")), 5000);
      nfc.onreading = (event) => {
        window.clearTimeout(timeout);
        if (event.serialNumber) resolve({ etiqueta_rfid: event.serialNumber, source: "Web NFC" });
        else reject(new Error("empty"));
      };
      nfc.onreadingerror = () => reject(new Error("nfc"));
      nfc.scan().catch(reject);
    });
  }

  return { etiqueta_rfid: pickDemoTag(), source: "Modo apresentação" };
}

export default function StudentTotemPage() {
  const [book, setBook] = useState<Book>(demoBooks[0]);
  const [tag, setTag] = useState(demoBooks[0].etiqueta_rfid);
  const [status, setStatus] = useState("RFID/NFC pronto para apresentação.");
  const [tab, setTab] = useState<"rfid" | "mapa" | "acervo" | "suporte">("rfid");
  const [logs, setLogs] = useState<string[]>(["Totem aluno iniciado", "Modo apresentação disponível"]);
  const [loading, setLoading] = useState(false);

  const activeSector = book.setor;
  const visibleBooks = useMemo(() => demoBooks, []);

  async function scan() {
    setLoading(true);
    setStatus("Aguardando leitura RFID/NFC...");
    try {
      const reading = await readRfid();
      const found = demoBooks.find((item) => item.etiqueta_rfid.toLowerCase() === reading.etiqueta_rfid.toLowerCase()) ?? demoBooks[0];
      setTag(reading.etiqueta_rfid);
      setBook(found);
      setStatus(`${reading.source}: ${found.nome_livro}`);
      setLogs((current) => [`Leitura ${reading.source}: ${found.nome_livro}`, ...current]);
    } catch {
      const found = demoBooks[0];
      setTag(found.etiqueta_rfid);
      setBook(found);
      setStatus("Modo apresentação: leitura simulada carregada.");
      setLogs((current) => [`Leitura simulada: ${found.nome_livro}`, ...current]);
    } finally {
      setLoading(false);
    }
  }

  function action(type: "emprestimo" | "devolucao") {
    const label = type === "emprestimo" ? "Empréstimo" : "Devolução";
    setStatus(`${label} registrado em modo apresentação.`);
    setLogs((current) => [`${label}: ${book.nome_livro} (${tag})`, ...current]);
    setBook((current) => ({ ...current, statusLabel: type === "emprestimo" ? "Emprestado" : "Disponível" }));
  }

  return (
    <main className="min-h-screen px-4 py-5 md:px-8 lg:px-10">
      <header className="mx-auto mb-5 flex max-w-7xl flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--cps-accent)]">LibCore · Totem Aluno</p>
          <h1 className="mt-1 text-3xl font-bold text-[var(--cps-text)]">Biblioteca inteligente</h1>
          <p className="mt-2 text-sm text-[var(--cps-text-muted)]">RFID/NFC real quando disponível, com modo apresentação para celular.</p>
        </div>
        <div className="rounded-2xl bg-[var(--cps-accent-soft)] px-4 py-3 text-sm font-bold text-[var(--cps-accent)]">{status}</div>
      </header>

      <nav className="mx-auto mb-5 grid max-w-7xl grid-cols-4 gap-2 rounded-2xl bg-white p-2 shadow-sm">
        {[
          ["rfid", "RFID"],
          ["mapa", "Mapa"],
          ["acervo", "Acervo"],
          ["suporte", "Suporte"],
        ].map(([id, label]) => (
          <button key={id} className={`rounded-xl px-3 py-3 text-sm font-bold ${tab === id ? "bg-[var(--cps-accent)] text-white" : "text-[var(--cps-text-muted)]"}`} onClick={() => setTab(id as typeof tab)} type="button">{label}</button>
        ))}
      </nav>

      <section className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[1fr_380px]">
        <div className="cps-card p-5">
          {tab === "rfid" && (
            <div>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--cps-accent)]">Leitura de livro</p>
                  <h2 className="mt-1 text-2xl font-bold">RFID/NFC do aluno</h2>
                  <p className="mt-1 text-sm text-[var(--cps-text-muted)]">Use o leitor real ou apresente com dados mockados.</p>
                </div>
                <button className="h-11 rounded-xl bg-[var(--cps-accent)] px-6 text-sm font-bold text-white disabled:opacity-60" disabled={loading} onClick={scan} type="button">{loading ? "Lendo..." : "Ler RFID/NFC"}</button>
              </div>
              <div className="mt-5 rounded-3xl border border-[var(--cps-border)] bg-white p-5">
                <p className="font-mono text-sm font-bold text-[var(--cps-accent)]">{tag}</p>
                <h3 className="mt-2 text-3xl font-bold">{book.nome_livro}</h3>
                <p className="mt-1 text-sm text-[var(--cps-text-muted)]">{book.autor_livro}</p>
                <p className="mt-4 rounded-2xl bg-[var(--cps-card-muted)] p-4 text-sm font-bold">{book.locationLabel}</p>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <button className="rounded-xl bg-[var(--cps-accent)] px-5 py-3 text-sm font-bold text-white" onClick={() => action("emprestimo")} type="button">Emprestar</button>
                  <button className="rounded-xl border border-[var(--cps-border-strong)] bg-white px-5 py-3 text-sm font-bold text-[var(--cps-accent)]" onClick={() => action("devolucao")} type="button">Devolver</button>
                </div>
              </div>
            </div>
          )}

          {tab === "mapa" && (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--cps-accent)]">Mapa 2D</p>
              <h2 className="mt-1 text-2xl font-bold">Localização do acervo</h2>
              <div className="mt-5 grid min-h-[420px] grid-cols-4 grid-rows-[80px_1fr_80px] gap-4 rounded-3xl border border-[var(--cps-border)] bg-[linear-gradient(135deg,rgba(176,0,32,0.08),white,rgba(32,44,57,0.08))] p-5">
                {["Entrada", "Balcão", "Consulta", "Sala"].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-center text-xs font-bold uppercase text-[var(--cps-accent)] shadow-sm">{item}</div>)}
                {sectors.map((sector) => <div key={sector} className={`rounded-3xl border p-4 ${activeSector === sector ? "border-[var(--cps-accent)] bg-[var(--cps-accent-soft)] text-[var(--cps-accent)]" : "border-[var(--cps-border)] bg-white"}`}><p className="text-xs font-bold uppercase">Setor {sector}</p><div className="mt-8 space-y-3"><div className="h-4 rounded-full bg-current opacity-20"/><div className="h-4 rounded-full bg-current opacity-20"/><div className="h-4 rounded-full bg-current opacity-20"/></div>{activeSector === sector && <p className="mt-5 rounded-full bg-[var(--cps-accent)] px-3 py-1 text-center text-xs font-bold text-white">RFID localizado</p>}</div>)}
                <div className="col-span-4 rounded-3xl border border-dashed border-[var(--cps-border-strong)] bg-white/80 p-4 text-center text-sm font-bold text-[var(--cps-accent)]">Rota: Entrada → Setor {book.setor} → Estante {book.estante} → Divisória {book.divisoria}</div>
              </div>
            </div>
          )}

          {tab === "acervo" && <div className="grid gap-3 md:grid-cols-2">{visibleBooks.map((item) => <article key={item.id_livro} className="rounded-2xl border border-[var(--cps-border)] bg-white p-4"><p className="font-mono text-xs font-bold text-[var(--cps-accent)]">{item.etiqueta_rfid}</p><h3 className="mt-2 font-bold">{item.nome_livro}</h3><p className="mt-1 text-sm text-[var(--cps-text-muted)]">{item.locationLabel}</p></article>)}</div>}

          {tab === "suporte" && <div><h2 className="text-2xl font-bold">Suporte</h2><p className="mt-2 text-sm text-[var(--cps-text-muted)]">Ticket mockado enviado para o Admin.</p><button className="mt-5 rounded-xl bg-[var(--cps-accent)] px-5 py-3 text-sm font-bold text-white" onClick={() => setLogs((current) => ["Ticket enviado: problema no leitor RFID", ...current])} type="button">Abrir ticket</button></div>}
        </div>

        <aside className="space-y-5">
          <div className="cps-card p-5"><h2 className="text-xl font-bold">Livro atual</h2><p className="mt-3 text-2xl font-bold text-[var(--cps-accent)]">{book.nome_livro}</p><p className="mt-2 text-sm text-[var(--cps-text-muted)]">{book.locationLabel}</p><span className="mt-4 inline-flex rounded-full bg-[var(--cps-accent-soft)] px-3 py-1 text-xs font-bold text-[var(--cps-accent)]">{book.statusLabel}</span></div>
          <div className="cps-card p-5"><h2 className="text-xl font-bold">Logs da apresentação</h2><div className="mt-4 space-y-2">{logs.slice(0, 6).map((log, index) => <p key={`${log}-${index}`} className="rounded-xl bg-[var(--cps-card-muted)] p-3 text-sm font-semibold text-[var(--cps-text-muted)]">{log}</p>)}</div></div>
        </aside>
      </section>
    </main>
  );
}
