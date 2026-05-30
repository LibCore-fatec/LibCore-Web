import { NextResponse } from "next/server";
import { createBook, listBooks } from "@/lib/server/admin-books";
import { ensureLocalSchema } from "@/lib/server/bootstrap";

function errorResponse(error: unknown, fallback: string, status = 500) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : fallback },
    { status },
  );
}

export async function GET() {
  try {
    await ensureLocalSchema();
    const livros = await listBooks();
    return NextResponse.json({ data: livros });
  } catch (error) {
    return errorResponse(error, "Falha ao carregar livros.");
  }
}

export async function POST(request: Request) {
  try {
    await ensureLocalSchema();
    const body = await request.json();
    const etiqueta = String(body.etiqueta_rfid ?? body.rfid_livro ?? "").trim();
    const titulo = String(body.nome_livro ?? "").trim();
    const autor = body.autor_livro ? String(body.autor_livro).trim() : null;

    if (!etiqueta || !titulo) {
      return NextResponse.json({ error: "etiqueta_rfid e nome_livro são obrigatórios." }, { status: 400 });
    }

    const livro = await createBook({ etiqueta_rfid: etiqueta, nome_livro: titulo, autor_livro: autor });
    return NextResponse.json({ data: livro }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Falha ao cadastrar livro.");
  }
}
