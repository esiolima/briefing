import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getRequesterIdentity } from "@/lib/identity";

const createSchema = z.object({
  rawNeed: z.string().trim().min(10, "Conte um pouco mais sobre o que você precisa."),
});

export async function POST(request: NextRequest) {
  const identity = getRequesterIdentity();
  if (!identity) {
    return NextResponse.json(
      { error: "Identificação não encontrada. Volte e informe seus dados." },
      { status: 401 },
    );
  }

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }

  const { rows } = await db.query(
    `INSERT INTO briefing_sessions
       (requester_token, requester_name, area_id, area_name, position_id, position_name, raw_need)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING id, status, raw_need, created_at`,
    [
      identity.token,
      identity.name,
      identity.areaId,
      identity.areaName,
      identity.positionId,
      identity.positionName,
      parsed.data.rawNeed,
    ],
  );

  return NextResponse.json(rows[0], { status: 201 });
}

export async function GET() {
  const identity = getRequesterIdentity();
  if (!identity) {
    return NextResponse.json(
      { error: "Identificação não encontrada." },
      { status: 401 },
    );
  }

  const { rows } = await db.query(
    `SELECT id, status, raw_need, briefing_final, created_at
     FROM briefing_sessions
     WHERE requester_token = $1
     ORDER BY created_at DESC
     LIMIT 20`,
    [identity.token],
  );

  return NextResponse.json(rows);
}
