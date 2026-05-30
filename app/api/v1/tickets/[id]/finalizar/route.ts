export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import { exigirAdminOuBibliotecario } from "@/lib/servidor/autenticacao/permissoes";
import { semConteudo, tratarErro } from "@/lib/servidor/http/respostas";
import { finalizarTicket } from "@/lib/servidor/servicos/libcore";

type Contexto = { params: { id: string } };

export async function PATCH(requisicao: NextRequest, { params }: Contexto) {
  try {
    exigirAdminOuBibliotecario(requisicao);
    await finalizarTicket(Number(params.id));
    return semConteudo();
  } catch (falha) {
    return tratarErro(falha);
  }
}

