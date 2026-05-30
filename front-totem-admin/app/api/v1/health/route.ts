import { NextResponse } from "next/server";
import { query } from "@/lib/server/db";

export async function GET() {
  try {
    await query("SELECT 1 AS ok");
    return NextResponse.json({ data: { api: "ok", postgres: "ok" } });
  } catch (error) {
    return NextResponse.json({
      data: {
        api: "ok",
        postgres: "offline",
        fallback: "demo",
        message: error instanceof Error ? error.message : "PostgreSQL indisponivel.",
      },
      mode: "demo",
    });
  }
}
