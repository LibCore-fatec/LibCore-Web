export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import { obterSessao } from "@/lib/servidor/autenticacao/permissoes";
import { criado, sucesso, tratarErro } from "@/lib/servidor/http/respostas";
import { criarReserva, listarReservas } from "@/lib/servidor/servicos/libcore";
import { lerJson } from "@/lib/servidor/validacoes/entrada";

export async function GET(requisicao: NextRequest) {
  try {
    const sessao = obterSessao(requisicao);
    return sucesso(await listarReservas(sessao));
  } catch (falha) {
    return tratarErro(falha);
  }
}

export async function POST(requisicao: NextRequest) {
  try {
    const sessao = obterSessao(requisicao);
    return criado(await criarReserva(sessao.id_usuario, await lerJson(requisicao)));
  } catch (falha) {
    return tratarErro(falha);
  }
}

