import { db } from "@/lib/db";
import { getRequesterIdentity } from "@/lib/identity";

export async function loadOwnedSession(id: string) {
  const identity = getRequesterIdentity();
  if (!identity) return { session: null, identity: null };

  const { rows } = await db.query(
    `SELECT * FROM briefing_sessions WHERE id = $1 AND requester_token = $2`,
    [id, identity.token],
  );

  return { session: rows[0] ?? null, identity };
}
