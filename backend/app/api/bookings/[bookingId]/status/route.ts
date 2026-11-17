import { NextResponse, type NextRequest } from "next/server";
import { authorizeAdminRequest, hashClientIp } from "@/lib/admin/auth";
import { BOOKING_STATUS_LABELS } from "@/lib/admin/constants";
import { recordAdminAudit } from "@/lib/admin/db";
import { clientIp } from "@/lib/admin/http";
import { STATUS_META } from "@/lib/booking/config";
import { updateBookingStatus } from "@/lib/booking/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
) {
  const auth = await authorizeAdminRequest(request, {
    permission: "bookings.manage",
  });
  if (!auth.ok) return auth.response;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request body." },
      { status: 400 },
    );
  }

  const { bookingId } = await context.params;
  const status = String(body?.status || "").trim();
  const note = String(body?.note || "").trim().slice(0, 500);

  if (!Object.hasOwn(STATUS_META, status)) {
    return NextResponse.json(
      {
        ok: false,
        message: `Status must be one of: ${Object.keys(STATUS_META).join(", ")}.`,
      },
      { status: 400 },
    );
  }

  const booking = await updateBookingStatus(bookingId, status, note);
  if (!booking) {
    return NextResponse.json(
      { ok: false, message: "Booking request not found." },
      { status: 404 },
    );
  }

  await recordAdminAudit({
    adminId: auth.session.id,
    action: "booking.status_changed",
    entityType: "booking",
    entityId: bookingId,
    detail: `Status set to ${BOOKING_STATUS_LABELS[status] || status}.${note ? ` Note: ${note}` : ""}`,
    ipHash: hashClientIp(clientIp(request)),
  });

  return NextResponse.json({
    ok: true,
    booking: {
      id: booking.id,
      status: booking.status,
      updatedAt: booking.updatedAt,
    },
  });
}
