import { NextResponse } from "next/server";
import { fecharSala } from "@/lib/server/admin-rooms";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const sala = await fecharSala(Number(id), body.id_usuario ? Number(body.id_usuario) : null);
  return NextResponse.json({ data: sala });
}
