import { NextRequest, NextResponse } from "next/server";
import { searchKnowledge } from "@/lib/knowledge-service";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  const category = request.nextUrl.searchParams.get("category") ?? undefined;
  const areaId = request.nextUrl.searchParams.get("areaId") ?? undefined;

  if (!q) {
    return NextResponse.json(
      { error: "Parâmetro q (texto de busca) é obrigatório." },
      { status: 400 },
    );
  }

  const results = await searchKnowledge(q, { category, areaId });
  return NextResponse.json(results);
}
