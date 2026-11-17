import { NextResponse } from "next/server";

export function adminJsonError(
  message: string,
  status = 400,
  extra: Record<string, unknown> = {},
) {
  return NextResponse.json({ ok: false, message, ...extra }, { status });
}

export async function readAdminJson<T = any>(request: Request) {
  try {
    return { ok: true as const, body: (await request.json()) as T };
  } catch {
    return { ok: false as const, response: adminJsonError("Invalid request body.", 400) };
  }
}

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") || "unknown";
}

export function userAgent(request: Request) {
  return (request.headers.get("user-agent") || "").slice(0, 300);
}

export function originAllowed(request: Request) {
  const method = request.method.toUpperCase();
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) return true;

  const origin = request.headers.get("origin");
  // Non-browser clients (curl, scripts) do not send Origin. Browser mutation
  // requests do, and it must match the host that served the admin app.
  if (!origin) return true;

  try {
    const originUrl = new URL(origin);
    const requestUrl = new URL(request.url);
    const forwardedHost = request.headers.get("x-forwarded-host");
    const allowedHosts = new Set([
      requestUrl.host,
      request.headers.get("host") || "",
      forwardedHost || "",
    ]);

    return allowedHosts.has(originUrl.host);
  } catch {
    return false;
  }
}

export function parsePositiveInt(value: unknown, fallback: number, max = 100) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return fallback;
  return Math.min(Math.floor(number), max);
}

export function cleanText(value: unknown, max = 500) {
  return String(value ?? "").trim().slice(0, max);
}
