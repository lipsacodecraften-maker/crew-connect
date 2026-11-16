import { NextResponse, type NextRequest } from "next/server";
import { authorizeAdminRequest, hashClientIp } from "@/lib/admin/auth";
import { recordAdminAudit } from "@/lib/admin/db";
import { adminJsonError, clientIp, readAdminJson } from "@/lib/admin/http";
import { allocateJobApplication } from "@/lib/admin/jobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
) {
  const auth = await authorizeAdminRequest(request, {
    permission: "applications.manage",
  });
  if (!auth.ok) return auth.response;

  const parsed = await readAdminJson<{ note?: string }>(request);
  if (!parsed.ok) return parsed.response;

  const { applicationId } = await context.params;
  const result = await allocateJobApplication(
    applicationId,
    auth.session.id,
    parsed.body.note,
  );

  if (!result.ok) {
    const status = result.reason === "not_found" ? 404 : 409;
    return adminJsonError(result.message, status, { code: result.reason });
  }

  await recordAdminAudit({
    adminId: auth.session.id,
    action: "job_application.allocated",
    entityType: "job_application",
    entityId: applicationId,
    detail: result.warning
      ? result.warning
      : "Candidate selected and an event assignment was created.",
    ipHash: hashClientIp(clientIp(request)),
  });

  return NextResponse.json({
    ok: true,
    application: result.application,
    ...(result.assignment ? { assignment: result.assignment } : {}),
    ...(result.warning ? { warning: result.warning } : {}),
  });
}
