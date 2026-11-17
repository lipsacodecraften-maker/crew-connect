export const BOOKING_STEPS = [
  {
    id: "contact",
    label: "Client",
    title: "Client & contact",
    blurb:
      "Who is booking the crew, and where should our dispatch desk reach you?",
  },
  {
    id: "event",
    label: "Event",
    title: "Event & schedule",
    blurb:
      "Give us the event headline, location and dates so we can map the right local crew.",
  },
  {
    id: "logistics",
    label: "Venue",
    title: "Venue & provisions",
    blurb:
      "Share the venue, duty hours and on-ground provisions your team will receive.",
  },
  {
    id: "staffing",
    label: "Roles",
    title: "Staffing requirements",
    blurb:
      "Add every role you need. Each role can have its own date, shift and headcount.",
  },
  {
    id: "review",
    label: "Review",
    title: "Review & submit",
    blurb:
      "Check the full booking brief, edit anything that needs changing, then send it to our desk.",
  },
] as const;

export const COMPANY_TYPES = [
  "Event agency",
  "Corporate / Enterprise",
  "Wedding planner",
  "Hospitality group",
  "Government / PSU",
  "Educational institution",
  "Individual / Family",
  "Other",
] as const;

export const EVENT_TYPES = [
  "Wedding",
  "Reception",
  "Corporate conference",
  "Exhibition / Expo",
  "Product launch",
  "Concert / Live show",
  "College festival",
  "Sports event",
  "Religious / Cultural event",
  "Private party",
  "Other",
] as const;

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const;

export const GUJARAT_CITIES = [
  "Ahmedabad",
  "Gandhinagar",
  "Vadodara",
  "Surat",
  "Rajkot",
  "Bhavnagar",
  "Jamnagar",
  "Junagadh",
  "Anand",
  "Nadiad",
  "Mehsana",
  "Palanpur",
  "Bhuj",
  "Morbi",
  "Navsari",
  "Vapi",
  "Valsad",
  "Bharuch",
  "Porbandar",
  "Veraval",
  "Dwarka",
  "Statue of Unity / Kevadia",
] as const;

export const LANGUAGE_OPTIONS = [
  "Gujarati",
  "Hindi",
  "English",
  "Marathi",
  "Sindhi",
  "Kutchi",
  "Other",
] as const;

export const GENDER_PREFERENCES = [
  "No preference",
  "Male",
  "Female",
  "Other",
] as const;

export const EXPERIENCE_OPTIONS = [
  "Any experience",
  "6 months+",
  "1+ year",
  "2+ years",
  "5+ years",
  "Supervisor experience",
] as const;

export const UNIFORM_OPTIONS = [
  "Standard black attire",
  "Formal corporate",
  "Traditional Indian",
  "Event-branded t-shirt",
  "Security uniform",
  "Custom (see instructions)",
] as const;

export const STAFF_ROLE_SUGGESTIONS = [
  "Groom Side Assistant",
  "Guest Welcome Executive",
  "Bouncer",
  "Technical Supervisor",
  "Event Steward",
  "Registration Executive",
  "Hospitality Host",
  "Stage Manager",
  "Production Crew",
  "Parking Marshal",
  "Housekeeping Crew",
  "Crowd Manager",
] as const;

export const QUICK_ROLES = [
  "Groom Side Assistant",
  "Guest Welcome Executive",
  "Bouncer",
  "Technical Supervisor",
] as const;

export const STATUS_META = {
  received: {
    label: "Request received",
    tone: "new",
    description: "Your brief is safely in the booking desk queue.",
  },
  under_review: {
    label: "Under review",
    tone: "progress",
    description: "Our staffing desk is checking availability and commercials.",
  },
  staffing: {
    label: "Staffing in progress",
    tone: "progress",
    description: "Crew is being assigned and briefed for your event.",
  },
  confirmed: {
    label: "Confirmed",
    tone: "success",
    description: "The roster is confirmed. Your coordinator will stay in touch.",
  },
  completed: {
    label: "Completed",
    tone: "success",
    description: "The engagement is complete. Thank you for booking with us.",
  },
  cancelled: {
    label: "Cancelled",
    tone: "muted",
    description: "This request has been cancelled. Contact the desk for help.",
  },
} as const;

export const STATUS_ORDER = [
  "received",
  "under_review",
  "staffing",
  "confirmed",
  "completed",
] as const;

export const MAX_FILE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_FILE_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "jpg",
  "jpeg",
  "png",
  "webp",
] as const;

export const ALLOWED_FILE_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

let roleCounter = 0;

export function createStaffRole(overrides: Record<string, any> = {}) {
  roleCounter += 1;

  const id =
    typeof globalThis.crypto?.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : `role-${Date.now()}-${roleCounter}`;

  return {
    id,
    staffRole: "",
    genderPreference: "No preference",
    quantity: "",
    workDate: "",
    reportingTime: "",
    shiftDuration: "",
    experienceRequirement: "Any experience",
    uniformRequirement: "Standard black attire",
    specialInstructions: "",
    ...overrides,
  };
}

export function createInitialBooking() {
  return {
    clientCompanyName: "",
    contactPerson: "",
    mobileNumber: "",
    whatsappNumber: "",
    emailAddress: "",
    companyType: "",

    eventName: "",
    eventType: "",
    eventCity: "",
    state: "Gujarat",
    eventStartDate: "",
    eventEndDate: "",
    guestCount: "",
    budgetPerPerson: "",

    venueAddress: "",
    mapsLocation: "",
    reportingTime: "",
    dutyStartTime: "",
    dutyEndTime: "",
    foodProvided: "",
    transportProvided: "",
    accommodationProvided: "",
    dressCode: "",
    languageRequirements: [] as string[],
    referenceFile: null as any,
    additionalNotes: "",
    urgent: false,

    staffingRoles: [createStaffRole()],
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

export function formatTime(timeString?: string | null) {
  if (!timeString || !/^\d{2}:\d{2}$/.test(timeString)) return "—";
  const [hours, minutes] = timeString.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

export function formatQuantity(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? String(number) : "0";
}

export function formatCurrency(value: unknown) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return "—";
  return `₹${number.toLocaleString("en-IN")}`;
}

export function formatFileSize(bytes?: number | string | null) {
  const size = Number(bytes);
  if (!Number.isFinite(size) || size <= 0) return "";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
