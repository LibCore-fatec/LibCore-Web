export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import { obterSessao } from "@/lib/servidor/autenticacao/permissoes";
import { semConteudo, tratarErro } from "@/lib/servidor/http/respostas";
import { cancelarReserva } from "@/lib/servidor/servicos/libcore";

type Contexto = { params: { id: string } };

export async function PATCH(requisicao: NextRequest, { params }: Contexto) {
  try {
    await cancelarReserva(Number(params.id), obterSessao(requisicao));
    return semConteudo();
  } catch (falha) {
    return tratarErro(falha);
  }
}

