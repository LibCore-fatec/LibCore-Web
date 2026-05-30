export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import { exigirAdminOuBibliotecario, obterSessao } from "@/lib/servidor/autenticacao/permissoes";
import { criado, sucesso, tratarErro } from "@/lib/servidor/http/respostas";
import { criarEspaco, listarEspacos } from "@/lib/servidor/servicos/libcore";
import { lerJson } from "@/lib/servidor/validacoes/entrada";

export async function GET(requisicao: NextRequest) {
  try {
    obterSessao(requisicao);
    return sucesso(await listarEspacos());
  } catch (falha) {
    return tratarErro(falha);
  }
}

export async function POST(requisicao: NextRequest) {
  try {
    exigirAdminOuBibliotecario(requisicao);
    return criado(await criarEspaco(await lerJson(requisicao)));
  } catch (falha) {
    return tratarErro(falha);
  }
}

