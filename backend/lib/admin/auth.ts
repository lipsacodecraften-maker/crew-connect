import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_ROLES,
  type AdminPermission,
  permissionsForRole,
  roleLabel,
  type AdminRoleId,
} from "./constants";
import {
  createAdminSession,
  findAdminSessionByTokenHash,
  findAdminUserByEmail,
  markAdminLogin,
  recordAdminAudit,
  revokeAdminSession,
  revokeAdminSessionsForAdmin,
  touchAdminSession,
} from "./db";
import { verifyPassword } from "./password";
import { adminJsonError, clientIp, originAllowed, userAgent } from "./http";

export const ADMIN_SESSION_COOKIE = "cc_admin_session";
const SESSION_TTL_HOURS = 12;
const SESSION_TTL_SECONDS = SESSION_TTL_HOURS * 60 * 60;

const globalForLoginThrottle = globalThis as unknown as {
  __ccAdminLoginThrottle?: Map<string, { count: number; resetAt: number }>;
};

const loginThrottle =
  globalForLoginThrottle.__ccAdminLoginThrottle ??
  (globalForLoginThrottle.__ccAdminLoginThrottle = new Map());

const MAX_LOGIN_ATTEMPTS = 8;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export type AdminSessionUser = {
  id: string;
  sessionId: string;
  email: string;
  name: string;
  role: string;
  roleLabel: string;
  permissions: AdminPermission[];
  isApiKey?: boolean;
  expiresAt?: Date;
};

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function hashClientIp(ip: string) {
  const salt = process.env.ADMIN_IP_SALT || "crewconnect-admin-ip";
  return sha256(`${salt}:${ip}`);
}

function safeEqual(a: string, b: string) {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB);
}

function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

function sessionFromRow(row: {
  id: string;
  expiresAt: Date;
  admin: { id: string; email: string; name: string; role: string; status: string };
}): AdminSessionUser | null {
  if (row.admin.status !== "active") return null;

  return {
    id: row.admin.id,
    sessionId: row.id,
    email: row.admin.email,
    name: row.admin.name,
    role: row.admin.role,
    roleLabel: roleLabel(row.admin.role),
    permissions: permissionsForRole(row.admin.role),
    expiresAt: row.expiresAt,
  };
}

/**
 * Reads the HttpOnly session cookie and validates it against the database.
 * Never trust the cookie value itself: only the SHA-256 hash is stored.
 */
export async function getAdminSession(): Promise<AdminSessionUser | null> {
  const store = await cookies();
  const token = store.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  return validateSessionToken(token);
}

export async function getAdminSessionFromRequest(
  request: NextRequest | Request,
): Promise<AdminSessionUser | null> {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_SESSION_COOKIE}=`));

  const token = match
    ? decodeURIComponent(match.slice(ADMIN_SESSION_COOKIE.length + 1))
    : null;

  if (!token) return null;
  return validateSessionToken(token);
}

async function validateSessionToken(token: string) {
  const row = await findAdminSessionByTokenHash(sha256(token));
  if (!row) return null;
  if (row.revokedAt) return null;
  if (row.expiresAt.getTime() <= Date.now()) return null;

  const session = sessionFromRow(row);
  if (!session) return null;

  // Avoid a write on every request while keeping a useful "last seen" trail.
  if (Date.now() - row.lastSeenAt.getTime() > 5 * 60 * 1000) {
    await touchAdminSession(row.id, new Date());
  }

  return session;
}

/* -------------------------------------------------------------------------- */
/* Login / logout                                                             */
/* -------------------------------------------------------------------------- */

function throttleKey(email: string, ip: string) {
  return `${email.toLowerCase()}|${ip}`;
}

function checkThrottle(key: string) {
  const bucket = loginThrottle.get(key);
  if (!bucket) return null;
  if (bucket.resetAt <= Date.now()) {
    loginThrottle.delete(key);
    return null;
  }
  if (bucket.count < MAX_LOGIN_ATTEMPTS) return null;
  return Math.ceil((bucket.resetAt - Date.now()) / 1000);
}

function recordFailedLogin(key: string) {
  const now = Date.now();
  const existing = loginThrottle.get(key);
  if (!existing || existing.resetAt <= now) {
    loginThrottle.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return;
  }
  existing.count += 1;
}

function clearThrottle(key: string) {
  loginThrottle.delete(key);
}

export async function loginAdmin(
  request: NextRequest,
  input: { email: string; password: string },
) {
  const email = input.email.trim().toLowerCase();
  const ip = clientIp(request);
  const key = throttleKey(email, ip);
  const retryAfter = checkThrottle(key);

  if (retryAfter) {
    return {
      ok: false as const,
      status: 429,
      message: `Too many sign-in attempts. Try again in ${Math.ceil(retryAfter / 60)} minute(s).`,
      retryAfter,
    };
  }

  const user = await findAdminUserByEmail(email);
  const passwordOk = user
    ? await verifyPassword(input.password, user.passwordHash)
    : false;

  if (!user || !passwordOk) {
    recordFailedLogin(key);
    await recordAdminAudit({
      adminId: user?.id || null,
      action: "auth.login_failed",
      entityType: "admin_user",
      entityId: user?.id || email,
      detail: "Invalid email or password.",
      ipHash: hashClientIp(ip),
    });
    return {
      ok: false as const,
      status: 401,
      message: "Invalid email or password.",
    };
  }

  if (user.status !== "active") {
    recordFailedLogin(key);
    return {
      ok: false as const,
      status: 403,
      message: "This admin account is disabled. Contact a super admin.",
    };
  }

  clearThrottle(key);

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

  await createAdminSession({
    adminId: user.id,
    tokenHash: sha256(token),
    userAgent: userAgent(request),
    ipHash: hashClientIp(ip),
    expiresAt,
  });
  await markAdminLogin(user.id);
  await recordAdminAudit({
    adminId: user.id,
    action: "auth.login",
    entityType: "admin_session",
    entityId: user.id,
    detail: `${ADMIN_ROLES[user.role as AdminRoleId]?.label || user.role} signed in.`,
    ipHash: hashClientIp(ip),
  });

  return {
    ok: true as const,
    token,
    expiresAt,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      roleLabel: roleLabel(user.role),
      permissions: permissionsForRole(user.role),
    },
  };
}

export function attachSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(ADMIN_SESSION_COOKIE, token, sessionCookieOptions());
  return response;
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}

export async function logoutAdmin(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_SESSION_COOKIE}=`));

  if (match) {
    const token = decodeURIComponent(match.slice(ADMIN_SESSION_COOKIE.length + 1));
    const session = await validateSessionToken(token);
    await revokeAdminSession(sha256(token));
    if (session) {
      await recordAdminAudit({
        adminId: session.id,
        action: "auth.logout",
        entityType: "admin_session",
        entityId: session.sessionId,
        detail: "Signed out.",
        ipHash: hashClientIp(clientIp(request)),
      });
    }
  }

  return clearSessionCookie(NextResponse.json({ ok: true }));
}

/* -------------------------------------------------------------------------- */
/* Route guards                                                               */
/* -------------------------------------------------------------------------- */

type AuthorizeOptions = {
  permission?: AdminPermission;
  allowApiKey?: boolean;
};

export type AdminAuthorization =
  | { ok: true; session: AdminSessionUser; viaApiKey: boolean }
  | { ok: false; response: NextResponse };

function hasPermissionOrApiKey(
  session: AdminSessionUser,
  permission?: AdminPermission,
) {
  if (!permission) return true;
  return session.permissions.includes(permission);
}

/**
 * Use inside every /api/admin route. Accepts either a signed-in dashboard
 * session (cookie) or the legacy ADMIN_API_KEY for scripts. The API key is
 * treated as a super admin, but origin checks still apply to browsers.
 */
export async function authorizeAdminRequest(
  request: NextRequest | Request,
  options: AuthorizeOptions = {},
): Promise<AdminAuthorization> {
  if (!originAllowed(request)) {
    return {
      ok: false,
      response: adminJsonError("Cross-origin request rejected.", 403),
    };
  }

  const session = await getAdminSessionFromRequest(request);
  if (session) {
    if (!hasPermissionOrApiKey(session, options.permission)) {
      return {
        ok: false,
        response: adminJsonError(
          "You do not have permission to perform this action.",
          403,
        ),
      };
    }
    return { ok: true, session, viaApiKey: false };
  }

  if (options.allowApiKey === false) {
    return { ok: false, response: adminJsonError("Unauthorized.", 401) };
  }

  const expected = process.env.ADMIN_API_KEY;
  const provided =
    request.headers.get("x-admin-key") ||
    (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");

  if (expected && provided && safeEqual(provided, expected)) {
    return {
      ok: true,
      viaApiKey: true,
      session: {
        id: "api-key",
        sessionId: "api-key",
        email: "api-key",
        name: "Automation API key",
        role: "super_admin",
        roleLabel: "Super admin (API key)",
        permissions: permissionsForRole("super_admin"),
        isApiKey: true,
      },
    };
  }

  return { ok: false, response: adminJsonError("Unauthorized.", 401) };
}

export function can(session: AdminSessionUser | null, permission: AdminPermission) {
  return Boolean(session?.permissions?.includes(permission));
}

export { revokeAdminSessionsForAdmin };
