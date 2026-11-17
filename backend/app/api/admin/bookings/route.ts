import { NextResponse, type NextRequest } from "next/server";
import { authorizeAdminRequest } from "@/lib/admin/auth";
import { getBookingFacets, listBookings } from "@/lib/admin/bookings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await authorizeAdminRequest(request, { permission: "bookings.view" });
  if (!auth.ok) return auth.response;

  const params = request.nextUrl.searchParams;
  const filters = {
    q: params.get("q") || undefined,
    city: params.get("city") || undefined,
    status: params.get("status") || undefined,
    role: params.get("role") || undefined,
    dateFrom: params.get("dateFrom") || undefined,
    dateTo: params.get("dateTo") || undefined,
  };

  const [bookings, facets] = await Promise.all([
    listBookings(filters),
    params.get("facets") === "1" ? getBookingFacets() : Promise.resolve(null),
  ]);

  return NextResponse.json({
    ok: true,
    total: bookings.length,
    bookings,
    ...(facets ? { facets } : {}),
  });
}
