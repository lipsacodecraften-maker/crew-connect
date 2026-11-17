import {
  APPLICATION_STATUSES,
  EXPERIENCE_REQUIREMENTS,
  JOB_STATUSES,
  dutyHoursBetween,
  isClockTime,
  isIsoDate,
  todayIso,
} from "./config";

function cleanText(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

export function validateListingInput(input: any, { partial = false } = {}) {
  const errors: Record<string, string> = {};
  const value: Record<string, any> = {};
  const has = (key: string) => Object.hasOwn(input || {}, key);

  const readText = (
    key: string,
    { label, min = 2, max = 80, required = true }: { label: string; min?: number; max?: number; required?: boolean },
  ) => {
    if (!has(key)) {
      if (required && !partial) errors[key] = `${label} is required.`;
      return;
    }
    const text = cleanText(input[key], max);
    if (!text) {
      if (required) errors[key] = `${label} is required.`;
      return;
    }
    if (text.length < min) {
      errors[key] = `${label} looks too short.`;
      return;
    }
    value[key] = text;
  };

  readText("eventType", { label: "Event type" });
  readText("jobRole", { label: "Job role" });
  readText("city", { label: "City", max: 60 });

  if (has("eventDate") || !partial) {
    const eventDate = cleanText(input.eventDate, 10);
    if (!isIsoDate(eventDate)) {
      errors.eventDate = "Choose a valid event date.";
    } else if (eventDate < todayIso()) {
      errors.eventDate = "Event date cannot be in the past.";
    } else {
      value.eventDate = eventDate;
    }
  }

  if (has("endDate")) {
    const endDate = cleanText(input.endDate, 10);
    if (!endDate) {
      value.endDate = "";
    } else if (!isIsoDate(endDate)) {
      errors.endDate = "Choose a valid end date.";
    } else {
      const start = value.eventDate || cleanText(input.eventDate, 10);
      if (isIsoDate(start) && endDate < start) {
        errors.endDate = "End date must be on or after the event date.";
      } else {
        value.endDate = endDate;
      }
    }
  }

  const hasStart = has("dutyStartTime");
  const hasEnd = has("dutyEndTime");

  if (hasStart || hasEnd || !partial) {
    const startTime = cleanText(input.dutyStartTime, 5);
    const endTime = cleanText(input.dutyEndTime, 5);

    if (!startTime && !endTime) {
      value.dutyStartTime = "";
      value.dutyEndTime = "";
      value.dutyHours = null;
    } else if (!isClockTime(startTime) || !isClockTime(endTime)) {
      errors.dutyStartTime = "Add both a valid start and end time.";
      errors.dutyEndTime = "Add both a valid start and end time.";
    } else {
      value.dutyStartTime = startTime;
      value.dutyEndTime = endTime;
      value.dutyHours = dutyHoursBetween(startTime, endTime);
    }
  }

  const hasPaymentMin = has("paymentMin");
  const hasPaymentMax = has("paymentMax");

  if (hasPaymentMin || hasPaymentMax) {
    const min = hasPaymentMin ? Math.round(Number(input.paymentMin) || 0) : null;
    const max = hasPaymentMax ? Math.round(Number(input.paymentMax) || 0) : null;

    if (min !== null && min < 0) {
      errors.paymentMin = "Payment cannot be negative.";
    } else if (min !== null && min > 100000) {
      errors.paymentMin = "Payment looks too high.";
    } else {
      value.paymentMin = min ? min : null;
    }

    if (max !== null && max < 0) {
      errors.paymentMax = "Payment cannot be negative.";
    } else if (max !== null && max > 100000) {
      errors.paymentMax = "Payment looks too high.";
    } else {
      value.paymentMax = max ? max : null;
    }

    const low = Number(value.paymentMin) || 0;
    const high = Number(value.paymentMax) || 0;
    if (low && high && high < low) {
      errors.paymentMax = "Maximum payment must be above the minimum.";
    }
  }

  if (has("openings") || !partial) {
    const openings = Math.round(Number(input.openings) || 0);
    if (!Number.isFinite(openings) || openings < 1) {
      errors.openings = "Add at least one opening.";
    } else if (openings > 500) {
      errors.openings = "Openings look too high.";
    } else {
      value.openings = openings;
    }
  }

  if (has("experienceRequired") || !partial) {
    const experience = cleanText(input.experienceRequired, 20) || "Any";
    if (!EXPERIENCE_REQUIREMENTS.includes(experience as any)) {
      errors.experienceRequired = "Choose a valid experience requirement.";
    } else {
      value.experienceRequired = experience;
    }
  }

  if (has("summary")) {
    value.summary = cleanText(input.summary, 600);
  }

  if (has("status")) {
    const status = cleanText(input.status, 20);
    if (!JOB_STATUSES.includes(status as any)) {
      errors.status = "Choose a valid listing status.";
    } else {
      value.status = status;
    }
  }

  if (has("bookingRef")) {
    value.bookingRef = cleanText(input.bookingRef, 100);
  }

  if (has("requirementRef")) {
    const ref = Number(input.requirementRef);
    value.requirementRef = Number.isFinite(ref) && ref > 0 ? ref : null;
  }

  return { errors, value };
}

export function validateApplicationStatusInput(input: any) {
  const errors: Record<string, string> = {};
  const value: Record<string, any> = {};

  const status = cleanText(input?.status, 20);
  if (!APPLICATION_STATUSES.includes(status as any)) {
    errors.status = `Status must be one of: ${APPLICATION_STATUSES.join(", ")}.`;
  } else {
    value.status = status;
  }

  value.note = cleanText(input?.note, 500);

  return { errors, value };
}
