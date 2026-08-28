import jwt from "jsonwebtoken";

export interface AdminSessionPayload {
  sub: string; // admin_users.id
  name: string;
  email: string;
}

const SECRET = process.env.JWT_SECRET;

function requireSecret(): string {
  if (!SECRET) {
    throw new Error(
      "JWT_SECRET não configurado. Defina a variável de ambiente antes de autenticar.",
    );
  }
  return SECRET;
}

export function signAdminSession(payload: AdminSessionPayload): string {
  return jwt.sign(payload, requireSecret(), { expiresIn: "12h" });
}

export function verifyAdminSession(token: string): AdminSessionPayload | null {
  try {
    return jwt.verify(token, requireSecret()) as AdminSessionPayload;
  } catch {
    return null;
  }
}
