import { NextResponse, type NextRequest } from "next/server";
import { authorizeAdminRequest, hashClientIp } from "@/lib/admin/auth";
import {
  QUOTATION_STATUSES,
  QUOTATION_STATUS_LABELS,
} from "@/lib/admin/constants";
import { recordAdminAudit } from "@/lib/admin/db";
import { adminJsonError, clientIp, readAdminJson } from "@/lib/admin/http";
import { saveQuotation, markQuotationStatus } from "@/lib/admin/bookings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type QuotationBody = {
  lineItems?: Array<{
    requirementRef?: number | string | null;
    label?: string;
    quantity?: number | string;
    days?: number | string;
    unitRate?: number | string;
    note?: string;
  }>;
  taxPercent?: number | string;
  notes?: string;
  validUntil?: string;
  status?: string;
};

export async function PUT(
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
) {
  const auth = await authorizeAdminRequest(request, {
    permission: "quotations.manage",
  });
  if (!auth.ok) return auth.response;

  const parsed = await readAdminJson<QuotationBody>(request);
  if (!parsed.ok) return parsed.response;

  const { bookingId } = await context.params;
  const body = parsed.body;

  if (!Array.isArray(body.lineItems) || body.lineItems.length === 0) {
    return adminJsonError("Add at least one quotation line item.", 400);
  }

  const lineItems = body.lineItems.map((item) => ({
    requirementRef:
      item.requirementRef === null || item.requirementRef === undefined
        ? null
        : Number(item.requirementRef),
    label: String(item.label || "").trim(),
    quantity: Number(item.quantity) || 1,
    days: Number(item.days) || 1,
    unitRate: Number(item.unitRate) || 0,
    note: item.note,
  }));

  if (lineItems.some((item) => !item.label)) {
    return adminJsonError("Every quotation line needs a label.", 400);
  }
  if (lineItems.some((item) => item.unitRate < 0)) {
    return adminJsonError("Unit rates cannot be negative.", 400);
  }

  const quotation = await saveQuotation(
    bookingId,
    {
      lineItems,
      taxPercent: body.taxPercent === undefined ? 18 : Number(body.taxPercent),
      notes: body.notes,
      validUntil: body.validUntil,
      status: body.status,
    },
    auth.session.id,
  );

  if (!quotation) return adminJsonError("Booking request not found.", 404);

  await recordAdminAudit({
    adminId: auth.session.id,
    action: "quotation.saved",
    entityType: "booking",
    entityId: bookingId,
    detail: `Quotation ${QUOTATION_STATUS_LABELS[quotation.status] || quotation.status} · ₹${Math.round(quotation.total).toLocaleString("en-IN")}`,
    ipHash: hashClientIp(clientIp(request)),
  });

  return NextResponse.json({ ok: true, quotation });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
) {
  const auth = await authorizeAdminRequest(request, {
    permission: "quotations.manage",
  });
  if (!auth.ok) return auth.response;

  const parsed = await readAdminJson<{ status?: string }>(request);
  if (!parsed.ok) return parsed.response;

  const status = String(parsed.body.status || "");
  if (!(QUOTATION_STATUSES as readonly string[]).includes(status)) {
    return adminJsonError(
      `Quotation status must be one of: ${QUOTATION_STATUSES.join(", ")}.`,
      400,
    );
  }

  const { bookingId } = await context.params;
  const quotation = await markQuotationStatus(bookingId, status);
  if (!quotation) return adminJsonError("Quotation not found.", 404);

  await recordAdminAudit({
    adminId: auth.session.id,
    action: "quotation.status_changed",
    entityType: "booking",
    entityId: bookingId,
    detail: `Quotation marked ${QUOTATION_STATUS_LABELS[status] || status}.`,
    ipHash: hashClientIp(clientIp(request)),
  });

  return NextResponse.json({ ok: true, quotation });
}
