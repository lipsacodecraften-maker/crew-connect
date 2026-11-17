import { prisma } from "@/lib/prisma";
import {
  ACTIVE_ASSIGNMENT_STATUSES,
  ASSIGNMENT_STATUS_LABELS,
  isAssignmentStatus,
} from "./constants";
import { shiftHours, shiftMinutes } from "./format";

export type AssignmentConflict = {
  code:
    | "not_found"
    | "not_approved"
    | "unavailable"
    | "duplicate"
    | "overlap"
    | "filled"
    | "booking_closed"
    | "invalid";
  message: string;
  assignmentId?: string;
};

export function addHoursToClock(start: string, hours: number) {
  if (!/^\d{2}:\d{2}$/.test(start) || !Number.isFinite(hours) || hours <= 0) {
    return null;
  }
  const [hour, minute] = start.split(":").map(Number);
  const total = (hour * 60 + minute + Math.round(hours * 60)) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(
    total % 60,
  ).padStart(2, "0")}`;
}

export async function checkAssignmentConflicts(input: {
  registrationId: string;
  bookingId?: string | null;
  requirementRef?: number | null;
  workDate: string;
  shiftStart?: string | null;
  shiftEnd?: string | null;
  excludeAssignmentId?: string;
}): Promise<{ ok: true; staff: any; requirement: any } | { ok: false; conflict: AssignmentConflict }> {
  const staff = await prisma.staffRegistration.findUnique({
    where: { id: String(input.registrationId || "").trim().toUpperCase() },
    select: {
      id: true,
      fullName: true,
      status: true,
      currentCity: true,
      availableFrom: true,
      availableUntil: true,
      shiftTypes: true,
    },
  });

  if (!staff) {
    return {
      ok: false,
      conflict: { code: "not_found", message: "Staff registration was not found." },
    };
  }

  if (staff.status !== "approved") {
    return {
      ok: false,
      conflict: {
        code: "not_approved",
        message: `${staff.fullName} is not approved yet (${staff.status}). Approve the profile before assigning work.`,
      },
    };
  }

  if (staff.availableFrom && input.workDate < staff.availableFrom) {
    return {
      ok: false,
      conflict: {
        code: "unavailable",
        message: `${staff.fullName} is not available until ${staff.availableFrom}.`,
      },
    };
  }
  if (staff.availableUntil && input.workDate > staff.availableUntil) {
    return {
      ok: false,
      conflict: {
        code: "unavailable",
        message: `${staff.fullName} is only available until ${staff.availableUntil}.`,
      },
    };
  }

  let requirement: any = null;
  if (input.bookingId) {
    const booking = await prisma.bookingRequest.findUnique({
      where: { id: input.bookingId },
      select: {
        id: true,
        status: true,
        staffingRequirements: input.requirementRef
          ? { where: { id: input.requirementRef } }
          : false,
      },
    });

    if (!booking) {
      return {
        ok: false,
        conflict: { code: "not_found", message: "Booking request was not found." },
      };
    }
    if (["cancelled", "completed"].includes(booking.status)) {
      return {
        ok: false,
        conflict: {
          code: "booking_closed",
          message: "This booking is closed for new assignments.",
        },
      };
    }
    requirement = booking.staffingRequirements?.[0] || null;

    if (input.requirementRef && !requirement) {
      return {
        ok: false,
        conflict: {
          code: "not_found",
          message: "The selected staffing requirement no longer exists.",
        },
      };
    }

    if (requirement) {
      const duplicate = await prisma.eventAssignment.findFirst({
        where: {
          bookingId: input.bookingId,
          requirementRef: requirement.id,
          registrationId: staff.id,
          status: { in: [...ACTIVE_ASSIGNMENT_STATUSES] },
          ...(input.excludeAssignmentId
            ? { id: { not: input.excludeAssignmentId } }
            : {}),
        },
        select: { id: true, workDate: true },
      });
      if (duplicate) {
        return {
          ok: false,
          conflict: {
            code: "duplicate",
            assignmentId: duplicate.id,
            message: `${staff.fullName} is already assigned to this requirement on ${duplicate.workDate}.`,
          },
        };
      }

      const filled = await prisma.eventAssignment.count({
        where: {
          bookingId: input.bookingId,
          requirementRef: requirement.id,
          status: { in: [...ACTIVE_ASSIGNMENT_STATUSES] },
          ...(input.excludeAssignmentId
            ? { id: { not: input.excludeAssignmentId } }
            : {}),
        },
      });
      if (filled >= Number(requirement.quantity)) {
        return {
          ok: false,
          conflict: {
            code: "filled",
            message: `This requirement already has ${filled}/${requirement.quantity} crew assigned.`,
          },
        };
      }
    }
  }

  const sameDay = await prisma.eventAssignment.findMany({
    where: {
      registrationId: staff.id,
      workDate: input.workDate,
      status: { in: [...ACTIVE_ASSIGNMENT_STATUSES] },
      ...(input.excludeAssignmentId
        ? { id: { not: input.excludeAssignmentId } }
        : {}),
    },
    select: {
      id: true,
      role: true,
      shiftStart: true,
      shiftEnd: true,
      bookingId: true,
    },
  });

  const requestedRange =
    input.shiftStart && input.shiftEnd
      ? shiftMinutes(input.shiftStart, input.shiftEnd)
      : null;

  for (const existing of sameDay) {
    const existingRange =
      existing.shiftStart && existing.shiftEnd
        ? shiftMinutes(existing.shiftStart, existing.shiftEnd)
        : null;

    const overlaps =
      !requestedRange || !existingRange
        ? true
        : requestedRange.start < existingRange.end &&
          requestedRange.end > existingRange.start;

    if (overlaps) {
      return {
        ok: false,
        conflict: {
          code: "overlap",
          assignmentId: existing.id,
          message: `${staff.fullName} already has a ${
            existing.role
          } assignment on ${input.workDate}${
            existing.shiftStart && existing.shiftEnd
              ? ` (${existing.shiftStart}–${existing.shiftEnd})`
              : ""
          }. Resolve the scheduling conflict first.`,
        },
      };
    }
  }

  return { ok: true, staff, requirement };
}

export async function createAssignment(
  input: {
    bookingId: string;
    requirementRef?: number | null;
    registrationId: string;
    shiftStart?: string | null;
    shiftEnd?: string | null;
    payRate?: number | null;
    notes?: string | null;
    status?: string;
    workDate?: string;
    role?: string;
    city?: string;
    listingId?: string | null;
    applicationId?: string | null;
  },
  adminId: string,
) {
  const fullBooking = await prisma.bookingRequest.findUnique({
    where: { id: input.bookingId },
    select: {
      id: true,
      eventCity: true,
      staffingRequirements: input.requirementRef
        ? { where: { id: input.requirementRef } }
        : false,
    },
  });

  if (!fullBooking) {
    return {
      ok: false as const,
      conflict: { code: "not_found" as const, message: "Booking request was not found." },
    };
  }

  const requirement =
    input.requirementRef && fullBooking.staffingRequirements
      ? fullBooking.staffingRequirements[0]
      : null;

  if (input.requirementRef && !requirement) {
    return {
      ok: false as const,
      conflict: {
        code: "not_found" as const,
        message: "The selected staffing requirement was not found.",
      },
    };
  }

  const role = requirement?.staffRole || input.role || "Event crew";
  const workDate = requirement?.workDate || input.workDate || "";
  const shiftStart = input.shiftStart || requirement?.reportingTime || null;
  const shiftEnd =
    input.shiftEnd ||
    (requirement?.reportingTime && Number(requirement.shiftDuration) > 0
      ? addHoursToClock(requirement.reportingTime, Number(requirement.shiftDuration))
      : null);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(workDate)) {
    return {
      ok: false as const,
      conflict: {
        code: "invalid" as const,
        message: "A valid work date is required before assigning staff.",
      },
    };
  }

  const conflictCheck = await checkAssignmentConflicts({
    registrationId: input.registrationId,
    bookingId: input.bookingId,
    requirementRef: input.requirementRef ?? null,
    workDate,
    shiftStart,
    shiftEnd,
  });

  if (!conflictCheck.ok) {
    return { ok: false as const, conflict: conflictCheck.conflict };
  }

  const status = isAssignmentStatus(input.status) ? input.status : "confirmed";
  const assignment = await prisma.eventAssignment.create({
    data: {
      bookingId: input.bookingId,
      requirementRef: input.requirementRef ?? null,
      listingId: input.listingId || null,
      applicationId: input.applicationId || null,
      registrationId: conflictCheck.staff.id,
      role,
      city: input.city || fullBooking.eventCity,
      workDate,
      shiftStart,
      shiftEnd,
      status,
      payRate:
        input.payRate === null || input.payRate === undefined
          ? null
          : Math.max(0, Number(input.payRate)),
      notes: input.notes?.trim().slice(0, 500) || null,
      createdBy: adminId,
    },
    include: {
      registration: {
        select: { id: true, fullName: true, currentCity: true, mobileNumber: true },
      },
    },
  });

  return { ok: true as const, assignment, staff: conflictCheck.staff };
}

export async function updateAssignment(
  assignmentId: string,
  patch: {
    status?: string;
    attendanceStatus?: string;
    payRate?: number | null;
    notes?: string;
    attendanceNotes?: string;
  },
) {
  const existing = await prisma.eventAssignment.findUnique({
    where: { id: assignmentId },
    include: {
      booking: { select: { id: true, eventName: true, eventCity: true } },
      registration: { select: { id: true, fullName: true } },
    },
  });
  if (!existing) return null;

  const data: any = {};
  const now = new Date();

  if (patch.status !== undefined) {
    if (!isAssignmentStatus(patch.status)) {
      return { error: "invalid_status" as const };
    }
    data.status = patch.status;

    if (patch.status === "checked_in") {
      data.attendanceStatus = "checked_in";
      data.checkInAt = existing.checkInAt || now;
    }
    if (patch.status === "completed") {
      data.attendanceStatus = "checked_out";
      data.checkInAt = existing.checkInAt || now;
      data.checkOutAt = existing.checkOutAt || now;
      data.completedAt = existing.completedAt || now;
    }
    if (patch.status === "cancelled" || patch.status === "no_show") {
      data.completedAt = null;
    }
  }

  if (patch.attendanceStatus !== undefined) {
    data.attendanceStatus = patch.attendanceStatus;
    if (patch.attendanceStatus === "checked_in") {
      data.checkInAt = existing.checkInAt || now;
      if (existing.status !== "cancelled" && existing.status !== "no_show") {
        data.status = "checked_in";
      }
    }
    if (patch.attendanceStatus === "checked_out") {
      data.checkOutAt = existing.checkOutAt || now;
      data.completedAt = existing.completedAt || now;
      if (existing.status !== "cancelled" && existing.status !== "no_show") {
        data.status = "completed";
      }
    }
    if (patch.attendanceStatus === "absent") {
      data.status = "no_show";
    }
  }

  if (patch.payRate !== undefined) {
    data.payRate =
      patch.payRate === null ? null : Math.max(0, Number(patch.payRate));
  }
  if (patch.notes !== undefined) {
    data.notes = patch.notes.trim().slice(0, 500) || null;
  }
  if (patch.attendanceNotes !== undefined) {
    data.attendanceNotes = patch.attendanceNotes.trim().slice(0, 500) || null;
  }

  const updated = await prisma.eventAssignment.update({
    where: { id: assignmentId },
    data,
    include: {
      booking: { select: { id: true, eventName: true, eventCity: true } },
      registration: { select: { id: true, fullName: true } },
    },
  });

  // A completed assignment becomes an immutable work-history entry.
  if (updated.status === "completed") {
    await prisma.staffWorkHistory.upsert({
      where: { assignmentId: updated.id },
      create: {
        registrationId: updated.registrationId,
        assignmentId: updated.id,
        eventName: updated.booking.eventName,
        role: updated.role,
        city: updated.city,
        workDate: updated.workDate,
        shiftHours: shiftHours(updated.shiftStart, updated.shiftEnd),
        payRate: updated.payRate === null ? null : Number(updated.payRate),
        notes: updated.notes || null,
        source: "assignment",
      },
      update: {
        eventName: updated.booking.eventName,
        role: updated.role,
        city: updated.city,
        workDate: updated.workDate,
        shiftHours: shiftHours(updated.shiftStart, updated.shiftEnd),
        payRate: updated.payRate === null ? null : Number(updated.payRate),
        notes: updated.notes || null,
      },
    });
  } else {
    await prisma.staffWorkHistory.deleteMany({ where: { assignmentId: updated.id } });
  }

  return { assignment: updated };
}

export async function getAssignmentDetail(assignmentId: string) {
  return prisma.eventAssignment.findUnique({
    where: { id: assignmentId },
    include: {
      booking: { select: { id: true, eventName: true, eventCity: true } },
      registration: {
        select: {
          id: true,
          fullName: true,
          mobileNumber: true,
          currentCity: true,
        },
      },
    },
  });
}

export async function listUpcomingAssignments(limit = 20) {
  const today = new Date().toISOString().slice(0, 10);
  return prisma.eventAssignment.findMany({
    where: {
      workDate: { gte: today },
      status: { in: [...ACTIVE_ASSIGNMENT_STATUSES] },
    },
    orderBy: [{ workDate: "asc" }, { createdAt: "asc" }],
    take: limit,
    include: {
      booking: { select: { id: true, eventName: true, eventCity: true } },
      registration: { select: { id: true, fullName: true } },
    },
  });
}

export function assignmentStatusLabel(status: string) {
  return ASSIGNMENT_STATUS_LABELS[status] || status;
}
