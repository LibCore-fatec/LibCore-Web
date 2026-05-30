import { NextResponse } from "next/server";
import { findBookByRfid } from "@/lib/server/admin-books";

export async function GET(
  _request: Request,
  context: { params: Promise<{ etiqueta: string }> },
) {
  const { etiqueta } = await context.params;
  const livro = await findBookByRfid(decodeURIComponent(etiqueta));

  if (!livro) {
    return NextResponse.json({ error: "RFID desconhecido." }, { status: 404 });
  }

  return NextResponse.json({ data: livro });
}
