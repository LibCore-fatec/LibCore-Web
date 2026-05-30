import { NextResponse } from "next/server";
import { listBooks } from "@/lib/server/rfid-books";

export async function GET() {
  try {
    return NextResponse.json({ data: await listBooks() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Falha ao carregar livros." }, { status: 500 });
  }
}
