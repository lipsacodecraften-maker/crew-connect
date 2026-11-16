import { NextResponse, type NextRequest } from "next/server";
import { authorizeAdminRequest, hashClientIp } from "@/lib/admin/auth";
import { BOOKING_STATUSES, BOOKING_STATUS_LABELS } from "@/lib/admin/constants";
import { recordAdminAudit } from "@/lib/admin/db";
import { adminJsonError, clientIp, readAdminJson } from "@/lib/admin/http";
import { updateBookingStatus } from "@/lib/booking/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
) {
  const auth = await authorizeAdminRequest(request, { permission: "bookings.manage" });
  if (!auth.ok) return auth.response;

  const parsed = await readAdminJson<{ status?: string; note?: string }>(request);
  if (!parsed.ok) return parsed.response;

  const status = String(parsed.body.status || "").trim();
  const note = String(parsed.body.note || "").trim().slice(0, 500);

  if (!(BOOKING_STATUSES as readonly string[]).includes(status)) {
    return adminJsonError(
      `Status must be one of: ${BOOKING_STATUSES.join(", ")}.`,
      400,
    );
  }

  const { bookingId } = await context.params;
  const booking = await updateBookingStatus(bookingId, status, note);
  if (!booking) return adminJsonError("Booking request not found.", 404);

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
      statusLabel: BOOKING_STATUS_LABELS[booking.status] || booking.status,
      updatedAt: booking.updatedAt,
    },
  });
}
