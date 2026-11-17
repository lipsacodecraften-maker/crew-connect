import { prisma } from "@/lib/prisma";
import { listRecentAudit } from "./db";
import { ACTIVE_ASSIGNMENT_STATUSES } from "./constants";
import { todayIso } from "./format";

export async function getDashboardOverview() {
  const today = todayIso();

  const [
    totalStaff,
    pendingStaff,
    onHoldStaff,
    approvedStaff,
    totalRequests,
    upcomingEvents,
    availableStaff,
    assignedGroups,
    openApplications,
    openJobs,
    draftQuotations,
    allRequests,
    staffStatusGroups,
    recentRequests,
    upcomingRows,
    recentApplications,
    audit,
  ] = await Promise.all([
    prisma.staffRegistration.count(),
    prisma.staffRegistration.count({
      where: { status: { in: ["pending_review", "under_verification"] } },
    }),
    prisma.staffRegistration.count({ where: { status: "on_hold" } }),
    prisma.staffRegistration.count({ where: { status: "approved" } }),
    prisma.bookingRequest.count(),
    prisma.bookingRequest.count({
      where: {
        eventStartDate: { gte: today },
        status: { notIn: ["cancelled", "completed"] },
      },
    }),
    prisma.staffRegistration.count({
      where: {
        status: "approved",
        AND: [
          {
            OR: [
              { availableFrom: "" },
              { availableFrom: { lte: today } },
            ],
          },
          {
            OR: [
              { availableUntil: "" },
              { availableUntil: { gte: today } },
            ],
          },
        ],
      },
    }),
    prisma.eventAssignment.groupBy({
      by: ["registrationId"],
      where: {
        workDate: { gte: today },
        status: { in: [...ACTIVE_ASSIGNMENT_STATUSES] },
      },
    }),
    prisma.jobApplication.count({
      where: { status: { in: ["submitted", "shortlisted"] } },
    }),
    prisma.jobListing.count({
      where: { status: "open", eventDate: { gte: today } },
    }),
    prisma.quotation.count({ where: { status: { in: ["draft", "sent"] } } }),
    prisma.bookingRequest.findMany({
      select: { status: true, eventStartDate: true, totalStaff: true },
    }),
    prisma.staffRegistration.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.bookingRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        status: true,
        clientCompanyName: true,
        eventName: true,
        eventCity: true,
        eventType: true,
        eventStartDate: true,
        eventEndDate: true,
        totalStaff: true,
        createdAt: true,
        urgent: true,
      },
    }),
    prisma.bookingRequest.findMany({
      where: {
        eventStartDate: { gte: today },
        status: { notIn: ["cancelled", "completed"] },
      },
      orderBy: { eventStartDate: "asc" },
      take: 6,
      select: {
        id: true,
        eventName: true,
        eventType: true,
        eventCity: true,
        eventStartDate: true,
        totalStaff: true,
        status: true,
        staffingRequirements: {
          select: { id: true, quantity: true, staffRole: true },
        },
        assignments: {
          where: { status: { in: [...ACTIVE_ASSIGNMENT_STATUSES] } },
          select: { id: true, registrationId: true },
        },
      },
    }),
    prisma.jobApplication.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        listing: {
          select: {
            jobRole: true,
            eventCity: true,
            eventDate: true,
            status: true,
          },
        },
      },
    }),
    listRecentAudit(10),
  ]);

  const staffIds = [
    ...new Set(recentApplications.map((row) => row.registrationId)),
  ];
  const staffProfiles = staffIds.length
    ? await prisma.staffRegistration.findMany({
        where: { id: { in: staffIds } },
        select: { id: true, fullName: true, currentCity: true, status: true },
      })
    : [];
  const staffById = new Map(staffProfiles.map((row) => [row.id, row]));

  const bookingPipeline = ["received", "under_review", "staffing", "confirmed", "completed", "cancelled"].map(
    (status) => ({
      status,
      count: allRequests.filter((row) => row.status === status).length,
    }),
  );

  const staffPipeline = ["pending_review", "under_verification", "approved", "on_hold", "rejected"].map(
    (status) => ({
      status,
      count:
        staffStatusGroups.find((row) => row.status === status)?._count._all ?? 0,
    }),
  );

  return {
    metrics: {
      totalStaff,
      pendingStaff,
      onHoldStaff,
      approvedStaff,
      totalRequests,
      upcomingEvents,
      availableStaff,
      assignedStaff: assignedGroups.length,
      openApplications,
      openJobs,
      draftQuotations,
    },
    bookingPipeline,
    staffPipeline,
    recentRequests,
    upcomingEvents: upcomingRows.map((row) => {
      const requested = row.staffingRequirements.reduce(
        (sum, requirement) => sum + Number(requirement.quantity),
        0,
      );
      const assigned = new Set(row.assignments.map((a) => a.registrationId)).size;
      return {
        ...row,
        requested,
        assigned,
        fillPercent: requested ? Math.round((assigned / requested) * 100) : 0,
      };
    }),
    recentApplications: recentApplications.map((row) => ({
      id: row.id,
      status: row.status,
      createdAt: row.createdAt,
      jobRole: row.listing?.jobRole || "Role removed",
      city: row.listing?.eventCity || "",
      eventDate: row.listing?.eventDate || "",
      listingStatus: row.listing?.status || "",
      registrationId: row.registrationId,
      staffName: staffById.get(row.registrationId)?.fullName || "Unknown staff",
      staffCity: staffById.get(row.registrationId)?.currentCity || "",
    })),
    audit,
  };
}

export async function getSidebarCounts() {
  const today = todayIso();
  const [pendingStaff, upcomingEvents, openApplications, openJobs] =
    await Promise.all([
      prisma.staffRegistration.count({
        where: { status: { in: ["pending_review", "under_verification"] } },
      }),
      prisma.bookingRequest.count({
        where: {
          eventStartDate: { gte: today },
          status: { notIn: ["cancelled", "completed"] },
        },
      }),
      prisma.jobApplication.count({
        where: { status: "submitted" },
      }),
      prisma.jobListing.count({
        where: { status: "open", eventDate: { gte: today } },
      }),
    ]);

  return { pendingStaff, upcomingEvents, openApplications, openJobs };
}
