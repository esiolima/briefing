import { openai, EMBEDDING_MODEL } from "./client";

/**
 * Gera o embedding de um texto e já devolve no formato de literal
 * que o pgvector aceita em uma query parametrizada: "[0.1,0.2,...]".
 */
export async function embedText(text: string): Promise<string> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });

  const vector = response.data[0]?.embedding;
  if (!vector) {
    throw new Error("A API de embeddings não retornou um vetor.");
  }

  return `[${vector.join(",")}]`;
}
