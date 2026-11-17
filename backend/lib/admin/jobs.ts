import { prisma } from "@/lib/prisma";
import { createAssignment } from "./assignments";
import { updateApplicationStatus } from "@/lib/jobs/db";

export type JobListFilters = {
  q?: string;
  status?: string;
  city?: string;
  role?: string;
};

function mapJob(row: any) {
  return {
    id: row.id,
    status: row.status,
    eventType: row.eventType,
    jobRole: row.jobRole,
    city: row.eventCity,
    eventDate: row.eventDate,
    endDate: row.endDate || "",
    dutyStartTime: row.dutyStartTime || "",
    dutyEndTime: row.dutyEndTime || "",
    dutyHours:
      row.dutyHours === null || row.dutyHours === undefined
        ? null
        : Number(row.dutyHours),
    paymentMin:
      row.paymentMin === null || row.paymentMin === undefined
        ? null
        : Number(row.paymentMin),
    paymentMax:
      row.paymentMax === null || row.paymentMax === undefined
        ? null
        : Number(row.paymentMax),
    openings: Number(row.openings),
    experienceRequired: row.experienceRequired,
    summary: row.summary || "",
    bookingRef: row.bookingRef || "",
    requirementRef:
      row.requirementRef === null || row.requirementRef === undefined
        ? null
        : Number(row.requirementRef),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    publishedAt: row.publishedAt || "",
    applicationCount: row.applicationCount ?? 0,
    submittedCount: row.submittedCount ?? 0,
    shortlistedCount: row.shortlistedCount ?? 0,
    selectedCount: row.selectedCount ?? 0,
    remaining: Math.max(0, Number(row.openings) - (row.selectedCount ?? 0)),
  };
}

export async function listAdminJobs(filters: JobListFilters = {}) {
  const and: any[] = [];

  if (filters.status && filters.status !== "all") {
    and.push({ status: filters.status });
  }
  if (filters.city && filters.city !== "all") {
    and.push({ eventCity: { contains: filters.city, mode: "insensitive" } });
  }
  if (filters.role && filters.role !== "all") {
    and.push({ jobRole: { contains: filters.role, mode: "insensitive" } });
  }
  if (filters.q) {
    const q = filters.q.trim();
    and.push({
      OR: [
        { id: { contains: q, mode: "insensitive" } },
        { jobRole: { contains: q, mode: "insensitive" } },
        { eventCity: { contains: q, mode: "insensitive" } },
        { eventType: { contains: q, mode: "insensitive" } },
        { bookingRef: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  const rows = await prisma.jobListing.findMany({
    where: and.length ? { AND: and } : undefined,
    orderBy: [{ eventDate: "desc" }, { createdAt: "desc" }],
    include: {
      applications: {
        select: { status: true },
      },
    },
  });

  return rows.map((row) =>
    mapJob({
      ...row,
      applicationCount: row.applications.length,
      submittedCount: row.applications.filter((a) => a.status === "submitted").length,
      shortlistedCount: row.applications.filter((a) => a.status === "shortlisted").length,
      selectedCount: row.applications.filter((a) => a.status === "selected").length,
    }),
  );
}

export async function getJobFacets() {
  const rows = await prisma.jobListing.findMany({
    select: { eventCity: true, jobRole: true },
  });
  return {
    cities: [...new Set(rows.map((row) => row.eventCity).filter(Boolean))].sort(),
    roles: [...new Set(rows.map((row) => row.jobRole).filter(Boolean))].sort(),
  };
}

export async function getAdminJobDetail(listingId: string) {
  if (!listingId) return null;

  const row = await prisma.jobListing.findUnique({
    where: { id: listingId },
    include: {
      applications: {
        orderBy: { createdAt: "asc" },
        include: {
          events: { orderBy: { id: "asc" } },
        },
      },
    },
  });

  if (!row) return null;

  const staffIds = [...new Set(row.applications.map((app) => app.registrationId))];
  const staff = staffIds.length
    ? await prisma.staffRegistration.findMany({
        where: { id: { in: staffIds } },
        select: {
          id: true,
          fullName: true,
          mobileNumber: true,
          currentCity: true,
          experienceLevel: true,
          yearsExperience: true,
          status: true,
          skills: true,
          expectedPayment: true,
        },
      })
    : [];
  const staffById = new Map(staff.map((profile) => [profile.id, profile]));

  const assignments = await prisma.eventAssignment.findMany({
    where: { listingId },
    select: {
      id: true,
      registrationId: true,
      status: true,
      workDate: true,
      attendanceStatus: true,
    },
  });
  const assignmentByApplication = new Map<string, any>();
  for (const application of row.applications) {
    const match = assignments.find(
      (assignment) => assignment.registrationId === application.registrationId,
    );
    if (match) assignmentByApplication.set(application.id, match);
  }

  const booking = row.bookingRef
    ? await prisma.bookingRequest.findUnique({
        where: { id: row.bookingRef },
        select: {
          id: true,
          eventName: true,
          eventCity: true,
          eventStartDate: true,
          eventEndDate: true,
          status: true,
        },
      })
    : null;

  return {
    ...mapJob({
      ...row,
      applicationCount: row.applications.length,
      submittedCount: row.applications.filter((a) => a.status === "submitted").length,
      shortlistedCount: row.applications.filter((a) => a.status === "shortlisted").length,
      selectedCount: row.applications.filter((a) => a.status === "selected").length,
    }),
    booking,
    applications: row.applications.map((application) => {
      const applicant = staffById.get(application.registrationId);
      const assignment = assignmentByApplication.get(application.id);
      return {
        id: application.id,
        registrationId: application.registrationId,
        status: application.status,
        note: application.note || "",
        createdAt: application.createdAt,
        updatedAt: application.updatedAt,
        applicant: {
          fullName: applicant?.fullName || "Registration not found",
          mobileNumber: applicant?.mobileNumber || "",
          currentCity: applicant?.currentCity || "",
          experienceLevel: applicant?.experienceLevel || "",
          yearsExperience: Number(applicant?.yearsExperience || 0),
          status: applicant?.status || "",
          expectedPayment: Number(applicant?.expectedPayment || 0),
          skills: applicant?.skills || "[]",
        },
        events: application.events.map((event) => ({
          status: event.status,
          note: event.note || "",
          createdAt: event.createdAt,
        })),
        assignment: assignment
          ? {
              id: assignment.id,
              status: assignment.status,
              workDate: assignment.workDate,
              attendanceStatus: assignment.attendanceStatus,
            }
          : null,
      };
    }),
  };
}

export type AdminJobDetail = NonNullable<Awaited<ReturnType<typeof getAdminJobDetail>>>;

export async function allocateJobApplication(
  applicationId: string,
  adminId: string,
  note = "",
) {
  const application = await prisma.jobApplication.findUnique({
    where: { id: applicationId },
    include: { listing: true },
  });
  if (!application) {
    return { ok: false as const, reason: "not_found" as const, message: "Application not found." };
  }

  if (application.status === "selected") {
    return {
      ok: false as const,
      reason: "already_selected" as const,
      message: "This candidate is already selected.",
    };
  }

  const listing = application.listing;

  // Without a linked booking there is no event roster to attach an assignment
  // to. The application can still be confirmed on the listing.
  if (!listing.bookingRef) {
    const updated = await updateApplicationStatus(
      applicationId,
      "selected",
      note || "Selected through the admin job board. Link a booking to create an on-ground assignment.",
    );
    return {
      ok: true as const,
      warning:
        "Candidate selected. No booking is linked to this listing, so no event assignment was created.",
      application: updated,
    };
  }

  const result = await createAssignment(
    {
      bookingId: listing.bookingRef,
      requirementRef: listing.requirementRef ?? null,
      registrationId: application.registrationId,
      workDate: listing.eventDate,
      role: listing.jobRole,
      city: listing.eventCity,
      shiftStart: listing.dutyStartTime || null,
      shiftEnd: listing.dutyEndTime || null,
      payRate: listing.paymentMin ?? null,
      status: "confirmed",
      listingId: listing.id,
      applicationId: application.id,
      notes: `Allocated from job ${listing.id}.`,
    },
    adminId,
  );

  if (!result.ok) {
    return {
      ok: false as const,
      reason: result.conflict.code,
      message: result.conflict.message,
      assignmentId: result.conflict.assignmentId,
    };
  }

  const updated = await updateApplicationStatus(
    applicationId,
    "selected",
    note || "Allocated and confirmed from the admin job board.",
  );

  return {
    ok: true as const,
    assignment: result.assignment,
    application: updated,
  };
}
