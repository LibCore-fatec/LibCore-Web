import { NextResponse } from "next/server";
import { createBook, listBooks } from "@/lib/server/admin-books";

export async function GET() {
  const livros = await listBooks();
  return NextResponse.json({ data: livros });
}

export async function POST(request: Request) {
  const body = await request.json();
  const etiqueta = String(body.etiqueta_rfid ?? body.rfid_livro ?? "").trim();
  const titulo = String(body.nome_livro ?? "").trim();
  const autor = body.autor_livro ? String(body.autor_livro).trim() : null;

  if (!etiqueta || !titulo) {
    return NextResponse.json({ error: "Dados obrigatórios ausentes." }, { status: 400 });
  }

  const livro = await createBook({ etiqueta_rfid: etiqueta, nome_livro: titulo, autor_livro: autor });
  return NextResponse.json({ data: livro }, { status: 201 });
}
