export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import { sucesso, tratarErro } from "@/lib/servidor/http/respostas";
import { validarRosto } from "@/lib/servidor/servicos/libcore";
import { lerJson, numeroOpcional, textoObrigatorio } from "@/lib/servidor/validacoes/entrada";

export async function POST(requisicao: NextRequest) {
  try {
    const corpo = await lerJson(requisicao);
    const facialToken = textoObrigatorio(corpo, "facial_token");
    const idUsuario = numeroOpcional(corpo, "id_usuario") ?? undefined;
    return sucesso(await validarRosto(facialToken, idUsuario));
  } catch (falha) {
    return tratarErro(falha);
  }
}

