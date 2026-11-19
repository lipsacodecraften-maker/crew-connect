import {
  DOCUMENT_EXTENSIONS,
  DOCUMENT_MIME_TYPES,
  MAX_FILE_BYTES,
  MAX_SUPPORTING_DOCUMENTS,
  MINIMUM_AGE,
  PHOTO_EXTENSIONS,
  PHOTO_MIME_TYPES,
  RESUME_EXTENSIONS,
  RESUME_MIME_TYPES,
  SHIFT_TYPES,
  STAFF_SKILLS,
  calculateAge,
  normalizePhoneNumber,
} from "./config";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PINCODE_PATTERN = /^\d{6}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function getFileExtension(name: unknown): string {
  const parts = String(name || "").toLowerCase().split(".");
  return parts.length > 1 ? (parts.pop() as string) : "";
}

function formatLimit(bytes: number): string {
  return `${Math.round(bytes / (1024 * 1024))} MB`;
}

function validateFile(
  file: any,
  { extensions, mimeTypes, label }: { extensions: readonly string[]; mimeTypes: readonly string[]; label: string },
): string {
  if (!file || typeof file !== "object") return "";

  const name = String(file.name || "");
  const extension = getFileExtension(name);
  const type = String(file.type || "").toLowerCase();
  const size = Number(file.size || 0);

  if (!name) return `Choose a ${label.toLowerCase()} file.`;
  if (!extensions.includes(extension)) {
    return `${label} must be a ${extensions.join(", ").toUpperCase()} file.`;
  }
  if (type && !mimeTypes.includes(type)) {
    return `${label} has an unsupported file type.`;
  }
  if (size <= 0) return `${label} appears to be empty.`;
  if (size > MAX_FILE_BYTES) {
    return `${label} must be ${formatLimit(MAX_FILE_BYTES)} or smaller.`;
  }
  return "";
}

export function validateProfilePhoto(file: any): string {
  if (!file) return "Add a clear profile photo.";
  return validateFile(file, {
    extensions: PHOTO_EXTENSIONS,
    mimeTypes: PHOTO_MIME_TYPES,
    label: "Profile photo",
  });
}

export function validateResumeFile(file: any): string {
  if (!file) return "";
  return validateFile(file, {
    extensions: RESUME_EXTENSIONS,
    mimeTypes: RESUME_MIME_TYPES,
    label: "Resume",
  });
}

export function validateSupportingDocument(file: any): string {
  if (!file) return "";
  return validateFile(file, {
    extensions: DOCUMENT_EXTENSIONS,
    mimeTypes: DOCUMENT_MIME_TYPES,
    label: "Supporting document",
  });
}

export function validateRegistration(form: any, options: { requireWhatsApp?: boolean } = {}): Record<string, string> {
  const { requireWhatsApp = true } = options;
  const errors: Record<string, string> = {};

  if (!String(form.fullName || "").trim()) {
    errors.fullName = "Enter your full legal name.";
  } else if (String(form.fullName).trim().length < 3) {
    errors.fullName = "Enter your name as it appears on your ID.";
  } else if (String(form.fullName).trim().length > 100) {
    errors.fullName = "Name must be 100 characters or fewer.";
  } else if (!/^[A-Za-z ]+$/.test(String(form.fullName).trim())) {
    errors.fullName = "Name can contain only letters and spaces.";
  }

  const phone = normalizePhoneNumber(form.mobileNumber);
  if (!phone) {
    errors.mobileNumber = "Enter a valid 10-digit Indian mobile number starting with 6–9.";
  }

  if (requireWhatsApp && !form.whatsappVerified) {
    errors.mobileNumber = errors.mobileNumber || "Verify your WhatsApp number with the OTP.";
  }

  if (!EMAIL_PATTERN.test(String(form.emailAddress || "").trim())) {
    errors.emailAddress = "Enter a valid email address.";
  }

  const age = calculateAge(form.dateOfBirth);
  if (!form.dateOfBirth || !DATE_PATTERN.test(form.dateOfBirth)) {
    errors.dateOfBirth = "Enter your date of birth.";
  } else if (age === null || age < MINIMUM_AGE) {
    errors.dateOfBirth = `Applicants must be at least ${MINIMUM_AGE} years old.`;
  } else if (age > 100) {
    errors.dateOfBirth = "Check your date of birth and try again.";
  }

  if (!String(form.currentCity || "").trim()) {
    errors.currentCity = "Enter your current city.";
  }

  if (!PINCODE_PATTERN.test(String(form.areaPincode || "").trim())) {
    errors.areaPincode = "Enter a valid 6-digit pincode.";
  }

  if (!Array.isArray(form.languages) || form.languages.length === 0) {
    errors.languages = "Select at least one language you speak.";
  }

  if (requireWhatsApp) {
    if (!form.profilePhoto) {
      errors.profilePhoto = "Add a clear profile photo.";
    } else {
      const photoError = validateProfilePhoto(form.profilePhoto);
      if (photoError) errors.profilePhoto = photoError;
    }
  }

  if (!Array.isArray(form.skills) || form.skills.length === 0) {
    errors.skills = "Choose at least one work category.";
  } else if (!form.skills.every((skill: string) => STAFF_SKILLS.includes(skill as any))) {
    errors.skills = "One or more selected categories are not recognised.";
  } else if (form.skills.includes("Other") && !String(form.otherSkill || "").trim()) {
    errors.otherSkill = "Describe the other work category you can handle.";
  }

  if (!["Fresher", "Experienced"].includes(form.experienceLevel)) {
    errors.experienceLevel = "Select fresher or experienced.";
  }

  if (form.experienceLevel === "Experienced") {
    const years = Number(form.yearsOfExperience);
    if (form.yearsOfExperience === "" || !Number.isFinite(years) || years <= 0) {
      errors.yearsOfExperience = "Enter your years of event experience.";
    } else if (years > 50) {
      errors.yearsOfExperience = "Enter a realistic number of years.";
    }
  }

  const payment = Number(form.expectedPayment);
  if (form.expectedPayment === "" || !Number.isFinite(payment) || payment < 100) {
    errors.expectedPayment = "Enter your expected payment per shift (minimum ₹100).";
  } else if (payment > 100000) {
    errors.expectedPayment = "Enter a realistic per-shift amount.";
  }

  if (form.resume) {
    const resumeError = validateResumeFile(form.resume);
    if (resumeError) errors.resume = resumeError;
  }

  if (!Array.isArray(form.preferredCities) || form.preferredCities.length === 0) {
    errors.preferredCities = "Choose at least one preferred work city.";
  }

  if (!form.availableFrom || !DATE_PATTERN.test(form.availableFrom)) {
    errors.availableFrom = "Choose the first date you are available.";
  }

  if (!form.availableUntil || !DATE_PATTERN.test(form.availableUntil)) {
    errors.availableUntil = "Choose the last date you are available.";
  } else if (
    form.availableFrom &&
    DATE_PATTERN.test(form.availableFrom) &&
    form.availableUntil < form.availableFrom
  ) {
    errors.availableUntil = "The last available date must be after the first.";
  }

  if (!Array.isArray(form.shiftTypes) || form.shiftTypes.length === 0) {
    errors.shiftTypes = "Select at least one shift type.";
  } else if (!form.shiftTypes.every((shift: string) => SHIFT_TYPES.includes(shift as any))) {
    errors.shiftTypes = "One or more selected shift types are not recognised.";
  }

  if (!["yes", "no"].includes(form.willingToTravel)) {
    errors.willingToTravel = "Tell us whether you can travel for work.";
  }

  if (!["yes", "no"].includes(form.transportAvailable)) {
    errors.transportAvailable = "Tell us whether you have transport.";
  }

  if (Array.isArray(form.supportingDocuments) && form.supportingDocuments.length > MAX_SUPPORTING_DOCUMENTS) {
    errors.supportingDocuments = `Attach up to ${MAX_SUPPORTING_DOCUMENTS} documents.`;
  } else if (Array.isArray(form.supportingDocuments)) {
    for (const file of form.supportingDocuments) {
      const documentError = validateSupportingDocument(file);
      if (documentError) {
        errors.supportingDocuments = documentError;
        break;
      }
    }
  }

  if (Array.isArray(form.supportingDocuments) && form.supportingDocuments.length > 0 && !form.documentsConsent) {
    errors.documentsConsent = "Consent is required before attaching identity or supporting documents.";
  }

  if (!form.ageConfirmed) {
    errors.ageConfirmed = "Confirm that you meet the minimum age requirement.";
  }

  if (!form.privacyConsent) {
    errors.privacyConsent = "Accept the privacy policy to continue.";
  }

  if (!form.termsConsent) {
    errors.termsConsent = "Accept the terms and conditions to continue.";
  }

  return errors;
}

export function getRegistrationErrorCount(form: any): number {
  return Object.keys(validateRegistration(form)).length;
}
