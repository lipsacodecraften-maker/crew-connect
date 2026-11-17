import { NextResponse, type NextRequest } from "next/server";
import { getStaffSessionFromRequest } from "@/lib/staff/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getStaffSessionFromRequest(request);
  if (!session) return NextResponse.json({ ok: false, message: "Not authenticated." }, { status: 401 });
  return NextResponse.json({ ok: true, session });
}
