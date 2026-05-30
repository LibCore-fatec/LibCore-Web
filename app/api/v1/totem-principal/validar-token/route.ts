export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import { sucesso, tratarErro } from "@/lib/servidor/http/respostas";
import { validarTokenTotemPrincipal } from "@/lib/servidor/servicos/libcore";
import { lerJson, textoObrigatorio } from "@/lib/servidor/validacoes/entrada";

export async function POST(requisicao: NextRequest) {
  try {
    const corpo = await lerJson(requisicao);
    return sucesso(await validarTokenTotemPrincipal(textoObrigatorio(corpo, "token_validacao")));
  } catch (falha) {
    return tratarErro(falha);
  }
}
