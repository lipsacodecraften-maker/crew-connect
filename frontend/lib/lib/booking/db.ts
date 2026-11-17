import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

function createBookingIdBase() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `CC-MP-${year}${month}-`;
}

async function createBookingId() {
  const prefix = createBookingIdBase();
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const suffix = randomBytes(3).toString("hex").toUpperCase();
    const candidate = `${prefix}${suffix}`;
    const existing = await prisma.bookingRequest.findUnique({ where: { id: candidate }, select: { id: true } });
    if (!existing) return candidate;
  }
  return `${prefix}${randomBytes(5).toString("hex").toUpperCase()}`;
}

function integerToYesNo(value: boolean | number | null | undefined) {
  return value ? "yes" : "no";
}

function parseLanguages(value: any) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string" || !value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Older rows may contain a comma-separated string.
  }
  return value
    .split(",")
    .map((language: string) => language.trim())
    .filter(Boolean);
}

function mapRole(role: any) {
  return {
    staffRole: role.staffRole,
    genderPreference: role.genderPreference,
    quantity: role.quantity,
    workDate: role.workDate,
    reportingTime: role.reportingTime,
    shiftDuration: role.shiftDuration,
    experienceRequirement: role.experienceRequirement,
    uniformRequirement: role.uniformRequirement,
    specialInstructions: role.specialInstructions || "",
  };
}

function mapHistory(event: any) {
  return {
    status: event.status,
    note: event.note || "",
    createdAt: event.createdAt,
  };
}

function mapBooking(row: any) {
  return {
    id: row.id,
    status: row.status,
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
    budgetPerPerson: row.budgetPerPerson,
    foodProvided: integerToYesNo(row.foodProvided),
    transportProvided: integerToYesNo(row.transportProvided),
    accommodationProvided: integerToYesNo(row.accommodationProvided),
    dressCode: row.dressCode,
    languageRequirements: parseLanguages(row.languageRequirements),
    additionalNotes: row.additionalNotes || "",
    urgent: Boolean(row.urgent),
    referenceFileName: row.referenceFileName || "",
    referenceFileType: row.referenceFileType || "",
    referenceFileSize: row.referenceFileSize || 0,
    totalStaff: row.totalStaff,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    roles: (row.staffingRequirements || []).map(mapRole),
    history: (row.statusEvents || []).map(mapHistory),
  };
}

const bookingInclude = {
  staffingRequirements: { orderBy: { roleIndex: "asc" as const } },
  statusEvents: { orderBy: { id: "asc" as const } },
};

export async function createBooking({ data, file, totalStaff }: { data: any; file?: any; totalStaff: number }) {
  const id = await createBookingId();
  const trackingToken = randomBytes(24).toString("base64url");
  const now = new Date().toISOString();

  await prisma.$transaction(async (tx) => {
    await tx.bookingRequest.create({
      data: {
        id,
        trackingToken,
        status: "received",
        clientCompanyName: data.clientCompanyName,
        contactPerson: data.contactPerson,
        mobileNumber: data.mobileNumber,
        whatsappNumber: data.whatsappNumber,
        emailAddress: data.emailAddress,
        companyType: data.companyType,
        eventName: data.eventName,
        eventType: data.eventType,
        eventCity: data.eventCity,
        state: data.state,
        venueAddress: data.venueAddress,
        mapsLocation: data.mapsLocation || null,
        eventStartDate: data.eventStartDate,
        eventEndDate: data.eventEndDate,
        reportingTime: data.reportingTime,
        dutyStartTime: data.dutyStartTime,
        dutyEndTime: data.dutyEndTime,
        guestCount: Number(data.guestCount),
        budgetPerPerson: Number(data.budgetPerPerson),
        foodProvided: data.foodProvided === true || data.foodProvided === "yes" || data.foodProvided === 1,
        transportProvided: data.transportProvided === true || data.transportProvided === "yes" || data.transportProvided === 1,
        accommodationProvided: data.accommodationProvided === true || data.accommodationProvided === "yes" || data.accommodationProvided === 1,
        dressCode: data.dressCode,
        languageRequirements: JSON.stringify(data.languageRequirements || []),
        additionalNotes: data.additionalNotes || null,
        urgent: Boolean(data.urgent),
        referenceFileName: file?.name || null,
        referenceFileType: file?.type || null,
        referenceFileSize: file?.size ? Number(file.size) : null,
        referenceFileData: file?.buffer ? Buffer.from(file.buffer) : null,
        totalStaff,
        createdAt: now,
        updatedAt: now,
        staffingRequirements: {
          create: (data.staffingRoles || []).map((role: any, index: number) => ({
            roleIndex: index,
            staffRole: role.staffRole,
            genderPreference: role.genderPreference,
            quantity: Number(role.quantity),
            workDate: role.workDate,
            reportingTime: role.reportingTime,
            shiftDuration: Number(role.shiftDuration),
            experienceRequirement: role.experienceRequirement,
            uniformRequirement: role.uniformRequirement,
            specialInstructions: role.specialInstructions || null,
          })),
        },
        statusEvents: {
          create: {
            status: "received",
            note: "Booking request submitted by the client.",
            createdAt: now,
          },
        },
      },
    });
  });

  return {
    booking: (await getBookingById(id))!,
    trackingToken,
  };
}

export async function getBookingById(bookingId: string) {
  const row = await prisma.bookingRequest.findUnique({ where: { id: bookingId }, include: bookingInclude });
  if (!row) return null;
  return mapBooking(row);
}

export async function getBookingByTrackingToken(token: string) {
  if (!token) return null;
  const row = await prisma.bookingRequest.findUnique({ where: { trackingToken: token }, include: bookingInclude });
  if (!row) return null;
  return mapBooking(row);
}

export async function getBookingByReference(bookingId: string, email: string) {
  if (!bookingId || !email) return null;
  const row = await prisma.bookingRequest.findFirst({
    where: {
      id: { equals: bookingId.trim(), mode: "insensitive" },
      emailAddress: { equals: email.trim(), mode: "insensitive" },
    },
    include: bookingInclude,
  });
  if (!row) return null;
  return mapBooking(row);
}

export async function updateBookingStatus(bookingId: string, status: string, note = "") {
  const existing = await prisma.bookingRequest.findUnique({ where: { id: bookingId }, select: { id: true } });
  if (!existing) return null;
  const now = new Date().toISOString();

  await prisma.$transaction(async (tx) => {
    await tx.bookingRequest.update({ where: { id: bookingId }, data: { status, updatedAt: now } });
    await tx.bookingStatusEvent.create({ data: { bookingId, status, note: note || null, createdAt: now } });
  });

  return getBookingById(bookingId);
}

export async function recordNotification({
  bookingId,
  channel,
  recipientType,
  recipient,
  status,
  provider,
  subject,
  error,
}: any) {
  await prisma.bookingNotification.create({
    data: {
      bookingId,
      channel,
      recipientType,
      recipient: recipient || null,
      status,
      provider: provider || null,
      subject: subject || null,
      error: error || null,
      createdAt: new Date().toISOString(),
    },
  });
}

// Compatibility export (no-op with Prisma)
export function getDatabase() {
  return null;
}
