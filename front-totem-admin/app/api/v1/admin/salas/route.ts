import { NextResponse } from "next/server";
import { listarSalas } from "@/lib/server/admin-rooms";

export async function GET() {
  const salas = await listarSalas();
  return NextResponse.json({ data: salas });
}
