import { Pool } from "pg";

// Pool único reaproveitado entre requisições (padrão recomendado
// para Next.js em ambiente serverless/edge com Postgres tradicional).
const globalForDb = globalThis as unknown as { pgPool?: Pool };

export const db =
  globalForDb.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgPool = db;
}
