export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import { exigirTotem } from "@/lib/servidor/autenticacao/permissoes";
import { criado, tratarErro } from "@/lib/servidor/http/respostas";
import { criarTicket } from "@/lib/servidor/servicos/libcore";
import { lerJson, numeroOpcional } from "@/lib/servidor/validacoes/entrada";

export async function POST(requisicao: NextRequest) {
  try {
    const sessao = exigirTotem(requisicao);
    const corpo = await lerJson(requisicao);
    const idUsuario = numeroOpcional(corpo, "id_usuario") ?? sessao.id_usuario;
    return criado(await criarTicket(idUsuario, corpo));
  } catch (falha) {
    return tratarErro(falha);
  }
}

