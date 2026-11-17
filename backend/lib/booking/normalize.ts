function text(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function normalizeLanguages(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => text(item)).filter(Boolean);
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => text(item)).filter(Boolean);
      }
    } catch {
      // Fall through to comma-separated parsing.
    }
    return value
      .split(",")
      .map((item) => text(item))
      .filter(Boolean);
  }
  return [];
}

function normalizeRoles(value: unknown): any[] {
  if (!Array.isArray(value)) return [];
  return value.map((role: any) => ({
    staffRole: text(role?.staffRole),
    genderPreference: text(role?.genderPreference),
    quantity: text(role?.quantity),
    workDate: text(role?.workDate),
    reportingTime: text(role?.reportingTime),
    shiftDuration: text(role?.shiftDuration),
    experienceRequirement: text(role?.experienceRequirement),
    uniformRequirement: text(role?.uniformRequirement),
    specialInstructions: text(role?.specialInstructions),
  }));
}

export function normalizePayload(raw: any) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;

  return {
    clientCompanyName: text(raw.clientCompanyName),
    contactPerson: text(raw.contactPerson),
    mobileNumber: text(raw.mobileNumber),
    whatsappNumber: text(raw.whatsappNumber),
    emailAddress: text(raw.emailAddress),
    companyType: text(raw.companyType),

    eventName: text(raw.eventName),
    eventType: text(raw.eventType),
    eventCity: text(raw.eventCity),
    state: text(raw.state),
    eventStartDate: text(raw.eventStartDate),
    eventEndDate: text(raw.eventEndDate),
    guestCount: text(raw.guestCount),
    budgetPerPerson: text(raw.budgetPerPerson),

    venueAddress: text(raw.venueAddress),
    mapsLocation: text(raw.mapsLocation),
    reportingTime: text(raw.reportingTime),
    dutyStartTime: text(raw.dutyStartTime),
    dutyEndTime: text(raw.dutyEndTime),
    foodProvided: text(raw.foodProvided),
    transportProvided: text(raw.transportProvided),
    accommodationProvided: text(raw.accommodationProvided),
    dressCode: text(raw.dressCode),
    languageRequirements: normalizeLanguages(raw.languageRequirements),
    additionalNotes: text(raw.additionalNotes),
    urgent:
      raw.urgent === true ||
      raw.urgent === "true" ||
      raw.urgent === "yes" ||
      raw.urgent === 1,

    staffingRoles: normalizeRoles(raw.staffingRoles),
  };
}
