/**
 * Local demo listings for the /available-jobs board (PostgreSQL/Prisma).
 *
 *   node scripts/seed-job-listings.mjs          # insert demo listings
 *   node scripts/seed-job-listings.mjs --clear  # remove every demo listing
 *
 * Demo rows are tagged with bookingRef = "DEMO-SEED" so they can always be
 * identified and removed. Never run this against production data.
 */

import { randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";

if (process.env.NODE_ENV === "production" && process.env.ALLOW_DEMO_SEED !== "1") {
  console.error(
    "Refusing to seed demo listings in production. Set ALLOW_DEMO_SEED=1 to override.",
  );
  process.exit(1);
}

const prisma = new PrismaClient();
const DEMO_TAG = "DEMO-SEED";

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function monthStamp() {
  const now = new Date();
  return `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}`;
}

async function createId() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = `CC-JOB-${monthStamp()}-${randomBytes(2).toString("hex").toUpperCase()}`;
    const exists = await prisma.jobListing.findUnique({ where: { id: candidate }, select: { id: true } });
    if (!exists) return candidate;
  }
  throw new Error("Could not allocate a unique listing id.");
}

function dutyHours(start, end) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let minutes = eh * 60 + em - (sh * 60 + sm);
  if (minutes <= 0) minutes += 24 * 60;
  return Math.round((minutes / 60) * 10) / 10;
}

const DEMO_LISTINGS = [
  {
    eventType: "Wedding",
    jobRole: "Guest Welcome Executive",
    city: "Ahmedabad",
    daysFromNow: 4,
    start: "16:00",
    end: "23:00",
    paymentMin: 1400,
    paymentMax: 1800,
    openings: 8,
    experience: "Any",
    summary:
      "Welcome and seat guests, manage the entry desk and coordinate with the on-site supervisor during the evening function.",
  },
  {
    eventType: "Corporate Conference",
    jobRole: "Registration Executive",
    city: "Gandhinagar",
    daysFromNow: 7,
    start: "08:30",
    end: "17:30",
    paymentMin: 1600,
    paymentMax: 2000,
    openings: 6,
    experience: "Experienced",
    summary:
      "Run delegate registration, badge printing and help-desk queries for a two-hall business conference. Comfortable English and Gujarati required.",
  },
  {
    eventType: "Exhibition",
    jobRole: "Event Steward",
    city: "Surat",
    daysFromNow: 11,
    start: "09:00",
    end: "18:00",
    paymentMin: 1200,
    paymentMax: 1500,
    openings: 12,
    experience: "Fresher",
    summary:
      "Guide visitors through exhibition halls, manage queue lines and support exhibitor requests across the show floor.",
  },
  {
    eventType: "Concert",
    jobRole: "Bouncer",
    city: "Vadodara",
    daysFromNow: 15,
    start: "17:00",
    end: "23:30",
    paymentMin: 2200,
    paymentMax: 2800,
    openings: 10,
    experience: "Experienced",
    summary:
      "Crowd management at stage barriers and entry gates. Physically fit crew with prior live-event security experience preferred.",
  },
  {
    eventType: "Product Launch",
    jobRole: "Hospitality Host",
    city: "Ahmedabad",
    daysFromNow: 21,
    start: "10:00",
    end: "19:00",
    paymentMin: 1500,
    paymentMax: 1900,
    openings: 4,
    experience: "Any",
    summary:
      "Host VIP guests, manage the lounge area and coordinate refreshments with the catering team during the launch showcase.",
  },
  {
    eventType: "Award Night",
    jobRole: "Stage Manager",
    city: "Rajkot",
    daysFromNow: 28,
    start: "15:00",
    end: "23:00",
    paymentMin: 2600,
    paymentMax: 3200,
    openings: 2,
    experience: "Experienced",
    summary:
      "Run backstage cues, coordinate awardee movement and keep the show timeline on track with the technical team.",
  },
  {
    eventType: "Wedding",
    jobRole: "Groom Side Assistant",
    city: "Vadodara",
    daysFromNow: 34,
    start: "18:00",
    end: "00:30",
    paymentMin: 1300,
    paymentMax: 1700,
    openings: 5,
    experience: "Fresher",
    summary:
      "Support the groom's family through the evening rituals, manage carry items and coordinate with the wedding planner.",
  },
  {
    eventType: "Exhibition",
    jobRole: "Technical Supervisor",
    city: "Gandhinagar",
    daysFromNow: 46,
    start: "08:00",
    end: "18:00",
    paymentMin: 3000,
    paymentMax: 3800,
    openings: 2,
    experience: "Experienced",
    summary:
      "Supervise AV setup, power distribution and exhibitor technical requests. Prior exhibition or convention-centre experience required.",
  },
];

async function main() {
  if (process.argv.includes("--clear")) {
    const result = await prisma.jobListing.deleteMany({ where: { bookingRef: DEMO_TAG } });
    console.log(`Removed ${result.count} demo listing(s).`);
    return;
  }

  const removed = await prisma.jobListing.deleteMany({ where: { bookingRef: DEMO_TAG } });
  if (removed.count > 0) {
    console.log(`Cleared ${removed.count} previous demo listing(s).`);
  }

  const now = new Date().toISOString();
  const insertedIds = [];

  for (const listing of DEMO_LISTINGS) {
    const id = await createId();
    await prisma.jobListing.create({
      data: {
        id,
        status: "open",
        eventType: listing.eventType,
        jobRole: listing.jobRole,
        eventCity: listing.city,
        eventDate: addDays(listing.daysFromNow),
        endDate: null,
        dutyStartTime: listing.start,
        dutyEndTime: listing.end,
        dutyHours: dutyHours(listing.start, listing.end),
        paymentMin: listing.paymentMin,
        paymentMax: listing.paymentMax,
        openings: listing.openings,
        experienceRequired: listing.experience,
        summary: listing.summary,
        bookingRef: DEMO_TAG,
        requirementRef: null,
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
      },
    });
    insertedIds.push(id);
  }

  console.log(`Inserted ${insertedIds.length} demo listing(s):`);
  for (const id of insertedIds) console.log(`  ${id}`);
  console.log("Remove them again with: node scripts/seed-job-listings.mjs --clear");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
