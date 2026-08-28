import { NextRequest, NextResponse } from "next/server";
import { deleteCampaign } from "@/lib/campaign-service";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  await deleteCampaign(params.id);
  return NextResponse.json({ ok: true });
}
