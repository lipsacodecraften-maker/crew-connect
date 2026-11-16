import { NextResponse, type NextRequest } from "next/server";
import {
  authorizeAdminRequest,
  hashClientIp,
  revokeAdminSessionsForAdmin,
} from "@/lib/admin/auth";
import { findAdminUserById, recordAdminAudit, updateAdminUser } from "@/lib/admin/db";
import { clientIp } from "@/lib/admin/http";
import { hashPassword, validatePasswordStrength, verifyPassword } from "@/lib/admin/password";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const auth = await authorizeAdminRequest(request);
  if (!auth.ok) return auth.response;
  if (auth.session.isApiKey) {
    return NextResponse.json(
      { ok: false, message: "API keys cannot change passwords through this route." },
      { status: 400 },
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request body." }, { status: 400 });
  }

  const currentPassword = String(body?.currentPassword || "");
  const newPassword = String(body?.newPassword || "");

  const user = await findAdminUserById(auth.session.id);
  if (!user) {
    return NextResponse.json({ ok: false, message: "Admin user not found." }, { status: 404 });
  }

  const currentOk = await verifyPassword(currentPassword, user.passwordHash);
  if (!currentOk) {
    return NextResponse.json(
      { ok: false, message: "Current password is incorrect." },
      { status: 400 },
    );
  }

  const errors = validatePasswordStrength(newPassword);
  if (errors.length) {
    return NextResponse.json(
      { ok: false, message: errors[0], errors },
      { status: 400 },
    );
  }

  await updateAdminUser(user.id, { passwordHash: await hashPassword(newPassword) });
  // Keep the current session, sign out every other device.
  await revokeAdminSessionsForAdmin(user.id, auth.session.sessionId);
  await recordAdminAudit({
    adminId: user.id,
    action: "auth.password_changed",
    entityType: "admin_user",
    entityId: user.id,
    detail: "Password changed; other sessions revoked.",
    ipHash: hashClientIp(clientIp(request)),
  });

  return NextResponse.json({ ok: true, message: "Password updated." });
}
