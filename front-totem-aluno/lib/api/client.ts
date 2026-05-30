import type { RespostaApi } from "@/lib/types";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

function obterToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("libcore_token");
}

export function salvarToken(token: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("libcore_token", token);
  }
}

export async function apiFetch<T>(caminho: string, init: RequestInit = {}) {
  const token = obterToken();
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const resposta = await fetch(`${apiBaseUrl}${caminho}`, {
    ...init,
    headers,
    cache: "no-store"
  });

  const corpo = (await resposta.json().catch(() => null)) as RespostaApi<T> | { erro?: { mensagem?: string } } | null;

  if (!resposta.ok) {
    const mensagem = corpo && "erro" in corpo ? corpo.erro?.mensagem : "Não foi possível comunicar com a API.";
    throw new Error(mensagem ?? "Não foi possível comunicar com a API.");
  }

  return (corpo as RespostaApi<T>).dados;
}
