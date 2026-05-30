import { NextResponse } from "next/server";
import { fecharSala } from "@/lib/server/admin-rooms";
import { createDemoLog } from "@/lib/server/demo-data";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const idSala = Number(id);
  const body = await request.json().catch(() => ({}));
  const idUsuario = body.id_usuario ? Number(body.id_usuario) : null;

  try {
    const sala = await fecharSala(idSala, idUsuario);
    return NextResponse.json({ data: sala });
  } catch {
    const sala = {
      id_sala: Number.isFinite(idSala) ? idSala : 1,
      id_espaco: 1,
      nome_sala: "Sala de estudo 01",
      status_sala: "FECHADA",
      camera_url: null,
      largura_planta: "12.00",
      altura_planta: "8.00",
      metadata: { mapa: "2d", blender_ready: true },
      atualizada_em: new Date().toISOString(),
    };
    createDemoLog({
      id_usuario: idUsuario,
      acao: "SALA_FECHADA_DEMO",
      entidade: "salas",
      id_entidade: sala.id_sala,
      detalhes: { nome_sala: sala.nome_sala },
    });
    return NextResponse.json({ data: sala, mode: "demo" });
  }
}
