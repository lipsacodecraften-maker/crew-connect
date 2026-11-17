import { NextResponse, type NextRequest } from "next/server";
import { authorizeAdminRequest } from "@/lib/admin/auth";
import { getStaffFacets, listStaff } from "@/lib/admin/staff";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await authorizeAdminRequest(request, { permission: "staff.view" });
  if (!auth.ok) return auth.response;

  const params = request.nextUrl.searchParams;
  const filters = {
    q: params.get("q") || undefined,
    city: params.get("city") || undefined,
    skill: params.get("skill") || undefined,
    experience: params.get("experience") || undefined,
    availability: params.get("availability") || undefined,
    status: params.get("status") || undefined,
  };

  const [staff, facets] = await Promise.all([
    listStaff(filters),
    params.get("facets") === "1" ? getStaffFacets() : Promise.resolve(null),
  ]);

  return NextResponse.json({
    ok: true,
    total: staff.length,
    staff,
    ...(facets ? { facets } : {}),
  });
}
