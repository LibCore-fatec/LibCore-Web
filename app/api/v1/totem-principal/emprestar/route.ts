export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import { sucesso, tratarErro } from "@/lib/servidor/http/respostas";
import { emprestarLivroComToken } from "@/lib/servidor/servicos/libcore";
import { lerJson, textoObrigatorio } from "@/lib/servidor/validacoes/entrada";

export async function POST(requisicao: NextRequest) {
  try {
    const corpo = await lerJson(requisicao);
    return sucesso(await emprestarLivroComToken(textoObrigatorio(corpo, "token_validacao"), textoObrigatorio(corpo, "etiqueta_rfid")));
  } catch (falha) {
    return tratarErro(falha);
  }
}
