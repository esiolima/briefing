import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { loadOwnedSession } from "@/lib/briefing-session";
import { generateBriefing } from "@/lib/ai/briefing-service";

export async function POST(
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

  try {
    const answeredQuestions = (session.clarifying_questions ?? []) as Array<{
      id: string;
      text: string;
      type: "opcoes" | "texto";
      options?: string[];
      answer: string;
    }>;

    const briefing = await generateBriefing({
      rawNeed: session.raw_need,
      context: {
        areaName: session.area_name,
        positionName: session.position_name,
      },
      interpretedData: session.interpreted_data ?? {},
      answeredQuestions,
    });

    await db.query(
      `UPDATE briefing_sessions
       SET briefing_final = $1, status = 'aguardando_revisao', updated_at = now()
       WHERE id = $2`,
      [JSON.stringify(briefing), params.id],
    );

    return NextResponse.json({ briefing });
  } catch (error) {
    console.error("Erro ao gerar briefing:", error);
    return NextResponse.json(
      { error: "Não consegui concluir essa etapa agora. Tente novamente." },
      { status: 502 },
    );
  }
}
