import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { loadOwnedSession } from "@/lib/briefing-session";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const { session } = await loadOwnedSession(params.id);

  if (!session) {
    return NextResponse.json(
      { error: "Briefing não encontrado." },
      { status: 404 },
    );
  }

  return NextResponse.json(session);
}

const patchSchema = z.object({
  briefingFinal: z.record(z.unknown()).optional(),
  status: z.enum(["aguardando_revisao", "aprovado"]).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const { session } = await loadOwnedSession(params.id);

  if (!session) {
    return NextResponse.json(
      { error: "Briefing não encontrado." },
      { status: 404 },
    );
  }

  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const { rows } = await db.query(
    `UPDATE briefing_sessions SET
       briefing_final = COALESCE($1, briefing_final),
       status = COALESCE($2, status),
       updated_at = now()
     WHERE id = $3
     RETURNING id, status, briefing_final`,
    [
      parsed.data.briefingFinal ? JSON.stringify(parsed.data.briefingFinal) : null,
      parsed.data.status ?? null,
      params.id,
    ],
  );

  return NextResponse.json(rows[0]);
}

