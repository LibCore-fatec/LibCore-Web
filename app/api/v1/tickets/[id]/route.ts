export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import { exigirAdminOuBibliotecario, obterSessao } from "@/lib/servidor/autenticacao/permissoes";
import { sucesso, tratarErro } from "@/lib/servidor/http/respostas";
import { atualizarTicket, buscarTicket } from "@/lib/servidor/servicos/libcore";
import { lerJson } from "@/lib/servidor/validacoes/entrada";

type Contexto = { params: { id: string } };

export async function GET(requisicao: NextRequest, { params }: Contexto) {
  try {
    return sucesso(await buscarTicket(Number(params.id), obterSessao(requisicao)));
  } catch (falha) {
    return tratarErro(falha);
  }
}

export async function PATCH(requisicao: NextRequest, { params }: Contexto) {
  try {
    exigirAdminOuBibliotecario(requisicao);
    return sucesso(await atualizarTicket(Number(params.id), await lerJson(requisicao)));
  } catch (falha) {
    return tratarErro(falha);
  }
}

