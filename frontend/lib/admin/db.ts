import { prisma } from "@/lib/prisma";
import type { AdminRoleId } from "./constants";

export type AdminUserRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const adminUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  status: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function findAdminUserByEmail(email: string) {
  return prisma.adminUser.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
}

export async function findAdminUserById(id: string) {
  return prisma.adminUser.findUnique({ where: { id } });
}

export async function listAdminUsers() {
  return prisma.adminUser.findMany({
    select: adminUserSelect,
    orderBy: [{ createdAt: "asc" }],
  });
}

export async function createAdminUser(input: {
  email: string;
  name: string;
  passwordHash: string;
  role: AdminRoleId;
}) {
  return prisma.adminUser.create({
    data: {
      email: input.email.trim().toLowerCase(),
      name: input.name.trim(),
      passwordHash: input.passwordHash,
      role: input.role,
      status: "active",
    },
    select: adminUserSelect,
  });
}

export async function updateAdminUser(
  id: string,
  patch: {
    name?: string;
    role?: AdminRoleId;
    status?: "active" | "disabled";
    passwordHash?: string;
  },
) {
  return prisma.adminUser.update({
    where: { id },
    data: patch,
    select: adminUserSelect,
  });
}

export async function markAdminLogin(id: string) {
  return prisma.adminUser.update({
    where: { id },
    data: { lastLoginAt: new Date() },
    select: { id: true },
  });
}

export async function countActiveAdmins(role?: AdminRoleId) {
  return prisma.adminUser.count({
    where: { status: "active", ...(role ? { role } : {}) },
  });
}

/* -------------------------------------------------------------------------- */
/* Sessions                                                                   */
/* -------------------------------------------------------------------------- */

export async function createAdminSession(input: {
  adminId: string;
  tokenHash: string;
  userAgent?: string;
  ipHash?: string;
  expiresAt: Date;
}) {
  return prisma.adminSession.create({ data: input });
}

export async function findAdminSessionByTokenHash(tokenHash: string) {
  return prisma.adminSession.findUnique({
    where: { tokenHash },
    include: {
      admin: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
        },
      },
    },
  });
}

export async function touchAdminSession(id: string, lastSeenAt: Date) {
  await prisma.adminSession.update({
    where: { id },
    data: { lastSeenAt },
    select: { id: true },
  });
}

export async function revokeAdminSession(tokenHash: string) {
  await prisma.adminSession.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function revokeAdminSessionsForAdmin(
  adminId: string,
  exceptSessionId?: string,
) {
  await prisma.adminSession.updateMany({
    where: {
      adminId,
      revokedAt: null,
      ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}),
    },
    data: { revokedAt: new Date() },
  });
}

export async function pruneAdminSessions() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  await prisma.adminSession.deleteMany({
    where: {
      OR: [{ expiresAt: { lt: new Date() } }, { revokedAt: { lt: cutoff } }],
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Audit trail                                                                */
/* -------------------------------------------------------------------------- */

export async function recordAdminAudit(input: {
  adminId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  detail?: string | null;
  ipHash?: string | null;
}) {
  await prisma.adminAuditLog.create({
    data: {
      adminId: input.adminId || null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId || null,
      detail: input.detail ? input.detail.slice(0, 700) : null,
      ipHash: input.ipHash || null,
    },
  });
}

export async function listRecentAudit(limit = 12) {
  const rows = await prisma.adminAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { admin: { select: { name: true, email: true } } },
  });

  return rows.map((row) => ({
    id: row.id,
    action: row.action,
    entityType: row.entityType,
    entityId: row.entityId || "",
    detail: row.detail || "",
    createdAt: row.createdAt,
    adminName: row.admin?.name || "System",
  }));
}
