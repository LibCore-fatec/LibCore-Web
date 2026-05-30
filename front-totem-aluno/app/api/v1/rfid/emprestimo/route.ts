import { NextResponse } from "next/server";
import { emprestar } from "@/lib/server/rfid-books";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const etiqueta = String(body.etiqueta_rfid ?? "").trim();
    const idUsuario = Number(body.id_usuario ?? 1);
    if (!etiqueta) return NextResponse.json({ error: "etiqueta_rfid é obrigatória." }, { status: 400 });
    return NextResponse.json({ data: await emprestar(etiqueta, idUsuario) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Falha ao emprestar por RFID." }, { status: 500 });
  }
}
