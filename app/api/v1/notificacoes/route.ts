export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import { obterSessao } from "@/lib/servidor/autenticacao/permissoes";
import { sucesso, tratarErro } from "@/lib/servidor/http/respostas";
import { listarNotificacoes } from "@/lib/servidor/servicos/libcore";

export async function GET(requisicao: NextRequest) {
  try {
    return sucesso(await listarNotificacoes(obterSessao(requisicao)));
  } catch (falha) {
    return tratarErro(falha);
  }
}

