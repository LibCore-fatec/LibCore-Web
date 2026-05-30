import { type NextRequest } from "next/server";
import { verificarToken } from "@/lib/servidor/autenticacao/jwt";
import { ErroApi } from "@/lib/servidor/http/respostas";
import type { SessaoApi, TipoUsuario } from "@/lib/servidor/tipos";

export function obterSessao(requisicao: NextRequest): SessaoApi {
  const cabecalho = requisicao.headers.get("authorization") ?? "";
  const [tipo, token] = cabecalho.split(" ");

  if (tipo !== "Bearer" || !token) {
    throw new ErroApi(401, "NAO_AUTENTICADO", "Informe um token Bearer válido.");
  }

  return verificarToken(token);
}

export function exigirPerfis(requisicao: NextRequest, perfis: TipoUsuario[]) {
  const sessao = obterSessao(requisicao);
  if (!perfis.includes(sessao.tipo_usuario)) {
    throw new ErroApi(403, "ACESSO_NEGADO", "Seu perfil não possui permissão para esta operação.");
  }
  return sessao;
}

export function exigirAdminOuBibliotecario(requisicao: NextRequest) {
  return exigirPerfis(requisicao, ["ADMIN", "BIBLIOTECARIO"]);
}

export function exigirTotem(requisicao: NextRequest) {
  return exigirPerfis(requisicao, ["TOTEM", "ADMIN", "BIBLIOTECARIO"]);
}
