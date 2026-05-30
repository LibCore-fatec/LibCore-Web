import { NextResponse } from "next/server";
import { audit, findBookByRfid } from "@/lib/server/rfid-books";

export async function GET(_request: Request, context: { params: Promise<{ etiqueta: string }> }) {
  try {
    const { etiqueta } = await context.params;
    const clean = decodeURIComponent(etiqueta);
    const livro = await findBookByRfid(clean);
    if (!livro) {
      await audit({ id_usuario: 1, acao: "ALUNO_RFID_DESCONHECIDO", entidade: "livros", detalhes: { etiqueta_rfid: clean } });
      return NextResponse.json({ error: "RFID desconhecido." }, { status: 404 });
    }
    await audit({ id_usuario: 1, acao: "ALUNO_LEU_RFID", entidade: "livros", id_entidade: livro.id_livro, detalhes: { etiqueta_rfid: clean } });
    return NextResponse.json({ data: livro });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Falha ao consultar RFID." }, { status: 500 });
  }
}
