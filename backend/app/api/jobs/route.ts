import { NextResponse, type NextRequest } from "next/server";
import {
  EVENT_DATE_WINDOWS,
  EXPERIENCE_FILTERS,
  PAYMENT_RANGE_OPTIONS,
  addDaysIso,
} from "@/lib/jobs/config";
import { getListingFacets, listOpenListings } from "@/lib/jobs/db";
import { clientKey, rateLimit } from "@/lib/jobs/throttle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function readFilters(searchParams: URLSearchParams) {
  const filters: Record<string, any> = {};

  const city = (searchParams.get("city") || "").trim();
  if (city && city !== "all") filters.city = city;

  const role = (searchParams.get("role") || "").trim();
  if (role && role !== "all") filters.role = role;

  const dateWindow =
    EVENT_DATE_WINDOWS.find(
      (option) => option.id === searchParams.get("date"),
    ) || EVENT_DATE_WINDOWS[0];

  if (dateWindow.days) filters.dateTo = addDaysIso(dateWindow.days);

  const customFrom = (searchParams.get("dateFrom") || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(customFrom)) filters.dateFrom = customFrom;

  const customTo = (searchParams.get("dateTo") || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(customTo)) filters.dateTo = customTo;

  const payment =
    PAYMENT_RANGE_OPTIONS.find(
      (option) => option.id === searchParams.get("payment"),
    ) || PAYMENT_RANGE_OPTIONS[0];

  if (payment.min !== null) filters.minPayment = payment.min;
  if (payment.max !== null) filters.maxPayment = payment.max;

  const experience = (searchParams.get("experience") || "").trim();
  if (experience === "fresher" || experience === "experienced") {
    filters.experience = experience;
  }

  return filters;
}

export async function GET(request: NextRequest) {
  const throttle = rateLimit(`jobs:list:${clientKey(request)}`, {
    limit: 120,
    windowMs: 60 * 1000,
  });

  if (!throttle.allowed) {
    return NextResponse.json(
      { ok: false, message: "Too many requests. Please try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(throttle.retryAfter) },
      },
    );
  }

  const { searchParams } = new URL(request.url);
  const filters = readFilters(searchParams);
  const jobs = await listOpenListings(filters);
  const facets = await getListingFacets();

  return NextResponse.json(
    {
      ok: true,
      total: jobs.length,
      jobs,
      filters: {
        cities: facets.cities,
        roles: facets.roles,
        dateWindows: EVENT_DATE_WINDOWS,
        paymentRanges: PAYMENT_RANGE_OPTIONS.map(({ id, label }) => ({
          id,
          label,
        })),
        experience: EXPERIENCE_FILTERS,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
