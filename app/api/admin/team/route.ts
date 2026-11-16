import { NextResponse, type NextRequest } from "next/server";
import {
  authorizeAdminRequest,
  hashClientIp,
  revokeAdminSessionsForAdmin,
} from "@/lib/admin/auth";
import { ADMIN_ROLE_IDS, ADMIN_ROLES, isAdminRole } from "@/lib/admin/constants";
import {
  countActiveAdmins,
  createAdminUser,
  findAdminUserByEmail,
  findAdminUserById,
  listAdminUsers,
  recordAdminAudit,
  updateAdminUser,
} from "@/lib/admin/db";
import { adminJsonError, clientIp, readAdminJson } from "@/lib/admin/http";
import { hashPassword, validatePasswordStrength } from "@/lib/admin/password";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await authorizeAdminRequest(request, { permission: "team.manage" });
  if (!auth.ok) return auth.response;

  const users = await listAdminUsers();
  return NextResponse.json({
    ok: true,
    users,
    roles: ADMIN_ROLE_IDS.map((role) => ({
      id: role,
      label: ADMIN_ROLES[role].label,
      description: ADMIN_ROLES[role].description,
    })),
  });
}

export async function POST(request: NextRequest) {
  const auth = await authorizeAdminRequest(request, { permission: "team.manage" });
  if (!auth.ok) return auth.response;

  const parsed = await readAdminJson<{
    name?: string;
    email?: string;
    password?: string;
    role?: string;
  }>(request);
  if (!parsed.ok) return parsed.response;

  const name = String(parsed.body.name || "").trim().slice(0, 120);
  const email = String(parsed.body.email || "").trim().toLowerCase();
  const password = String(parsed.body.password || "");
  const role = String(parsed.body.role || "");

  if (!name) return adminJsonError("Add the admin's full name.", 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return adminJsonError("Enter a valid email address.", 400);
  }
  if (!isAdminRole(role)) {
    return adminJsonError(`Role must be one of: ${ADMIN_ROLE_IDS.join(", ")}.`, 400);
  }

  const passwordErrors = validatePasswordStrength(password);
  if (passwordErrors.length) {
    return adminJsonError(passwordErrors[0], 400, { errors: passwordErrors });
  }

  const existing = await findAdminUserByEmail(email);
  if (existing) {
    return adminJsonError("An admin with that email already exists.", 409);
  }

  const user = await createAdminUser({
    name,
    email,
    role,
    passwordHash: await hashPassword(password),
  });

  await recordAdminAudit({
    adminId: auth.session.id,
    action: "admin_user.created",
    entityType: "admin_user",
    entityId: user.id,
    detail: `${user.name} (${user.email}) added as ${ADMIN_ROLES[role].label}.`,
    ipHash: hashClientIp(clientIp(request)),
  });

  return NextResponse.json({ ok: true, user }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const auth = await authorizeAdminRequest(request, { permission: "team.manage" });
  if (!auth.ok) return auth.response;

  const parsed = await readAdminJson<{
    userId?: string;
    name?: string;
    role?: string;
    status?: string;
    password?: string;
  }>(request);
  if (!parsed.ok) return parsed.response;

  const userId = String(parsed.body.userId || "");
  if (!userId) return adminJsonError("Choose an admin user to update.", 400);

  const patch: {
    name?: string;
    role?: any;
    status?: "active" | "disabled";
    passwordHash?: string;
  } = {};

  if (parsed.body.name !== undefined) {
    patch.name = String(parsed.body.name).trim().slice(0, 120);
    if (!patch.name) return adminJsonError("Name cannot be empty.", 400);
  }
  if (parsed.body.role !== undefined) {
    if (!isAdminRole(parsed.body.role)) {
      return adminJsonError("Invalid role.", 400);
    }
    patch.role = parsed.body.role;
  }
  if (parsed.body.status !== undefined) {
    if (!["active", "disabled"].includes(parsed.body.status)) {
      return adminJsonError("Status must be active or disabled.", 400);
    }
    if (parsed.body.status === "disabled" && userId === auth.session.id) {
      return adminJsonError("You cannot disable your own account.", 400);
    }
    patch.status = parsed.body.status as "active" | "disabled";
  }
  if (parsed.body.password !== undefined) {
    const errors = validatePasswordStrength(String(parsed.body.password));
    if (errors.length) return adminJsonError(errors[0], 400, { errors });
    patch.passwordHash = await hashPassword(String(parsed.body.password));
  }

  if (Object.keys(patch).length === 0) {
    return adminJsonError("No changes were provided.", 400);
  }

  // Never allow the last active super admin to be demoted or disabled.
  const target = await findAdminUserById(userId);
  if (!target) return adminJsonError("Admin user not found.", 404);

  if (
    ((patch.role && patch.role !== "super_admin") || patch.status === "disabled") &&
    target.role === "super_admin" &&
    target.status === "active"
  ) {
    const activeSuperAdmins = await countActiveAdmins("super_admin");
    if (activeSuperAdmins <= 1) {
      return adminJsonError(
        "At least one active super admin must remain. Promote another admin first.",
        400,
      );
    }
  }

  const user = await updateAdminUser(userId, patch);

  if (patch.status === "disabled" || patch.passwordHash) {
    await revokeAdminSessionsForAdmin(userId);
  }

  await recordAdminAudit({
    adminId: auth.session.id,
    action: "admin_user.updated",
    entityType: "admin_user",
    entityId: userId,
    detail: `Updated ${user.name} (${user.email}). ${Object.keys(patch).join(", ")}`,
    ipHash: hashClientIp(clientIp(request)),
  });

  return NextResponse.json({ ok: true, user });
}
