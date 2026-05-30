import { NextResponse } from "next/server";
import { audit } from "@/lib/server/rfid-books";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const acao = String(body.acao ?? "").trim();
    const entidade = String(body.entidade ?? "aluno_web").trim();
    if (!acao) {
      return NextResponse.json({ error: "acao é obrigatória." }, { status: 400 });
    }
    await audit({
      id_usuario: body.id_usuario ? Number(body.id_usuario) : 1,
      acao,
      entidade,
      id_entidade: body.id_entidade ? Number(body.id_entidade) : null,
      detalhes: body.detalhes ?? null,
    });
    return NextResponse.json({ data: { ok: true } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Falha ao registrar auditoria." }, { status: 500 });
  }
}
