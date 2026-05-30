import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import type { SessaoApi, TipoUsuario } from "@/lib/servidor/tipos";
import { ErroApi } from "@/lib/servidor/http/respostas";

const segredo = process.env.JWT_SECRET ?? process.env.NEXTAUTH_SECRET ?? "libcore-desenvolvimento-altere-este-segredo";
const emissor = "libcore-api";

type PayloadJwt = SessaoApi & {
  iss: string;
  iat: number;
  exp: number;
};

function base64Url(valor: Buffer | string) {
  return Buffer.from(valor).toString("base64url");
}

function assinar(conteudo: string) {
  return createHmac("sha256", segredo).update(conteudo).digest("base64url");
}

export function criarToken(sessao: SessaoApi) {
  const agora = Math.floor(Date.now() / 1000);
  const payload: PayloadJwt = {
    ...sessao,
    iss: emissor,
    iat: agora,
    exp: agora + Number(process.env.JWT_TEMPO_SEGUNDOS ?? 60 * 60 * 8)
  };
  const cabecalho = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const corpo = base64Url(JSON.stringify(payload));
  const assinatura = assinar(`${cabecalho}.${corpo}`);
  return `${cabecalho}.${corpo}.${assinatura}`;
}

export function verificarToken(token: string): SessaoApi {
  const partes = token.split(".");
  if (partes.length !== 3) {
    throw new ErroApi(401, "TOKEN_INVALIDO", "Token de autenticação inválido.");
  }

  const [cabecalho, corpo, assinatura] = partes;
  const assinaturaEsperada = assinar(`${cabecalho}.${corpo}`);
  const recebido = Buffer.from(assinatura);
  const esperado = Buffer.from(assinaturaEsperada);

  if (recebido.length !== esperado.length || !timingSafeEqual(recebido, esperado)) {
    throw new ErroApi(401, "TOKEN_INVALIDO", "Token de autenticação inválido.");
  }

  const payload = JSON.parse(Buffer.from(corpo, "base64url").toString("utf8")) as PayloadJwt;
  if (payload.iss !== emissor || payload.exp < Math.floor(Date.now() / 1000)) {
    throw new ErroApi(401, "TOKEN_EXPIRADO", "Sessão expirada. Faça login novamente.");
  }

  return {
    id_usuario: payload.id_usuario,
    nome_usuario: payload.nome_usuario,
    email_usuario: payload.email_usuario,
    tipo_usuario: payload.tipo_usuario as TipoUsuario
  };
}

export function criarSalt() {
  return randomBytes(16).toString("hex");
}

export function criarHashSenha(senha: string, salt = criarSalt()) {
  const hash = createHmac("sha256", segredo).update(`${salt}:${senha}`).digest("hex");
  return { salt, hash };
}

export function senhaConfere(senha: string, salt: string, hash: string) {
  const calculado = criarHashSenha(senha, salt).hash;
  return timingSafeEqual(Buffer.from(calculado), Buffer.from(hash));
}
