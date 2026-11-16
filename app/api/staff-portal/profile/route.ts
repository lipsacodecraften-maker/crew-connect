import { NextResponse, type NextRequest } from "next/server";
import { authorizeStaffRequest } from "@/lib/staff/auth";
import { prisma } from "@/lib/prisma";
import { getStaffRegistrationById } from "@/lib/staff/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await authorizeStaffRequest(request);
  if (!auth.ok) return auth.response;
  const profile = await getStaffRegistrationById(auth.session.id);
  return NextResponse.json({ ok: true, profile });
}

export async function PATCH(request: NextRequest) {
  const auth = await authorizeStaffRequest(request);
  if (!auth.ok) return auth.response;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request body." }, { status: 400 });
  }

  const data: any = { updatedAt: new Date().toISOString() };
  const allowed = [
    "fullName",
    "emailAddress",
    "currentCity",
    "areaPincode",
    "experienceLevel",
    "expectedPayment",
    "availableFrom",
    "availableUntil",
    "previousEvents",
    "otherSkill",
  ];
  for (const key of allowed) {
    if (body?.[key] !== undefined) data[key] = body[key];
  }
  if (Array.isArray(body?.languages)) data.languages = JSON.stringify(body.languages);
  if (Array.isArray(body?.skills)) data.skills = JSON.stringify(body.skills);
  if (Array.isArray(body?.preferredCities)) data.preferredCities = JSON.stringify(body.preferredCities);
  if (Array.isArray(body?.shiftTypes)) data.shiftTypes = JSON.stringify(body.shiftTypes);
  if (body?.willingToTravel !== undefined) data.willingToTravel = body.willingToTravel === "yes" || body.willingToTravel === true;
  if (body?.transportAvailable !== undefined) data.transportAvailable = body.transportAvailable === "yes" || body.transportAvailable === true;
  if (body?.yearsOfExperience !== undefined) data.yearsExperience = Number(body.yearsOfExperience) || 0;

  await prisma.staffRegistration.update({ where: { id: auth.session.id }, data });
  const profile = await getStaffRegistrationById(auth.session.id);
  return NextResponse.json({ ok: true, profile });
}
