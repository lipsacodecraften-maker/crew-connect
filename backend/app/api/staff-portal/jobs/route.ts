import { NextResponse, type NextRequest } from "next/server";
import { authorizeStaffRequest } from "@/lib/staff/auth";
import { listOpenListings } from "@/lib/jobs/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await authorizeStaffRequest(request);
  if (!auth.ok) return auth.response;
  const url = new URL(request.url);
  const filters = {
    q: url.searchParams.get("q") || undefined,
    city: url.searchParams.get("city") || undefined,
    role: url.searchParams.get("role") || undefined,
  };
  const listings = await listOpenListings(filters);
  return NextResponse.json({ ok: true, listings });
}
