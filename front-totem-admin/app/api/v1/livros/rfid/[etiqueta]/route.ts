import { NextResponse } from "next/server";
import { findBookByRfid } from "@/lib/server/admin-books";
import { ensureLocalSchema } from "@/lib/server/bootstrap";

export async function GET(
  _request: Request,
  context: { params: Promise<{ etiqueta: string }> },
) {
  try {
    await ensureLocalSchema();
    const { etiqueta } = await context.params;
    const livro = await findBookByRfid(decodeURIComponent(etiqueta));

    if (!livro) {
      return NextResponse.json({ error: "RFID desconhecido." }, { status: 404 });
    }

    return NextResponse.json({ data: livro });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Falha ao consultar RFID." },
      { status: 500 },
    );
  }
}
