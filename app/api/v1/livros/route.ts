export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import { exigirAdminOuBibliotecario, obterSessao } from "@/lib/servidor/autenticacao/permissoes";
import { criado, sucesso, tratarErro } from "@/lib/servidor/http/respostas";
import { criarLivro, listarLivros } from "@/lib/servidor/servicos/libcore";
import { lerJson, obterPaginacao } from "@/lib/servidor/validacoes/entrada";

export async function GET(requisicao: NextRequest) {
  try {
    obterSessao(requisicao);
    return sucesso(await listarLivros(requisicao.url, obterPaginacao(requisicao.url)));
  } catch (falha) {
    return tratarErro(falha);
  }
}

export async function POST(requisicao: NextRequest) {
  try {
    exigirAdminOuBibliotecario(requisicao);
    return criado(await criarLivro(await lerJson(requisicao)));
  } catch (falha) {
    return tratarErro(falha);
  }
}

