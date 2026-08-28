import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { signAdminSession } from "@/lib/auth/session";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "E-mail e senha são obrigatórios." },
      { status: 400 },
    );
  }

  const { email, password } = parsed.data;

  const { rows } = await db.query(
    `SELECT id, name, email, password_hash, active
     FROM admin_users WHERE email = $1`,
    [email],
  );

  const admin = rows[0];

  if (!admin || !admin.active || !verifyPassword(password, admin.password_hash)) {
    return NextResponse.json(
      { error: "E-mail ou senha inválidos." },
      { status: 401 },
    );
  }

  const token = signAdminSession({
    sub: admin.id,
    name: admin.name,
    email: admin.email,
  });

  const response = NextResponse.json({ name: admin.name, email: admin.email });
  response.cookies.set("mb_admin_session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return response;
}
