export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import { obterSessao } from "@/lib/servidor/autenticacao/permissoes";
import { sucesso, tratarErro } from "@/lib/servidor/http/respostas";
import { obterTokenValidacaoAluno } from "@/lib/servidor/servicos/libcore";

export async function GET(requisicao: NextRequest) {
  try {
    return sucesso(await obterTokenValidacaoAluno(obterSessao(requisicao)));
  } catch (falha) {
    return tratarErro(falha);
  }
}
