import AvailableJobsClient from "./AvailableJobsClient";
import "../hire-manpower/hire-manpower.css";
import "./available-jobs.css";
import {
  EVENT_DATE_WINDOWS,
  EXPERIENCE_FILTERS,
  PAYMENT_RANGE_OPTIONS,
} from "@/lib/jobs/config";
import { getListingFacets, listOpenListings } from "@/lib/jobs/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Available Jobs | CrewConnect",
  description:
    "Browse approved, open event staffing opportunities across Gujarat. Apply with your CrewConnect staff registration and track your application status.",
};

export default async function AvailableJobsPage() {
  const jobs = await listOpenListings();
  const facets = await getListingFacets();

  const initialFilters = {
    cities: facets.cities,
    roles: facets.roles,
    dateWindows: EVENT_DATE_WINDOWS,
    paymentRanges: PAYMENT_RANGE_OPTIONS.map(({ id, label }) => ({
      id,
      label,
    })),
    experience: EXPERIENCE_FILTERS,
  };

  return (
    <AvailableJobsClient initialJobs={jobs} initialFilters={initialFilters} />
  );
}
