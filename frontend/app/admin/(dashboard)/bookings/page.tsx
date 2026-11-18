import Link from "next/link";
import {
  FiCalendar,
  FiFilter,
  FiMapPin,
  FiRefreshCw,
  FiSearch,
  FiUsers,
} from "react-icons/fi";

import { can, getAdminSession } from "@/lib/admin/auth";
import {
  getBookingFacets,
  listBookings,
  type BookingListFilters,
} from "@/lib/admin/bookings";
import {
  BOOKING_STATUSES,
  BOOKING_STATUS_LABELS,
} from "@/lib/admin/constants";
import { formatDateRange, formatNumber, formatRelative } from "@/lib/admin/format";
import {
  CardHead,
  EmptyState,
  MetricCard,
  PageHeader,
  StatusPill,
} from "../../_components/ui";
import { fillTone, initials } from "../../_components/status";

export const dynamic = "force-dynamic";

function readParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
}

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters: BookingListFilters = {
    q: readParam(params.q) || undefined,
    city: readParam(params.city) || undefined,
    status: readParam(params.status) || undefined,
    role: readParam(params.role) || undefined,
    dateFrom: readParam(params.dateFrom) || undefined,
    dateTo: readParam(params.dateTo) || undefined,
  };

  const [session, bookings, facets] = await Promise.all([
    getAdminSession(),
    listBookings(filters),
    getBookingFacets(),
  ]);

  const canManage = can(session!, "bookings.manage");
  const totalRequested = bookings.reduce(
    (sum, booking) => sum + booking.requested,
    0,
  );
  const totalAssigned = bookings.reduce(
    (sum, booking) => sum + booking.assigned,
    0,
  );
  const activeCount = bookings.filter(
    (booking) => !["completed", "cancelled"].includes(booking.status),
  ).length;

  return (
    <>
      <PageHeader
        eyebrow="Client requests"
        title="Manpower request pipeline"
        subtitle="Search every event requirement by city, date, role and booking stage. Open a request to review quantities, prepare a quotation and assign crew."
        actions={
          <>
            <span className="admin-topbar-chip">
              <i aria-hidden="true" /> {bookings.length} matching request
              {bookings.length === 1 ? "" : "s"}
            </span>
            <Link href="/admin/matching" className="admin-btn">
              <FiUsers aria-hidden="true" /> Staff matching
            </Link>
          </>
        }
      />

      <section className="admin-grid admin-grid-4" style={{ marginBottom: 16 }}>
        <MetricCard
          icon={<FiCalendar aria-hidden="true" />}
          label="Requests in view"
          value={formatNumber(bookings.length)}
          suffix="results"
          tone="blue"
          foot={`${activeCount} still active`}
        />
        <MetricCard
          icon={<FiUsers aria-hidden="true" />}
          label="Crew requested"
          value={formatNumber(totalRequested)}
          suffix="positions"
          tone="accent"
          foot="Across the filtered events"
        />
        <MetricCard
          icon={<FiUsers aria-hidden="true" />}
          label="Crew assigned"
          value={formatNumber(totalAssigned)}
          suffix="filled"
          tone="green"
          foot={
            totalRequested
              ? `${Math.round((totalAssigned / totalRequested) * 100)}% coverage`
              : "No requirement data"
          }
        />
        <MetricCard
          icon={<FiMapPin aria-hidden="true" />}
          label="Cities"
          value={formatNumber(
            new Set(bookings.map((booking) => booking.eventCity)).size,
          )}
          suffix="locations"
          tone="yellow"
          foot="Distinct event cities in view"
        />
      </section>

      <form className="admin-filter-bar" method="get" role="search">
        <div className="admin-filter-grid is-seven">
          <div className="admin-field is-wide">
            <label className="admin-label" htmlFor="q">
              Search requests
            </label>
            <div style={{ position: "relative" }}>
              <FiSearch
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: 10,
                  top: 12,
                  color: "var(--adm-subtle)",
                  fontSize: 13,
                }}
              />
              <input
                id="q"
                name="q"
                defaultValue={filters.q || ""}
                className="admin-input"
                style={{ paddingLeft: 30 }}
                placeholder="Company, event, contact, city, email, phone or ID"
              />
            </div>
          </div>

          <div className="admin-field">
            <label className="admin-label" htmlFor="city">
              City
            </label>
            <select
              id="city"
              name="city"
              className="admin-select"
              defaultValue={filters.city || "all"}
            >
              <option value="all">All cities</option>
              {facets.cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-field">
            <label className="admin-label" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              name="status"
              className="admin-select"
              defaultValue={filters.status || "all"}
            >
              <option value="all">All statuses</option>
              {BOOKING_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {BOOKING_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-field">
            <label className="admin-label" htmlFor="role">
              Staff role
            </label>
            <select
              id="role"
              name="role"
              className="admin-select"
              defaultValue={filters.role || "all"}
            >
              <option value="all">All roles</option>
              {facets.roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-field">
            <label className="admin-label" htmlFor="dateFrom">
              From
            </label>
            <input
              id="dateFrom"
              name="dateFrom"
              type="date"
              className="admin-input"
              defaultValue={filters.dateFrom || ""}
            />
          </div>

          <div className="admin-field">
            <label className="admin-label" htmlFor="dateTo">
              To
            </label>
            <input
              id="dateTo"
              name="dateTo"
              type="date"
              className="admin-input"
              defaultValue={filters.dateTo || ""}
            />
          </div>

          <div className="admin-filter-actions">
            <button type="submit" className="admin-btn is-primary">
              <FiFilter aria-hidden="true" /> Apply
            </button>
            <a href="/admin/bookings" className="admin-btn is-ghost">
              <FiRefreshCw aria-hidden="true" /> Reset
            </a>
          </div>
        </div>
      </form>

      <section className="admin-card">
        <CardHead
          title="Requests"
          subtitle="Newest events first. Assigned counts only include active assignments."
          action={
            <span className="admin-count-chip">
              {bookings.length} row{bookings.length === 1 ? "" : "s"}
            </span>
          }
        />
        {bookings.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Request</th>
                  <th>Event</th>
                  <th>Dates</th>
                  <th>Roles</th>
                  <th>Crew fill</th>
                  <th>Status</th>
                  <th className="is-right">Open</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
                        <span className="admin-avatar">
                          {initials(booking.clientCompanyName)}
                        </span>
                        <span>
                          <Link
                            href={`/admin/bookings/${booking.id}`}
                            className="admin-row-title"
                            style={{ textDecoration: "none" }}
                          >
                            {booking.clientCompanyName}
                          </Link>
                          <span className="admin-row-sub">
                            <code>{booking.id}</code> ·{" "}
                            {formatRelative(booking.createdAt)}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="admin-row-title">{booking.eventName}</span>
                      <span className="admin-row-sub">
                        {booking.eventType} · {booking.eventCity}, {booking.state}
                      </span>
                    </td>
                    <td className="is-nowrap">
                      {formatDateRange(
                        booking.eventStartDate,
                        booking.eventEndDate,
                      )}
                    </td>
                    <td>
                      <span className="admin-muted">
                        {booking.rolesPreview || "No roles listed"}
                      </span>
                      <span className="admin-row-sub">
                        {booking.roles.length} role
                        {booking.roles.length === 1 ? "" : "s"} requested
                      </span>
                    </td>
                    <td style={{ minWidth: 130 }}>
                      <div className="admin-progress">
                        <span
                          className={fillTone(booking.assigned, booking.requested)}
                          style={{
                            width: `${
                              booking.requested
                                ? Math.min(
                                    100,
                                    Math.round(
                                      (booking.assigned / booking.requested) * 100,
                                    ),
                                  )
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <div className="admin-progress-meta">
                        <span>
                          {booking.assigned}/{booking.requested || booking.totalStaff}
                        </span>
                        <span>{formatNumber(booking.remaining)} left</span>
                      </div>
                    </td>
                    <td className="is-nowrap">
                      <StatusPill
                        status={booking.status}
                        label={booking.statusLabel}
                      />
                      {booking.urgent ? (
                        <span
                          className="admin-pill is-danger"
                          style={{ marginLeft: 5 }}
                        >
                          urgent
                        </span>
                      ) : null}
                    </td>
                    <td className="is-right is-nowrap">
                      <Link
                        href={`/admin/bookings/${booking.id}`}
                        className="admin-btn is-small"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No requests match these filters"
            action={
              <Link href="/admin/bookings" className="admin-btn">
                Clear filters
              </Link>
            }
          >
            Try a different city, date range or status. New client submissions
            appear here automatically.
          </EmptyState>
        )}
      </section>

      {!canManage ? (
        <p className="admin-subtle admin-small" style={{ marginTop: 12 }}>
          Your role can review requests but cannot change booking status,
          quotations or assignments.
        </p>
      ) : null}
    </>
  );
}
