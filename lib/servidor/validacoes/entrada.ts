import { type NextRequest } from "next/server";
import { ErroApi } from "@/lib/servidor/http/respostas";
import type { Paginacao } from "@/lib/servidor/tipos";

export async function lerJson(requisicao: NextRequest) {
  try {
    return (await requisicao.json()) as Record<string, unknown>;
  } catch {
    throw new ErroApi(400, "JSON_INVALIDO", "O corpo da requisição deve ser um JSON válido.");
  }
}

export function textoObrigatorio(corpo: Record<string, unknown>, campo: string) {
  const valor = corpo[campo];
  if (typeof valor !== "string" || valor.trim().length === 0) {
    throw new ErroApi(400, "CAMPO_OBRIGATORIO", `O campo ${campo} é obrigatório.`);
  }
  return valor.trim();
}

export function textoOpcional(corpo: Record<string, unknown>, campo: string) {
  const valor = corpo[campo];
  return typeof valor === "string" && valor.trim().length > 0 ? valor.trim() : null;
}

export function numeroObrigatorio(corpo: Record<string, unknown>, campo: string) {
  const valor = Number(corpo[campo]);
  if (!Number.isInteger(valor) || valor <= 0) {
    throw new ErroApi(400, "CAMPO_INVALIDO", `O campo ${campo} deve ser um número inteiro positivo.`);
  }
  return valor;
}

export function numeroOpcional(corpo: Record<string, unknown>, campo: string) {
  const valor = corpo[campo];
  if (valor === undefined || valor === null || valor === "") return null;
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero <= 0) {
    throw new ErroApi(400, "CAMPO_INVALIDO", `O campo ${campo} deve ser um número inteiro positivo.`);
  }
  return numero;
}

export function obterPaginacao(url: string): Paginacao {
  const parametros = new URL(url).searchParams;
  const pagina = Math.max(Number(parametros.get("pagina") ?? 1), 1);
  const limiteSolicitado = Math.max(Number(parametros.get("limite") ?? 20), 1);
  const limite = Math.min(limiteSolicitado, 100);
  return { pagina, limite, deslocamento: (pagina - 1) * limite };
}
