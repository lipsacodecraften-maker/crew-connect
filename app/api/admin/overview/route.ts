import { NextResponse, type NextRequest } from "next/server";
import { authorizeAdminRequest } from "@/lib/admin/auth";
import { getDashboardOverview } from "@/lib/admin/overview";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await authorizeAdminRequest(request, { permission: "dashboard.view" });
  if (!auth.ok) return auth.response;

  const overview = await getDashboardOverview();
  return NextResponse.json({ ok: true, ...overview });
}
