import { NextResponse, type NextRequest } from "next/server";
import { authorizeStaffRequest } from "@/lib/staff/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await authorizeStaffRequest(request);
  if (!auth.ok) return auth.response;

  const assignments = await prisma.eventAssignment.findMany({
    where: { registrationId: auth.session.id },
    orderBy: [{ workDate: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ ok: true, assignments });
}
