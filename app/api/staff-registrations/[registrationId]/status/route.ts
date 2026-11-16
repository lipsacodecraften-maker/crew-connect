import { NextResponse, type NextRequest } from "next/server";
import { authorizeAdmin } from "@/lib/staff/adminAuth";
import { STAFF_STATUS_META } from "@/lib/staff/config";
import { updateStaffRegistrationStatus } from "@/lib/staff/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, context: { params: Promise<Record<string, string>> }) {
  const unauthorized = await authorizeAdmin(request, "staff.review");
  if (unauthorized) return unauthorized;

  let body: any;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request body." },
      { status: 400 },
    );
  }

  const { registrationId } = await context.params;
  const status = String(body?.status || "").trim();
  const note = String(body?.note || "").trim().slice(0, 500);

  if (!Object.hasOwn(STAFF_STATUS_META, status)) {
    return NextResponse.json(
      {
        ok: false,
        message: `Status must be one of: ${Object.keys(STAFF_STATUS_META).join(", ")}.`,
      },
      { status: 400 },
    );
  }

  const registration = await updateStaffRegistrationStatus(
    registrationId,
    status,
    note,
  );

  if (!registration) {
    return NextResponse.json(
      { ok: false, message: "Staff registration not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    registration: {
      id: registration.id,
      status: registration.status,
      statusLabel:
        STAFF_STATUS_META[
          registration.status as keyof typeof STAFF_STATUS_META
        ]?.label,
      updatedAt: registration.updatedAt,
    },
  });
}
