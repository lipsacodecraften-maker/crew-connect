
import {
  ALLOWED_FILE_EXTENSIONS,
  BOOKING_STEPS,
  COMPANY_TYPES,
  EVENT_TYPES,
  EXPERIENCE_OPTIONS,
  GENDER_PREFERENCES,
  INDIAN_STATES,
  LANGUAGE_OPTIONS,
  MAX_FILE_BYTES,
  UNIFORM_OPTIONS,
} from "./config";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

const FIELD_STEPS: Record<string, string> = {
  clientCompanyName: "contact",
  contactPerson: "contact",
  mobileNumber: "contact",
  whatsappNumber: "contact",
  emailAddress: "contact",
  companyType: "contact",

  eventName: "event",
  eventType: "event",
  eventCity: "event",
  state: "event",
  eventStartDate: "event",
  eventEndDate: "event",
  guestCount: "event",
  budgetPerPerson: "event",

  venueAddress: "logistics",
  mapsLocation: "logistics",
  reportingTime: "logistics",
  dutyStartTime: "logistics",
  dutyEndTime: "logistics",
  foodProvided: "logistics",
  transportProvided: "logistics",
  accommodationProvided: "logistics",
  dressCode: "logistics",
  languageRequirements: "logistics",
  referenceFile: "logistics",
  additionalNotes: "logistics",
  urgent: "logistics",

  staffingRoles: "staffing",
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function hasValue(value: unknown): boolean {
  if (typeof value === "string") return value.trim().length > 0;
  if (value === null || value === undefined) return false;
  return true;
}

function isDate(value: unknown): boolean {
  const candidate = text(value);

  if (!DATE_PATTERN.test(candidate)) return false;

  const [year, month, day] = candidate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isTime(value: unknown): boolean {
  return TIME_PATTERN.test(text(value));
}

function isPhone(value: unknown): boolean {
  const digits = text(value).replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

function isEmail(value: unknown): boolean {
  const email = text(value);
  return email.length <= 254 && EMAIL_PATTERN.test(email);
}

function isHttpUrl(value: unknown): boolean {
  const candidate = text(value);

  if (!candidate) return true;

  try {
    const url = new URL(candidate);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function getLocalToday(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60 * 1000;

  return new Date(now.getTime() - offset)
    .toISOString()
    .slice(0, 10);
}

function isYesNo(value: unknown): boolean {
  return (
    value === true ||
    value === false ||
    value === "yes" ||
    value === "no"
  );
}

// ============================================
// REFERENCE FILE VALIDATION
// ============================================

export function validateReferenceFile(file: any) {
  if (!file) return null;

  const size = Number(file.size);
  const name = text(file.name).toLowerCase();

  if (Number.isFinite(size) && size > MAX_FILE_BYTES) {
    return "Reference file must be 5 MB or smaller.";
  }

  if (Number.isFinite(size) && size === 0) {
    return "The selected file is empty. Choose another file.";
  }

  const extension = name.includes(".")
    ? name.split(".").pop()
    : "";

  if (!ALLOWED_FILE_EXTENSIONS.includes(extension as any)) {
    return "Upload a PDF, DOC, DOCX, JPG, PNG or WEBP file.";
  }

  return null;
}

// ============================================
// STEP 1: CLIENT & CONTACT
// ============================================

export function validateContact(data: any) {
  const errors: Record<string, string> = {};

  // Required: Client / company name
  if (!hasValue(data.clientCompanyName)) {
    errors.clientCompanyName = "Enter your client or company name.";
  } else if (text(data.clientCompanyName).length < 2) {
    errors.clientCompanyName = "Client name must be at least 2 characters.";
  } else if (text(data.clientCompanyName).length > 120) {
    errors.clientCompanyName = "Client name must be 120 characters or fewer.";
  }

  // Required: Contact person
  if (!hasValue(data.contactPerson)) {
    errors.contactPerson = "Enter the contact person's name.";
  } else if (text(data.contactPerson).length < 2) {
    errors.contactPerson = "Contact name must be at least 2 characters.";
  } else if (text(data.contactPerson).length > 80) {
    errors.contactPerson = "Contact name must be 80 characters or fewer.";
  }

  // Required: Mobile number
  if (!hasValue(data.mobileNumber)) {
    errors.mobileNumber = "Enter a mobile number.";
  } else if (!isPhone(data.mobileNumber)) {
    errors.mobileNumber = "Enter a valid mobile number (10–15 digits).";
  }

  // Optional: WhatsApp number
  if (hasValue(data.whatsappNumber) && !isPhone(data.whatsappNumber)) {
    errors.whatsappNumber = "Enter a valid WhatsApp number (10–15 digits).";
  }

  // Optional: Email address
  if (hasValue(data.emailAddress) && !isEmail(data.emailAddress)) {
    errors.emailAddress = "Enter a valid email address.";
  }

  // Optional: Company type
  if (
    hasValue(data.companyType) &&
    !COMPANY_TYPES.includes(text(data.companyType) as any)
  ) {
    errors.companyType = "Select a valid company type.";
  }

  return errors;
}

// ============================================
// STEP 2: EVENT DETAILS
// ============================================

export function validateEvent(data: any) {
  const errors: Record<string, string> = {};
  const today = getLocalToday();

  // Required: Event name
  if (!hasValue(data.eventName)) {
    errors.eventName = "Enter the event name.";
  } else if (text(data.eventName).length < 3) {
    errors.eventName = "Event name must be at least 3 characters.";
  } else if (text(data.eventName).length > 150) {
    errors.eventName = "Event name must be 150 characters or fewer.";
  }

  // Required: Event type
  if (!hasValue(data.eventType)) {
    errors.eventType = "Select an event type.";
  } else if (!EVENT_TYPES.includes(text(data.eventType) as any)) {
    errors.eventType = "Select a valid event type.";
  }

  // Required: Event city
  if (!hasValue(data.eventCity)) {
    errors.eventCity = "Enter the event city.";
  } else if (text(data.eventCity).length < 2) {
    errors.eventCity = "Event city must be at least 2 characters.";
  } else if (text(data.eventCity).length > 80) {
    errors.eventCity = "Event city must be 80 characters or fewer.";
  }

  // Required: State
  if (!hasValue(data.state)) {
    errors.state = "Select the state.";
  } else if (!INDIAN_STATES.includes(text(data.state) as any)) {
    errors.state = "Select a valid Indian state.";
  }

  // Required: Event start date
  if (!hasValue(data.eventStartDate)) {
    errors.eventStartDate = "Select the event start date.";
  } else if (!isDate(data.eventStartDate)) {
    errors.eventStartDate = "Enter a valid start date.";
  } else if (text(data.eventStartDate) < today) {
    errors.eventStartDate = "The event start date cannot be in the past.";
  }

  // Required: Event end date
  if (!hasValue(data.eventEndDate)) {
    errors.eventEndDate = "Select the event end date.";
  } else if (!isDate(data.eventEndDate)) {
    errors.eventEndDate = "Enter a valid end date.";
  } else if (
    isDate(data.eventStartDate) &&
    text(data.eventEndDate) < text(data.eventStartDate)
  ) {
    errors.eventEndDate = "The end date cannot be before the start date.";
  }

  // Optional: Expected guest count
  if (hasValue(data.guestCount)) {
    const guestCount = Number(data.guestCount);

    if (!Number.isInteger(guestCount) || guestCount < 1) {
      errors.guestCount = "Guest count must be a whole number of at least 1.";
    } else if (guestCount > 1000000) {
      errors.guestCount = "Guest count looks too high. Contact the desk directly.";
    }
  }

  // Optional: Budget per person / shift
  if (hasValue(data.budgetPerPerson)) {
    const budget = Number(data.budgetPerPerson);

    if (!Number.isFinite(budget) || budget <= 0) {
      errors.budgetPerPerson = "Budget must be greater than zero.";
    } else if (budget > 1000000) {
      errors.budgetPerPerson = "Budget looks too high. Contact the desk directly.";
    }
  }

  return errors;
}

// ============================================
// STEP 3: VENUE & LOGISTICS
// ============================================

export function validateLogistics(data: any) {
  const errors: Record<string, string> = {};

  // Required: Full venue address
  if (!hasValue(data.venueAddress)) {
    errors.venueAddress = "Enter the full venue address.";
  } else if (text(data.venueAddress).length < 5) {
    errors.venueAddress = "Venue address must be at least 5 characters.";
  } else if (text(data.venueAddress).length > 600) {
    errors.venueAddress = "Venue address must be 600 characters or fewer.";
  }

  // Optional: Google Maps location
  if (hasValue(data.mapsLocation) && !isHttpUrl(data.mapsLocation)) {
    errors.mapsLocation = "Enter a valid Google Maps link starting with http(s).";
  } else if (text(data.mapsLocation).length > 500) {
    errors.mapsLocation = "Maps link must be 500 characters or fewer.";
  }

  // Required: Staff reporting time
  if (!hasValue(data.reportingTime)) {
    errors.reportingTime = "Select the staff reporting time.";
  } else if (!isTime(data.reportingTime)) {
    errors.reportingTime = "Enter a valid reporting time.";
  }

  // Required: Duty start time
  if (!hasValue(data.dutyStartTime)) {
    errors.dutyStartTime = "Select the duty start time.";
  } else if (!isTime(data.dutyStartTime)) {
    errors.dutyStartTime = "Enter a valid duty start time.";
  }

  // Required: Duty end time
  if (!hasValue(data.dutyEndTime)) {
    errors.dutyEndTime = "Select the duty end time.";
  } else if (!isTime(data.dutyEndTime)) {
    errors.dutyEndTime = "Enter a valid duty end time.";
  }

  // Optional: Food, transport and accommodation
  const optionalYesNoFields = [
    "foodProvided",
    "transportProvided",
    "accommodationProvided",
  ] as const;

  for (const field of optionalYesNoFields) {
    const value = data[field];

    if (hasValue(value) && !isYesNo(value)) {
      errors[field] = "Select Yes or No.";
    }
  }

  // Optional: Dress code
  if (
    hasValue(data.dressCode) &&
    text(data.dressCode).length > 200
  ) {
    errors.dressCode = "Dress code must be 200 characters or fewer.";
  }

  // Optional: Language requirements
  const languages = Array.isArray(data.languageRequirements)
    ? data.languageRequirements
    : [];

  if (
    languages.length > 0 &&
    languages.some(
      (language: any) =>
        !LANGUAGE_OPTIONS.includes(text(language) as any)
    )
  ) {
    errors.languageRequirements = "Select valid language requirements.";
  }

  // Optional: Additional notes
  if (text(data.additionalNotes).length > 2000) {
    errors.additionalNotes = "Additional notes must be 2,000 characters or fewer.";
  }

  // Optional: Reference file
  const fileError = validateReferenceFile(data.referenceFile);

  if (fileError) {
    errors.referenceFile = fileError;
  }

  // Urgent requirement is optional.
  // No validation needed.

  return errors;
}

// ============================================
// STEP 4: STAFFING REQUIREMENTS
// ============================================

export function validateStaffing(data: any) {
  const errors: Record<string, string> = {};

  const roles = Array.isArray(data.staffingRoles)
    ? data.staffingRoles
    : [];

  if (roles.length === 0) {
    errors.staffingRoles = "Add at least one staffing role.";
    return errors;
  }

  let totalStaff = 0;

  roles.forEach((role: any, index: number) => {
    const prefix = `staffingRoles.${index}`;
    const roleName = text(role.staffRole);

    // Required: Staff role
    if (!roleName) {
      errors[`${prefix}.staffRole`] = "Enter the staff role.";
    } else if (roleName.length < 2) {
      errors[`${prefix}.staffRole`] = "Role name must be at least 2 characters.";
    } else if (roleName.length > 100) {
      errors[`${prefix}.staffRole`] = "Role name must be 100 characters or fewer.";
    }

    // Optional: Gender preference
    if (
      hasValue(role.genderPreference) &&
      !GENDER_PREFERENCES.includes(text(role.genderPreference) as any)
    ) {
      errors[`${prefix}.genderPreference`] = "Select a valid gender preference.";
    }

    // Required: Quantity
    if (!hasValue(role.quantity)) {
      errors[`${prefix}.quantity`] = "Enter the quantity required.";
    } else {
      const quantity = Number(role.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        errors[`${prefix}.quantity`] = "Quantity must be a whole number of at least 1.";
      } else if (quantity > 500) {
        errors[`${prefix}.quantity`] = "Maximum 500 staff per role. Split larger teams.";
      } else {
        totalStaff += quantity;
      }
    }

    // Required: Work date
    if (!hasValue(role.workDate)) {
      errors[`${prefix}.workDate`] = "Select the work date.";
    } else if (!isDate(role.workDate)) {
      errors[`${prefix}.workDate`] = "Enter a valid work date.";
    } else {
      if (
        isDate(data.eventStartDate) &&
        text(role.workDate) < text(data.eventStartDate)
      ) {
        errors[`${prefix}.workDate`] = "Work date cannot be before the event start date.";
      } else if (
        isDate(data.eventEndDate) &&
        text(role.workDate) > text(data.eventEndDate)
      ) {
        errors[`${prefix}.workDate`] = "Work date cannot be after the event end date.";
      }
    }

    // Required: Reporting time
    if (!hasValue(role.reportingTime)) {
      errors[`${prefix}.reportingTime`] = "Select the reporting time.";
    } else if (!isTime(role.reportingTime)) {
      errors[`${prefix}.reportingTime`] = "Enter a valid reporting time.";
    }

    // Required: Shift duration
    if (!hasValue(role.shiftDuration)) {
      errors[`${prefix}.shiftDuration`] = "Enter the shift duration.";
    } else {
      const duration = Number(role.shiftDuration);

      if (!Number.isFinite(duration) || duration < 0.5 || duration > 24) {
        errors[`${prefix}.shiftDuration`] = "Shift duration must be between 0.5 and 24 hours.";
      }
    }

    // Optional: Experience requirement
    if (
      hasValue(role.experienceRequirement) &&
      !EXPERIENCE_OPTIONS.includes(text(role.experienceRequirement) as any)
    ) {
      errors[`${prefix}.experienceRequirement`] = "Select a valid experience requirement.";
    }

    // Optional: Uniform requirement
    if (
      hasValue(role.uniformRequirement) &&
      !UNIFORM_OPTIONS.includes(text(role.uniformRequirement) as any)
    ) {
      errors[`${prefix}.uniformRequirement`] = "Select a valid uniform requirement.";
    }

    // Optional: Special instructions
    if (text(role.specialInstructions).length > 500) {
      errors[`${prefix}.specialInstructions`] = "Special instructions must be 500 characters or fewer.";
    }
  });

  if (totalStaff > 5000) {
    errors.staffingRoles = "Total requested staff cannot exceed 5,000 for a single request.";
  }

  return errors;
}

// ============================================
// STEP VALIDATION
// ============================================

export function validateStep(stepId: string, data: any) {
  if (stepId === "contact") return validateContact(data);
  if (stepId === "event") return validateEvent(data);
  if (stepId === "logistics") return validateLogistics(data);
  if (stepId === "staffing") return validateStaffing(data);

  return validateBooking(data);
}

// ============================================
// COMPLETE BOOKING VALIDATION
// ============================================

export function validateBooking(data: any) {
  return {
    ...validateContact(data),
    ...validateEvent(data),
    ...validateLogistics(data),
    ...validateStaffing(data),
  };
}

// ============================================
// ERROR HELPERS
// ============================================

export function stepForField(field: string) {
  if (!field) return "review";

  if (field.startsWith("staffingRoles")) {
    return "staffing";
  }

  return FIELD_STEPS[field] || "review";
}

export function firstErrorStep(errors: Record<string, string>) {
  const steps = BOOKING_STEPS.map((step) => step.id);

  const affected = new Set(
    Object.keys(errors).map((field) => stepForField(field))
  );

  return steps.find((step) => affected.has(step)) || "review";
}

export function countStepErrors(
  errors: Record<string, string>,
  stepId: string
) {
  return Object.keys(errors).filter(
    (field) => stepForField(field) === stepId
  ).length;
}

export function getTotalStaff(roles: any[]) {
  if (!Array.isArray(roles)) return 0;

  return roles.reduce((total, role) => {
    const quantity = Number(role.quantity);

    return total + (
      Number.isFinite(quantity) && quantity > 0
        ? quantity
        : 0
    );
  }, 0);
}
