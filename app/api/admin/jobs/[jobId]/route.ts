import { NextResponse, type NextRequest } from "next/server";
import { authorizeAdminRequest } from "@/lib/admin/auth";
import { getListingById, updateListing } from "@/lib/jobs/db";
import { validateListingInput } from "@/lib/jobs/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: { params: Promise<Record<string, string>> }) {
  const auth = await authorizeAdminRequest(request, { permission: "jobs.view" });
  if (!auth.ok) return auth.response;

  const { jobId } = await context.params;
  const listing = await getListingById(jobId);

  if (!listing) {
    return NextResponse.json(
      { ok: false, message: "Job listing not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true, listing });
}

export async function PATCH(request: NextRequest, context: { params: Promise<Record<string, string>> }) {
  const auth = await authorizeAdminRequest(request, { permission: "jobs.manage" });
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

  const { errors, value } = validateListingInput(body, { partial: true });

  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      {
        ok: false,
        message: "Some listing details need attention.",
        errors,
      },
      { status: 400 },
    );
  }

  const { jobId } = await context.params;
  const listing = await updateListing(jobId, value);

  if (!listing) {
    return NextResponse.json(
      { ok: false, message: "Job listing not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true, listing });
}
