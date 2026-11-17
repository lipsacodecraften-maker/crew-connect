import { NextResponse, type NextRequest } from "next/server";
import { authorizeAdmin } from "@/lib/staff/adminAuth";
import { getStaffRegistrationById } from "@/lib/staff/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: { params: Promise<Record<string, string>> }) {
  const unauthorized = await authorizeAdmin(request);
  if (unauthorized) return unauthorized;

  const { registrationId } = await context.params;
  const registration = await getStaffRegistrationById(registrationId);

  if (!registration) {
    return NextResponse.json(
      { ok: false, message: "Staff registration not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true, registration });
}
