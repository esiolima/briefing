import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  await db.query(`DELETE FROM materials WHERE id = $1`, [params.id]);
  return NextResponse.json({ ok: true });
}
