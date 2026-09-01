import pg from "pg";
import { randomBytes, scryptSync } from "node:crypto";

// Mesmo esquema de hash usado em lib/auth/password.ts
function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
});

await client.connect();

const adminEmail =
  process.env.SEED_ADMIN_EMAIL || "admin@martins.com.br";

const adminPassword =
  process.env.SEED_ADMIN_PASSWORD || "trocar-esta-senha";

const passwordHash = hashPassword(adminPassword);

await client.query(
  `INSERT INTO admin_users (name, email, password_hash)
   VALUES ($1, $2, $3)
   ON CONFLICT (email) DO NOTHING`,
  ["Administrador", adminEmail, passwordHash],
);

// Áreas do fluxo de identificação do briefing.
const areas = [
  "Rede Smart",
  "Trade Martins - Matcon",
  "Trade Martins - Agrovet e Pet",
  "Trade Martins - Eletro",
  "Trade Martins - Farma",
  "Trade Martins - Varejo",
];

for (const name of areas) {
  await client.query(
    `INSERT INTO areas (name, description)
     VALUES ($1, $2)
     ON CONFLICT (name) DO UPDATE SET active = true`,
    [name, "Área do fluxo de briefing do Martins."],
  );
}

await client.end();

console.log(
  `Seed concluído. Admin: ${adminEmail} / senha: ${adminPassword}`,
);
