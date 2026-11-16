import { NextResponse, type NextRequest } from "next/server";
import { logoutAdmin } from "@/lib/admin/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  return logoutAdmin(request);
}

export async function GET() {
  return NextResponse.json(
    { ok: false, message: "Use POST to sign out." },
    { status: 405 },
  );
}
