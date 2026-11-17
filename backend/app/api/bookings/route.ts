import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { MAX_FILE_BYTES } from "@/lib/booking/config";
import { createBooking } from "@/lib/booking/db";
import { normalizePayload } from "@/lib/booking/normalize";
import { sendBookingNotifications } from "@/lib/booking/notifications";
import {
  getTotalStaff,
  validateBooking,
  validateReferenceFile,
} from "@/lib/booking/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(
  message: string,
  status: number,
  errors?: Record<string, string>,
) {
  return NextResponse.json(
    { ok: false, message, ...(errors ? { errors } : {}) },
    { status },
  );
}

async function readRequest(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const payload = formData.get("payload");

    if (typeof payload !== "string" || !payload) {
      throw new Error("Missing booking payload.");
    }

    let raw: any;
    try {
      raw = JSON.parse(payload);
    } catch {
      throw new Error("Booking payload is not valid JSON.");
    }

    const maybeFile = formData.get("referenceFile");
    const file =
      maybeFile &&
      typeof maybeFile === "object" &&
      typeof (maybeFile as File).arrayBuffer === "function" &&
      (maybeFile as File).size > 0
        ? (maybeFile as File)
        : null;

    return { raw, file };
  }

  if (contentType.includes("application/json")) {
    return { raw: await request.json(), file: null };
  }

  throw new Error("Unsupported request format.");
}

function safeFileName(name: unknown) {
  return path
    .basename(String(name || "reference-file"))
    .replace(/[^\w.\- ()]/g, "_")
    .slice(0, 180);
}

export async function POST(request: NextRequest) {
  let parsed;

  try {
    parsed = await readRequest(request);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Could not read the booking request.",
      400,
    );
  }

  const data = normalizePayload(parsed.raw);
  if (!data) {
    return jsonError("Could not read the booking payload.", 400);
  }

  const errors = validateBooking(data);

  let file = null;
  if (parsed.file) {
    const fileError = validateReferenceFile(parsed.file);
    if (fileError) {
      errors.referenceFile = fileError;
    } else if (parsed.file.size > MAX_FILE_BYTES) {
      errors.referenceFile = "Reference file must be 5 MB or smaller.";
    } else {
      let buffer;
      try {
        buffer = Buffer.from(await parsed.file.arrayBuffer());
      } catch {
        errors.referenceFile = "The reference file could not be read. Try again.";
      }

      if (buffer) {
        file = {
          name: safeFileName(parsed.file.name),
          type: String(parsed.file.type || "application/octet-stream").slice(
            0,
            120,
          ),
          size: parsed.file.size,
          buffer,
        };
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return jsonError("Please correct the highlighted fields.", 400, errors);
  }

  const totalStaff = getTotalStaff(data.staffingRoles);

  let created;
  try {
    created = await createBooking({ data, file, totalStaff });
  } catch (error) {
    console.error("[bookings] Could not save booking", error);
    return jsonError(
      "The request could not be saved right now. Please try again.",
      500,
    );
  }

  const origin = new URL(request.url).origin;
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    origin
  ).replace(/\/$/, "");

  const trackingPath = `/hire-manpower/track?ref=${encodeURIComponent(
    created.booking.id,
  )}&token=${encodeURIComponent(created.trackingToken)}`;
  const trackingUrl = `${baseUrl}${trackingPath}`;

  let notifications;
  try {
    notifications = await sendBookingNotifications({
      booking: created.booking,
      trackingUrl,
    });
  } catch (error) {
    console.error("[bookings] Notification dispatch failed", error);
    notifications = {
      email: { attempted: 0, sent: 0, failed: 0, logged: 0, skipped: 0 },
      whatsapp: { attempted: 0, sent: 0, failed: 0, logged: 0, skipped: 0 },
      configured: { email: false, whatsapp: false },
    };
  }

  return NextResponse.json(
    {
      ok: true,
      booking: {
        id: created.booking.id,
        status: created.booking.status,
        totalStaff: created.booking.totalStaff,
        createdAt: created.booking.createdAt,
        eventName: created.booking.eventName,
        eventStartDate: created.booking.eventStartDate,
        eventEndDate: created.booking.eventEndDate,
        eventCity: created.booking.eventCity,
        state: created.booking.state,
        contactPerson: created.booking.contactPerson,
        emailAddress: created.booking.emailAddress,
        whatsappNumber: created.booking.whatsappNumber,
      },
      trackingPath,
      trackingToken: created.trackingToken,
      notifications,
    },
    { status: 201 },
  );
}
