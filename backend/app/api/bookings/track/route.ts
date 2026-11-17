import { NextResponse, type NextRequest } from "next/server";
import {
  getBookingByReference,
  getBookingByTrackingToken,
} from "@/lib/booking/db";
import { toTrackingSummary } from "@/lib/booking/public";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NOT_FOUND_MESSAGE =
  "No request matched those details. Check the booking ID and email address.";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const reference = searchParams.get("ref") || searchParams.get("id");
  const email = searchParams.get("email");

  let booking = null;

  if (token) {
    booking = await getBookingByTrackingToken(token);
  } else if (reference && email) {
    booking = await getBookingByReference(reference, email);
  } else {
    return NextResponse.json(
      {
        ok: false,
        message: "Provide a tracking token, or a booking ID with its email address.",
      },
      { status: 400 },
    );
  }

  if (!booking) {
    return NextResponse.json(
      { ok: false, message: NOT_FOUND_MESSAGE },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    booking: toTrackingSummary(booking),
  });
}

export async function POST(request: NextRequest) {
  let body: any;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request body." },
      { status: 400 },
    );
  }

  const bookingId = String(body?.bookingId || "").trim();
  const email = String(body?.email || "").trim();

  if (!bookingId || !email) {
    return NextResponse.json(
      { ok: false, message: "Enter both the booking ID and email address." },
      { status: 400 },
    );
  }

  const booking = await getBookingByReference(bookingId, email);

  if (!booking) {
    return NextResponse.json(
      { ok: false, message: NOT_FOUND_MESSAGE },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    booking: toTrackingSummary(booking),
  });
}
