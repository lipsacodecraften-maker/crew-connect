import Link from "next/link";
import {
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiFilter,
  FiMapPin,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiUsers,
} from "react-icons/fi";

import { can, getAdminSession } from "@/lib/admin/auth";
import {
  getJobFacets,
  listAdminJobs,
  type JobListFilters,
} from "@/lib/admin/jobs";
import { listMatchingBookings } from "@/lib/admin/matching";
import { JOB_STATUS_META, JOB_STATUSES } from "@/lib/jobs/config";
import {
  formatIsoDate,
  formatNumber,
  formatRelative,
} from "@/lib/admin/format";
import {
  CardHead,
  EmptyState,
  MetricCard,
  PageHeader,
  StatusPill,
} from "../../_components/ui";
import { fillTone } from "../../_components/status";
import JobCreateForm from "./JobCreateForm";

export const dynamic = "force-dynamic";

function readParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters: JobListFilters = {
    q: readParam(params.q) || undefined,
    status: readParam(params.status) || undefined,
    city: readParam(params.city) || undefined,
    role: readParam(params.role) || undefined,
  };

  const [session, jobs, facets, bookings] = await Promise.all([
    getAdminSession(),
    listAdminJobs(filters),
    getJobFacets(),
    listMatchingBookings(),
  ]);

  const open = jobs.filter((job) => job.status === "open").length;
  const totalApplications = jobs.reduce(
    (sum, job) => sum + job.applicationCount,
    0,
  );
  const totalOpenings = jobs.reduce((sum, job) => sum + job.openings, 0);
  const selected = jobs.reduce((sum, job) => sum + job.selectedCount, 0);

  return (
    <>
      <PageHeader
        eyebrow="Job board"
        title="Job management"
        subtitle="Publish approved jobs, close filled positions, review applications, shortlist candidates and confirm allocations."
        actions={
          <>
            <span className="admin-topbar-chip">
              <i aria-hidden="true" /> {jobs.length} listing
              {jobs.length === 1 ? "" : "s"} in view
            </span>
            <Link href="/admin/bookings" className="admin-btn is-ghost">
              <FiBriefcase aria-hidden="true" /> Requests
            </Link>
          </>
        }
      />

      <section className="admin-grid admin-grid-4" style={{ marginBottom: 16 }}>
        <MetricCard
          icon={<FiBriefcase aria-hidden="true" />}
          label="Published jobs"
          value={formatNumber(open)}
          suffix="open"
          tone="accent"
          foot={`${formatNumber(jobs.length)} total in view`}
        />
        <MetricCard
          icon={<FiUsers aria-hidden="true" />}
          label="Applications"
          value={formatNumber(totalApplications)}
          suffix="received"
          tone="blue"
          foot="Across the filtered listings"
        />
        <MetricCard
          icon={<FiCheckCircle aria-hidden="true" />}
          label="Crew selected"
          value={formatNumber(selected)}
          suffix="allocated"
          tone="green"
          foot={`${formatNumber(totalOpenings)} positions advertised`}
        />
        <MetricCard
          icon={<FiCalendar aria-hidden="true" />}
          label="Drafts"
          value={formatNumber(
            jobs.filter((job) => job.status === "draft").length,
          )}
          suffix="unpublished"
          tone="yellow"
          foot="Publish once the booking is confirmed"
        />
      </section>

      {can(session!, "jobs.manage") ? (
        <section className="admin-card" style={{ marginBottom: 16 }}>
          <CardHead
            title="Create a job listing"
            subtitle="Listings can be linked to a booking so confirming a candidate also creates an event assignment."
          />
          <JobCreateForm
            bookings={bookings.map((booking) => ({
              id: booking.id,
              eventName: booking.eventName,
              eventCity: booking.eventCity,
              eventStartDate: booking.eventStartDate,
              requirements: booking.requirements,
            }))}
          />
        </section>
      ) : null}

      <section className="admin-card">
        <CardHead
          title="Listings"
          subtitle="Search across role, city, event type and booking reference."
          action={
            <span className="admin-count-chip">
              {formatNumber(jobs.length)} result{jobs.length === 1 ? "" : "s"}
            </span>
          }
        />
        <div className="admin-card-body">
          <form className="admin-filter-bar is-inline" action="/admin/jobs" method="get">
            <div className="admin-filter-search">
              <FiSearch aria-hidden="true" />
              <input
                className="admin-input"
                name="q"
                defaultValue={filters.q || ""}
                placeholder="Search role, city, event type, booking…"
                aria-label="Search job listings"
              />
            </div>
            <select
              className="admin-select"
              name="status"
              defaultValue={filters.status || "all"}
              aria-label="Listing status"
            >
              <option value="all">All statuses</option>
              {JOB_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {JOB_STATUS_META[status].label}
                </option>
              ))}
            </select>
            <select
              className="admin-select"
              name="city"
              defaultValue={filters.city || "all"}
              aria-label="City"
            >
              <option value="all">All cities</option>
              {facets.cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <select
              className="admin-select"
              name="role"
              defaultValue={filters.role || "all"}
              aria-label="Role"
            >
              <option value="all">All roles</option>
              {facets.roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <button type="submit" className="admin-btn is-primary">
              <FiFilter aria-hidden="true" /> Apply
            </button>
            <Link href="/admin/jobs" className="admin-btn is-ghost">
              <FiRefreshCw aria-hidden="true" /> Reset
            </Link>
          </form>
        </div>

        {jobs.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Role & event</th>
                  <th>Date & city</th>
                  <th>Shift</th>
                  <th>Pay</th>
                  <th>Openings</th>
                  <th>Applications</th>
                  <th>Status</th>
                  <th className="is-right">Open</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <Link
                        href={`/admin/jobs/${job.id}`}
                        className="admin-row-title"
                        style={{ textDecoration: "none" }}
                      >
                        {job.jobRole}
                      </Link>
                      <span className="admin-row-sub">
                        {job.eventType}
                        {job.bookingRef ? ` · ${job.bookingRef}` : ""}
                      </span>
                      <span className="admin-row-sub">
                        Created {formatRelative(job.createdAt)}
                      </span>
                    </td>
                    <td className="is-nowrap">
                      {formatIsoDate(job.eventDate)}
                      {job.endDate ? ` → ${formatIsoDate(job.endDate)}` : ""}
                      <span className="admin-row-sub">
                        <FiMapPin aria-hidden="true" /> {job.city}
                      </span>
                    </td>
                    <td className="is-nowrap">
                      {job.dutyStartTime
                        ? `${job.dutyStartTime}–${job.dutyEndTime}`
                        : "TBC"}
                      <span className="admin-row-sub">
                        {job.dutyHours ? `${job.dutyHours} hours` : "Duration TBC"}
                      </span>
                    </td>
                    <td className="is-nowrap">
                      {job.paymentMin || job.paymentMax
                        ? `₹${job.paymentMin || 0}–₹${job.paymentMax || 0}`
                        : "At briefing"}
                    </td>
                    <td style={{ minWidth: 120 }}>
                      <span className="admin-row-title">
                        {job.selectedCount}/{job.openings}
                      </span>
                      <span className="admin-row-sub">
                        {job.remaining} remaining
                      </span>
                      <div className="admin-progress">
                        <span
                          className={fillTone(job.selectedCount, job.openings)}
                          style={{
                            width: `${
                              job.openings
                                ? Math.min(
                                    100,
                                    Math.round(
                                      (job.selectedCount / job.openings) * 100,
                                    ),
                                  )
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </td>
                    <td className="is-nowrap">
                      <span className="admin-row-title">
                        {job.applicationCount}
                      </span>
                      <span className="admin-row-sub">
                        {job.submittedCount} new · {job.shortlistedCount} shortlisted
                      </span>
                    </td>
                    <td className="is-nowrap">
                      <StatusPill status={job.status} />
                      <span className="admin-row-sub">
                        {job.publishedAt
                          ? `Published ${formatRelative(job.publishedAt)}`
                          : "Not published"}
                      </span>
                    </td>
                    <td className="is-right">
                      <Link
                        href={`/admin/jobs/${job.id}`}
                        className="admin-btn is-small is-ghost"
                      >
                        <FiBriefcase aria-hidden="true" /> Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No listings match those filters">
            Reset the filters or create a new job listing.
          </EmptyState>
        )}
      </section>
    </>
  );
}
