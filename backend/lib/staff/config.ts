import {
  GUJARAT_CITIES,
  INDIAN_STATES,
  LANGUAGE_OPTIONS,
} from "@/lib/booking/config";

export const STAFF_STEPS = [
  {
    id: "personal",
    label: "Personal",
    title: "Personal information",
    blurb:
      "Your identity, contact details and base city. We verify your WhatsApp number before you submit.",
  },
  {
    id: "skills",
    label: "Skills",
    title: "Skills & work categories",
    blurb:
      "Choose every role you can credibly handle on an event floor. You can select more than one.",
  },
  {
    id: "experience",
    label: "Experience",
    title: "Experience & payment",
    blurb:
      "Tell us how much event work you have done and the shift rate you expect.",
  },
  {
    id: "availability",
    label: "Availability",
    title: "Availability & travel",
    blurb:
      "Share the cities, dates and shift windows that work for you so dispatch can match you well.",
  },
  {
    id: "verification",
    label: "Verification",
    title: "Verification & submission",
    blurb:
      "Review your dossier, attach any supporting documents you consent to share, and accept the policies.",
  },
] as const;

export const STAFF_SKILLS = [
  "Event Boy / Girl",
  "Wedding Hospitality",
  "Groom Side Assistant",
  "Bride Side Assistant",
  "Bouncer",
  "Security",
  "Exhibition Promoter",
  "Registration Staff",
  "Ticket Scanner",
  "Technician",
  "Event Supervisor",
  "Serving Staff",
  "Event Helper",
  "Other",
] as const;

export const EXPERIENCE_LEVELS = ["Fresher", "Experienced"] as const;

export const SHIFT_TYPES = [
  "Day Shift",
  "Night Shift",
  "Full-Day Work",
  "Part-Time Work",
] as const;

export const DOCUMENT_TYPES = [
  "Government photo ID (only if requested)",
  "Address proof",
  "Experience certificate",
  "Police verification",
  "Other supporting document",
] as const;

export const STAFF_CITIES = GUJARAT_CITIES;
export const STAFF_LANGUAGES = LANGUAGE_OPTIONS;
export const STAFF_STATES = INDIAN_STATES;

export const STAFF_REFERRAL_OPTIONS = [
  "WhatsApp group",
  "Friend or family",
  "Previous event",
  "Instagram / social media",
  "Walk-in / office",
  "Other",
] as const;

export const STAFF_STATUS_META = {
  pending_review: {
    label: "Pending review",
    tone: "new",
    description:
      "Your registration is in the verification queue. No shifts are confirmed yet.",
  },
  under_verification: {
    label: "Under verification",
    tone: "progress",
    description:
      "Our candidate desk is checking your details and supporting documents.",
  },
  approved: {
    label: "Approved",
    tone: "success",
    description:
      "Your profile is approved. Dispatch may contact you for suitable shifts.",
  },
  rejected: {
    label: "Not approved",
    tone: "muted",
    description:
      "This registration was not approved. Contact the candidate desk for details.",
  },
  on_hold: {
    label: "On hold",
    tone: "progress",
    description:
      "The candidate desk needs more information before a decision can be made.",
  },
} as const;

export const STAFF_STATUS_ORDER = [
  "pending_review",
  "under_verification",
  "approved",
  "rejected",
  "on_hold",
] as const;

export const MINIMUM_AGE = 18;
export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_SUPPORTING_DOCUMENTS = 3;

export const PHOTO_EXTENSIONS = ["jpg", "jpeg", "png", "webp"] as const;
export const PHOTO_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const RESUME_EXTENSIONS = ["pdf", "doc", "docx"] as const;
export const RESUME_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const DOCUMENT_EXTENSIONS = ["pdf", "jpg", "jpeg", "png", "webp"] as const;
export const DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

const AVATAR_FALLBACK =
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=60";

export function createInitialRegistration() {
  return {
    fullName: "",
    mobileNumber: "",
    whatsappVerified: false,
    whatsappVerificationToken: "",
    emailAddress: "",
    dateOfBirth: "",
    currentCity: "",
    areaPincode: "",
    languages: [] as string[],
    profilePhoto: null as any,

    skills: [] as string[],
    otherSkill: "",

    experienceLevel: "",
    yearsOfExperience: "",
    previousEvents: "",
    expectedPayment: "",
    resume: null as any,

    preferredCities: [] as string[],
    availableFrom: "",
    availableUntil: "",
    shiftTypes: [] as string[],
    willingToTravel: "",
    transportAvailable: "",

    supportingDocuments: [] as any[],
    documentsConsent: false,
    privacyConsent: false,
    termsConsent: false,
    ageConfirmed: false,
  };
}

export function formatDate(dateString?: string | null) {
  if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return "—";
  const [year, month, day] = dateString.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${day} ${months[Number(month) - 1] || month} ${year}`;
}

export function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day} ${months[date.getMonth()]} ${date.getFullYear()}, ${hours}:${minutes}`;
}

export function formatFileSize(bytes?: number | string | null) {
  const size = Number(bytes);
  if (!Number.isFinite(size) || size <= 0) return "";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function calculateAge(dateString?: string | null) {
  if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return null;
  const [year, month, day] = dateString.split("-").map(Number);
  const today = new Date();
  let age = today.getFullYear() - year;
  const monthDifference = today.getMonth() + 1 - month;
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < day)) {
    age -= 1;
  }
  return age;
}

export function normalizePhoneNumber(value?: string | null) {
  let digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length !== 10 || !/^[6-9]/.test(digits)) return "";
  return `+91${digits}`;
}

export function formatPhoneNumber(value?: string | null) {
  const normalized = normalizePhoneNumber(value);
  if (!normalized) return value || "—";
  return `+91 ${normalized.slice(3, 8)} ${normalized.slice(8)}`;
}

export function getInitials(name?: string | null) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "CC";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export { AVATAR_FALLBACK };
