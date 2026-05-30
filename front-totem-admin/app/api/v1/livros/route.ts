import { NextResponse } from "next/server";
import { createBook, listBooks } from "@/lib/server/admin-books";
import { createDemoBook, createDemoLog, getDemoBooks } from "@/lib/server/demo-data";

function errorResponse(error: unknown, fallback: string, status = 500) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : fallback },
    { status },
  );
}

export async function GET() {
  try {
    const livros = await listBooks();
    return NextResponse.json({ data: livros.length ? livros : getDemoBooks() });
  } catch {
    return NextResponse.json({ data: getDemoBooks(), mode: "demo" });
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const etiqueta = String(body.etiqueta_rfid ?? body.rfid_livro ?? "").trim();
  const titulo = String(body.nome_livro ?? "").trim();
  const autor = body.autor_livro ? String(body.autor_livro).trim() : null;

  if (!etiqueta || !titulo) {
    return NextResponse.json(
      { error: "etiqueta_rfid e nome_livro sao obrigatorios." },
      { status: 400 },
    );
  }

  try {
    const livro = await createBook({
      etiqueta_rfid: etiqueta,
      nome_livro: titulo,
      autor_livro: autor,
    });
    return NextResponse.json({ data: livro }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && /duplicate|unique|23505/i.test(error.message)) {
      return errorResponse(error, "Etiqueta RFID ja cadastrada.", 409);
    }

    const livro = createDemoBook({
      etiqueta_rfid: etiqueta,
      nome_livro: titulo,
      autor_livro: autor,
    });
    createDemoLog({
      acao: "CADASTRO_RFID_DEMO",
      entidade: "livros",
      id_entidade: livro.id_livro,
      detalhes: {
        etiqueta_rfid: etiqueta,
        nome_livro: titulo,
        motivo: "PostgreSQL indisponivel",
      },
    });
    return NextResponse.json({ data: livro, mode: "demo" }, { status: 201 });
  }
}
