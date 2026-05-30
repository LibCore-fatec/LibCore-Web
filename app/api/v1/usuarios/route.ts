export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import { exigirAdminOuBibliotecario } from "@/lib/servidor/autenticacao/permissoes";
import { criado, sucesso, tratarErro } from "@/lib/servidor/http/respostas";
import { criarUsuario, listarUsuarios } from "@/lib/servidor/servicos/libcore";
import { lerJson, obterPaginacao } from "@/lib/servidor/validacoes/entrada";

export async function GET(requisicao: NextRequest) {
  try {
    exigirAdminOuBibliotecario(requisicao);
    return sucesso(await listarUsuarios(obterPaginacao(requisicao.url)));
  } catch (falha) {
    return tratarErro(falha);
  }
}

export async function POST(requisicao: NextRequest) {
  try {
    exigirAdminOuBibliotecario(requisicao);
    return criado(await criarUsuario(await lerJson(requisicao)));
  } catch (falha) {
    return tratarErro(falha);
  }
}

