export const CONTACT = {
  phoneDisplay: "+91 9510572460",
  phoneHref: "tel:+919510572460",
  whatsappNumber: "919510572460",
  whatsappHref: "https://wa.me/919510572460",
  deskHours: "Mon–Sat · 10:00–19:00 IST",
  serviceLine: "Ahmedabad · Gandhinagar · Vadodara · Surat",
  location: "Gujarat, India",
} as const;

export const SERVICE_HUBS = [
  {
    code: "AMD",
    name: "Ahmedabad",
    note: "Dispatch headquarters for weddings, corporate events and exhibitions.",
  },
  {
    code: "GNR",
    name: "Gandhinagar",
    note: "Crew support for conventions, government events and campus programmes.",
  },
  {
    code: "BRC",
    name: "Vadodara",
    note: "Hospitality and front-of-house teams for weddings and cultural events.",
  },
  {
    code: "ST",
    name: "Surat",
    note: "Event crews for exhibitions, concerts and large-format gatherings.",
  },
] as const;

export const ENQUIRY_TYPES = [
  "Hire manpower",
  "Join as staff",
  "Available jobs",
  "Existing booking",
  "Something else",
] as const;

export const ENQUIRY_CITIES = [
  "Ahmedabad",
  "Gandhinagar",
  "Vadodara",
  "Surat",
  "Other city in Gujarat",
  "Outside Gujarat",
] as const;
