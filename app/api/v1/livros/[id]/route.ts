export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import { exigirAdminOuBibliotecario, obterSessao } from "@/lib/servidor/autenticacao/permissoes";
import { semConteudo, sucesso, tratarErro } from "@/lib/servidor/http/respostas";
import { atualizarLivro, buscarLivro, removerLivro } from "@/lib/servidor/servicos/libcore";
import { lerJson } from "@/lib/servidor/validacoes/entrada";

type Contexto = { params: { id: string } };

export async function GET(requisicao: NextRequest, { params }: Contexto) {
  try {
    obterSessao(requisicao);
    return sucesso(await buscarLivro(Number(params.id)));
  } catch (falha) {
    return tratarErro(falha);
  }
}

export async function PATCH(requisicao: NextRequest, { params }: Contexto) {
  try {
    exigirAdminOuBibliotecario(requisicao);
    return sucesso(await atualizarLivro(Number(params.id), await lerJson(requisicao)));
  } catch (falha) {
    return tratarErro(falha);
  }
}

export async function DELETE(requisicao: NextRequest, { params }: Contexto) {
  try {
    exigirAdminOuBibliotecario(requisicao);
    await removerLivro(Number(params.id));
    return semConteudo();
  } catch (falha) {
    return tratarErro(falha);
  }
}

