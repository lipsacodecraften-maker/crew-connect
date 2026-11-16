import { NextResponse, type NextRequest } from "next/server";
import { authorizeAdminRequest } from "@/lib/admin/auth";
import { recommendStaff } from "@/lib/admin/matching";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await authorizeAdminRequest(request, { permission: "matching.view" });
  if (!auth.ok) return auth.response;

  const params = request.nextUrl.searchParams;
  const requirementRef = Number(params.get("requirementRef"));

  const result = await recommendStaff({
    bookingId: params.get("bookingId") || undefined,
    requirementRef:
      Number.isFinite(requirementRef) && requirementRef > 0
        ? requirementRef
        : undefined,
    city: params.get("city") || undefined,
    role: params.get("role") || undefined,
    workDate: params.get("workDate") || undefined,
    shiftStart: params.get("shiftStart") || undefined,
    shiftEnd: params.get("shiftEnd") || undefined,
    experience: params.get("experience") || undefined,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, message: result.message }, { status: 400 });
  }

  return NextResponse.json(result);
}
