import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  fileUrl: z.string().url().optional(),
  link: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  campaignId: z.string().uuid().optional().nullable(),
  areaId: z.string().uuid().optional().nullable(),
  year: z.number().int().optional().nullable(),
});

export async function GET(request: NextRequest) {
  const areaId = request.nextUrl.searchParams.get("areaId");
  const campaignId = request.nextUrl.searchParams.get("campaignId");

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (areaId) {
    params.push(areaId);
    conditions.push(`area_id = $${params.length}`);
  }
  if (campaignId) {
    params.push(campaignId);
    conditions.push(`campaign_id = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const { rows } = await db.query(
    `SELECT id, name, description, category, file_url, link, tags,
            campaign_id, area_id, year, created_at
     FROM materials ${where} ORDER BY created_at DESC`,
    params,
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

  const m = parsed.data;

  const { rows } = await db.query(
    `INSERT INTO materials
       (name, description, category, file_url, link, tags, campaign_id, area_id, year)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING id, name, description, category, file_url, link, tags,
               campaign_id, area_id, year, created_at`,
    [
      m.name,
      m.description ?? null,
      m.category ?? null,
      m.fileUrl ?? null,
      m.link ?? null,
      m.tags ?? [],
      m.campaignId ?? null,
      m.areaId ?? null,
      m.year ?? null,
    ],
  );

  return NextResponse.json(rows[0], { status: 201 });
}
