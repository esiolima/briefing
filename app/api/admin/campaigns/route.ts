import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createCampaign, listCampaigns } from "@/lib/campaign-service";

const createSchema = z.object({
  name: z.string().min(1),
  areaId: z.string().uuid().optional().nullable(),
  year: z.number().int().optional().nullable(),
  type: z.string().optional(),
  objective: z.string().optional(),
  audience: z.string().optional(),
  description: z.string().optional(),
  briefing: z.string().optional(),
  materials: z.array(z.unknown()).optional(),
  references: z.array(z.unknown()).optional(),
  observations: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  const areaId = request.nextUrl.searchParams.get("areaId") ?? undefined;
  const campaigns = await listCampaigns({ areaId });
  return NextResponse.json(campaigns);
}

export async function POST(request: NextRequest) {
  const parsed = createSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }

  const campaign = await createCampaign(parsed.data);
  return NextResponse.json(campaign, { status: 201 });
}
