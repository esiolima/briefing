import pg from "pg";
import { randomBytes, scryptSync } from "node:crypto";

// Mesmo esquema de hash usado em lib/auth/password.ts (scrypt + salt),
// reimplementado aqui porque este script roda em Node puro, sem o
// transpilador do Next.js para TypeScript.
function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@martins.com.br";
const adminPassword = process.env.SEED_ADMIN_PASSWORD || "trocar-esta-senha";

const passwordHash = hashPassword(adminPassword);

await client.query(
  `INSERT INTO admin_users (name, email, password_hash)
   VALUES ($1, $2, $3)
   ON CONFLICT (email) DO NOTHING`,
  ["Administrador", adminEmail, passwordHash],
);

// Áreas/cargos de exemplo — apenas para permitir testar o fluxo de
// identificação. Substituir pelos dados reais do Martins via painel admin.
const { rows: existingAreas } = await client.query("SELECT id FROM areas LIMIT 1");

if (existingAreas.length === 0) {
  const { rows: [comercial] } = await client.query(
    `INSERT INTO areas (name, description) VALUES ($1, $2) RETURNING id`,
    ["Comercial", "Área de exemplo — substituir pelos dados reais do Martins."],
  );
  await client.query(
    `INSERT INTO positions (name, area_id) VALUES ($1, $2)`,
    ["Gerente Comercial", comercial.id],
  );

  const { rows: [marketing] } = await client.query(
    `INSERT INTO areas (name, description) VALUES ($1, $2) RETURNING id`,
    ["Marketing", "Área de exemplo — substituir pelos dados reais do Martins."],
  );
  await client.query(
    `INSERT INTO positions (name, area_id) VALUES ($1, $2)`,
    ["Analista de Marketing", marketing.id],
  );
}

await client.end();
console.log(`Seed concluído. Admin: ${adminEmail} / senha: ${adminPassword}`);
