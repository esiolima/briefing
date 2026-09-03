import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { loadOwnedSession } from "@/lib/briefing-session";
import { searchKnowledge } from "@/lib/knowledge-service";
import { interpretNeed } from "@/lib/ai/briefing-service";

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
    // 1. Consultar o banco de conhecimento ANTES de perguntar ao solicitante
    //    (regra central da spec — seção 3 e 8).
    const knowledgeMatches = await searchKnowledge(session.raw_need, {
      areaId: session.area_id ?? undefined,
      limit: 6,
    });

    // 2. Só então a IA interpreta e decide o que ainda falta perguntar.
    const { interpretedData, questions } = await interpretNeed({
      rawNeed: session.raw_need,
      context: {
        areaName: session.area_name,
        positionName: session.position_name,
      },
      knowledgeMatches: knowledgeMatches.map((k) => ({
        title: k.title,
        content: k.content,
        category: k.category,
      })),
    });

    await db.query(
      `UPDATE briefing_sessions
       SET interpreted_data = $1, clarifying_questions = $2, updated_at = now()
       WHERE id = $3`,
      [JSON.stringify(interpretedData), JSON.stringify(questions), params.id],
    );

    return NextResponse.json({ interpretedData, questions });
  } catch (error) {
    console.error("Erro ao interpretar necessidade:", error);
    return NextResponse.json(
      { error: "Não consegui concluir essa etapa agora. Tente novamente." },
      { status: 502 },
    );
  }
}
