import { cookies } from "next/headers";

const COOKIE_NAME = "mb_identity";

export interface RequesterIdentity {
  name: string;
  areaId: string;
  areaName: string;
  positionId: string;
  positionName: string;
}

export function getRequesterIdentity(): RequesterIdentity | null {
  const raw = cookies().get(COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RequesterIdentity;
  } catch {
    return null;
  }
}

export function setRequesterIdentity(identity: RequesterIdentity) {
  cookies().set(COOKIE_NAME, JSON.stringify(identity), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    // Sem expiração curta: o solicitante não faz login, então mantemos
    // a identificação por uma sessão de navegador razoavelmente longa.
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearRequesterIdentity() {
  cookies().delete(COOKIE_NAME);
}
