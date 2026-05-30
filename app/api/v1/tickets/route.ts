export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import { obterSessao } from "@/lib/servidor/autenticacao/permissoes";
import { criado, sucesso, tratarErro } from "@/lib/servidor/http/respostas";
import { criarTicket, listarTickets } from "@/lib/servidor/servicos/libcore";
import { lerJson } from "@/lib/servidor/validacoes/entrada";

export async function GET(requisicao: NextRequest) {
  try {
    const sessao = obterSessao(requisicao);
    return sucesso(await listarTickets(sessao));
  } catch (falha) {
    return tratarErro(falha);
  }
}

export async function POST(requisicao: NextRequest) {
  try {
    const sessao = obterSessao(requisicao);
    return criado(await criarTicket(sessao.id_usuario, await lerJson(requisicao)));
  } catch (falha) {
    return tratarErro(falha);
  }
}

