import { NextResponse, type NextRequest } from "next/server";
import { authorizeAdminRequest } from "@/lib/admin/auth";
import { getListingById, listApplicationsForListing } from "@/lib/jobs/db";

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

  const applications = await listApplicationsForListing(listing.id);

  return NextResponse.json({
    ok: true,
    listing,
    total: applications.length,
    applications,
  });
}
