export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import { exigirAdminOuBibliotecario } from "@/lib/servidor/autenticacao/permissoes";
import { sucesso, tratarErro } from "@/lib/servidor/http/respostas";
import { devolverLivro } from "@/lib/servidor/servicos/libcore";
import { lerJson, numeroObrigatorio, textoObrigatorio } from "@/lib/servidor/validacoes/entrada";

export async function POST(requisicao: NextRequest) {
  try {
    exigirAdminOuBibliotecario(requisicao);
    const corpo = await lerJson(requisicao);
    return sucesso(await devolverLivro(numeroObrigatorio(corpo, "id_usuario"), textoObrigatorio(corpo, "etiqueta_rfid")));
  } catch (falha) {
    return tratarErro(falha);
  }
}

