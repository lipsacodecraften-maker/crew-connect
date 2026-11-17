import { NextResponse, type NextRequest } from "next/server";
import { authorizeAdminRequest, hashClientIp } from "@/lib/admin/auth";
import { ASSIGNMENT_STATUS_LABELS } from "@/lib/admin/constants";
import { recordAdminAudit } from "@/lib/admin/db";
import { adminJsonError, clientIp, readAdminJson } from "@/lib/admin/http";
import { getAssignmentDetail, updateAssignment } from "@/lib/admin/assignments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
) {
  const parsed = await readAdminJson<{
    status?: string;
    attendanceStatus?: string;
    payRate?: number | string | null;
    notes?: string;
    attendanceNotes?: string;
  }>(request);

  if (!parsed.ok) return parsed.response;

  const needsAttendance = parsed.body.attendanceStatus !== undefined;
  const auth = await authorizeAdminRequest(request, {
    permission: needsAttendance ? "attendance.manage" : "assignments.manage",
  });
  if (!auth.ok) return auth.response;

  const { assignmentId } = await context.params;
  const result = await updateAssignment(assignmentId, {
    status: parsed.body.status,
    attendanceStatus: parsed.body.attendanceStatus,
    payRate:
      parsed.body.payRate === undefined
        ? undefined
        : parsed.body.payRate === null
          ? null
          : Number(parsed.body.payRate),
    notes: parsed.body.notes,
    attendanceNotes: parsed.body.attendanceNotes,
  });

  if (!result) return adminJsonError("Assignment not found.", 404);
  if ("error" in result) {
    return adminJsonError("Invalid assignment status.", 400);
  }

  const assignment = result.assignment;
  await recordAdminAudit({
    adminId: auth.session.id,
    action: "assignment.updated",
    entityType: "assignment",
    entityId: assignmentId,
    detail: `${assignment.registration.fullName} · ${assignment.role} · ${
      ASSIGNMENT_STATUS_LABELS[assignment.status] || assignment.status
    }${needsAttendance ? ` · attendance ${assignment.attendanceStatus}` : ""}.`,
    ipHash: hashClientIp(clientIp(request)),
  });

  return NextResponse.json({ ok: true, assignment: await getAssignmentDetail(assignmentId) });
}
