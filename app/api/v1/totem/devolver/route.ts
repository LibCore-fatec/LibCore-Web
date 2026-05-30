export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import { exigirTotem } from "@/lib/servidor/autenticacao/permissoes";
import { sucesso, tratarErro } from "@/lib/servidor/http/respostas";
import { devolverLivro } from "@/lib/servidor/servicos/libcore";
import { lerJson, numeroOpcional, textoObrigatorio } from "@/lib/servidor/validacoes/entrada";

export async function POST(requisicao: NextRequest) {
  try {
    const sessao = exigirTotem(requisicao);
    const corpo = await lerJson(requisicao);
    const idUsuario = numeroOpcional(corpo, "id_usuario") ?? sessao.id_usuario;
    const etiquetaRfid = textoObrigatorio(corpo, "etiqueta_rfid");
    return sucesso(await devolverLivro(idUsuario, etiquetaRfid));
  } catch (falha) {
    return tratarErro(falha);
  }
}

