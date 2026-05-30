import { NextResponse } from "next/server";
import { listarSalas } from "@/lib/server/admin-rooms";

const demoSalas = [
  {
    id_sala: 1,
    id_espaco: 1,
    nome_sala: "Sala de estudo 01",
    status_sala: "ABERTA",
    camera_url: null,
    largura_planta: "12.00",
    altura_planta: "8.00",
    metadata: { mapa: "2d", blender_ready: true },
    atualizada_em: new Date().toISOString(),
  },
];

export async function GET() {
  try {
    const salas = await listarSalas();
    return NextResponse.json({ data: salas.length ? salas : demoSalas });
  } catch {
    return NextResponse.json({ data: demoSalas, mode: "demo" });
  }
}
