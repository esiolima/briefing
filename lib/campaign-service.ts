import { db } from "@/lib/db";
import { embedText } from "@/lib/ai/embeddings";

export interface CampaignInput {
  name: string;
  areaId?: string | null;
  year?: number | null;
  type?: string;
  objective?: string;
  audience?: string;
  description?: string;
  briefing?: string;
  materials?: unknown[];
  references?: unknown[];
  observations?: string;
  tags?: string[];
  active?: boolean;
}

function embeddingSource(input: Partial<CampaignInput>) {
  return [input.name, input.objective, input.description, input.briefing]
    .filter(Boolean)
    .join("\n");
}

export async function createCampaign(input: CampaignInput) {
  const embedding = await embedText(embeddingSource(input));

  const { rows } = await db.query(
    `INSERT INTO campaigns
       (name, area_id, year, type, objective, audience, description,
        briefing, materials, "references", observations, tags, active, embedding)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     RETURNING id, name, area_id, year, type, objective, audience,
               description, briefing, tags, active, created_at`,
    [
      input.name,
      input.areaId ?? null,
      input.year ?? null,
      input.type ?? null,
      input.objective ?? null,
      input.audience ?? null,
      input.description ?? null,
      input.briefing ?? null,
      JSON.stringify(input.materials ?? []),
      JSON.stringify(input.references ?? []),
      input.observations ?? null,
      input.tags ?? [],
      input.active ?? true,
      embedding,
    ],
  );

  return rows[0];
}

export async function listCampaigns(filters: { areaId?: string } = {}) {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters.areaId) {
    params.push(filters.areaId);
    conditions.push(`area_id = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const { rows } = await db.query(
    `SELECT id, name, area_id, year, type, objective, audience, tags, active, created_at
     FROM campaigns ${where}
     ORDER BY created_at DESC`,
    params,
  );

  return rows;
}

export async function deleteCampaign(id: string) {
  await db.query(`DELETE FROM campaigns WHERE id = $1`, [id]);
}

/** Usado na etapa "Material anterior" (seção 22) para sugerir campanhas relacionadas. */
export async function searchCampaigns(
  query: string,
  filters: { areaId?: string; limit?: number } = {},
) {
  const embedding = await embedText(query);
  const limit = filters.limit ?? 5;

  const conditions: string[] = ["active = true"];
  const params: unknown[] = [embedding];

  if (filters.areaId) {
    params.push(filters.areaId);
    conditions.push(`area_id = $${params.length}`);
  }

  params.push(limit);

  const { rows } = await db.query(
    `SELECT id, name, year, type, objective, description, briefing, tags,
            1 - (embedding <=> $1) AS similarity
     FROM campaigns
     WHERE ${conditions.join(" AND ")}
     ORDER BY embedding <=> $1
     LIMIT $${params.length}`,
    params,
  );

  return rows;
}
