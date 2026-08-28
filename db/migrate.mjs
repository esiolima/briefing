import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

await client.connect();

// 1. Extensões base (pgvector)
await client.query(readFileSync(path.join(__dirname, "init.sql"), "utf8"));

// 2. Migrations em ordem alfabética (0001_, 0002_, ...)
const migrationsDir = path.join(__dirname, "migrations");
const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

for (const file of files) {
  console.log(`Aplicando migration: ${file}`);
  await client.query(readFileSync(path.join(migrationsDir, file), "utf8"));
}

await client.end();
console.log("Migrações aplicadas com sucesso.");
