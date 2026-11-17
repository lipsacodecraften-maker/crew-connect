import { NextResponse, type NextRequest } from "next/server";
import { authorizeAdmin } from "@/lib/staff/adminAuth";
import { getStaffDocument } from "@/lib/staff/db";
import { decryptBuffer } from "@/lib/staff/secureStorage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: { params: Promise<Record<string, string>> }) {
  const unauthorized = await authorizeAdmin(request);
  if (unauthorized) return unauthorized;

  const { registrationId, documentId } = await context.params;
  const document = await getStaffDocument(registrationId, documentId);

  if (!document) {
    return NextResponse.json(
      { ok: false, message: "Document not found." },
      { status: 404 },
    );
  }

  let buffer;
  try {
    buffer = decryptBuffer(document.buffer);
  } catch (error) {
    console.error("[staff-registration] Could not decrypt document", error);
    return NextResponse.json(
      { ok: false, message: "Document could not be decrypted." },
      { status: 500 },
    );
  }

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": document.fileType || "application/octet-stream",
      "Content-Disposition": `inline; filename="${String(document.name).replace(/[^\w.\- ()]/g, "_")}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
