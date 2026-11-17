import { NextResponse, type NextRequest } from "next/server";
import { authorizeAdminRequest } from "@/lib/admin/auth";
import { getBookingDetail } from "@/lib/admin/bookings";
import { adminJsonError } from "@/lib/admin/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
) {
  const auth = await authorizeAdminRequest(request, { permission: "bookings.view" });
  if (!auth.ok) return auth.response;

  const { bookingId } = await context.params;
  const booking = await getBookingDetail(bookingId);
  if (!booking) return adminJsonError("Booking request not found.", 404);

  return NextResponse.json({ ok: true, booking });
}
