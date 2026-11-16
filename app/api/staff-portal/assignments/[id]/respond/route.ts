import { NextResponse, type NextRequest } from "next/server";
import { authorizeStaffRequest } from "@/lib/staff/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorizeStaffRequest(request);
  if (!auth.ok) return auth.response;
  const { id } = await params;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request body." }, { status: 400 });
  }

  const action = String(body?.action || "").toLowerCase();
  if (!["accept", "decline"].includes(action)) {
    return NextResponse.json({ ok: false, message: "Action must be accept or decline." }, { status: 400 });
  }

  const assignment = await prisma.eventAssignment.findFirst({
    where: { id, registrationId: auth.session.id },
  });
  if (!assignment) {
    return NextResponse.json({ ok: false, message: "Assignment not found." }, { status: 404 });
  }

  const nextStatus = action === "accept" ? "confirmed" : "cancelled";
  await prisma.eventAssignment.update({
    where: { id },
    data: { status: nextStatus, updatedAt: new Date() },
  });

  return NextResponse.json({ ok: true, status: nextStatus });
}
