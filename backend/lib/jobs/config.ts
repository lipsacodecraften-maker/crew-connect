export const JOB_STATUSES = ["draft", "open", "closed", "filled"] as const;

export const JOB_STATUS_META = {
  draft: {
    label: "Draft",
    tone: "muted",
    description: "Not visible to crew yet.",
  },
  open: {
    label: "Open",
    tone: "new",
    description: "Published on the public job board and accepting applications.",
  },
  closed: {
    label: "Closed",
    tone: "muted",
    description: "Hidden from the public board. Existing applications are kept.",
  },
  filled: {
    label: "Filled",
    tone: "success",
    description: "Enough crew has been selected for this listing.",
  },
} as const;

export const EXPERIENCE_REQUIREMENTS = ["Any", "Fresher", "Experienced"] as const;

export const EXPERIENCE_FILTERS = [
  { id: "any", label: "Any experience" },
  { id: "fresher", label: "Fresher friendly" },
  { id: "experienced", label: "Experienced required" },
] as const;

export const APPLICATION_STATUSES = [
  "submitted",
  "shortlisted",
  "selected",
  "not_selected",
  "withdrawn",
] as const;

export const APPLICATION_STATUS_META = {
  submitted: {
    label: "Application received",
    tone: "new",
    description:
      "Your application is with the staffing desk and waiting for a first review.",
  },
  shortlisted: {
    label: "Shortlisted",
    tone: "progress",
    description:
      "The desk is confirming availability and shift details for this role.",
  },
  selected: {
    label: "Selected",
    tone: "success",
    description:
      "You are confirmed for this role. Watch WhatsApp for the reporting briefing.",
  },
  not_selected: {
    label: "Not selected",
    tone: "muted",
    description:
      "This role was filled with another crew member. Other shifts may still match your profile.",
  },
  withdrawn: {
    label: "Withdrawn",
    tone: "muted",
    description: "This application was withdrawn.",
  },
} as const;

export const PAYMENT_RANGE_OPTIONS = [
  { id: "any", label: "Any payment", min: null, max: null },
  { id: "upto-1200", label: "Up to ₹1,200", min: null, max: 1200 },
  { id: "1200-1800", label: "₹1,200 – ₹1,800", min: 1200, max: 1800 },
  { id: "1800-2500", label: "₹1,800 – ₹2,500", min: 1800, max: 2500 },
  { id: "2500-plus", label: "₹2,500 and above", min: 2500, max: null },
] as const;

export const EVENT_DATE_WINDOWS = [
  { id: "any", label: "Any date", days: null },
  { id: "7", label: "Next 7 days", days: 7 },
  { id: "30", label: "Next 30 days", days: 30 },
  { id: "90", label: "Next 90 days", days: 90 },
] as const;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isClockTime(value: unknown): value is string {
  return typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysIso(days: number | string) {
  const date = new Date();
  date.setDate(date.getDate() + Number(days));
  return date.toISOString().slice(0, 10);
}

export function formatDate(dateString: string) {
  if (!isIsoDate(dateString)) return "Date to be confirmed";
  const [year, month, day] = dateString.split("-");
  return `${day} ${MONTHS[Number(month) - 1] || month} ${year}`;
}

export function dutyHoursBetween(start: string, end: string) {
  if (!isClockTime(start) || !isClockTime(end)) return null;

  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);

  let minutes = endHour * 60 + endMinute - (startHour * 60 + startMinute);
  if (minutes <= 0) minutes += 24 * 60;

  return Math.round((minutes / 60) * 10) / 10;
}

export function formatDutyWindow(start: string, end: string) {
  if (!isClockTime(start) || !isClockTime(end)) return "Shared before the shift";
  const hours = dutyHoursBetween(start, end);
  return `${start} – ${end}${hours ? ` · ${hours} hrs` : ""}`;
}

export function formatCurrency(value: unknown) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return "";
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

export function formatPaymentRange(paymentMin: unknown, paymentMax: unknown) {
  const min = Number(paymentMin) || 0;
  const max = Number(paymentMax) || 0;

  if (min > 0 && max > 0) {
    if (min === max) return `${formatCurrency(min)} per shift`;
    return `${formatCurrency(min)} – ${formatCurrency(max)}`;
  }
  if (min > 0) return `${formatCurrency(min)}+ per shift`;
  if (max > 0) return `Up to ${formatCurrency(max)}`;
  return "Confirmed at briefing";
}

export function formatOpenings(count: unknown) {
  const openings = Number(count) || 0;
  if (openings <= 0) return "No openings";
  return `${openings} opening${openings === 1 ? "" : "s"}`;
}
