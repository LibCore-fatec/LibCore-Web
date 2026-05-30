export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import { entrar } from "@/lib/servidor/servicos/libcore";
import { sucesso, tratarErro } from "@/lib/servidor/http/respostas";
import { lerJson, textoObrigatorio } from "@/lib/servidor/validacoes/entrada";

export async function POST(requisicao: NextRequest) {
  try {
    const corpo = await lerJson(requisicao);
    const identificador = textoObrigatorio(corpo, "identificador");
    const senha = textoObrigatorio(corpo, "senha");
    return sucesso(await entrar(identificador, senha));
  } catch (falha) {
    return tratarErro(falha);
  }
}

