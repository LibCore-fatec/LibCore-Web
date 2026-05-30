export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import { exigirAdminOuBibliotecario } from "@/lib/servidor/autenticacao/permissoes";
import { sucesso, tratarErro } from "@/lib/servidor/http/respostas";
import { listarTransacoes } from "@/lib/servidor/servicos/libcore";

export async function GET(requisicao: NextRequest) {
  try {
    exigirAdminOuBibliotecario(requisicao);
    return sucesso(await listarTransacoes());
  } catch (falha) {
    return tratarErro(falha);
  }
}

