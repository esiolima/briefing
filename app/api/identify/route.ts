import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { setRequesterIdentity } from "@/lib/identity";

const bodySchema = z.object({
  name: z.string().trim().min(1, "Informe seu nome."),
  areaId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }

  const { name, areaId } = parsed.data;

  const { rows } = await db.query(
    `SELECT a.name AS area_name
     FROM areas a
     WHERE a.id = $1 AND a.active = true`,
    [areaId],
  );

  const match = rows[0];

  if (!match) {
    return NextResponse.json(
      { error: "A área informada não está disponível." },
      { status: 400 },
    );
  }

  setRequesterIdentity({
    name,
    areaId,
    areaName: match.area_name,
  });

  return NextResponse.json({ ok: true });
}
