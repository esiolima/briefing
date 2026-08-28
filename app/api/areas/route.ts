import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const { rows } = await db.query(
    `SELECT id, name FROM areas WHERE active = true ORDER BY name`,
  );
  return NextResponse.json(rows);
}
