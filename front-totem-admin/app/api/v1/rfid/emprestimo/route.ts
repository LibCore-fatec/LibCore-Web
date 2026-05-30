import { NextResponse } from "next/server";
import { emprestarLivroPorRfid } from "@/lib/server/admin-loans";
import { createDemoLog, setDemoBookStatus } from "@/lib/server/demo-data";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const etiqueta = String(body.etiqueta_rfid ?? body.rfid_livro ?? "").trim();
  const idUsuario = Number(body.id_usuario ?? 1);

  if (!etiqueta) {
    return NextResponse.json({ error: "etiqueta_rfid e obrigatoria." }, { status: 400 });
  }

  try {
    const result = await emprestarLivroPorRfid({
      etiqueta_rfid: etiqueta,
      id_usuario: Number.isFinite(idUsuario) ? idUsuario : 1,
    });
    return NextResponse.json({ data: result });
  } catch {
    const demo = setDemoBookStatus(etiqueta, "EMPRESTADO");
    if (!demo) {
      createDemoLog({
        id_usuario: Number.isFinite(idUsuario) ? idUsuario : 1,
        acao: "RFID_DESCONHECIDO",
        entidade: "livros",
        detalhes: { etiqueta_rfid: etiqueta, operacao: "emprestimo" },
      });
      return NextResponse.json({ error: "Livro nao encontrado para esta etiqueta RFID." }, { status: 404 });
    }

    createDemoLog({
      id_usuario: Number.isFinite(idUsuario) ? idUsuario : 1,
      acao: "EMPRESTIMO_RFID_DEMO",
      entidade: "livros",
      id_entidade: demo.id_livro,
      detalhes: { etiqueta_rfid: etiqueta, nome_livro: demo.nome_livro },
    });
    return NextResponse.json({ data: demo, mode: "demo" });
  }
}
