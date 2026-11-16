import { NextResponse, type NextRequest } from "next/server";
import { authorizeAdminRequest, hashClientIp } from "@/lib/admin/auth";
import { createAssignment } from "@/lib/admin/assignments";
import { recordAdminAudit } from "@/lib/admin/db";
import { adminJsonError, clientIp, readAdminJson } from "@/lib/admin/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AssignBody = {
  registrationId?: string;
  requirementRef?: number | string;
  shiftStart?: string;
  shiftEnd?: string;
  payRate?: number | string | null;
  notes?: string;
  status?: string;
};

export async function POST(
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
) {
  const auth = await authorizeAdminRequest(request, {
    permission: "assignments.manage",
  });
  if (!auth.ok) return auth.response;

  const parsed = await readAdminJson<AssignBody>(request);
  if (!parsed.ok) return parsed.response;

  const { bookingId } = await context.params;
  const registrationId = String(parsed.body.registrationId || "").trim().toUpperCase();
  const requirementRef = Number(parsed.body.requirementRef);

  if (!registrationId) {
    return adminJsonError("Choose a staff registration to assign.", 400);
  }
  if (!Number.isFinite(requirementRef) || requirementRef <= 0) {
    return adminJsonError("Choose the staffing requirement to fill.", 400);
  }

  const result = await createAssignment(
    {
      bookingId,
      requirementRef,
      registrationId,
      shiftStart: parsed.body.shiftStart || null,
      shiftEnd: parsed.body.shiftEnd || null,
      payRate:
        parsed.body.payRate === undefined || parsed.body.payRate === null
          ? null
          : Number(parsed.body.payRate),
      notes: parsed.body.notes || null,
      status: parsed.body.status || "confirmed",
    },
    auth.session.id,
  );

  if (!result.ok) {
    const status =
      result.conflict.code === "not_found"
        ? 404
        : result.conflict.code === "booking_closed"
          ? 409
          : result.conflict.code === "invalid"
            ? 400
            : 409;
    return adminJsonError(result.conflict.message, status, {
      code: result.conflict.code,
      assignmentId: result.conflict.assignmentId,
    });
  }

  await recordAdminAudit({
    adminId: auth.session.id,
    action: "assignment.created",
    entityType: "booking",
    entityId: bookingId,
    detail: `${result.assignment.registration.fullName} assigned as ${result.assignment.role} on ${result.assignment.workDate}.`,
    ipHash: hashClientIp(clientIp(request)),
  });

  return NextResponse.json({ ok: true, assignment: result.assignment }, { status: 201 });
}
