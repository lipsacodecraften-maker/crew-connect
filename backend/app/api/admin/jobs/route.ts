import { NextResponse, type NextRequest } from "next/server";
import { authorizeAdminRequest } from "@/lib/admin/auth";
import { createListing, listAllListings } from "@/lib/jobs/db";
import { validateListingInput } from "@/lib/jobs/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await authorizeAdminRequest(request, { permission: "jobs.view" });
  if (!auth.ok) return auth.response;

  const listings = await listAllListings();

  return NextResponse.json({ ok: true, total: listings.length, listings });
}

export async function POST(request: NextRequest) {
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

  const { errors, value } = validateListingInput(body, { partial: false });

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

  const listing = await createListing(value);

  return NextResponse.json({ ok: true, listing }, { status: 201 });
}
