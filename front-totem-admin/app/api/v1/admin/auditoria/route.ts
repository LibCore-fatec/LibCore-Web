import { NextResponse } from "next/server";
import { createAuditLog, listAuditLogs } from "@/lib/server/audit";
import { createDemoLog, getDemoLogs } from "@/lib/server/demo-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? 50);

  try {
    const logs = await listAuditLogs(Number.isFinite(limit) ? limit : 50);
    return NextResponse.json({ data: logs.length ? logs : getDemoLogs(limit) });
  } catch {
    return NextResponse.json({ data: getDemoLogs(limit), mode: "demo" });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const acao = String(body.acao ?? "").trim();
  const entidade = String(body.entidade ?? "").trim();

  if (!acao || !entidade) {
    return NextResponse.json({ error: "acao e entidade são obrigatórios." }, { status: 400 });
  }

  try {
    const log = await createAuditLog({
      id_usuario: body.id_usuario ? Number(body.id_usuario) : null,
      acao,
      entidade,
      id_entidade: body.id_entidade ? Number(body.id_entidade) : null,
      detalhes: body.detalhes ?? null,
    });
    return NextResponse.json({ data: log }, { status: 201 });
  } catch {
    const log = createDemoLog({
      id_usuario: body.id_usuario ? Number(body.id_usuario) : null,
      acao,
      entidade,
      id_entidade: body.id_entidade ? Number(body.id_entidade) : null,
      detalhes: body.detalhes ?? null,
    });
    return NextResponse.json(
      { data: log, mode: "demo" },
      { status: 201 },
    );
  }
}
