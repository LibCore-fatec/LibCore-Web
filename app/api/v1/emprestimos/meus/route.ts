export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import { obterSessao } from "@/lib/servidor/autenticacao/permissoes";
import { sucesso, tratarErro } from "@/lib/servidor/http/respostas";
import { listarEmprestimos } from "@/lib/servidor/servicos/libcore";

export async function GET(requisicao: NextRequest) {
  try {
    const sessao = obterSessao(requisicao);
    return sucesso(await listarEmprestimos(sessao, true));
  } catch (falha) {
    return tratarErro(falha);
  }
}

