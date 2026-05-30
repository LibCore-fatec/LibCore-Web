export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import { obterSessao } from "@/lib/servidor/autenticacao/permissoes";
import { sucesso, tratarErro } from "@/lib/servidor/http/respostas";

export async function GET(requisicao: NextRequest) {
  try {
    return sucesso(obterSessao(requisicao));
  } catch (falha) {
    return tratarErro(falha);
  }
}

