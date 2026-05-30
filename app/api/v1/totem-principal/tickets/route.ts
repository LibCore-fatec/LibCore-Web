export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import { criado, tratarErro } from "@/lib/servidor/http/respostas";
import { criarTicket, validarTokenTotemPrincipal } from "@/lib/servidor/servicos/libcore";
import { lerJson, textoObrigatorio } from "@/lib/servidor/validacoes/entrada";

export async function POST(requisicao: NextRequest) {
  try {
    const corpo = await lerJson(requisicao);
    const validacao = await validarTokenTotemPrincipal(textoObrigatorio(corpo, "token_validacao"));
    return criado(await criarTicket(validacao.usuario.id_usuario, corpo));
  } catch (falha) {
    return tratarErro(falha);
  }
}
