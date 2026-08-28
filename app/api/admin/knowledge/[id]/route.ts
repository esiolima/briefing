import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { updateKnowledgeItem, deleteKnowledgeItem } from "@/lib/knowledge-service";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  metadata: z.record(z.unknown()).optional(),
  tags: z.array(z.string()).optional(),
  areaId: z.string().uuid().optional().nullable(),
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

  const item = await updateKnowledgeItem(params.id, parsed.data);

  if (!item) {
    return NextResponse.json(
      { error: "Item de conhecimento não encontrado." },
      { status: 404 },
    );
  }

  return NextResponse.json(item);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  await deleteKnowledgeItem(params.id);
  return NextResponse.json({ ok: true });
}
