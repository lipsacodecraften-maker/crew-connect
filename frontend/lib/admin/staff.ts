import { prisma } from "@/lib/prisma";
import {
  ACTIVE_ASSIGNMENT_STATUSES,
  STAFF_REVIEW_LABELS,
} from "./constants";
import { parseStringArray, toNumberOrNull, todayIso } from "./format";

export type StaffListFilters = {
  q?: string;
  city?: string;
  skill?: string;
  experience?: string;
  availability?: string;
  status?: string;
};

function mapStaffRow(row: any) {
  const skills = parseStringArray(row.skills);
  const preferredCities = parseStringArray(row.preferredCities);
  const shiftTypes = parseStringArray(row.shiftTypes);
  const assignments = row.assignments || [];
  const activeAssignments = assignments.filter((assignment: any) =>
    (ACTIVE_ASSIGNMENT_STATUSES as readonly string[]).includes(assignment.status),
  );
  const completed = assignments.filter(
    (assignment: any) => assignment.status === "completed",
  ).length;

  return {
    id: row.id,
    status: row.status,
    statusLabel: STAFF_REVIEW_LABELS[row.status] || row.status,
    fullName: row.fullName,
    mobileNumber: row.mobileNumber,
    emailAddress: row.emailAddress,
    currentCity: row.currentCity,
    areaPincode: row.areaPincode,
    age: row.age,
    experienceLevel: row.experienceLevel,
    yearsExperience: Number(row.yearsExperience),
    expectedPayment: Number(row.expectedPayment),
    skills,
    preferredCities,
    shiftTypes,
    availableFrom: row.availableFrom,
    availableUntil: row.availableUntil,
    willingToTravel: Boolean(row.willingToTravel),
    transportAvailable: Boolean(row.transportAvailable),
    whatsappVerified: Boolean(row.whatsappVerified),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    activeAssignments: activeAssignments.length,
    completedAssignments: completed,
    availabilityLabel: availabilityLabel(row.availableFrom, row.availableUntil),
  };
}

export function availabilityLabel(from?: string | null, until?: string | null) {
  const today = todayIso();
  if (from && from > today) return `From ${from}`;
  if (until && until < today) return `Unavailable since ${until}`;
  if (until) return `Available until ${until}`;
  if (from) return `Available from ${from}`;
  return "Available now";
}

export async function listStaff(filters: StaffListFilters = {}) {
  const and: any[] = [];
  const today = todayIso();

  if (filters.status && filters.status !== "all") {
    and.push({ status: filters.status });
  }
  if (filters.city && filters.city !== "all") {
    and.push({
      OR: [
        { currentCity: { contains: filters.city, mode: "insensitive" } },
        { preferredCities: { contains: filters.city, mode: "insensitive" } },
      ],
    });
  }
  if (filters.skill && filters.skill !== "all") {
    and.push({ skills: { contains: filters.skill, mode: "insensitive" } });
  }
  if (filters.experience && filters.experience !== "all") {
    if (filters.experience === "fresher") {
      and.push({ experienceLevel: "Fresher" });
    } else if (filters.experience === "experienced") {
      and.push({ experienceLevel: "Experienced" });
    } else if (filters.experience === "2plus") {
      and.push({ yearsExperience: { gte: 2 } });
    } else if (filters.experience === "5plus") {
      and.push({ yearsExperience: { gte: 5 } });
    }
  }
  if (filters.availability === "available_now") {
    and.push({ status: "approved" });
    and.push({ OR: [{ availableFrom: "" }, { availableFrom: { lte: today } }] });
    and.push({ OR: [{ availableUntil: "" }, { availableUntil: { gte: today } }] });
  } else if (filters.availability === "available_week") {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekIso = nextWeek.toISOString().slice(0, 10);
    and.push({ status: "approved" });
    and.push({ OR: [{ availableFrom: "" }, { availableFrom: { lte: nextWeekIso } }] });
    and.push({ OR: [{ availableUntil: "" }, { availableUntil: { gte: today } }] });
  }
  if (filters.q) {
    const q = filters.q.trim();
    and.push({
      OR: [
        { id: { contains: q, mode: "insensitive" } },
        { fullName: { contains: q, mode: "insensitive" } },
        { mobileNumber: { contains: q, mode: "insensitive" } },
        { emailAddress: { contains: q, mode: "insensitive" } },
        { currentCity: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  const rows = await prisma.staffRegistration.findMany({
    where: and.length ? { AND: and } : undefined,
    orderBy: [{ createdAt: "desc" }],
    include: {
      assignments: {
        select: { status: true, workDate: true },
      },
    },
  });

  return rows.map(mapStaffRow);
}

export async function getStaffFacets() {
  const [cities, rows] = await Promise.all([
    prisma.staffRegistration.findMany({
      distinct: ["currentCity"],
      select: { currentCity: true },
      orderBy: { currentCity: "asc" },
    }),
    prisma.staffRegistration.findMany({ select: { skills: true } }),
  ]);

  const skillSet = new Set<string>();
  for (const row of rows) {
    for (const skill of parseStringArray(row.skills)) skillSet.add(skill);
  }

  return {
    cities: cities.map((row) => row.currentCity).filter(Boolean),
    skills: [...skillSet].sort(),
  };
}

export async function getStaffDetail(registrationId: string) {
  if (!registrationId) return null;

  const row = await prisma.staffRegistration.findUnique({
    where: { id: registrationId },
    include: {
      documents: { orderBy: { id: "asc" } },
      statusEvents: { orderBy: { id: "asc" } },
      workHistory: { orderBy: [{ workDate: "desc" }, { createdAt: "desc" }] },
      assignments: {
        orderBy: [{ workDate: "desc" }, { createdAt: "desc" }],
        include: {
          booking: {
            select: {
              id: true,
              eventName: true,
              eventCity: true,
              eventType: true,
              status: true,
            },
          },
        },
      },
    },
  });

  if (!row) return null;

  const applications = await prisma.jobApplication.findMany({
    where: { registrationId },
    orderBy: { createdAt: "desc" },
    include: {
      listing: {
        select: {
          id: true,
          jobRole: true,
          eventCity: true,
          eventDate: true,
          status: true,
        },
      },
    },
  });

  const skills = parseStringArray(row.skills);
  const preferredCities = parseStringArray(row.preferredCities);
  const shiftTypes = parseStringArray(row.shiftTypes);
  const languages = parseStringArray(row.languages);

  return {
    id: row.id,
    status: row.status,
    statusLabel: STAFF_REVIEW_LABELS[row.status] || row.status,
    fullName: row.fullName,
    mobileNumber: row.mobileNumber,
    whatsappVerified: Boolean(row.whatsappVerified),
    emailAddress: row.emailAddress,
    dateOfBirth: row.dateOfBirth,
    age: row.age,
    currentCity: row.currentCity,
    areaPincode: row.areaPincode,
    languages,
    skills,
    otherSkill: row.otherSkill || "",
    experienceLevel: row.experienceLevel,
    yearsExperience: Number(row.yearsExperience),
    previousEvents: row.previousEvents || "",
    expectedPayment: Number(row.expectedPayment),
    preferredCities,
    availableFrom: row.availableFrom,
    availableUntil: row.availableUntil,
    shiftTypes,
    willingToTravel: Boolean(row.willingToTravel),
    transportAvailable: Boolean(row.transportAvailable),
    profilePhoto: {
      name: row.profilePhotoName,
      type: row.profilePhotoType,
      size: row.profilePhotoSize,
    },
    documentsConsent: Boolean(row.documentsConsent),
    privacyConsent: Boolean(row.privacyConsent),
    termsConsent: Boolean(row.termsConsent),
    ageConfirmed: Boolean(row.ageConfirmed),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    availabilityLabel: availabilityLabel(row.availableFrom, row.availableUntil),
    documents: row.documents.map((document) => ({
      id: document.id,
      kind: document.documentKind,
      type: document.documentType || "",
      name: document.fileName,
      fileType: document.fileType,
      size: document.fileSize,
      createdAt: document.createdAt,
    })),
    history: row.statusEvents.map((event) => ({
      status: event.status,
      statusLabel: STAFF_REVIEW_LABELS[event.status] || event.status,
      note: event.note || "",
      createdAt: event.createdAt,
    })),
    assignments: row.assignments.map((assignment) => ({
      id: assignment.id,
      bookingId: assignment.bookingId,
      bookingStatus: assignment.booking?.status || "",
      eventName: assignment.booking?.eventName || "Event removed",
      eventType: assignment.booking?.eventType || "",
      role: assignment.role,
      city: assignment.city,
      workDate: assignment.workDate,
      shiftStart: assignment.shiftStart || "",
      shiftEnd: assignment.shiftEnd || "",
      status: assignment.status,
      attendanceStatus: assignment.attendanceStatus,
      payRate: assignment.payRate === null ? null : Number(assignment.payRate),
      checkInAt: assignment.checkInAt,
      checkOutAt: assignment.checkOutAt,
      notes: assignment.notes || "",
      createdAt: assignment.createdAt,
    })),
    workHistory: row.workHistory.map((entry) => ({
      id: entry.id,
      eventName: entry.eventName,
      role: entry.role,
      city: entry.city,
      workDate: entry.workDate,
      shiftHours:
        entry.shiftHours === null || entry.shiftHours === undefined
          ? null
          : Number(entry.shiftHours),
      payRate:
        entry.payRate === null || entry.payRate === undefined
          ? null
          : Number(entry.payRate),
      rating: entry.rating,
      notes: entry.notes || "",
      source: entry.source,
      createdAt: entry.createdAt,
    })),
    applications: applications.map((application) => ({
      id: application.id,
      status: application.status,
      createdAt: application.createdAt,
      jobRole: application.listing?.jobRole || "Listing removed",
      city: application.listing?.eventCity || "",
      eventDate: application.listing?.eventDate || "",
      listingId: application.listing?.id || "",
      listingStatus: application.listing?.status || "",
    })),
    stats: {
      activeAssignments: row.assignments.filter((assignment) =>
        (ACTIVE_ASSIGNMENT_STATUSES as readonly string[]).includes(
          assignment.status,
        ),
      ).length,
      completedAssignments: row.assignments.filter(
        (assignment) => assignment.status === "completed",
      ).length,
      totalAssignments: row.assignments.length,
      applications: applications.length,
    },
  };
}

export type StaffDetail = NonNullable<Awaited<ReturnType<typeof getStaffDetail>>>;

export type WorkHistoryInput = {
  eventName?: string;
  role?: string;
  city?: string;
  workDate?: string;
  shiftHours?: number | string | null;
  payRate?: number | string | null;
  rating?: number | string | null;
  notes?: string;
};

/**
 * Adds an offline work-history entry. Assignment-sourced entries are managed
 * automatically when an assignment is completed, so this is for past events
 * the crew worked outside the platform.
 */
export async function addWorkHistory(
  registrationId: string,
  input: WorkHistoryInput,
) {
  const registration = await prisma.staffRegistration.findUnique({
    where: { id: String(registrationId || "").trim().toUpperCase() },
    select: { id: true },
  });
  if (!registration) {
    return { ok: false as const, error: "Staff registration not found.", status: 404 };
  }

  const eventName = String(input.eventName || "").trim().slice(0, 160);
  const role = String(input.role || "").trim().slice(0, 120);
  const city = String(input.city || "").trim().slice(0, 80);
  const workDate = String(input.workDate || "").trim();

  if (!eventName || !role || !city) {
    return {
      ok: false as const,
      error: "Event name, role and city are required.",
      status: 400,
    };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(workDate)) {
    return { ok: false as const, error: "A valid work date is required.", status: 400 };
  }

  const hours = toNumberOrNull(input.shiftHours);
  if (hours !== null && (hours < 0 || hours > 24)) {
    return { ok: false as const, error: "Shift hours must be between 0 and 24.", status: 400 };
  }
  const payRate = toNumberOrNull(input.payRate);
  if (payRate !== null && payRate < 0) {
    return { ok: false as const, error: "Pay rate cannot be negative.", status: 400 };
  }
  const rating = toNumberOrNull(input.rating);
  if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
    return {
      ok: false as const,
      error: "Rating must be a whole number from 1 to 5.",
      status: 400,
    };
  }

  const entry = await prisma.staffWorkHistory.create({
    data: {
      registrationId: registration.id,
      eventName,
      role,
      city,
      workDate,
      shiftHours: hours,
      payRate,
      rating: rating === null ? null : Number(rating),
      notes: String(input.notes || "").trim().slice(0, 400) || null,
      source: "manual",
    },
  });

  return { ok: true as const, entry };
}

export async function deleteWorkHistory(
  registrationId: string,
  entryId: string,
) {
  const entry = await prisma.staffWorkHistory.findFirst({
    where: {
      id: entryId,
      registrationId: String(registrationId || "").trim().toUpperCase(),
    },
    select: { id: true, eventName: true, source: true, assignmentId: true },
  });
  if (!entry) {
    return { ok: false as const, error: "Work-history entry not found.", status: 404 };
  }
  if (entry.source === "assignment") {
    return {
      ok: false as const,
      error:
        "This entry came from a completed assignment. Change the assignment status instead.",
      status: 409,
    };
  }

  await prisma.staffWorkHistory.delete({ where: { id: entry.id } });
  return { ok: true as const, entry };
}

export async function getApprovedStaffForMatching() {
  return prisma.staffRegistration.findMany({
    where: { status: "approved" },
    select: {
      id: true,
      fullName: true,
      mobileNumber: true,
      currentCity: true,
      preferredCities: true,
      skills: true,
      otherSkill: true,
      experienceLevel: true,
      yearsExperience: true,
      expectedPayment: true,
      availableFrom: true,
      availableUntil: true,
      shiftTypes: true,
      willingToTravel: true,
      transportAvailable: true,
      languages: true,
    },
  });
}
