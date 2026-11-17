import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { normalizePhoneNumber } from "@/lib/staff/config";
import {
  getLatestOtpChallenge,
  incrementOtpAttempts,
  markOtpVerified,
} from "@/lib/staff/db";
import {
  createVerificationToken,
  hashOtpCode,
  hashVerificationToken,
} from "@/lib/staff/secureStorage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VERIFICATION_TTL_MS = 30 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function jsonError(message: string, status: number) {
  return NextResponse.json({ ok: false, message }, { status });
}

function hashesMatch(left: unknown, right: unknown) {
  const leftBuffer = Buffer.from(String(left), "hex");
  const rightBuffer = Buffer.from(String(right), "hex");
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export async function POST(request: NextRequest) {
  let body: any;

  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const phone = normalizePhoneNumber(body?.mobileNumber);
  const code = String(body?.code || "").replace(/\D/g, "");

  if (!phone) {
    return jsonError("Enter a valid mobile number.", 400);
  }

  if (!/^\d{6}$/.test(code)) {
    return jsonError("Enter the 6-digit code from WhatsApp.", 400);
  }

  const challenge = await getLatestOtpChallenge(phone);

  if (!challenge) {
    return jsonError("Request a verification code first.", 400);
  }

  if (challenge.consumed_at) {
    return jsonError(
      "This verification has already been used. Request a new code.",
      400,
    );
  }

  if (Number(challenge.attempts) >= MAX_ATTEMPTS) {
    return jsonError(
      "Too many incorrect attempts. Request a new verification code.",
      429,
    );
  }

  if (new Date(challenge.expires_at).getTime() < Date.now()) {
    return jsonError("This code has expired. Request a new one.", 400);
  }

  if (!hashesMatch(hashOtpCode(phone, code), challenge.code_hash)) {
    await incrementOtpAttempts(challenge.id);
    const remaining = MAX_ATTEMPTS - (Number(challenge.attempts) + 1);
    return jsonError(
      remaining > 0
        ? `Incorrect code. ${remaining} attempt${remaining === 1 ? "" : "s"} left.`
        : "Too many incorrect attempts. Request a new verification code.",
      400,
    );
  }

  const token = createVerificationToken();
  const expiresAt = new Date(
    Date.now() + VERIFICATION_TTL_MS,
  ).toISOString();

  await markOtpVerified(challenge.id, hashVerificationToken(token), expiresAt);

  return NextResponse.json({
    ok: true,
    verified: true,
    verificationToken: token,
    expiresInSeconds: Math.floor(VERIFICATION_TTL_MS / 1000),
  });
}
