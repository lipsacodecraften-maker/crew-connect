import { NextResponse, type NextRequest } from "next/server";
import { authorizeAdminRequest, hashClientIp } from "@/lib/admin/auth";
import { recordAdminAudit } from "@/lib/admin/db";
import { adminJsonError, clientIp } from "@/lib/admin/http";
import { deleteWorkHistory } from "@/lib/admin/staff";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
) {
  const auth = await authorizeAdminRequest(request, { permission: "staff.review" });
  if (!auth.ok) return auth.response;

  const { registrationId, entryId } = await context.params;
  const result = await deleteWorkHistory(registrationId, entryId);

  if (!result.ok) return adminJsonError(result.error, result.status);

  await recordAdminAudit({
    adminId: auth.session.id,
    action: "staff.work_history_removed",
    entityType: "staff_registration",
    entityId: registrationId,
    detail: `Removed work-history entry: ${result.entry.eventName}.`,
    ipHash: hashClientIp(clientIp(request)),
  });

  return NextResponse.json({ ok: true });
}
