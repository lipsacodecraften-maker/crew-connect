import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { calculateAge, normalizePhoneNumber } from "./config";

function parseJsonArray(value: any) {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function createRegistrationId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const suffix = randomBytes(3).toString("hex").toUpperCase();
    const candidate = `CC-STF-${year}${month}-${suffix}`;
    const existing = await prisma.staffRegistration.findUnique({ where: { id: candidate }, select: { id: true } });
    if (!existing) return candidate;
  }
  return `CC-STF-${year}${month}-${randomBytes(5).toString("hex").toUpperCase()}`;
}

function mapRegistration(row: any, documents: any[], history: any[]) {
  return {
    id: row.id,
    status: row.status,
    fullName: row.fullName,
    mobileNumber: row.mobileNumber,
    whatsappVerified: Boolean(row.whatsappVerified),
    emailAddress: row.emailAddress,
    dateOfBirth: row.dateOfBirth,
    age: row.age,
    currentCity: row.currentCity,
    areaPincode: row.areaPincode,
    languages: parseJsonArray(row.languages),
    skills: parseJsonArray(row.skills),
    otherSkill: row.otherSkill || "",
    experienceLevel: row.experienceLevel,
    yearsOfExperience: row.yearsExperience,
    previousEvents: row.previousEvents || "",
    expectedPayment: row.expectedPayment,
    preferredCities: parseJsonArray(row.preferredCities),
    availableFrom: row.availableFrom,
    availableUntil: row.availableUntil,
    shiftTypes: parseJsonArray(row.shiftTypes),
    willingToTravel: row.willingToTravel ? "yes" : "no",
    transportAvailable: row.transportAvailable ? "yes" : "no",
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
    documents,
    history,
  };
}

function mapDocument(row: any, includeData = false) {
  return {
    id: row.id,
    kind: row.documentKind,
    type: row.documentType || "",
    name: row.fileName,
    fileType: row.fileType,
    size: row.fileSize,
    createdAt: row.createdAt,
    ...(includeData ? { encryptedData: row.encryptedData } : {}),
  };
}

function mapHistory(row: any) {
  return { status: row.status, note: row.note || "", createdAt: row.createdAt };
}

export async function createStaffRegistration({ data, profilePhoto, documents }: any) {
  const id = await createRegistrationId();
  const now = new Date().toISOString();
  const age = calculateAge(data.dateOfBirth) || 0;

  await prisma.$transaction(async (tx) => {
    await tx.staffRegistration.create({
      data: {
        id,
        status: "pending_review",
        fullName: data.fullName,
        mobileNumber: normalizePhoneNumber(data.mobileNumber),
        whatsappVerified: true,
        emailAddress: data.emailAddress,
        dateOfBirth: data.dateOfBirth,
        age,
        currentCity: data.currentCity,
        areaPincode: data.areaPincode,
        languages: JSON.stringify(data.languages || []),
        skills: JSON.stringify(data.skills || []),
        otherSkill: data.otherSkill || null,
        experienceLevel: data.experienceLevel,
        yearsExperience: Number(data.yearsOfExperience) || 0,
        previousEvents: data.previousEvents || null,
        expectedPayment: Number(data.expectedPayment),
        preferredCities: JSON.stringify(data.preferredCities || []),
        availableFrom: data.availableFrom,
        availableUntil: data.availableUntil,
        shiftTypes: JSON.stringify(data.shiftTypes || []),
        willingToTravel: data.willingToTravel === "yes",
        transportAvailable: data.transportAvailable === "yes",
        profilePhotoName: profilePhoto.name,
        profilePhotoType: profilePhoto.type,
        profilePhotoSize: Number(profilePhoto.size),
        profilePhotoData: Buffer.from(profilePhoto.buffer),
        documentsConsent: Boolean(data.documentsConsent),
        privacyConsent: Boolean(data.privacyConsent),
        termsConsent: Boolean(data.termsConsent),
        ageConfirmed: Boolean(data.ageConfirmed),
        createdAt: now,
        updatedAt: now,
      },
    });

    for (const document of documents || []) {
      await tx.staffDocument.create({
        data: {
          registrationId: id,
          documentKind: document.kind,
          documentType: document.type || null,
          fileName: document.name,
          fileType: document.fileType,
          fileSize: Number(document.size),
          encryptedData: Buffer.from(document.buffer),
          createdAt: now,
        },
      });
    }

    await tx.staffStatusEvent.create({
      data: {
        registrationId: id,
        status: "pending_review",
        note: "Staff registration submitted and queued for review.",
        createdAt: now,
      },
    });
  });

  return (await getStaffRegistrationById(id))!;
}

export async function getStaffRegistrationById(registrationId: string) {
  if (!registrationId) return null;
  const row = await prisma.staffRegistration.findUnique({ where: { id: registrationId } });
  if (!row) return null;
  const [documents, history] = await Promise.all([
    prisma.staffDocument.findMany({ where: { registrationId }, orderBy: { id: "asc" } }),
    prisma.staffStatusEvent.findMany({ where: { registrationId }, orderBy: { id: "asc" } }),
  ]);
  return mapRegistration(row, documents.map((d) => mapDocument(d)), history.map(mapHistory));
}

export async function getStaffProfilePhoto(registrationId: string) {
  if (!registrationId) return null;
  const row = await prisma.staffRegistration.findUnique({
    where: { id: registrationId },
    select: { profilePhotoName: true, profilePhotoType: true, profilePhotoData: true },
  });
  if (!row) return null;
  return {
    name: row.profilePhotoName,
    type: row.profilePhotoType,
    buffer: row.profilePhotoData,
  };
}

export async function getStaffDocument(registrationId: string, documentId: string | number) {
  if (!registrationId || !documentId) return null;
  const row = await prisma.staffDocument.findFirst({
    where: { registrationId, id: Number(documentId) },
  });
  if (!row) return null;
  return {
    id: row.id,
    type: row.documentType || "",
    name: row.fileName,
    fileType: row.fileType,
    size: row.fileSize,
    buffer: row.encryptedData,
  };
}

export async function updateStaffRegistrationStatus(registrationId: string, status: string, note = "") {
  const existing = await prisma.staffRegistration.findUnique({ where: { id: registrationId }, select: { id: true } });
  if (!existing) return null;
  const now = new Date().toISOString();

  await prisma.$transaction(async (tx) => {
    await tx.staffRegistration.update({ where: { id: registrationId }, data: { status, updatedAt: now } });
    await tx.staffStatusEvent.create({ data: { registrationId, status, note: note || null, createdAt: now } });
  });

  return getStaffRegistrationById(registrationId);
}

export async function getRecentOtpChallenges(mobileNumber: string, sinceIso: string) {
  const rows = await prisma.staffOtpChallenge.findMany({
    where: { mobileNumber, createdAt: { gte: sinceIso } },
    orderBy: { id: "desc" },
    select: { id: true, createdAt: true },
  });
  return rows.map((r) => ({ id: r.id, created_at: r.createdAt }));
}

export async function createOtpChallenge({ mobileNumber, codeHash, expiresAt }: any) {
  const now = new Date().toISOString();
  const result = await prisma.staffOtpChallenge.create({
    data: { mobileNumber, codeHash, expiresAt, createdAt: now },
  });
  return Number(result.id);
}

export async function getLatestOtpChallenge(mobileNumber: string) {
  const row = await prisma.staffOtpChallenge.findFirst({
    where: { mobileNumber },
    orderBy: { id: "desc" },
  });
  if (!row) return null;
  return {
    id: row.id,
    mobile_number: row.mobileNumber,
    code_hash: row.codeHash,
    attempts: row.attempts,
    expires_at: row.expiresAt,
    verified_at: row.verifiedAt,
    verification_expires_at: row.verificationExpiresAt,
    consumed_at: row.consumedAt,
    created_at: row.createdAt,
  };
}

export async function incrementOtpAttempts(challengeId: number) {
  await prisma.staffOtpChallenge.update({ where: { id: challengeId }, data: { attempts: { increment: 1 } } });
}

export async function markOtpVerified(challengeId: number, tokenHash: string, verificationExpiresAt: string) {
  await prisma.staffOtpChallenge.update({
    where: { id: challengeId },
    data: {
      verifiedAt: new Date().toISOString(),
      verificationTokenHash: tokenHash,
      verificationExpiresAt,
    },
  });
}

export async function hasValidOtpVerification(mobileNumber: string, tokenHash: string, nowIso: string) {
  const row = await prisma.staffOtpChallenge.findFirst({
    where: {
      mobileNumber,
      verificationTokenHash: tokenHash,
      verifiedAt: { not: null },
      consumedAt: null,
      verificationExpiresAt: { gte: nowIso },
    },
    orderBy: { id: "desc" },
    select: { id: true },
  });
  return Boolean(row);
}

export async function consumeOtpVerification(mobileNumber: string, tokenHash: string, nowIso: string) {
  const row = await prisma.staffOtpChallenge.findFirst({
    where: {
      mobileNumber,
      verificationTokenHash: tokenHash,
      verifiedAt: { not: null },
      consumedAt: null,
      verificationExpiresAt: { gte: nowIso },
    },
    orderBy: { id: "desc" },
    select: { id: true },
  });
  if (!row) return false;
  await prisma.staffOtpChallenge.update({ where: { id: row.id }, data: { consumedAt: nowIso } });
  return true;
}

export async function pruneExpiredOtpChallenges(beforeIso: string) {
  await prisma.staffOtpChallenge.deleteMany({ where: { createdAt: { lt: beforeIso }, verifiedAt: null } });
}

export async function createStaffSession({
  registrationId,
  tokenHash,
  userAgent = null,
  ipHash = null,
  expiresAt,
}: {
  registrationId: string;
  tokenHash: string;
  userAgent?: string | null;
  ipHash?: string | null;
  expiresAt: Date;
}) {
  const row = await prisma.staffSession.create({
    data: {
      registrationId,
      tokenHash,
      userAgent: userAgent || null,
      ipHash: ipHash || null,
      expiresAt,
    },
  });
  return row.id;
}

export async function findStaffSessionByTokenHash(tokenHash: string) {
  return prisma.staffSession.findUnique({
    where: { tokenHash },
    include: { registration: true },
  });
}

export async function revokeStaffSession(sessionId: string) {
  await prisma.staffSession.update({
    where: { id: sessionId },
    data: { revokedAt: new Date() },
  });
}

export async function touchStaffSession(sessionId: string) {
  await prisma.staffSession.update({
    where: { id: sessionId },
    data: { lastSeenAt: new Date() },
  });
}

