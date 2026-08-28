import { db } from "@/lib/db";
import { embedText } from "@/lib/ai/embeddings";

export interface KnowledgeItemInput {
  category: "empresa" | "area" | "cargo" | "tipo_demanda" | "campanha" | "material";
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
  tags?: string[];
  areaId?: string | null;
  active?: boolean;
  createdBy?: string;
}

export async function createKnowledgeItem(input: KnowledgeItemInput) {
  const embedding = await embedText(`${input.title}\n${input.content}`);

  const { rows } = await db.query(
    `INSERT INTO knowledge_items
       (category, title, content, metadata, tags, area_id, active, created_by, embedding)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, category, title, content, metadata, tags, area_id, active, created_at`,
    [
      input.category,
      input.title,
      input.content,
      JSON.stringify(input.metadata ?? {}),
      input.tags ?? [],
      input.areaId ?? null,
      input.active ?? true,
      input.createdBy ?? null,
      embedding,
    ],
  );

  return rows[0];
}

export async function updateKnowledgeItem(
  id: string,
  input: Partial<KnowledgeItemInput>,
) {
  const current = await db.query(
    `SELECT title, content FROM knowledge_items WHERE id = $1`,
    [id],
  );
  if (current.rows.length === 0) return null;

  const title = input.title ?? current.rows[0].title;
  const content = input.content ?? current.rows[0].content;

  const contentChanged =
    input.title !== undefined || input.content !== undefined;
  const embedding = contentChanged
    ? await embedText(`${title}\n${content}`)
    : null;

  const { rows } = await db.query(
    `UPDATE knowledge_items SET
       title = $1,
       content = $2,
       metadata = COALESCE($3, metadata),
       tags = COALESCE($4, tags),
       area_id = COALESCE($5, area_id),
       active = COALESCE($6, active),
       embedding = COALESCE($7, embedding),
       updated_at = now()
     WHERE id = $8
     RETURNING id, category, title, content, metadata, tags, area_id, active, updated_at`,
    [
      title,
      content,
      input.metadata !== undefined ? JSON.stringify(input.metadata) : null,
      input.tags ?? null,
      input.areaId ?? null,
      input.active ?? null,
      embedding,
      id,
    ],
  );

  return rows[0] ?? null;
}

export async function deleteKnowledgeItem(id: string) {
  await db.query(`DELETE FROM knowledge_items WHERE id = $1`, [id]);
}

export async function listKnowledgeItems(filters: {
  category?: string;
  areaId?: string;
} = {}) {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters.category) {
    params.push(filters.category);
    conditions.push(`category = $${params.length}`);
  }
  if (filters.areaId) {
    params.push(filters.areaId);
    conditions.push(`area_id = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const { rows } = await db.query(
    `SELECT id, category, title, content, metadata, tags, area_id, active, created_at
     FROM knowledge_items ${where}
     ORDER BY created_at DESC`,
    params,
  );

  return rows;
}

/**
 * Busca semântica: encontra itens de conhecimento relacionados ao texto
 * da query mesmo quando as palavras usadas são diferentes (seção 14).
 * Filtra por categoria/área ANTES de rankear por similaridade, reduzindo
 * custo e ruído.
 */
export async function searchKnowledge(
  query: string,
  filters: { category?: string; areaId?: string; limit?: number } = {},
) {
  const embedding = await embedText(query);
  const limit = filters.limit ?? 8;

  const conditions: string[] = ["active = true"];
  const params: unknown[] = [embedding];

  if (filters.category) {
    params.push(filters.category);
    conditions.push(`category = $${params.length}`);
  }
  if (filters.areaId) {
    params.push(filters.areaId);
    conditions.push(`area_id = $${params.length}`);
  }

  params.push(limit);

  const { rows } = await db.query(
    `SELECT id, category, title, content, metadata, tags, area_id,
            1 - (embedding <=> $1) AS similarity
     FROM knowledge_items
     WHERE ${conditions.join(" AND ")}
     ORDER BY embedding <=> $1
     LIMIT $${params.length}`,
    params,
  );

  return rows;
}
