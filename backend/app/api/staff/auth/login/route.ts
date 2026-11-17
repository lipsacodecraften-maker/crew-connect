import { prisma } from "@/lib/prisma";
import { NextResponse, type NextRequest } from "next/server";
import { normalizePhoneNumber } from "@/lib/staff/config";
import {
  getStaffRegistrationById,
  hasValidOtpVerification,
  consumeOtpVerification,
} from "@/lib/staff/db";
import { hashVerificationToken } from "@/lib/staff/secureStorage";
import {
  createStaffSessionToken,
  setStaffSessionCookie,
} from "@/lib/staff/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request body." }, { status: 400 });
  }

  const phone = normalizePhoneNumber(body?.mobileNumber);
  const token = String(body?.verificationToken || "");
  if (!phone || !token) {
    return NextResponse.json({ ok: false, message: "Mobile number and verification token are required." }, { status: 400 });
  }

  const nowIso = new Date().toISOString();
  const valid = await hasValidOtpVerification(phone, hashVerificationToken(token), nowIso);
  if (!valid) {
    return NextResponse.json({ ok: false, message: "Verification expired or invalid. Request a new code." }, { status: 400 });
  }

  // find registration by mobile
  const registration = await prisma.staffRegistration.findFirst({
    where: { mobileNumber: phone },
    select: { id: true, status: true },
  });

  if (!registration) {
    return NextResponse.json({ ok: false, message: "No staff account found for this number. Please register first." }, { status: 404 });
  }

  if (registration.status === "rejected") {
    return NextResponse.json({ ok: false, message: "Your registration was not approved." }, { status: 403 });
  }

  await consumeOtpVerification(phone, hashVerificationToken(token), nowIso);

  const userAgent = request.headers.get("user-agent");
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  const { token: sessionToken } = await createStaffSessionToken(registration.id, userAgent, ip);

  const response = NextResponse.json({ ok: true, registrationId: registration.id });
  await setStaffSessionCookie(response, sessionToken);
  return response;
}
