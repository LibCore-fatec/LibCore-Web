import { NextResponse } from "next/server";

export class ErroApi extends Error {
  constructor(
    public status: number,
    public codigo: string,
    mensagem: string,
    public detalhes?: unknown
  ) {
    super(mensagem);
  }
}

export function sucesso(dados: unknown = null, metadados: Record<string, unknown> = {}, status = 200) {
  return NextResponse.json({ dados, metadados }, { status });
}

export function criado(dados: unknown = null, metadados: Record<string, unknown> = {}) {
  return sucesso(dados, metadados, 201);
}

export function semConteudo() {
  return new NextResponse(null, { status: 204 });
}

export function erro(status: number, codigo: string, mensagem: string, detalhes?: unknown) {
  return NextResponse.json({ erro: { codigo, mensagem, detalhes } }, { status });
}

export function tratarErro(falha: unknown) {
  if (falha instanceof ErroApi) {
    return erro(falha.status, falha.codigo, falha.message, falha.detalhes);
  }

  console.error(falha);
  return erro(500, "ERRO_INTERNO", "Não foi possível concluir a operação.");
}
