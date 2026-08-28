import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  requiredInfo: z.array(z.string()).optional(),
  specificQuestions: z.array(z.unknown()).optional(),
  commonDeliverables: z.array(z.string()).optional(),
  examples: z.string().optional(),
  guidelines: z.string().optional(),
  active: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const parsed = updateSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }

  const d = parsed.data;

  const { rows } = await db.query(
    `UPDATE demand_types SET
       name = COALESCE($1, name),
       description = COALESCE($2, description),
       required_info = COALESCE($3, required_info),
       specific_questions = COALESCE($4, specific_questions),
       common_deliverables = COALESCE($5, common_deliverables),
       examples = COALESCE($6, examples),
       guidelines = COALESCE($7, guidelines),
       active = COALESCE($8, active)
     WHERE id = $9
     RETURNING id, name, description, active`,
    [
      d.name ?? null,
      d.description ?? null,
      d.requiredInfo ? JSON.stringify(d.requiredInfo) : null,
      d.specificQuestions ? JSON.stringify(d.specificQuestions) : null,
      d.commonDeliverables ? JSON.stringify(d.commonDeliverables) : null,
      d.examples ?? null,
      d.guidelines ?? null,
      d.active ?? null,
      params.id,
    ],
  );

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "Tipo de demanda não encontrado." },
      { status: 404 },
    );
  }

  return NextResponse.json(rows[0]);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  await db.query(`DELETE FROM demand_types WHERE id = $1`, [params.id]);
  return NextResponse.json({ ok: true });
}
