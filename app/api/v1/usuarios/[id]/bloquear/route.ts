export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import { exigirAdminOuBibliotecario } from "@/lib/servidor/autenticacao/permissoes";
import { sucesso, tratarErro } from "@/lib/servidor/http/respostas";
import { bloquearUsuario } from "@/lib/servidor/servicos/libcore";

type Contexto = { params: { id: string } };

export async function PATCH(requisicao: NextRequest, { params }: Contexto) {
  try {
    exigirAdminOuBibliotecario(requisicao);
    return sucesso(await bloquearUsuario(Number(params.id)));
  } catch (falha) {
    return tratarErro(falha);
  }
}

