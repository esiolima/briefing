import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const areaId = request.nextUrl.searchParams.get("areaId");

  if (!areaId) {
    return NextResponse.json(
      { error: "Parâmetro areaId é obrigatório." },
      { status: 400 },
    );
  }

  const { rows } = await db.query(
    `SELECT id, name FROM positions WHERE area_id = $1 AND active = true ORDER BY name`,
    [areaId],
  );

  return NextResponse.json(rows);
}
