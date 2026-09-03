import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { loadOwnedSession } from "@/lib/briefing-session";

const bodySchema = z.object({
  answers: z.record(z.string()), // { [questionId]: respostaTexto }
});

export async function POST(
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

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Respostas inválidas." },
      { status: 400 },
    );
  }

  const questions = (session.clarifying_questions ?? []) as Array<{
    id: string;
    text: string;
    type: string;
    options?: string[];
  }>;

  const merged = questions.map((q) => ({
    ...q,
    answer: parsed.data.answers[q.id] ?? "",
  }));

  await db.query(
    `UPDATE briefing_sessions
     SET clarifying_questions = $1, updated_at = now()
     WHERE id = $2`,
    [JSON.stringify(merged), params.id],
  );

  return NextResponse.json({ ok: true });
}
