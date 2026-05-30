import { NextResponse } from "next/server";
import { findBookByRfid } from "@/lib/server/admin-books";
import { createDemoLog, findDemoBookByRfid } from "@/lib/server/demo-data";

export async function GET(
  _request: Request,
  context: { params: Promise<{ etiqueta: string }> },
) {
  const { etiqueta } = await context.params;
  const clean = decodeURIComponent(etiqueta).trim();

  if (!clean) {
    return NextResponse.json({ error: "RFID vazio." }, { status: 400 });
  }

  try {
    const livro = await findBookByRfid(clean);
    if (livro) {
      return NextResponse.json({ data: livro });
    }
  } catch {
    // O fallback demo abaixo mantem a apresentacao funcionando sem PostgreSQL.
  }

  const demo = findDemoBookByRfid(clean);
  if (demo) {
    createDemoLog({
      acao: "LEITURA_RFID_DEMO",
      entidade: "livros",
      id_entidade: demo.id_livro,
      detalhes: { etiqueta_rfid: clean, nome_livro: demo.nome_livro },
    });
    return NextResponse.json({ data: demo, mode: "demo" });
  }

  createDemoLog({
    acao: "RFID_DESCONHECIDO",
    entidade: "livros",
    detalhes: { etiqueta_rfid: clean },
  });
  return NextResponse.json({ error: "RFID desconhecido." }, { status: 404 });
}
