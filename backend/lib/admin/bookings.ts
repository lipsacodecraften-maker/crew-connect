import { prisma } from "@/lib/prisma";
import {
  ACTIVE_ASSIGNMENT_STATUSES,
  BOOKING_STATUS_LABELS,
  QUOTATION_STATUSES,
} from "./constants";
import { parseStringArray, toNumberOrNull } from "./format";

export type BookingListFilters = {
  q?: string;
  city?: string;
  status?: string;
  role?: string;
  dateFrom?: string;
  dateTo?: string;
};

function activeAssignmentWhere() {
  return { status: { in: [...ACTIVE_ASSIGNMENT_STATUSES] } };
}

function mapBookingRow(row: any) {
  const requirements = row.staffingRequirements || [];
  const requested = requirements.reduce(
    (sum: number, requirement: any) => sum + Number(requirement.quantity || 0),
    0,
  );
  const activeAssignments = (row.assignments || []).filter((assignment: any) =>
    (ACTIVE_ASSIGNMENT_STATUSES as readonly string[]).includes(assignment.status),
  );
  const assigned = new Set(
    activeAssignments.map((assignment: any) => assignment.registrationId),
  ).size;

  return {
    id: row.id,
    status: row.status,
    statusLabel: BOOKING_STATUS_LABELS[row.status] || row.status,
    clientCompanyName: row.clientCompanyName,
    contactPerson: row.contactPerson,
    mobileNumber: row.mobileNumber,
    emailAddress: row.emailAddress,
    eventName: row.eventName,
    eventType: row.eventType,
    eventCity: row.eventCity,
    state: row.state,
    eventStartDate: row.eventStartDate,
    eventEndDate: row.eventEndDate,
    guestCount: row.guestCount,
    budgetPerPerson: toNumberOrNull(row.budgetPerPerson),
    totalStaff: Number(row.totalStaff || requested),
    requested,
    assigned,
    remaining: Math.max(0, requested - assigned),
    urgent: Boolean(row.urgent),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    roles: requirements.map((requirement: any) => requirement.staffRole),
    rolesPreview: [...new Set(requirements.map((requirement: any) => requirement.staffRole))]
      .slice(0, 3)
      .join(" · "),
  };
}

export async function listBookings(filters: BookingListFilters = {}) {
  const and: any[] = [];

  if (filters.status && filters.status !== "all") {
    and.push({ status: filters.status });
  }
  if (filters.city && filters.city !== "all") {
    and.push({ eventCity: { contains: filters.city, mode: "insensitive" } });
  }
  if (filters.role && filters.role !== "all") {
    and.push({
      staffingRequirements: {
        some: { staffRole: { contains: filters.role, mode: "insensitive" } },
      },
    });
  }
  if (filters.dateFrom) {
    and.push({ eventStartDate: { gte: filters.dateFrom } });
  }
  if (filters.dateTo) {
    and.push({ eventStartDate: { lte: filters.dateTo } });
  }
  if (filters.q) {
    const q = filters.q.trim();
    and.push({
      OR: [
        { id: { contains: q, mode: "insensitive" } },
        { clientCompanyName: { contains: q, mode: "insensitive" } },
        { contactPerson: { contains: q, mode: "insensitive" } },
        { eventName: { contains: q, mode: "insensitive" } },
        { eventCity: { contains: q, mode: "insensitive" } },
        { emailAddress: { contains: q, mode: "insensitive" } },
        { mobileNumber: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  const rows = await prisma.bookingRequest.findMany({
    where: and.length ? { AND: and } : undefined,
    orderBy: [{ eventStartDate: "desc" }, { createdAt: "desc" }],
    include: {
      staffingRequirements: {
        orderBy: { roleIndex: "asc" },
        select: { id: true, staffRole: true, quantity: true, workDate: true },
      },
      assignments: {
        where: activeAssignmentWhere(),
        select: { registrationId: true, status: true, requirementRef: true },
      },
    },
  });

  return rows.map(mapBookingRow);
}

export async function getBookingFacets() {
  const [cities, requirements] = await Promise.all([
    prisma.bookingRequest.findMany({
      distinct: ["eventCity"],
      select: { eventCity: true },
      orderBy: { eventCity: "asc" },
    }),
    prisma.staffingRequirement.findMany({
      distinct: ["staffRole"],
      select: { staffRole: true },
      orderBy: { staffRole: "asc" },
    }),
  ]);

  return {
    cities: cities.map((row) => row.eventCity).filter(Boolean),
    roles: requirements.map((row) => row.staffRole).filter(Boolean),
  };
}

export async function getBookingDetail(bookingId: string) {
  if (!bookingId) return null;

  const row = await prisma.bookingRequest.findUnique({
    where: { id: bookingId },
    include: {
      staffingRequirements: { orderBy: { roleIndex: "asc" } },
      statusEvents: { orderBy: { id: "asc" } },
      quotation: {
        include: { lineItems: { orderBy: { position: "asc" } } },
      },
      assignments: {
        orderBy: [{ workDate: "asc" }, { createdAt: "asc" }],
        include: {
          registration: {
            select: {
              id: true,
              fullName: true,
              mobileNumber: true,
              currentCity: true,
              status: true,
              experienceLevel: true,
            },
          },
        },
      },
      notifications: { orderBy: { id: "desc" }, take: 8 },
    },
  });

  if (!row) return null;

  const activeAssignments = row.assignments.filter((assignment) =>
    (ACTIVE_ASSIGNMENT_STATUSES as readonly string[]).includes(assignment.status),
  );

  const requirements = row.staffingRequirements.map((requirement) => {
    const assigned = activeAssignments.filter(
      (assignment) => assignment.requirementRef === requirement.id,
    );
    const filled = new Set(assigned.map((assignment) => assignment.registrationId)).size;
    return {
      id: requirement.id,
      roleIndex: requirement.roleIndex,
      staffRole: requirement.staffRole,
      genderPreference: requirement.genderPreference,
      quantity: Number(requirement.quantity),
      workDate: requirement.workDate,
      reportingTime: requirement.reportingTime,
      shiftDuration: Number(requirement.shiftDuration),
      experienceRequirement: requirement.experienceRequirement,
      uniformRequirement: requirement.uniformRequirement,
      specialInstructions: requirement.specialInstructions || "",
      filled,
      remaining: Math.max(0, Number(requirement.quantity) - filled),
      assignedStaff: assigned.map((assignment) => ({
        assignmentId: assignment.id,
        registrationId: assignment.registrationId,
        fullName: assignment.registration.fullName,
        mobileNumber: assignment.registration.mobileNumber,
        status: assignment.status,
        attendanceStatus: assignment.attendanceStatus,
      })),
    };
  });

  const requested = requirements.reduce(
    (sum, requirement) => sum + requirement.quantity,
    0,
  );
  const assigned = new Set(
    activeAssignments.map((assignment) => assignment.registrationId),
  ).size;

  return {
    id: row.id,
    trackingToken: row.trackingToken,
    status: row.status,
    statusLabel: BOOKING_STATUS_LABELS[row.status] || row.status,
    clientCompanyName: row.clientCompanyName,
    contactPerson: row.contactPerson,
    mobileNumber: row.mobileNumber,
    whatsappNumber: row.whatsappNumber,
    emailAddress: row.emailAddress,
    companyType: row.companyType,
    eventName: row.eventName,
    eventType: row.eventType,
    eventCity: row.eventCity,
    state: row.state,
    venueAddress: row.venueAddress,
    mapsLocation: row.mapsLocation || "",
    eventStartDate: row.eventStartDate,
    eventEndDate: row.eventEndDate,
    reportingTime: row.reportingTime,
    dutyStartTime: row.dutyStartTime,
    dutyEndTime: row.dutyEndTime,
    guestCount: row.guestCount,
    budgetPerPerson: Number(row.budgetPerPerson),
    foodProvided: Boolean(row.foodProvided),
    transportProvided: Boolean(row.transportProvided),
    accommodationProvided: Boolean(row.accommodationProvided),
    dressCode: row.dressCode,
    languageRequirements: parseStringArray(row.languageRequirements),
    additionalNotes: row.additionalNotes || "",
    urgent: Boolean(row.urgent),
    referenceFileName: row.referenceFileName || "",
    referenceFileSize: row.referenceFileSize || 0,
    totalStaff: Number(row.totalStaff),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    requirements,
    requested,
    assigned,
    remaining: Math.max(0, requested - assigned),
    history: row.statusEvents.map((event) => ({
      status: event.status,
      statusLabel: BOOKING_STATUS_LABELS[event.status] || event.status,
      note: event.note || "",
      createdAt: event.createdAt,
    })),
    assignments: row.assignments.map((assignment) => ({
      id: assignment.id,
      requirementRef: assignment.requirementRef,
      registrationId: assignment.registrationId,
      staffName: assignment.registration.fullName,
      staffMobile: assignment.registration.mobileNumber,
      staffCity: assignment.registration.currentCity,
      staffStatus: assignment.registration.status,
      role: assignment.role,
      city: assignment.city,
      workDate: assignment.workDate,
      shiftStart: assignment.shiftStart || "",
      shiftEnd: assignment.shiftEnd || "",
      status: assignment.status,
      attendanceStatus: assignment.attendanceStatus,
      payRate: assignment.payRate === null ? null : Number(assignment.payRate),
      notes: assignment.notes || "",
      checkInAt: assignment.checkInAt,
      checkOutAt: assignment.checkOutAt,
      attendanceNotes: assignment.attendanceNotes || "",
      completedAt: assignment.completedAt,
      createdAt: assignment.createdAt,
    })),
    quotation: row.quotation
      ? {
          id: row.quotation.id,
          status: row.quotation.status,
          statusLabel:
            QUOTATION_STATUSES.includes(row.quotation.status as any)
              ? row.quotation.status
              : row.quotation.status,
          currency: row.quotation.currency,
          taxPercent: Number(row.quotation.taxPercent),
          subtotal: Number(row.quotation.subtotal),
          taxAmount: Number(row.quotation.taxAmount),
          total: Number(row.quotation.total),
          notes: row.quotation.notes || "",
          validUntil: row.quotation.validUntil || "",
          createdAt: row.quotation.createdAt,
          updatedAt: row.quotation.updatedAt,
          lineItems: row.quotation.lineItems.map((item) => ({
            id: item.id,
            requirementRef: item.requirementRef,
            label: item.label,
            quantity: Number(item.quantity),
            days: Number(item.days),
            unitRate: Number(item.unitRate),
            amount: Number(item.amount),
            note: item.note || "",
          })),
        }
      : null,
    notifications: row.notifications.map((notification) => ({
      id: notification.id,
      channel: notification.channel,
      recipientType: notification.recipientType,
      status: notification.status,
      subject: notification.subject || "",
      error: notification.error || "",
      createdAt: notification.createdAt,
    })),
  };
}

export type BookingDetail = NonNullable<Awaited<ReturnType<typeof getBookingDetail>>>;

export async function listBookingRequirementsForAssignment(bookingId: string) {
  const booking = await prisma.bookingRequest.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      eventName: true,
      eventCity: true,
      status: true,
      staffingRequirements: { orderBy: { roleIndex: "asc" } },
      assignments: {
        where: activeAssignmentWhere(),
        select: { id: true, registrationId: true, requirementRef: true },
      },
    },
  });

  if (!booking) return null;

  return {
    ...booking,
    requirements: booking.staffingRequirements.map((requirement) => {
      const filled = new Set(
        booking.assignments
          .filter((assignment) => assignment.requirementRef === requirement.id)
          .map((assignment) => assignment.registrationId),
      ).size;
      return {
        id: requirement.id,
        staffRole: requirement.staffRole,
        quantity: Number(requirement.quantity),
        workDate: requirement.workDate,
        reportingTime: requirement.reportingTime,
        shiftDuration: Number(requirement.shiftDuration),
        experienceRequirement: requirement.experienceRequirement,
        genderPreference: requirement.genderPreference,
        filled,
        remaining: Math.max(0, Number(requirement.quantity) - filled),
      };
    }),
  };
}

export function buildQuotationDraft(booking: BookingDetail) {
  const lineItems = booking.requirements.map((requirement, index) => ({
    id: `draft-${requirement.id}`,
    requirementRef: requirement.id,
    label: `${requirement.staffRole} · ${requirement.workDate}`,
    quantity: requirement.quantity,
    days: 1,
    unitRate: Math.round(booking.budgetPerPerson || 0),
    amount: requirement.quantity * Math.round(booking.budgetPerPerson || 0),
    note: requirement.shiftDuration
      ? `${requirement.shiftDuration} hour shift`
      : "",
    position: index,
  }));

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const taxPercent = 18;
  const taxAmount = Math.round(subtotal * (taxPercent / 100));
  return {
    status: "draft",
    taxPercent,
    subtotal,
    taxAmount,
    total: subtotal + taxAmount,
    notes: "",
    validUntil: "",
    lineItems,
  };
}

export async function saveQuotation(
  bookingId: string,
  input: {
    lineItems: Array<{
      requirementRef?: number | null;
      label: string;
      quantity: number;
      days?: number;
      unitRate: number;
      note?: string;
    }>;
    taxPercent?: number;
    notes?: string;
    validUntil?: string;
    status?: string;
  },
  adminId: string,
) {
  const existing = await prisma.bookingRequest.findUnique({
    where: { id: bookingId },
    select: { id: true },
  });
  if (!existing) return null;

  const lineItems = input.lineItems
    .filter((item) => item.label?.trim())
    .map((item, index) => {
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
      const days = Math.max(1, Math.floor(Number(item.days) || 1));
      const unitRate = Math.max(0, Number(item.unitRate) || 0);
      return {
        requirementRef: item.requirementRef ?? null,
        label: String(item.label).trim().slice(0, 180),
        quantity,
        days,
        unitRate,
        amount: Math.round(quantity * days * unitRate),
        note: item.note ? String(item.note).trim().slice(0, 300) : null,
        position: index,
      };
    });

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const taxPercent = Math.min(50, Math.max(0, Number(input.taxPercent ?? 18)));
  const taxAmount = Math.round(subtotal * (taxPercent / 100));
  const total = subtotal + taxAmount;
  const status = (QUOTATION_STATUSES as readonly string[]).includes(
    String(input.status),
  )
    ? String(input.status)
    : "draft";

  return prisma.$transaction(async (tx) => {
    const quotation = await tx.quotation.upsert({
      where: { bookingId },
      create: {
        bookingId,
        status,
        taxPercent,
        subtotal,
        taxAmount,
        total,
        notes: input.notes?.trim().slice(0, 2000) || null,
        validUntil: input.validUntil?.trim() || null,
        createdBy: adminId,
      },
      update: {
        status,
        taxPercent,
        subtotal,
        taxAmount,
        total,
        notes: input.notes?.trim().slice(0, 2000) || null,
        validUntil: input.validUntil?.trim() || null,
      },
    });

    await tx.quotationLineItem.deleteMany({ where: { quotationId: quotation.id } });
    if (lineItems.length) {
      await tx.quotationLineItem.createMany({
        data: lineItems.map((item) => ({
          ...item,
          quotationId: quotation.id,
        })),
      });
    }

    return tx.quotation.findUnique({
      where: { id: quotation.id },
      include: { lineItems: { orderBy: { position: "asc" } } },
    });
  });
}

export async function markQuotationStatus(
  bookingId: string,
  status: string,
) {
  if (!(QUOTATION_STATUSES as readonly string[]).includes(status)) return null;
  return prisma.quotation.update({
    where: { bookingId },
    data: { status },
    include: { lineItems: { orderBy: { position: "asc" } } },
  });
}
