import { NextResponse, type NextRequest } from "next/server";
import { authorizeStaffRequest } from "@/lib/staff/auth";
import { createApplication } from "@/lib/jobs/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorizeStaffRequest(request);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const result = await createApplication({ listingId: id, registrationId: auth.session.id });
  if (!result.ok) {
    return NextResponse.json({ ok: false, message: result.reason }, { status: 400 });
  }
  return NextResponse.json({ ok: true, application: result.application });
}
