import { NextResponse, type NextRequest } from "next/server";
import { attachSessionCookie, loginAdmin } from "@/lib/admin/auth";
import { adminJsonError, originAllowed } from "@/lib/admin/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!originAllowed(request)) {
    return adminJsonError("Cross-origin request rejected.", 403);
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return adminJsonError("Invalid request body.", 400);
  }

  const email = String(body?.email || "").trim();
  const password = String(body?.password || "");

  if (!email || !password) {
    return adminJsonError("Email and password are required.", 400);
  }

  const result = await loginAdmin(request, { email, password });

  if (!result.ok) {
    const response = adminJsonError(result.message, result.status);
    if (result.retryAfter) {
      response.headers.set("Retry-After", String(result.retryAfter));
    }
    return response;
  }

  const response = NextResponse.json({
    ok: true,
    user: result.user,
    expiresAt: result.expiresAt,
  });
  return attachSessionCookie(response, result.token);
}
