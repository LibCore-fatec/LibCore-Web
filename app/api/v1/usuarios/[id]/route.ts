export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import { exigirAdminOuBibliotecario } from "@/lib/servidor/autenticacao/permissoes";
import { sucesso, tratarErro } from "@/lib/servidor/http/respostas";
import { atualizarUsuario, buscarUsuario } from "@/lib/servidor/servicos/libcore";
import { lerJson } from "@/lib/servidor/validacoes/entrada";

type Contexto = { params: { id: string } };

export async function GET(requisicao: NextRequest, { params }: Contexto) {
  try {
    exigirAdminOuBibliotecario(requisicao);
    return sucesso(await buscarUsuario(Number(params.id)));
  } catch (falha) {
    return tratarErro(falha);
  }
}

export async function PATCH(requisicao: NextRequest, { params }: Contexto) {
  try {
    exigirAdminOuBibliotecario(requisicao);
    return sucesso(await atualizarUsuario(Number(params.id), await lerJson(requisicao)));
  } catch (falha) {
    return tratarErro(falha);
  }
}

