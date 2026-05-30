export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import { obterSessao } from "@/lib/servidor/autenticacao/permissoes";
import { sucesso, tratarErro } from "@/lib/servidor/http/respostas";
import { buscarLivroPorRfid } from "@/lib/servidor/servicos/libcore";

type Contexto = { params: { etiqueta: string } };

export async function GET(requisicao: NextRequest, { params }: Contexto) {
  try {
    obterSessao(requisicao);
    return sucesso(await buscarLivroPorRfid(params.etiqueta));
  } catch (falha) {
    return tratarErro(falha);
  }
}

