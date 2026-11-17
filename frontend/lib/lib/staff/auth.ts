import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import {
  createStaffSession,
  findStaffSessionByTokenHash,
  revokeStaffSession,
  touchStaffSession,
} from "./db";
import { getStaffRegistrationById } from "./db";

export const STAFF_SESSION_COOKIE = "cc_staff_session";
const SESSION_TTL_HOURS = 12;
const SESSION_TTL_SECONDS = SESSION_TTL_HOURS * 60 * 60;

export type StaffSessionUser = {
  id: string;
  sessionId: string;
  fullName: string;
  mobileNumber: string;
  status: string;
};

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

export async function createStaffSessionToken(registrationId: string, userAgent?: string | null, ip?: string | null) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);
  await createStaffSession({
    registrationId,
    tokenHash: sha256(token),
    userAgent: userAgent || null,
    ipHash: ip || null,
    expiresAt,
  });
  return { token, expiresAt };
}

export async function validateStaffSessionToken(token: string): Promise<StaffSessionUser | null> {
  const row: any = await findStaffSessionByTokenHash(sha256(token));
  if (!row) return null;
  if (row.revokedAt) return null;
  if (row.expiresAt.getTime() <= Date.now()) return null;
  if (!row.registration || row.registration.status === "rejected") return null;
  if (Date.now() - row.lastSeenAt.getTime() > 5 * 60 * 1000) {
    await touchStaffSession(row.id);
  }
  return {
    id: row.registration.id,
    sessionId: row.id,
    fullName: row.registration.fullName,
    mobileNumber: row.registration.mobileNumber,
    status: row.registration.status,
  };
}

export async function getStaffSession(): Promise<StaffSessionUser | null> {
  const store = await cookies();
  const token = store.get(STAFF_SESSION_COOKIE)?.value;
  if (!token) return null;
  return validateStaffSessionToken(token);
}

export async function getStaffSessionFromRequest(request: NextRequest | Request): Promise<StaffSessionUser | null> {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${STAFF_SESSION_COOKIE}=`));
  const token = match ? decodeURIComponent(match.slice(STAFF_SESSION_COOKIE.length + 1)) : null;
  if (!token) return null;
  return validateStaffSessionToken(token);
}

export async function setStaffSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(STAFF_SESSION_COOKIE, token, sessionCookieOptions());
  return response;
}

export async function revokeStaffSessionByToken(token: string) {
  const row: any = await findStaffSessionByTokenHash(sha256(token));
  if (row) await revokeStaffSession(row.id);
}

export async function authorizeStaffRequest(request: NextRequest | Request) {
  const session = await getStaffSessionFromRequest(request);
  if (!session) {
    return { ok: false as const, response: NextResponse.json({ ok: false, message: "Authentication required." }, { status: 401 }) };
  }
  return { ok: true as const, session };
}

// helper to fetch profile
export async function getStaffProfile(registrationId: string) {
  return getStaffRegistrationById(registrationId);
}
