import { NextResponse } from "next/server";
import { query } from "@/lib/server/db";

export async function GET() {
  try {
    await query("SELECT 1 AS ok");
    return NextResponse.json({ data: { api: "ok", postgres: "ok" } });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "PostgreSQL indisponível." },
      { status: 500 },
    );
  }
}
