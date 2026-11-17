import { NextResponse, type NextRequest } from "next/server";
import { authorizeAdminRequest } from "@/lib/admin/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await authorizeAdminRequest(request);
  if (!auth.ok) return auth.response;

  return NextResponse.json({
    ok: true,
    user: {
      id: auth.session.id,
      email: auth.session.email,
      name: auth.session.name,
      role: auth.session.role,
      roleLabel: auth.session.roleLabel,
      permissions: auth.session.permissions,
      viaApiKey: auth.viaApiKey,
    },
  });
}
