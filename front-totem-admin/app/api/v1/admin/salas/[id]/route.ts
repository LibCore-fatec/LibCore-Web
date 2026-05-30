import { NextResponse } from "next/server";
import { buscarSala } from "@/lib/server/admin-rooms";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const sala = await buscarSala(Number(id));
  if (!sala) return NextResponse.json({ error: "Sala não encontrada." }, { status: 404 });
  return NextResponse.json({ data: sala });
}
