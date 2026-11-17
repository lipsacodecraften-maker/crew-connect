import { NextResponse, type NextRequest } from "next/server";
import { authorizeAdmin } from "@/lib/staff/adminAuth";
import { getStaffProfilePhoto } from "@/lib/staff/db";
import { decryptBuffer } from "@/lib/staff/secureStorage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: { params: Promise<Record<string, string>> }) {
  const unauthorized = await authorizeAdmin(request);
  if (unauthorized) return unauthorized;

  const { registrationId } = await context.params;
  const photo = await getStaffProfilePhoto(registrationId);

  if (!photo) {
    return NextResponse.json(
      { ok: false, message: "Profile photo not found." },
      { status: 404 },
    );
  }

  let buffer;
  try {
    buffer = decryptBuffer(photo.buffer);
  } catch (error) {
    console.error("[staff-registration] Could not decrypt profile photo", error);
    return NextResponse.json(
      { ok: false, message: "Profile photo could not be decrypted." },
      { status: 500 },
    );
  }

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": photo.type || "application/octet-stream",
      "Content-Disposition": `inline; filename="${String(photo.name).replace(/[^\w.\- ()]/g, "_")}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
