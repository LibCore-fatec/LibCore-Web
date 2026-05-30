export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import { exigirAdminOuBibliotecario, obterSessao } from "@/lib/servidor/autenticacao/permissoes";
import { sucesso, tratarErro } from "@/lib/servidor/http/respostas";
import { emprestarLivro, listarEmprestimos } from "@/lib/servidor/servicos/libcore";
import { lerJson, numeroObrigatorio, textoObrigatorio } from "@/lib/servidor/validacoes/entrada";

export async function GET(requisicao: NextRequest) {
  try {
    const sessao = exigirAdminOuBibliotecario(requisicao);
    return sucesso(await listarEmprestimos(sessao));
  } catch (falha) {
    return tratarErro(falha);
  }
}

export async function POST(requisicao: NextRequest) {
  try {
    exigirAdminOuBibliotecario(requisicao);
    const corpo = await lerJson(requisicao);
    return sucesso(await emprestarLivro(numeroObrigatorio(corpo, "id_usuario"), textoObrigatorio(corpo, "etiqueta_rfid")));
  } catch (falha) {
    return tratarErro(falha);
  }
}

