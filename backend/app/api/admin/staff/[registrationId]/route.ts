import { NextResponse, type NextRequest } from "next/server";
import { authorizeAdminRequest } from "@/lib/admin/auth";
import { adminJsonError } from "@/lib/admin/http";
import { getStaffDetail } from "@/lib/admin/staff";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
) {
  const auth = await authorizeAdminRequest(request, { permission: "staff.view" });
  if (!auth.ok) return auth.response;

  const { registrationId } = await context.params;
  const staff = await getStaffDetail(registrationId);
  if (!staff) return adminJsonError("Staff registration not found.", 404);

  return NextResponse.json({ ok: true, staff });
}
