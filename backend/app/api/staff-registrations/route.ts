import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import {
  STAFF_STATUS_META,
  normalizePhoneNumber,
} from "@/lib/staff/config";
import {
  consumeOtpVerification,
  createStaffRegistration,
  hasValidOtpVerification,
} from "@/lib/staff/db";
import { normalizeRegistrationPayload } from "@/lib/staff/normalize";
import { encryptBuffer, hashVerificationToken } from "@/lib/staff/secureStorage";
import {
  validateProfilePhoto,
  validateRegistration,
  validateResumeFile,
  validateSupportingDocument,
} from "@/lib/staff/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SUPPORTING_DOCUMENTS = 3;

function jsonError(
  message: string,
  status: number,
  errors?: Record<string, string>,
) {
  return NextResponse.json(
    { ok: false, message, ...(errors ? { errors } : {}) },
    { status },
  );
}

function safeFileName(name: unknown) {
  return path
    .basename(String(name || "file"))
    .replace(/[^\w.\- ()]/g, "_")
    .slice(0, 180);
}

function fileType(file: any) {
  const type = String(file?.type || "").slice(0, 120);
  if (type) return type;

  const extension = String(file?.name || "")
    .toLowerCase()
    .split(".")
    .pop();
  const fallbacks: Record<string, string> = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
  };
  return fallbacks[extension || ""] || "application/octet-stream";
}

async function readFile(file: any) {
  if (!file || typeof file.arrayBuffer !== "function" || file.size <= 0) {
    return null;
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    return {
      name: safeFileName(file.name),
      type: fileType(file),
      size: file.size,
      buffer,
    };
  } catch {
    return null;
  }
}

async function readRequest(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";

  if (!contentType.includes("multipart/form-data")) {
    throw new Error("Submit the registration as multipart form data.");
  }

  const formData = await request.formData();
  const payload = formData.get("payload");

  if (typeof payload !== "string" || !payload) {
    throw new Error("Missing registration payload.");
  }

  let raw;
  try {
    raw = JSON.parse(payload);
  } catch {
    throw new Error("Registration payload is not valid JSON.");
  }

  const profilePhoto = await readFile(formData.get("profilePhoto"));
  const resume = await readFile(formData.get("resume"));
  const supportingDocuments = [];

  for (const entry of formData.getAll("supportingDocuments")) {
    if (supportingDocuments.length >= MAX_SUPPORTING_DOCUMENTS) break;
    if (!entry || typeof entry !== "object" || entry.size <= 0) continue;
    const file = await readFile(entry);
    if (file) supportingDocuments.push(file);
  }

  return { raw, profilePhoto, resume, supportingDocuments };
}

export async function POST(request: NextRequest) {
  let parsed;

  try {
    parsed = await readRequest(request);
  } catch (error) {
    return jsonError(
      error instanceof Error
        ? error.message
        : "Could not read the registration request.",
      400,
    );
  }

  const data = normalizeRegistrationPayload(parsed.raw);
  if (!data) {
    return jsonError("Could not read the registration payload.", 400);
  }

  const errors: Record<string, string> = {};
  const phone = normalizePhoneNumber(data.mobileNumber);

  if (!parsed.profilePhoto) {
    errors.profilePhoto = "Add a clear profile photo.";
  } else {
    const photoError = validateProfilePhoto(parsed.profilePhoto);
    if (photoError) errors.profilePhoto = photoError;
  }

  data.profilePhoto = parsed.profilePhoto
    ? {
        name: parsed.profilePhoto.name,
        type: parsed.profilePhoto.type,
        size: parsed.profilePhoto.size,
      }
    : null;

  if (parsed.resume) {
    const resumeError = validateResumeFile(parsed.resume);
    if (resumeError) errors.resume = resumeError;
    data.resume = {
      name: parsed.resume.name,
      type: parsed.resume.type,
      size: parsed.resume.size,
    };
  } else {
    data.resume = null;
  }

  data.supportingDocuments = parsed.supportingDocuments.map((file) => ({
    name: file.name,
    type: file.type,
    size: file.size,
  }));

  for (const file of parsed.supportingDocuments) {
    const documentError = validateSupportingDocument(file);
    if (documentError) {
      errors.supportingDocuments = documentError;
      break;
    }
  }

  if (
    data.supportingDocuments.length > 0 &&
    !data.documentsConsent
  ) {
    errors.documentsConsent =
      "Consent is required before attaching identity or supporting documents.";
  }

  const token = data.whatsappVerificationToken;
  let verified = false;

  if (!phone) {
    errors.mobileNumber =
      errors.mobileNumber ||
      "Enter a valid 10-digit Indian mobile number starting with 6–9.";
  } else if (!token) {
    errors.mobileNumber =
      errors.mobileNumber ||
      "Verify your WhatsApp number before submitting.";
  } else {
    verified = await hasValidOtpVerification(
      phone,
      hashVerificationToken(token),
      new Date().toISOString(),
    );
    if (!verified) {
      errors.mobileNumber =
        errors.mobileNumber ||
        "Your WhatsApp verification expired. Verify your number again.";
    }
  }

  data.whatsappVerified = verified;

  const validationErrors = validateRegistration(data);
  Object.assign(errors, validationErrors);

  if (Object.keys(errors).length > 0) {
    return jsonError(
      "Please correct the highlighted fields.",
      400,
      errors,
    );
  }

  if (!parsed.profilePhoto) {
    return jsonError("Add a clear profile photo.", 400, errors);
  }

  let profilePhoto;
  let resume = null;
  const documents = [];

  try {
    profilePhoto = {
      name: parsed.profilePhoto.name,
      type: parsed.profilePhoto.type,
      size: parsed.profilePhoto.size,
      buffer: encryptBuffer(parsed.profilePhoto.buffer),
    };

    if (parsed.resume) {
      resume = {
        kind: "resume",
        type: "Resume",
        name: parsed.resume.name,
        fileType: parsed.resume.type,
        size: parsed.resume.size,
        buffer: encryptBuffer(parsed.resume.buffer),
      };
    }

    parsed.supportingDocuments.forEach((file, index) => {
      documents.push({
        kind: "supporting",
        type:
          data.supportingDocumentTypes[index] ||
          "Other supporting document",
        name: file.name,
        fileType: file.type,
        size: file.size,
        buffer: encryptBuffer(file.buffer),
      });
    });

    if (resume) documents.unshift(resume);
  } catch (error) {
    console.error("[staff-registration] Could not secure documents", error);
    return jsonError(
      "Your documents could not be secured. Please try again.",
      500,
    );
  }

  let registration;

  try {
    registration = await createStaffRegistration({
      data,
      profilePhoto,
      documents,
    });
  } catch (error) {
    console.error("[staff-registration] Could not save registration", error);
    return jsonError(
      "The registration could not be saved right now. Please try again.",
      500,
    );
  }

  if (phone) {
    await consumeOtpVerification(
      phone,
      hashVerificationToken(token),
      new Date().toISOString(),
    );
  }

  const statusMeta =
    STAFF_STATUS_META[
      registration.status as keyof typeof STAFF_STATUS_META
    ] || STAFF_STATUS_META.pending_review;

  return NextResponse.json(
    {
      ok: true,
      registration: {
        id: registration.id,
        status: registration.status,
        statusLabel: statusMeta.label,
        fullName: registration.fullName,
        emailAddress: registration.emailAddress,
        mobileNumber: registration.mobileNumber,
        createdAt: registration.createdAt,
      },
    },
    { status: 201 },
  );
}
