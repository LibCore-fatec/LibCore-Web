"use client";

import { useState } from "react";
import { totemPrincipalApi } from "@/lib/api";
import type { CatalogBook, Usuario } from "@/lib/types";

export default function TotemPrincipalPage() {
  const [tokenValidacao, setTokenValidacao] = useState("");
  const [etiquetaRfid, setEtiquetaRfid] = useState("");
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [livro, setLivro] = useState<CatalogBook | null>(null);
  const [mensagem, setMensagem] = useState("Informe o token do aluno para iniciar.");
  const [carregando, setCarregando] = useState(false);

  async function executar(acao: () => Promise<unknown>, sucesso: string) {
    setCarregando(true);
    try {
      await acao();
      setMensagem(sucesso);
    } catch (erro) {
      setMensagem(erro instanceof Error ? erro.message : "Não foi possível concluir a operação.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--cps-bg)] p-5 text-[var(--cps-text)] md:p-8">
      <section className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[380px_1fr]">
        <div className="cps-card p-5">
          <p className="text-sm font-semibold text-[var(--cps-accent)]">Mobile Totem Principal</p>
          <h1 className="mt-2 text-3xl font-semibold">Validação da biblioteca</h1>
          <p className="mt-2 text-sm text-[var(--cps-text-muted)]">
            Use o token numérico do aluno e a etiqueta RFID/QR mock do livro para emprestar ou devolver.
          </p>

          <label className="mt-6 block text-sm font-semibold">
            Token do aluno
            <input
              className="mt-2 h-12 w-full rounded-md border border-[var(--cps-border)] bg-[var(--cps-card-muted)] px-3 text-lg tracking-[0.3em] outline-none"
              inputMode="numeric"
              maxLength={6}
              value={tokenValidacao}
              onChange={(event) => setTokenValidacao(event.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
            />
          </label>

          <label className="mt-4 block text-sm font-semibold">
            Etiqueta RFID ou QR mock
            <input
              className="mt-2 h-12 w-full rounded-md border border-[var(--cps-border)] bg-[var(--cps-card-muted)] px-3 outline-none"
              value={etiquetaRfid}
              onChange={(event) => setEtiquetaRfid(event.target.value)}
              placeholder="RFID-TEC-1842"
            />
          </label>

          <div className="mt-5 grid gap-3">
            <button
              className="h-11 rounded-md bg-[var(--cps-accent)] font-semibold text-white disabled:opacity-60"
              disabled={carregando || tokenValidacao.length !== 6}
              onClick={() =>
                executar(async () => {
                  const validacao = await totemPrincipalApi.validarToken(tokenValidacao);
                  setUsuario(validacao.usuario);
                }, "Token validado. Aluno identificado.")
              }
              type="button"
            >
              Validar token
            </button>
            <button
              className="h-11 rounded-md border border-[var(--cps-border)] font-semibold disabled:opacity-60"
              disabled={carregando || !etiquetaRfid}
              onClick={() =>
                executar(async () => {
                  setLivro(await totemPrincipalApi.buscarLivro(etiquetaRfid));
                }, "Livro localizado pela etiqueta RFID.")
              }
              type="button"
            >
              Buscar livro
            </button>
          </div>
        </div>

        <div className="grid gap-5">
          <div className="cps-card p-5">
            <h2 className="text-xl font-semibold">Status</h2>
            <p className="mt-2 rounded-md bg-[var(--cps-card-muted)] p-3 text-sm text-[var(--cps-text-muted)]">
              {mensagem}
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-[var(--cps-border)] p-4">
                <p className="text-sm text-[var(--cps-text-muted)]">Aluno</p>
                <p className="mt-1 font-semibold">{usuario?.nome_usuario ?? "Aguardando token"}</p>
              </div>
              <div className="rounded-lg border border-[var(--cps-border)] p-4">
                <p className="text-sm text-[var(--cps-text-muted)]">Livro</p>
                <p className="mt-1 font-semibold">{livro?.nome_livro ?? "Aguardando RFID"}</p>
              </div>
            </div>
          </div>

          <div className="cps-card grid gap-3 p-5 md:grid-cols-2">
            <button
              className="h-14 rounded-md bg-[var(--cps-accent)] text-base font-semibold text-white disabled:opacity-60"
              disabled={carregando || tokenValidacao.length !== 6 || !etiquetaRfid}
              onClick={() =>
                executar(
                  () => totemPrincipalApi.emprestar(tokenValidacao, etiquetaRfid),
                  "Empréstimo registrado. O token permanece ativo até a devolução.",
                )
              }
              type="button"
            >
              Registrar empréstimo
            </button>
            <button
              className="h-14 rounded-md bg-slate-900 text-base font-semibold text-white disabled:opacity-60"
              disabled={carregando || tokenValidacao.length !== 6 || !etiquetaRfid}
              onClick={() =>
                executar(
                  () => totemPrincipalApi.devolver(tokenValidacao, etiquetaRfid),
                  "Devolução registrada. Token do aluno desativado.",
                )
              }
              type="button"
            >
              Registrar devolução
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
