import { NextResponse, type NextRequest } from "next/server";
import { normalizePhoneNumber } from "@/lib/staff/config";
import {
  createOtpChallenge,
  getRecentOtpChallenges,
  pruneExpiredOtpChallenges,
} from "@/lib/staff/db";
import { isWhatsAppConfigured, sendWhatsAppOtp } from "@/lib/staff/otp";
import { createOtpCode, hashOtpCode } from "@/lib/staff/secureStorage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;
const MAX_SENDS_PER_HOUR = 5;

function jsonError(
  message: string,
  status: number,
  extra?: Record<string, unknown>,
) {
  return NextResponse.json({ ok: false, message, ...extra }, { status });
}

export async function POST(request: NextRequest) {
  let body: any;

  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const phone = normalizePhoneNumber(body?.mobileNumber);
  if (!phone) {
    return jsonError(
      "Enter a valid 10-digit Indian mobile number starting with 6–9.",
      400,
    );
  }

  const now = Date.now();
  const recent = await getRecentOtpChallenges(
    phone,
    new Date(now - 60 * 60 * 1000).toISOString(),
  );

  if (recent.length > 0) {
    const lastSent = new Date(recent[0].created_at).getTime();
    const waitMs = RESEND_COOLDOWN_MS - (now - lastSent);
    if (waitMs > 0) {
      return jsonError(
        `Please wait ${Math.ceil(waitMs / 1000)} seconds before requesting another code.`,
        429,
        { retryAfterSeconds: Math.ceil(waitMs / 1000) },
      );
    }
  }

  if (recent.length >= MAX_SENDS_PER_HOUR) {
    return jsonError(
      "Too many verification codes requested for this number. Try again later.",
      429,
    );
  }

  await pruneExpiredOtpChallenges(
    new Date(now - 24 * 60 * 60 * 1000).toISOString(),
  );

  const code = createOtpCode();
  const challengeId = await createOtpChallenge({
    mobileNumber: phone,
    codeHash: hashOtpCode(phone, code),
    expiresAt: new Date(now + OTP_TTL_MS).toISOString(),
  });

  const delivery = await sendWhatsAppOtp(phone, code);
  const configured = isWhatsAppConfigured();

  if (configured && !delivery.delivered) {
    return jsonError(
      "We could not send the text message code right now. Please try again.",
      502,
      { challengeId },
    );
  }

  if (!configured && process.env.NODE_ENV === "production") {
    return jsonError(
      "Text message OTP delivery is not configured. Contact the candidate desk.",
      503,
      { challengeId },
    );
  }

  return NextResponse.json({
    ok: true,
    challengeId,
    expiresInSeconds: Math.floor(OTP_TTL_MS / 1000),
    channel: configured ? "whatsapp" : "development",
    // Only exposed in non-production when WhatsApp is not configured so the
    // registration flow can be tested locally. Never returned in production.
    ...(configured ? {} : { devCode: code }),
  });
}
