import { NextResponse } from "next/server";
import { buscarSala } from "@/lib/server/admin-rooms";

function demoSala() {
  return {
    id_sala: 1,
    id_espaco: 1,
    nome_sala: "Sala de estudo 01",
    status_sala: "ABERTA",
    camera_url: null,
    largura_planta: "12.00",
    altura_planta: "8.00",
    metadata: { mapa: "2d", blender_ready: true },
    atualizada_em: new Date().toISOString(),
  };
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const idSala = Number(id);

  try {
    const sala = await buscarSala(idSala);
    if (!sala) return NextResponse.json({ error: "Sala nao encontrada." }, { status: 404 });
    return NextResponse.json({ data: sala });
  } catch {
    if (idSala !== 1) return NextResponse.json({ error: "Sala nao encontrada." }, { status: 404 });
    return NextResponse.json({ data: demoSala(), mode: "demo" });
  }
}
