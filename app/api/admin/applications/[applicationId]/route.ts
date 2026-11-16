import { NextResponse, type NextRequest } from "next/server";
import { authorizeAdminRequest, hashClientIp } from "@/lib/admin/auth";
import { APPLICATION_STATUS_META } from "@/lib/jobs/config";
import { recordAdminAudit } from "@/lib/admin/db";
import { adminJsonError, clientIp, readAdminJson } from "@/lib/admin/http";
import { updateApplicationStatus } from "@/lib/jobs/db";
import { validateApplicationStatusInput } from "@/lib/jobs/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
) {
  const auth = await authorizeAdminRequest(request, {
    permission: "applications.manage",
  });
  if (!auth.ok) return auth.response;

  const parsed = await readAdminJson<{ status?: string; note?: string }>(request);
  if (!parsed.ok) return parsed.response;

  const { errors, value } = validateApplicationStatusInput(parsed.body);
  if (Object.keys(errors).length > 0) {
    return adminJsonError("Invalid status update.", 400, { errors });
  }

  const { applicationId } = await context.params;
  const application = await updateApplicationStatus(
    applicationId,
    value.status,
    value.note,
  );

  if (!application) return adminJsonError("Application not found.", 404);

  await recordAdminAudit({
    adminId: auth.session.id,
    action: "job_application.status_changed",
    entityType: "job_application",
    entityId: applicationId,
    detail: `Application set to ${APPLICATION_STATUS_META[value.status as keyof typeof APPLICATION_STATUS_META]?.label || value.status}.${value.note ? ` Note: ${value.note}` : ""}`,
    ipHash: hashClientIp(clientIp(request)),
  });

  return NextResponse.json({ ok: true, application });
}
