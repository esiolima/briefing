import OpenAI from "openai";

const globalForAI = globalThis as unknown as { openaiClient?: OpenAI };

export const openai =
  globalForAI.openaiClient ??
  new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

if (process.env.NODE_ENV !== "production") {
  globalForAI.openaiClient = openai;
}

export const EMBEDDING_MODEL =
  process.env.AI_EMBEDDING_MODEL ?? "text-embedding-3-small";

export const CHAT_MODEL = process.env.AI_MODEL_NAME ?? "gpt-4.1";
