import { NextResponse, type NextRequest } from "next/server";
import { APPLICATION_STATUS_META } from "@/lib/jobs/config";
import {
  createApplication,
  getListingById,
  toPublicListing,
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

  const jobId = String(body?.jobId || "").trim().toUpperCase();
  const registrationId = String(body?.registrationId || "").trim().toUpperCase();
  const mobileNumber = String(body?.mobileNumber || "").trim();

  if (!jobId || !registrationId || !mobileNumber) {
    return NextResponse.json(
      {
        ok: false,
        message: "Job, Staff Registration ID and WhatsApp number are required.",
      },
      { status: 400 },
    );
  }

  const ipThrottle = rateLimit(`jobs:apply:${clientKey(request)}`, {
    limit: 12,
    windowMs: 10 * 60 * 1000,
  });
  const idThrottle = rateLimit(`jobs:apply:id:${registrationId}`, {
    limit: 12,
    windowMs: 10 * 60 * 1000,
  });

  if (!ipThrottle.allowed || !idThrottle.allowed) {
    return NextResponse.json(
      {
        ok: false,
        message: "Too many application attempts. Please try again later.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.max(ipThrottle.retryAfter, idThrottle.retryAfter),
          ),
        },
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

  const listing = await getListingById(jobId);
  if (!listing) {
    return NextResponse.json(
      { ok: false, message: "That job listing is no longer available." },
      { status: 404 },
    );
  }

  const result = await createApplication({
    listingId: listing.id,
    registrationId: staff.id,
  });

  if (!result.ok) {
    if (result.reason === "duplicate") {
      const duplicate = result.application;
      if (!duplicate) {
        return NextResponse.json(
          { ok: false, message: "That job listing is no longer available." },
          { status: 404 },
        );
      }
      return NextResponse.json(
        {
          ok: false,
          reason: "duplicate",
          message: "You have already applied for this job.",
          application: {
            id: duplicate.id,
            status: duplicate.status,
            statusLabel:
              APPLICATION_STATUS_META[
                duplicate.status as keyof typeof APPLICATION_STATUS_META
              ]?.label,
            createdAt: duplicate.createdAt,
          },
          job: toPublicListing(listing),
        },
        { status: 409 },
      );
    }

    if (result.reason === "full") {
      return NextResponse.json(
        {
          ok: false,
          reason: "full",
          message: "This listing has just been filled. Explore other open jobs.",
        },
        { status: 409 },
      );
    }

    if (result.reason === "closed") {
      return NextResponse.json(
        {
          ok: false,
          reason: "closed",
          message: "Applications for this job are closed.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { ok: false, message: "That job listing is no longer available." },
      { status: 404 },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      message: "Application submitted.",
      job: toPublicListing(listing),
      application: {
        id: result.application.id,
        status: result.application.status,
        statusLabel:
          APPLICATION_STATUS_META[
            result.application.status as keyof typeof APPLICATION_STATUS_META
          ]?.label,
        createdAt: result.application.createdAt,
      },
    },
    { status: 201 },
  );
}
