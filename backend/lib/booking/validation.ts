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

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function hasValue(value: unknown) {
  return typeof value === "string"
    ? value.trim().length > 0
    : value !== null && value !== undefined;
}

function isDate(value: unknown) {
  if (!DATE_PATTERN.test(text(value))) return false;
  const date = new Date(`${text(value)}T00:00:00`);
  return !Number.isNaN(date.getTime());
}

function isTime(value: unknown) {
  return TIME_PATTERN.test(text(value));
}

function isPhone(value: unknown) {
  const digits = text(value).replace(/\D/g, "");
  return digits.length === 10;
}

function isEmail(value: unknown) {
  return EMAIL_PATTERN.test(text(value)) && text(value).length <= 254;
}

function isHttpUrl(value: unknown) {
  const candidate = text(value);
  if (!candidate) return true;
  try {
    const url = new URL(candidate);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function getLocalToday() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function isYesNo(value: unknown) {
  return value === true || value === false || value === "yes" || value === "no";
}

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

  const extension = name.includes(".") ? name.split(".").pop() : "";
  if (!ALLOWED_FILE_EXTENSIONS.includes(extension as any)) {
    return "Upload a PDF, DOC, DOCX, JPG, PNG or WEBP file.";
  }

  return null;
}

export function validateContact(data: any) {
  const errors: Record<string, string> = {};

  if (!hasValue(data.clientCompanyName)) {
    errors.clientCompanyName = "Enter your client or company name.";
  } else if (text(data.clientCompanyName).length < 2) {
    errors.clientCompanyName = "Client name must be at least 2 characters.";
  } else if (text(data.clientCompanyName).length > 120) {
    errors.clientCompanyName = "Client name must be 120 characters or fewer.";
  }

  if (!hasValue(data.contactPerson)) {
    errors.contactPerson = "Enter the contact person's name.";
  } else if (text(data.contactPerson).length < 2) {
    errors.contactPerson = "Contact name must be at least 2 characters.";
  } else if (text(data.contactPerson).length > 80) {
    errors.contactPerson = "Contact name must be 80 characters or fewer.";
  } else if (!/^[A-Za-z ]+$/.test(text(data.contactPerson))) {
    errors.contactPerson = "Name can contain only letters and spaces.";
  }

  if (!hasValue(data.mobileNumber)) {
    errors.mobileNumber = "Enter a mobile number.";
  } else if (!isPhone(data.mobileNumber)) {
    errors.mobileNumber = "Enter a valid mobile number (10–15 digits).";
  }

  if (!hasValue(data.whatsappNumber)) {
    errors.whatsappNumber = "Enter a WhatsApp number.";
  } else if (!isPhone(data.whatsappNumber)) {
    errors.whatsappNumber = "Enter a valid WhatsApp number (10–15 digits).";
  }

  if (!hasValue(data.emailAddress)) {
    errors.emailAddress = "Enter an email address.";
  } else if (!isEmail(data.emailAddress)) {
    errors.emailAddress = "Enter a valid email address.";
  }

  if (!hasValue(data.companyType)) {
    errors.companyType = "Select your company type.";
  } else if (!COMPANY_TYPES.includes(text(data.companyType) as any)) {
    errors.companyType = "Select a valid company type.";
  }

  return errors;
}

export function validateEvent(data: any) {
  const errors: Record<string, string> = {};
  const today = getLocalToday();

  if (!hasValue(data.eventName)) {
    errors.eventName = "Enter the event name.";
  } else if (text(data.eventName).length < 3) {
    errors.eventName = "Event name must be at least 3 characters.";
  } else if (text(data.eventName).length > 150) {
    errors.eventName = "Event name must be 150 characters or fewer.";
  }

  if (!hasValue(data.eventType)) {
    errors.eventType = "Select an event type.";
  } else if (!EVENT_TYPES.includes(text(data.eventType) as any)) {
    errors.eventType = "Select a valid event type.";
  }

  if (!hasValue(data.eventCity)) {
    errors.eventCity = "Enter the event city.";
  } else if (text(data.eventCity).length < 2) {
    errors.eventCity = "Event city must be at least 2 characters.";
  } else if (text(data.eventCity).length > 80) {
    errors.eventCity = "Event city must be 80 characters or fewer.";
  }

  if (!hasValue(data.state)) {
    errors.state = "Select the state.";
  } else if (!INDIAN_STATES.includes(text(data.state) as any)) {
    errors.state = "Select a valid Indian state.";
  }

  if (!hasValue(data.eventStartDate)) {
    errors.eventStartDate = "Select the event start date.";
  } else if (!isDate(data.eventStartDate)) {
    errors.eventStartDate = "Enter a valid start date.";
  } else if (text(data.eventStartDate) < today) {
    errors.eventStartDate = "The event start date cannot be in the past.";
  }

  if (!hasValue(data.eventEndDate)) {
    errors.eventEndDate = "Select the event end date.";
  } else if (!isDate(data.eventEndDate)) {
    errors.eventEndDate = "Enter a valid end date.";
  } else if (isDate(data.eventStartDate) && text(data.eventEndDate) < text(data.eventStartDate)) {
    errors.eventEndDate = "The end date cannot be before the start date.";
  }

  const guestCount = Number(data.guestCount);
  if (!hasValue(data.guestCount)) {
    errors.guestCount = "Enter the expected guest count.";
  } else if (!Number.isInteger(guestCount) || guestCount < 1) {
    errors.guestCount = "Guest count must be a whole number of at least 1.";
  } else if (guestCount > 1000000) {
    errors.guestCount = "Guest count looks too high. Contact the desk directly.";
  }

  const budget = Number(data.budgetPerPerson);
  if (!hasValue(data.budgetPerPerson)) {
    errors.budgetPerPerson = "Enter the budget per person / per shift.";
  } else if (!Number.isFinite(budget) || budget <= 0) {
    errors.budgetPerPerson = "Budget must be greater than zero.";
  } else if (budget > 1000000) {
    errors.budgetPerPerson = "Budget looks too high. Contact the desk directly.";
  }

  return errors;
}

export function validateLogistics(data: any) {
  const errors: Record<string, string> = {};

  if (!hasValue(data.venueAddress)) {
    errors.venueAddress = "Enter the full venue address.";
  } else if (text(data.venueAddress).length < 5) {
    errors.venueAddress = "Venue address must be at least 5 characters.";
  } else if (text(data.venueAddress).length > 600) {
    errors.venueAddress = "Venue address must be 600 characters or fewer.";
  }

  if (text(data.mapsLocation) && !isHttpUrl(data.mapsLocation)) {
    errors.mapsLocation = "Enter a valid Google Maps link starting with http(s).";
  } else if (text(data.mapsLocation).length > 500) {
    errors.mapsLocation = "Maps link must be 500 characters or fewer.";
  }

  if (!hasValue(data.reportingTime)) {
    errors.reportingTime = "Select the staff reporting time.";
  } else if (!isTime(data.reportingTime)) {
    errors.reportingTime = "Enter a valid reporting time.";
  }

  if (!hasValue(data.dutyStartTime)) {
    errors.dutyStartTime = "Select the duty start time.";
  } else if (!isTime(data.dutyStartTime)) {
    errors.dutyStartTime = "Enter a valid duty start time.";
  }

  if (!hasValue(data.dutyEndTime)) {
    errors.dutyEndTime = "Select the duty end time.";
  } else if (!isTime(data.dutyEndTime)) {
    errors.dutyEndTime = "Enter a valid duty end time.";
  }

  for (const field of ["foodProvided", "transportProvided", "accommodationProvided"] as const) {
    if (!hasValue((data as any)[field])) {
      const label = field === "foodProvided" ? "food" : field === "transportProvided" ? "transport" : "accommodation";
      errors[field] = `Select whether ${label} is provided.`;
    } else if (!isYesNo((data as any)[field])) {
      errors[field] = "Select Yes or No.";
    }
  }

  if (!hasValue(data.dressCode)) {
    errors.dressCode = "Enter the dress code for the crew.";
  } else if (text(data.dressCode).length > 200) {
    errors.dressCode = "Dress code must be 200 characters or fewer.";
  }

  const languages = Array.isArray(data.languageRequirements) ? data.languageRequirements : [];
  if (languages.length === 0) {
    errors.languageRequirements = "Select at least one language requirement.";
  } else if (languages.some((language: any) => !LANGUAGE_OPTIONS.includes(text(language) as any))) {
    errors.languageRequirements = "Select valid language requirements.";
  }

  if (text(data.additionalNotes).length > 2000) {
    errors.additionalNotes = "Additional notes must be 2,000 characters or fewer.";
  }

  const fileError = validateReferenceFile(data.referenceFile);
  if (fileError) errors.referenceFile = fileError;

  return errors;
}

export function validateStaffing(data: any) {
  const errors: Record<string, string> = {};
  const roles = Array.isArray(data.staffingRoles) ? data.staffingRoles : [];

  if (roles.length === 0) {
    errors.staffingRoles = "Add at least one staffing role.";
    return errors;
  }

  let totalStaff = 0;

  roles.forEach((role: any, index: number) => {
    const prefix = `staffingRoles.${index}`;
    const roleName = text(role.staffRole);

    if (!roleName) {
      errors[`${prefix}.staffRole`] = "Enter the staff role.";
    } else if (roleName.length < 2) {
      errors[`${prefix}.staffRole`] = "Role name must be at least 2 characters.";
    } else if (roleName.length > 100) {
      errors[`${prefix}.staffRole`] = "Role name must be 100 characters or fewer.";
    }

    if (!hasValue(role.genderPreference)) {
      errors[`${prefix}.genderPreference`] = "Select a gender preference.";
    } else if (!GENDER_PREFERENCES.includes(text(role.genderPreference) as any)) {
      errors[`${prefix}.genderPreference`] = "Select a valid gender preference.";
    }

    const quantity = Number(role.quantity);
    if (!hasValue(role.quantity)) {
      errors[`${prefix}.quantity`] = "Enter the quantity required.";
    } else if (!Number.isInteger(quantity) || quantity < 1) {
      errors[`${prefix}.quantity`] = "Quantity must be a whole number of at least 1.";
    } else if (quantity > 500) {
      errors[`${prefix}.quantity`] = "Maximum 500 staff per role. Split larger teams.";
    } else {
      totalStaff += quantity;
    }

    if (!hasValue(role.workDate)) {
      errors[`${prefix}.workDate`] = "Select the work date.";
    } else if (!isDate(role.workDate)) {
      errors[`${prefix}.workDate`] = "Enter a valid work date.";
    } else {
      if (isDate(data.eventStartDate) && text(role.workDate) < text(data.eventStartDate)) {
        errors[`${prefix}.workDate`] = "Work date cannot be before the event start date.";
      } else if (isDate(data.eventEndDate) && text(role.workDate) > text(data.eventEndDate)) {
        errors[`${prefix}.workDate`] = "Work date cannot be after the event end date.";
      }
    }

    if (!hasValue(role.reportingTime)) {
      errors[`${prefix}.reportingTime`] = "Select the reporting time.";
    } else if (!isTime(role.reportingTime)) {
      errors[`${prefix}.reportingTime`] = "Enter a valid reporting time.";
    }

    const duration = Number(role.shiftDuration);
    if (!hasValue(role.shiftDuration)) {
      errors[`${prefix}.shiftDuration`] = "Enter the shift duration.";
    } else if (!Number.isFinite(duration) || duration < 0.5 || duration > 24) {
      errors[`${prefix}.shiftDuration`] = "Shift duration must be between 0.5 and 24 hours.";
    }

    if (!hasValue(role.experienceRequirement)) {
      errors[`${prefix}.experienceRequirement`] = "Select the experience requirement.";
    } else if (!EXPERIENCE_OPTIONS.includes(text(role.experienceRequirement) as any)) {
      errors[`${prefix}.experienceRequirement`] = "Select a valid experience requirement.";
    }

    if (!hasValue(role.uniformRequirement)) {
      errors[`${prefix}.uniformRequirement`] = "Select the uniform requirement.";
    } else if (!UNIFORM_OPTIONS.includes(text(role.uniformRequirement) as any)) {
      errors[`${prefix}.uniformRequirement`] = "Select a valid uniform requirement.";
    }

    if (text(role.specialInstructions).length > 500) {
      errors[`${prefix}.specialInstructions`] = "Special instructions must be 500 characters or fewer.";
    }
  });

  if (totalStaff > 5000) {
    errors.staffingRoles = "Total requested staff cannot exceed 5,000 for a single request.";
  }

  return errors;
}

export function validateStep(stepId: string, data: any) {
  if (stepId === "contact") return validateContact(data);
  if (stepId === "event") return validateEvent(data);
  if (stepId === "logistics") return validateLogistics(data);
  if (stepId === "staffing") return validateStaffing(data);
  return validateBooking(data);
}

export function validateBooking(data: any) {
  return {
    ...validateContact(data),
    ...validateEvent(data),
    ...validateLogistics(data),
    ...validateStaffing(data),
  };
}

export function stepForField(field: string) {
  if (!field) return "review";
  if (field.startsWith("staffingRoles")) return "staffing";
  return FIELD_STEPS[field] || "review";
}

export function firstErrorStep(errors: Record<string, string>) {
  const steps = BOOKING_STEPS.map((step) => step.id);
  const affected = new Set(Object.keys(errors).map((field) => stepForField(field)));
  return steps.find((step) => affected.has(step)) || "review";
}

export function countStepErrors(errors: Record<string, string>, stepId: string) {
  return Object.keys(errors).filter((field) => stepForField(field) === stepId).length;
}

export function getTotalStaff(roles: any[]) {
  if (!Array.isArray(roles)) return 0;
  return roles.reduce((total, role) => {
    const quantity = Number(role.quantity);
    return total + (Number.isFinite(quantity) && quantity > 0 ? quantity : 0);
  }, 0);
}
