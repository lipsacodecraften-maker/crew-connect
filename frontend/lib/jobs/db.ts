import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { normalizePhoneNumber } from "../staff/config";
import { todayIso } from "./config";

function monthStamp(date = new Date()) {
  return `${String(date.getFullYear()).slice(2)}${String(date.getMonth() + 1).padStart(2, "0")}`;
}

async function createPublicId(prefix: string, table: "jobListing" | "jobApplication", bytes: number) {
  const stamp = monthStamp();
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const suffix = randomBytes(bytes).toString("hex").toUpperCase();
    const candidate = `${prefix}-${stamp}-${suffix}`;
    const existing =
      table === "jobListing"
        ? await prisma.jobListing.findUnique({ where: { id: candidate }, select: { id: true } })
        : await prisma.jobApplication.findUnique({ where: { id: candidate }, select: { id: true } });
    if (!existing) return candidate;
  }
  return `${prefix}-${stamp}-${randomBytes(bytes + 2).toString("hex").toUpperCase()}`;
}

function mapListing(row: any) {
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
    dutyHours: row.dutyHours === null || row.dutyHours === undefined ? null : Number(row.dutyHours),
    paymentMin: row.paymentMin === null || row.paymentMin === undefined ? null : Number(row.paymentMin),
    paymentMax: row.paymentMax === null || row.paymentMax === undefined ? null : Number(row.paymentMax),
    openings: Number(row.openings),
    experienceRequired: row.experienceRequired,
    summary: row.summary || "",
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    publishedAt: row.publishedAt || "",
    bookingRef: row.bookingRef || "",
    requirementRef:
      row.requirementRef === null || row.requirementRef === undefined ? null : Number(row.requirementRef),
    applicationCount: row.applicationCount === undefined ? undefined : Number(row.applicationCount),
    selectedCount: row.selectedCount === undefined ? undefined : Number(row.selectedCount),
  };
}

export function toPublicListing(listing: any) {
  return {
    id: listing.id,
    eventType: listing.eventType,
    jobRole: listing.jobRole,
    city: listing.city,
    eventDate: listing.eventDate,
    endDate: listing.endDate,
    dutyStartTime: listing.dutyStartTime,
    dutyEndTime: listing.dutyEndTime,
    dutyHours: listing.dutyHours,
    paymentMin: listing.paymentMin,
    paymentMax: listing.paymentMax,
    openings: listing.openings,
    experienceRequired: listing.experienceRequired,
    summary: listing.summary,
    publishedAt: listing.publishedAt,
  };
}

function buildListingWhere(filters: any = {}) {
  const and: any[] = [{ status: "open" }, { eventDate: { gte: todayIso() } }];

  if (filters.city) {
    and.push({ eventCity: { equals: String(filters.city), mode: "insensitive" } });
  }
  if (filters.role) {
    and.push({ jobRole: { equals: String(filters.role), mode: "insensitive" } });
  }
  if (filters.dateFrom) {
    and.push({ eventDate: { gte: String(filters.dateFrom) } });
  }
  if (filters.dateTo) {
    and.push({ eventDate: { lte: String(filters.dateTo) } });
  }
  if (Number.isFinite(filters.minPayment)) {
    and.push({ OR: [{ paymentMax: null }, { paymentMax: { gte: Number(filters.minPayment) } }] });
  }
  if (Number.isFinite(filters.maxPayment)) {
    and.push({ OR: [{ paymentMin: null }, { paymentMin: { lte: Number(filters.maxPayment) } }] });
  }
  if (filters.experience === "fresher") {
    and.push({ experienceRequired: { in: ["Any", "Fresher"] } });
  } else if (filters.experience === "experienced") {
    and.push({ experienceRequired: "Experienced" });
  }

  return { AND: and };
}

export async function listOpenListings(filters: any = {}) {
  const rows = await prisma.jobListing.findMany({
    where: buildListingWhere(filters),
    orderBy: [{ eventDate: "asc" }, { createdAt: "asc" }],
  });
  return rows.map((row) => toPublicListing(mapListing(row)));
}

export async function getListingFacets() {
  const where = { status: "open", eventDate: { gte: todayIso() } };
  const [cities, roles] = await Promise.all([
    prisma.jobListing.findMany({ where, distinct: ["eventCity"], select: { eventCity: true }, orderBy: { eventCity: "asc" } }),
    prisma.jobListing.findMany({ where, distinct: ["jobRole"], select: { jobRole: true }, orderBy: { jobRole: "asc" } }),
  ]);
  return { cities: cities.map((r) => r.eventCity), roles: roles.map((r) => r.jobRole) };
}

export async function listAllListings() {
  const rows = await prisma.jobListing.findMany({
    orderBy: [{ eventDate: "desc" }, { createdAt: "desc" }],
    include: {
      _count: { select: { applications: true } },
      applications: { where: { status: "selected" }, select: { id: true } },
    },
  });
  return rows.map((row: any) =>
    mapListing({
      ...row,
      applicationCount: row._count?.applications ?? 0,
      selectedCount: row.applications?.length ?? 0,
    }),
  );
}

export async function getListingById(listingId: string) {
  if (!listingId) return null;
  const row = await prisma.jobListing.findUnique({ where: { id: String(listingId) } });
  return row ? mapListing(row) : null;
}

export async function createListing(data: any) {
  const id = await createPublicId("CC-JOB", "jobListing", 2);
  const now = new Date().toISOString();
  const status = data.status || "draft";

  await prisma.jobListing.create({
    data: {
      id,
      status,
      eventType: data.eventType,
      jobRole: data.jobRole,
      eventCity: data.city,
      eventDate: data.eventDate,
      endDate: data.endDate || null,
      dutyStartTime: data.dutyStartTime || null,
      dutyEndTime: data.dutyEndTime || null,
      dutyHours: data.dutyHours ?? null,
      paymentMin: data.paymentMin ?? null,
      paymentMax: data.paymentMax ?? null,
      openings: data.openings || 1,
      experienceRequired: data.experienceRequired || "Any",
      summary: data.summary || null,
      bookingRef: data.bookingRef || null,
      requirementRef: data.requirementRef ?? null,
      createdAt: now,
      updatedAt: now,
      publishedAt: status === "open" ? now : null,
    },
  });

  return getListingById(id);
}

const LISTING_PATCH_FIELDS: Record<string, string> = {
  status: "status",
  eventType: "eventType",
  jobRole: "jobRole",
  city: "eventCity",
  eventDate: "eventDate",
  endDate: "endDate",
  dutyStartTime: "dutyStartTime",
  dutyEndTime: "dutyEndTime",
  dutyHours: "dutyHours",
  paymentMin: "paymentMin",
  paymentMax: "paymentMax",
  openings: "openings",
  experienceRequired: "experienceRequired",
  summary: "summary",
  bookingRef: "bookingRef",
  requirementRef: "requirementRef",
};

export async function updateListing(listingId: string, patch: any) {
  if (!listingId) return null;
  const existing = await prisma.jobListing.findUnique({ where: { id: String(listingId) } });
  if (!existing) return null;

  const data: any = {};
  for (const [key, field] of Object.entries(LISTING_PATCH_FIELDS)) {
    if (!Object.hasOwn(patch, key)) continue;
    data[field] = patch[key] === "" ? null : patch[key];
  }
  if (Object.keys(data).length === 0) return mapListing(existing);

  const now = new Date().toISOString();
  data.updatedAt = now;
  if (patch.status === "open" && !existing.publishedAt) {
    data.publishedAt = now;
  }

  await prisma.jobListing.update({ where: { id: String(listingId) }, data });
  return getListingById(listingId);
}

export async function verifyStaffIdentity(registrationId: string, mobileNumber: string) {
  const id = String(registrationId || "").trim().toUpperCase();
  const phone = normalizePhoneNumber(mobileNumber);
  if (!id || !phone) return null;

  const row = await prisma.staffRegistration.findUnique({
    where: { id },
    select: { id: true, fullName: true, status: true, currentCity: true, experienceLevel: true, mobileNumber: true },
  });

  if (!row || row.status === "rejected") return null;
  if (normalizePhoneNumber(row.mobileNumber) !== phone) return null;

  return {
    id: row.id,
    fullName: row.fullName,
    status: row.status,
    currentCity: row.currentCity || "",
    experienceLevel: row.experienceLevel || "",
  };
}

function mapApplication(row: any) {
  return {
    id: row.id,
    listingId: row.listingId,
    registrationId: row.registrationId,
    status: row.status,
    note: row.note || "",
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function getApplicationEvents(applicationId: string) {
  const rows = await prisma.jobApplicationEvent.findMany({
    where: { applicationId },
    orderBy: { id: "asc" },
  });
  return rows.map((row) => ({ status: row.status, note: row.note || "", createdAt: row.createdAt }));
}

export async function getApplicationById(applicationId: string) {
  if (!applicationId) return null;
  const row = await prisma.jobApplication.findUnique({ where: { id: String(applicationId) } });
  if (!row) return null;
  return { ...mapApplication(row), events: await getApplicationEvents(row.id) };
}

export async function createApplication({ listingId, registrationId }: { listingId: string; registrationId: string }) {
  const listing = await prisma.jobListing.findUnique({ where: { id: String(listingId) } });
  if (!listing) return { ok: false as const, reason: "not_found" as const };

  if (listing.status !== "open" || listing.eventDate < todayIso()) {
    return { ok: false as const, reason: "closed" as const };
  }

  const existing = await prisma.jobApplication.findUnique({
    where: { listingId_registrationId: { listingId: listing.id, registrationId: String(registrationId) } },
  });
  if (existing) {
    return { ok: false as const, reason: "duplicate" as const, application: mapApplication(existing) };
  }

  const selected = await prisma.jobApplication.count({ where: { listingId: listing.id, status: "selected" } });
  if (selected >= Number(listing.openings)) {
    return { ok: false as const, reason: "full" as const };
  }

  const id = await createPublicId("CC-APP", "jobApplication", 3);
  const now = new Date().toISOString();

  await prisma.$transaction(async (tx) => {
    await tx.jobApplication.create({
      data: { id, listingId: listing.id, registrationId: String(registrationId), status: "submitted", note: null, createdAt: now, updatedAt: now },
    });
    await tx.jobApplicationEvent.create({
      data: { applicationId: id, status: "submitted", note: "Application submitted from the public job board.", createdAt: now },
    });
  });

  const created = await getApplicationById(id);
  return { ok: true as const, application: created! };
}

export async function listApplicationsForRegistration(registrationId: string) {
  const rows = await prisma.jobApplication.findMany({
    where: { registrationId: String(registrationId) },
    orderBy: { createdAt: "desc" },
  });

  return Promise.all(
    rows.map(async (row) => {
      const [listing, events] = await Promise.all([
        prisma.jobListing.findUnique({ where: { id: row.listingId } }),
        getApplicationEvents(row.id),
      ]);
      return {
        ...mapApplication(row),
        events,
        job: listing ? toPublicListing(mapListing(listing)) : null,
      };
    }),
  );
}

export async function listApplicationsForListing(listingId: string) {
  const rows = await prisma.jobApplication.findMany({
    where: { listingId: String(listingId) },
    orderBy: { createdAt: "asc" },
  });

  const regIds = [...new Set(rows.map((r) => r.registrationId))];
  const staff = regIds.length
    ? await prisma.staffRegistration.findMany({
        where: { id: { in: regIds } },
        select: { id: true, fullName: true, currentCity: true, experienceLevel: true, status: true },
      })
    : [];
  const staffById = new Map(staff.map((s) => [s.id, s]));

  return Promise.all(
    rows.map(async (row) => {
      const s = staffById.get(row.registrationId);
      return {
        ...mapApplication(row),
        events: await getApplicationEvents(row.id),
        applicant: {
          registrationId: row.registrationId,
          fullName: s?.fullName || "Registration not found",
          currentCity: s?.currentCity || "",
          experienceLevel: s?.experienceLevel || "",
          registrationStatus: s?.status || "",
        },
      };
    }),
  );
}

export async function updateApplicationStatus(applicationId: string, status: string, note = "") {
  const existing = await prisma.jobApplication.findUnique({ where: { id: String(applicationId) } });
  if (!existing) return null;
  const now = new Date().toISOString();

  await prisma.$transaction(async (tx) => {
    await tx.jobApplication.update({
      where: { id: String(applicationId) },
      data: { status, note: note || null, updatedAt: now },
    });
    await tx.jobApplicationEvent.create({
      data: { applicationId: String(applicationId), status, note: note || null, createdAt: now },
    });

    const listing = await tx.jobListing.findUnique({ where: { id: existing.listingId } });
    if (listing) {
      const selected = await tx.jobApplication.count({ where: { listingId: listing.id, status: "selected" } });
      if (listing.status === "open" && selected >= Number(listing.openings)) {
        await tx.jobListing.update({ where: { id: listing.id }, data: { status: "filled", updatedAt: now } });
      }
    }
  });

  return getApplicationById(applicationId);
}

export async function countOpenListings() {
  return prisma.jobListing.count({ where: { status: "open", eventDate: { gte: todayIso() } } });
}

// Compatibility export (no-op with Prisma)
export function getJobsDatabase() {
  return null;
}
