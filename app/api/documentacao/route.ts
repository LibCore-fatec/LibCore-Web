import { NextResponse } from "next/server";
import openapi from "@/docs/api/openapi.json";

export async function GET() {
  return NextResponse.json(openapi);
}
