import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { getRequesterIdentity, setRequesterIdentity } from "@/lib/identity";

const bodySchema = z.object({
  name: z.string().trim().min(1, "Informe seu nome."),
  areaId: z.string().uuid(),
  positionId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }

  const { name, areaId, positionId } = parsed.data;

  const { rows } = await db.query(
    `SELECT a.name AS area_name, p.name AS position_name
     FROM positions p
     JOIN areas a ON a.id = p.area_id
     WHERE p.id = $1 AND p.area_id = $2 AND p.active = true AND a.active = true`,
    [positionId, areaId],
  );

  const match = rows[0];

  if (!match) {
    return NextResponse.json(
      { error: "Área e cargo informados não conferem com o cadastro." },
      { status: 400 },
    );
  }

  setRequesterIdentity({
    token: getRequesterIdentity()?.token ?? randomUUID(),
    name,
    areaId,
    areaName: match.area_name,
    positionId,
    positionName: match.position_name,
  });

  return NextResponse.json({ ok: true });
}
