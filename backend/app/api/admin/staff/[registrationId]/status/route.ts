import { NextResponse, type NextRequest } from "next/server";
import { authorizeAdminRequest, hashClientIp } from "@/lib/admin/auth";
import {
  STAFF_REVIEW_LABELS,
  STAFF_REVIEW_STATUSES,
} from "@/lib/admin/constants";
import { recordAdminAudit } from "@/lib/admin/db";
import { adminJsonError, clientIp, readAdminJson } from "@/lib/admin/http";
import { updateStaffRegistrationStatus } from "@/lib/staff/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
) {
  const auth = await authorizeAdminRequest(request, { permission: "staff.review" });
  if (!auth.ok) return auth.response;

  const parsed = await readAdminJson<{ status?: string; note?: string }>(request);
  if (!parsed.ok) return parsed.response;

  const status = String(parsed.body.status || "").trim();
  const note = String(parsed.body.note || "").trim().slice(0, 500);

  if (!(STAFF_REVIEW_STATUSES as readonly string[]).includes(status)) {
    return adminJsonError(
      `Status must be one of: ${STAFF_REVIEW_STATUSES.join(", ")}.`,
      400,
    );
  }

  if ((status === "rejected" || status === "on_hold") && note.length < 5) {
    return adminJsonError(
      "Add a short note explaining the decision or the details still needed.",
      400,
    );
  }

  const { registrationId } = await context.params;
  const registration = await updateStaffRegistrationStatus(
    registrationId,
    status,
    note,
  );
  if (!registration) return adminJsonError("Staff registration not found.", 404);

  await recordAdminAudit({
    adminId: auth.session.id,
    action: "staff.status_changed",
    entityType: "staff_registration",
    entityId: registrationId,
    detail: `${registration.fullName} set to ${STAFF_REVIEW_LABELS[status] || status}.${note ? ` Note: ${note}` : ""}`,
    ipHash: hashClientIp(clientIp(request)),
  });

  return NextResponse.json({
    ok: true,
    registration: {
      id: registration.id,
      status: registration.status,
      statusLabel: STAFF_REVIEW_LABELS[registration.status] || registration.status,
      updatedAt: registration.updatedAt,
    },
  });
}
