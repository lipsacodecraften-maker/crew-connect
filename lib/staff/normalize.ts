function cleanString(value: unknown, maxLength = 2000): string {
  return String(value ?? "").trim().slice(0, maxLength);
}

function cleanStringArray(value: unknown, maxItems = 40): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(
      value
        .map((item) => cleanString(item, 120))
        .filter(Boolean),
    ),
  ).slice(0, maxItems);
}

function cleanBoolean(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

function cleanFileMetadata(value: any): { name: string; type: string; size: number } | null {
  if (!value || typeof value !== "object") return null;
  const name = cleanString(value.name, 200);
  if (!name) return null;
  return {
    name,
    type: cleanString(value.type, 120),
    size: Number(value.size) || 0,
  };
}

export function normalizeRegistrationPayload(raw: any) {
  if (!raw || typeof raw !== "object") return null;

  return {
    fullName: cleanString(raw.fullName, 100),
    mobileNumber: cleanString(raw.mobileNumber, 30),
    whatsappVerified: false,
    whatsappVerificationToken: cleanString(raw.whatsappVerificationToken, 300),
    emailAddress: cleanString(raw.emailAddress, 200).toLowerCase(),
    dateOfBirth: cleanString(raw.dateOfBirth, 10),
    currentCity: cleanString(raw.currentCity, 100),
    areaPincode: cleanString(raw.areaPincode, 10),
    languages: cleanStringArray(raw.languages),
    profilePhoto: cleanFileMetadata(raw.profilePhoto),

    skills: cleanStringArray(raw.skills),
    otherSkill: cleanString(raw.otherSkill, 200),

    experienceLevel: cleanString(raw.experienceLevel, 30),
    yearsOfExperience: cleanString(raw.yearsOfExperience, 10),
    previousEvents: cleanString(raw.previousEvents, 2000),
    expectedPayment: cleanString(raw.expectedPayment, 12),
    resume: cleanFileMetadata(raw.resume),

    preferredCities: cleanStringArray(raw.preferredCities),
    availableFrom: cleanString(raw.availableFrom, 10),
    availableUntil: cleanString(raw.availableUntil, 10),
    shiftTypes: cleanStringArray(raw.shiftTypes),
    willingToTravel: cleanString(raw.willingToTravel, 5).toLowerCase(),
    transportAvailable: cleanString(raw.transportAvailable, 5).toLowerCase(),

    supportingDocuments: Array.isArray(raw.supportingDocuments)
      ? raw.supportingDocuments.map(cleanFileMetadata).filter(Boolean).slice(0, 3)
      : [],
    supportingDocumentTypes: Array.isArray(raw.supportingDocumentTypes)
      ? raw.supportingDocumentTypes.map((item: unknown) => cleanString(item, 120)).slice(0, 3)
      : [],
    documentsConsent: cleanBoolean(raw.documentsConsent),
    privacyConsent: cleanBoolean(raw.privacyConsent),
    termsConsent: cleanBoolean(raw.termsConsent),
    ageConfirmed: cleanBoolean(raw.ageConfirmed),
  };
}
