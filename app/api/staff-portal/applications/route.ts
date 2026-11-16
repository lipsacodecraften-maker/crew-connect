import { NextResponse, type NextRequest } from "next/server";
import { authorizeStaffRequest } from "@/lib/staff/auth";
import { listApplicationsForRegistration } from "@/lib/jobs/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await authorizeStaffRequest(request);
  if (!auth.ok) return auth.response;
  const applications = await listApplicationsForRegistration(auth.session.id);
  return NextResponse.json({ ok: true, applications });
}
