import { NextResponse, type NextRequest } from "next/server";
import {
  APPLICATION_STATUS_META,
  formatOpenings,
  formatPaymentRange,
} from "@/lib/jobs/config";
import {
  listApplicationsForRegistration,
  verifyStaffIdentity,
} from "@/lib/jobs/db";
import { clientKey, rateLimit } from "@/lib/jobs/throttle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GENERIC_IDENTITY_ERROR =
  "We could not match that Staff Registration ID and WhatsApp number. Check both and try again.";

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

  const registrationId = String(body?.registrationId || "").trim().toUpperCase();
  const mobileNumber = String(body?.mobileNumber || "").trim();

  if (!registrationId || !mobileNumber) {
    return NextResponse.json(
      {
        ok: false,
        message: "Staff Registration ID and WhatsApp number are required.",
      },
      { status: 400 },
    );
  }

  const throttle = rateLimit(`jobs:track:${clientKey(request)}`, {
    limit: 30,
    windowMs: 10 * 60 * 1000,
  });

  if (!throttle.allowed) {
    return NextResponse.json(
      { ok: false, message: "Too many lookups. Please try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(throttle.retryAfter) },
      },
    );
  }

  const staff = await verifyStaffIdentity(registrationId, mobileNumber);
  if (!staff) {
    return NextResponse.json(
      { ok: false, message: GENERIC_IDENTITY_ERROR },
      { status: 401 },
    );
  }

  const applications = (await listApplicationsForRegistration(staff.id)).map(
    (application) => {
      const statusMeta =
        APPLICATION_STATUS_META[
          application.status as keyof typeof APPLICATION_STATUS_META
        ];
      return {
        id: application.id,
        status: application.status,
        statusLabel: statusMeta?.label || "",
        statusDescription: statusMeta?.description || "",
        tone: statusMeta?.tone || "muted",
        note: application.note,
        createdAt: application.createdAt,
        updatedAt: application.updatedAt,
        events: application.events,
        job: application.job
          ? {
              ...application.job,
              paymentLabel: formatPaymentRange(
                application.job.paymentMin,
                application.job.paymentMax,
              ),
              openingsLabel: formatOpenings(application.job.openings),
            }
          : null,
      };
    },
  );

  return NextResponse.json(
    {
      ok: true,
      staff: {
        registrationId: staff.id,
        fullName: staff.fullName,
        registrationStatus: staff.status,
        currentCity: staff.currentCity,
      },
      applications,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
