import { NextResponse, type NextRequest } from "next/server";
import { getStaffSessionFromRequest, revokeStaffSessionByToken, STAFF_SESSION_COOKIE } from "@/lib/staff/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.split(";").map(p=>p.trim()).find(p=>p.startsWith(`${STAFF_SESSION_COOKIE}=`));
  const token = match ? decodeURIComponent(match.slice(STAFF_SESSION_COOKIE.length + 1)) : null;
  if (token) await revokeStaffSessionByToken(token);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(STAFF_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
