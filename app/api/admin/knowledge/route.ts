import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createKnowledgeItem,
  listKnowledgeItems,
} from "@/lib/knowledge-service";

const createSchema = z.object({
  category: z.enum([
    "empresa",
    "area",
    "cargo",
    "tipo_demanda",
    "campanha",
    "material",
  ]),
  title: z.string().min(1),
  content: z.string().min(1),
  metadata: z.record(z.unknown()).optional(),
  tags: z.array(z.string()).optional(),
  areaId: z.string().uuid().optional().nullable(),
  active: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category") ?? undefined;
  const areaId = request.nextUrl.searchParams.get("areaId") ?? undefined;

  const items = await listKnowledgeItems({ category, areaId });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const parsed = createSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }

  const item = await createKnowledgeItem(parsed.data);
  return NextResponse.json(item, { status: 201 });
}
