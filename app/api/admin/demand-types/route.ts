import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  requiredInfo: z.array(z.string()).optional(),
  specificQuestions: z.array(z.unknown()).optional(),
  commonDeliverables: z.array(z.string()).optional(),
  examples: z.string().optional(),
  guidelines: z.string().optional(),
});

export async function GET() {
  const { rows } = await db.query(
    `SELECT id, name, description, required_info, specific_questions,
            common_deliverables, examples, guidelines, active, created_at
     FROM demand_types ORDER BY name`,
  );
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const parsed = createSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }

  const d = parsed.data;

  const { rows } = await db.query(
    `INSERT INTO demand_types
       (name, description, required_info, specific_questions, common_deliverables, examples, guidelines)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING id, name, description, active, created_at`,
    [
      d.name,
      d.description ?? null,
      JSON.stringify(d.requiredInfo ?? []),
      JSON.stringify(d.specificQuestions ?? []),
      JSON.stringify(d.commonDeliverables ?? []),
      d.examples ?? null,
      d.guidelines ?? null,
    ],
  );

  return NextResponse.json(rows[0], { status: 201 });
}
