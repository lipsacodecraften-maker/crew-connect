import { prisma } from "@/lib/prisma";
import { ACTIVE_ASSIGNMENT_STATUSES } from "./constants";
import { addHoursToClock, checkAssignmentConflicts } from "./assignments";
import { parseStringArray, shiftHours, shiftMinutes, todayIso } from "./format";

const ROLE_ALIASES: string[][] = [
  ["event boy", "event girl", "event boy / girl", "event helper", "hospitality", "welcome"],
  ["groom side", "bride side", "wedding", "hospitality", "guest welcome"],
  ["bouncer", "security", "crowd", "parking"],
  ["technician", "technical", "supervisor", "stage", "production"],
  ["registration", "ticket", "scanner", "welcome"],
  ["serving", "server", "helper", "housekeeping"],
  ["promoter", "exhibition", "host", "welcome"],
];

const STOP_WORDS = new Set([
  "staff",
  "crew",
  "event",
  "the",
  "and",
  "for",
  "with",
  "side",
  "work",
]);

function tokens(value: string) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9+]+/g, " ")
    .split(/\s+/)
    .filter((token) => token && !STOP_WORDS.has(token));
}

function aliasGroup(value: string) {
  const normalized = value.toLowerCase();
  return ROLE_ALIASES.find((group) =>
    group.some(
      (alias) => normalized.includes(alias) || alias.includes(normalized),
    ),
  );
}

function roleMatchScore(role: string, staffSkills: string[], otherSkill: string) {
  const skills = [...staffSkills, otherSkill].filter(Boolean);
  if (!skills.length) return { score: 0, reason: "No listed skills" };

  const roleTokens = tokens(role);
  const roleAliases = aliasGroup(role);

  let best = 0;
  let bestSkill = "";
  for (const skill of skills) {
    const normalizedSkill = skill.toLowerCase();
    const normalizedRole = role.toLowerCase();
    let score = 0;

    if (normalizedSkill === normalizedRole) score = 100;
    else if (
      normalizedSkill.includes(normalizedRole) ||
      normalizedRole.includes(normalizedSkill)
    ) {
      score = 85;
    } else {
      const skillTokens = tokens(skill);
      const overlap = roleTokens.filter((token) => skillTokens.includes(token)).length;
      if (overlap) score = Math.min(70, 35 + overlap * 15);

      if (roleAliases) {
        const sharesAlias = roleAliases.some(
          (alias) => normalizedSkill.includes(alias) || normalizedRole.includes(alias),
        );
        if (sharesAlias) score = Math.max(score, 65);
      }
    }

    if (score > best) {
      best = score;
      bestSkill = skill;
    }
  }

  return {
    score: Math.round((best / 100) * 40),
    reason: best ? `Skill match: ${bestSkill}` : "Role not listed in skills",
  };
}

function experienceScore(
  requirement: string,
  staff: { yearsExperience: number; experienceLevel: string; skills: string[] },
) {
  const years = Number(staff.yearsExperience) || 0;
  const normalized = String(requirement || "Any experience").toLowerCase();

  if (normalized.includes("any") || normalized === "") {
    return { score: 15, reason: "Any experience accepted" };
  }
  if (normalized.includes("supervisor")) {
    return years >= 3 || staff.skills.some((skill) => /supervisor/i.test(skill))
      ? { score: 15, reason: "Supervisor-ready profile" }
      : { score: 4, reason: "Supervisor experience not proven" };
  }

  const number = Number(normalized.match(/(\d+(?:\.\d+)?)/)?.[1] || 0);
  const requiredYears = normalized.includes("month")
    ? number / 12
    : normalized.includes("year")
      ? number
      : 0;

  if (years >= requiredYears) {
    return {
      score: 15,
      reason: `${years} year${years === 1 ? "" : "s"} experience`,
    };
  }
  return {
    score: Math.max(2, Math.round((years / Math.max(requiredYears, 1)) * 12)),
    reason: `Below required ${requirement}`,
  };
}

function shiftCompatibility(
  staffShiftTypes: string[],
  start?: string | null,
  end?: string | null,
) {
  if (!start || !end) return { score: 5, reason: "Shift timing confirmed at briefing" };

  const hours = shiftHours(start, end) || 0;
  const startHour = Number(start.split(":")[0]) || 0;
  const wanted = new Set<string>();

  if (hours >= 8) wanted.add("Full-Day Work");
  if (hours < 6) wanted.add("Part-Time Work");
  if (startHour >= 17 || startHour < 5) wanted.add("Night Shift");
  if (startHour >= 5 && startHour < 17) wanted.add("Day Shift");

  const matches = staffShiftTypes.filter((type) => wanted.has(type));
  if (matches.length) {
    return {
      score: 10,
      reason: `Shift fit: ${matches.join(", ")}`,
    };
  }
  if (!staffShiftTypes.length) {
    return { score: 5, reason: "Shift preference not listed" };
  }
  return { score: 2, reason: `Prefers ${staffShiftTypes.join(", ")}` };
}

function cityScore(
  eventCity: string,
  staff: { currentCity: string; preferredCities: string[]; willingToTravel: boolean },
) {
  const normalizedEventCity = String(eventCity || "").toLowerCase();
  if (!normalizedEventCity) {
    return { score: 8, reason: "City not specified" };
  }

  if (staff.currentCity.toLowerCase() === normalizedEventCity) {
    return { score: 20, reason: `Based in ${staff.currentCity}` };
  }
  if (
    staff.preferredCities.some(
      (city) => city.toLowerCase() === normalizedEventCity,
    )
  ) {
    return { score: 17, reason: `Prefers ${eventCity}` };
  }
  if (staff.willingToTravel) {
    return { score: 8, reason: "Willing to travel" };
  }
  return { score: 0, reason: `Not local to ${eventCity}` };
}

function availabilityScore(
  workDate: string,
  staff: { availableFrom: string; availableUntil: string },
) {
  if (staff.availableFrom && workDate < staff.availableFrom) {
    return { score: 0, available: false, reason: `Unavailable until ${staff.availableFrom}` };
  }
  if (staff.availableUntil && workDate > staff.availableUntil) {
    return { score: 0, available: false, reason: `Unavailable after ${staff.availableUntil}` };
  }
  return { score: 15, available: true, reason: "Available on event date" };
}

export type MatchingParams = {
  bookingId?: string;
  requirementRef?: number;
  city?: string;
  role?: string;
  workDate?: string;
  shiftStart?: string;
  shiftEnd?: string;
  experience?: string;
};

export async function getMatchingContext(
  bookingId?: string,
  requirementRef?: number,
) {
  if (!bookingId) return null;

  const booking = await prisma.bookingRequest.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      eventName: true,
      eventType: true,
      eventCity: true,
      eventStartDate: true,
      eventEndDate: true,
      status: true,
      staffingRequirements: { orderBy: { roleIndex: "asc" } },
      assignments: {
        where: { status: { in: [...ACTIVE_ASSIGNMENT_STATUSES] } },
        select: { id: true, requirementRef: true, registrationId: true, status: true },
      },
    },
  });

  if (!booking) return null;

  const requirements = booking.staffingRequirements.map((requirement) => {
    const filled = new Set(
      booking.assignments
        .filter((assignment) => assignment.requirementRef === requirement.id)
        .map((assignment) => assignment.registrationId),
    ).size;
    return {
      id: requirement.id,
      staffRole: requirement.staffRole,
      quantity: Number(requirement.quantity),
      workDate: requirement.workDate,
      reportingTime: requirement.reportingTime,
      shiftDuration: Number(requirement.shiftDuration),
      experienceRequirement: requirement.experienceRequirement,
      genderPreference: requirement.genderPreference,
      uniformRequirement: requirement.uniformRequirement,
      specialInstructions: requirement.specialInstructions || "",
      filled,
      remaining: Math.max(0, Number(requirement.quantity) - filled),
    };
  });

  return {
    ...booking,
    requirements,
    selectedRequirement:
      requirements.find((requirement) => requirement.id === requirementRef) ||
      requirements[0] ||
      null,
  };
}

export async function listMatchingBookings() {
  const bookings = await prisma.bookingRequest.findMany({
    where: {
      status: { notIn: ["cancelled", "completed"] },
      staffingRequirements: { some: {} },
    },
    orderBy: [{ eventStartDate: "asc" }, { createdAt: "desc" }],
    take: 80,
    select: {
      id: true,
      eventName: true,
      eventCity: true,
      eventStartDate: true,
      status: true,
      staffingRequirements: {
        orderBy: { roleIndex: "asc" },
        select: { id: true, staffRole: true, quantity: true },
      },
      assignments: {
        where: { status: { in: [...ACTIVE_ASSIGNMENT_STATUSES] } },
        select: { requirementRef: true, registrationId: true },
      },
    },
  });

  return bookings.map((booking) => ({
    id: booking.id,
    eventName: booking.eventName,
    eventCity: booking.eventCity,
    eventStartDate: booking.eventStartDate,
    status: booking.status,
    requirements: booking.staffingRequirements.map((requirement) => {
      const filled = new Set(
        booking.assignments
          .filter((assignment) => assignment.requirementRef === requirement.id)
          .map((assignment) => assignment.registrationId),
      ).size;
      return {
        id: requirement.id,
        staffRole: requirement.staffRole,
        quantity: Number(requirement.quantity),
        filled,
        remaining: Math.max(0, Number(requirement.quantity) - filled),
      };
    }),
  }));
}

export async function recommendStaff(params: MatchingParams) {
  const context = params.bookingId
    ? await getMatchingContext(params.bookingId, params.requirementRef)
    : null;

  if (params.bookingId && !context) {
    return {
      ok: false as const,
      message: "Booking request was not found.",
    };
  }

  const selected = context?.selectedRequirement;
  const role = selected?.staffRole || params.role || "";
  const eventCity = context?.eventCity || params.city || "";
  const workDate = selected?.workDate || params.workDate || "";
  const shiftStart =
    selected?.reportingTime || params.shiftStart || "";
  const shiftEnd =
    params.shiftEnd ||
    (selected?.reportingTime && selected.shiftDuration
      ? addHoursToClock(selected.reportingTime, selected.shiftDuration)
      : "");

  if (!role || !eventCity || !workDate) {
    return {
      ok: false as const,
      message: "Choose an event requirement (role, city and date) to match staff.",
    };
  }

  const [staffRows, dayAssignments] = await Promise.all([
    prisma.staffRegistration.findMany({
      where: { status: "approved" },
      select: {
        id: true,
        fullName: true,
        mobileNumber: true,
        currentCity: true,
        preferredCities: true,
        skills: true,
        otherSkill: true,
        experienceLevel: true,
        yearsExperience: true,
        expectedPayment: true,
        availableFrom: true,
        availableUntil: true,
        shiftTypes: true,
        willingToTravel: true,
        transportAvailable: true,
        languages: true,
      },
    }),
    prisma.eventAssignment.findMany({
      where: {
        workDate,
        status: { in: [...ACTIVE_ASSIGNMENT_STATUSES] },
      },
      select: {
        id: true,
        registrationId: true,
        bookingId: true,
        requirementRef: true,
        shiftStart: true,
        shiftEnd: true,
        role: true,
      },
    }),
  ]);

  const requestedRange =
    shiftStart && shiftEnd ? shiftMinutes(shiftStart, shiftEnd) : null;
  const filled = selected?.filled ?? 0;
  const quantity = selected?.quantity ?? Number.MAX_SAFE_INTEGER;
  const requirementFilled = Boolean(selected) && filled >= quantity;
  const requirement = selected?.experienceRequirement || params.experience || "Any experience";

  const candidates = staffRows.map((staff) => {
    const skills = parseStringArray(staff.skills);
    const preferredCities = parseStringArray(staff.preferredCities);
    const shiftTypes = parseStringArray(staff.shiftTypes);
    const languages = parseStringArray(staff.languages);

    const availability = availabilityScore(workDate, {
      availableFrom: staff.availableFrom,
      availableUntil: staff.availableUntil,
    });
    const roleMatch = roleMatchScore(role, skills, staff.otherSkill || "");
    const city = cityScore(eventCity, {
      currentCity: staff.currentCity,
      preferredCities,
      willingToTravel: Boolean(staff.willingToTravel),
    });
    const experience = experienceScore(requirement, {
      yearsExperience: Number(staff.yearsExperience),
      experienceLevel: staff.experienceLevel,
      skills,
    });
    const shift = shiftCompatibility(shiftTypes, shiftStart, shiftEnd);
    const reliability =
      (staff.transportAvailable ? 3 : 0) + (staff.willingToTravel ? 2 : 0);

    const conflicts: string[] = [];
    if (!availability.available) conflicts.push(availability.reason);
    if (requirementFilled) {
      conflicts.push(`Requirement already filled (${filled}/${quantity}).`);
    }

    const sameDay = dayAssignments.filter(
      (assignment) => assignment.registrationId === staff.id,
    );
    for (const assignment of sameDay) {
      const isDuplicate =
        params.bookingId &&
        selected &&
        assignment.bookingId === params.bookingId &&
        assignment.requirementRef === selected.id;

      if (isDuplicate) {
        conflicts.push("Already assigned to this requirement.");
        continue;
      }

      const existingRange =
        assignment.shiftStart && assignment.shiftEnd
          ? shiftMinutes(assignment.shiftStart, assignment.shiftEnd)
          : null;
      const overlaps =
        !requestedRange || !existingRange
          ? true
          : requestedRange.start < existingRange.end &&
            requestedRange.end > existingRange.start;

      if (overlaps) {
        conflicts.push(
          `Shift overlap with ${assignment.role}${
            assignment.shiftStart && assignment.shiftEnd
              ? ` (${assignment.shiftStart}–${assignment.shiftEnd})`
              : ""
          }.`,
        );
      }
    }

    const score =
      roleMatch.score +
      city.score +
      availability.score +
      experience.score +
      shift.score +
      reliability;

    return {
      id: staff.id,
      fullName: staff.fullName,
      mobileNumber: staff.mobileNumber,
      currentCity: staff.currentCity,
      preferredCities,
      skills,
      otherSkill: staff.otherSkill || "",
      experienceLevel: staff.experienceLevel,
      yearsExperience: Number(staff.yearsExperience),
      expectedPayment: Number(staff.expectedPayment),
      availableFrom: staff.availableFrom,
      availableUntil: staff.availableUntil,
      shiftTypes,
      languages,
      willingToTravel: Boolean(staff.willingToTravel),
      transportAvailable: Boolean(staff.transportAvailable),
      score,
      assignable: conflicts.length === 0,
      conflicts,
      reasons: [
        roleMatch.reason,
        city.reason,
        availability.reason,
        experience.reason,
        shift.reason,
      ],
      breakdown: {
        role: roleMatch.score,
        city: city.score,
        availability: availability.score,
        experience: experience.score,
        shift: shift.score,
        reliability,
      },
    };
  });

  candidates.sort((a, b) => {
    if (a.assignable !== b.assignable) return a.assignable ? -1 : 1;
    return b.score - a.score;
  });

  return {
    ok: true as const,
    context,
    selected,
    query: {
      role,
      eventCity,
      workDate,
      shiftStart,
      shiftEnd,
      experience: requirement,
    },
    candidates,
    summary: {
      totalApproved: staffRows.length,
      assignable: candidates.filter((candidate) => candidate.assignable).length,
      blocked: candidates.filter((candidate) => !candidate.assignable).length,
    },
  };
}

/**
 * Re-check conflicts immediately before creating an assignment. This is used
 * by the assignment API so a stale matching screen can never bypass the rule.
 */
export async function verifyCandidateAssignment(input: {
  registrationId: string;
  bookingId: string;
  requirementRef: number;
}) {
  const booking = await prisma.bookingRequest.findUnique({
    where: { id: input.bookingId },
    select: {
      staffingRequirements: { where: { id: input.requirementRef } },
    },
  });
  const requirement = booking?.staffingRequirements[0];
  if (!requirement) {
    return {
      ok: false as const,
      message: "The selected requirement was not found.",
    };
  }

  const shiftEnd = requirement.reportingTime
    ? addHoursToClock(requirement.reportingTime, Number(requirement.shiftDuration))
    : null;

  const check = await checkAssignmentConflicts({
    registrationId: input.registrationId,
    bookingId: input.bookingId,
    requirementRef: input.requirementRef,
    workDate: requirement.workDate,
    shiftStart: requirement.reportingTime,
    shiftEnd,
  });

  if (!check.ok) {
    return { ok: false as const, message: check.conflict.message };
  }

  return {
    ok: true as const,
    requirement,
    staff: check.staff,
    shiftEnd,
  };
}
