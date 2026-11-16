import { NextResponse, type NextRequest } from "next/server";
import { authorizeAdminRequest, hashClientIp } from "@/lib/admin/auth";
import { recordAdminAudit } from "@/lib/admin/db";
import { adminJsonError, clientIp, readAdminJson } from "@/lib/admin/http";
import { addWorkHistory, type WorkHistoryInput } from "@/lib/admin/staff";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
) {
  const auth = await authorizeAdminRequest(request, { permission: "staff.review" });
  if (!auth.ok) return auth.response;

  const parsed = await readAdminJson<WorkHistoryInput>(request);
  if (!parsed.ok) return parsed.response;

  const { registrationId } = await context.params;
  const result = await addWorkHistory(registrationId, parsed.body);

  if (!result.ok) return adminJsonError(result.error, result.status);

  await recordAdminAudit({
    adminId: auth.session.id,
    action: "staff.work_history_added",
    entityType: "staff_registration",
    entityId: registrationId,
    detail: `Added offline work: ${result.entry.eventName} as ${result.entry.role} on ${result.entry.workDate}.`,
    ipHash: hashClientIp(clientIp(request)),
  });

  return NextResponse.json({ ok: true, entry: result.entry }, { status: 201 });
}
