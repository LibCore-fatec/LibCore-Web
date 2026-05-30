export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import { validarRosto } from "@/lib/servidor/servicos/libcore";
import { sucesso, tratarErro } from "@/lib/servidor/http/respostas";
import { lerJson, numeroOpcional, textoObrigatorio } from "@/lib/servidor/validacoes/entrada";

export async function POST(requisicao: NextRequest) {
  try {
    const corpo = await lerJson(requisicao);
    return sucesso(await validarRosto(textoObrigatorio(corpo, "facial_token"), numeroOpcional(corpo, "id_usuario") ?? undefined));
  } catch (falha) {
    return tratarErro(falha);
  }
}

