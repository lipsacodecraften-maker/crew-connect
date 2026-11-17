import Link from "next/link";
import {
  FiActivity,
  FiAlertCircle,
  FiArrowUpRight,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiClipboard,
  FiClock,
  FiFileText,
  FiTarget,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";

import { can, getAdminSession } from "@/lib/admin/auth";
import { getDashboardOverview } from "@/lib/admin/overview";
import {
  BOOKING_STATUS_LABELS,
  STAFF_REVIEW_LABELS,
} from "@/lib/admin/constants";
import {
  formatIsoDate,
  formatNumber,
  formatRelative,
  formatTimestamp,
} from "@/lib/admin/format";
import {
  CardHead,
  EmptyState,
  MetricCard,
  PageHeader,
  StatusPill,
} from "../_components/ui";
import { fillTone, initials } from "../_components/status";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [session, overview] = await Promise.all([
    getAdminSession(),
    getDashboardOverview(),
  ]);

  const { metrics, bookingPipeline, staffPipeline } = overview;
  const totalBookingRequests = bookingPipeline.reduce(
    (sum, row) => sum + row.count,
    0,
  );
  const totalStaffRows = staffPipeline.reduce((sum, row) => sum + row.count, 0);

  return (
    <>
      <PageHeader
        eyebrow="Operations overview"
        title={
          <>
            Good to see you, {session?.name?.split(" ")[0] || "team"}.
            <br />
            Here is the desk today.
          </>
        }
        subtitle="Live staffing, client requests, approvals and job-board activity pulled straight from PostgreSQL."
        actions={
          <>
            <Link href="/admin/bookings" className="admin-btn is-primary">
              <FiClipboard aria-hidden="true" /> Open client requests
            </Link>
            <Link href="/admin/matching" className="admin-btn">
              <FiTarget aria-hidden="true" /> Match staff
            </Link>
          </>
        }
      />

      <section className="admin-grid admin-grid-5" aria-label="Key metrics">
        <MetricCard
          icon={<FiUsers aria-hidden="true" />}
          label="Staff registrations"
          value={formatNumber(metrics.totalStaff)}
          suffix="total"
          tone="blue"
          foot={
            <>
              <strong>{formatNumber(metrics.approvedStaff)} approved</strong> in
              the pool
            </>
          }
        />
        <MetricCard
          icon={<FiUserCheck aria-hidden="true" />}
          label="Pending approvals"
          value={formatNumber(metrics.pendingStaff)}
          suffix="in queue"
          tone="yellow"
          foot={
            <>
              <strong>{formatNumber(metrics.onHoldStaff)}</strong> waiting on
              details
            </>
          }
        />
        <MetricCard
          icon={<FiCheckCircle aria-hidden="true" />}
          label="Available staff"
          value={formatNumber(metrics.availableStaff)}
          suffix="ready"
          tone="green"
          foot="Approved and available today"
        />
        <MetricCard
          icon={<FiCalendar aria-hidden="true" />}
          label="Upcoming events"
          value={formatNumber(metrics.upcomingEvents)}
          suffix="live"
          tone="accent"
          foot={
            <>
              <strong>{formatNumber(metrics.assignedStaff)}</strong> crew already
              assigned
            </>
          }
        />
        <MetricCard
          icon={<FiClipboard aria-hidden="true" />}
          label="Manpower requests"
          value={formatNumber(metrics.totalRequests)}
          suffix="all time"
          tone="blue"
          foot="Client event requirements received"
        />
        <MetricCard
          icon={<FiBriefcase aria-hidden="true" />}
          label="Open applications"
          value={formatNumber(metrics.openApplications)}
          suffix="to review"
          tone="yellow"
          foot={
            <>
              <strong>{formatNumber(metrics.openJobs)}</strong> open job listings
            </>
          }
        />
        <MetricCard
          icon={<FiFileText aria-hidden="true" />}
          label="Quotations in progress"
          value={formatNumber(metrics.draftQuotations)}
          suffix="drafts / sent"
          tone="accent"
          foot="Prepare, send and track client pricing"
        />
        <MetricCard
          icon={<FiTarget aria-hidden="true" />}
          label="Assignment fill"
          value={
            metrics.upcomingEvents
              ? formatNumber(
                  Math.round(
                    (metrics.assignedStaff /
                      Math.max(
                        1,
                        overview.upcomingEvents.reduce(
                          (sum, event) => sum + event.requested,
                          0,
                        ),
                      )) *
                      100,
                  ),
                )
              : "0"
          }
          suffix="%"
          tone="green"
          foot="Upcoming crew demand covered"
        />
        <MetricCard
          icon={<FiClock aria-hidden="true" />}
          label="Shortlisted"
          value={formatNumber(
            overview.recentApplications.filter(
              (application) => application.status === "shortlisted",
            ).length,
          )}
          suffix="recent"
          tone="yellow"
          foot="Latest applications shortlisted"
        />
        <MetricCard
          icon={<FiActivity aria-hidden="true" />}
          label="Pipeline activity"
          value={formatNumber(totalBookingRequests + totalStaffRows)}
          suffix="records"
          tone="blue"
          foot="Requests and candidate records in view"
        />
      </section>

      <div className="admin-split" style={{ marginTop: 18 }}>
        <div className="admin-stack">
          <section className="admin-card">
            <CardHead
              title="Upcoming events"
              subtitle="Next events with live crew fill progress."
              action={
                <Link href="/admin/bookings" className="admin-link">
                  All requests <FiArrowUpRight aria-hidden="true" />
                </Link>
              }
            />
            {overview.upcomingEvents.length ? (
              <div className="admin-list">
                {overview.upcomingEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/admin/bookings/${event.id}`}
                    className="admin-list-row"
                    style={{ textDecoration: "none" }}
                  >
                    <span className="admin-avatar">
                      {initials(event.eventName)}
                    </span>
                    <div className="admin-list-main">
                      <strong>{event.eventName}</strong>
                      <p>
                        {event.eventType} · {event.eventCity} ·{" "}
                        {formatIsoDate(event.eventStartDate)}
                      </p>
                      <div
                        className="admin-progress"
                        style={{ marginTop: 9 }}
                        aria-label={`${event.assigned} of ${event.requested} crew assigned`}
                      >
                        <span
                          className={fillTone(event.assigned, event.requested)}
                          style={{ width: `${Math.min(100, event.fillPercent)}%` }}
                        />
                      </div>
                      <div className="admin-progress-meta">
                        <span>
                          {event.assigned}/{event.requested || event.totalStaff}{" "}
                          crew assigned
                        </span>
                        <span>{event.fillPercent}% filled</span>
                      </div>
                    </div>
                    <div className="admin-list-side">
                      <StatusPill status={event.status} />
                      <small>{event.assignments.length} assignments</small>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState title="No upcoming events">
                New client requirements will appear here once they are submitted.
              </EmptyState>
            )}
          </section>

          <section className="admin-card">
            <CardHead
              title="Recent client requests"
              subtitle="The latest six requests and their current booking stage."
              action={
                <Link href="/admin/bookings" className="admin-link">
                  View pipeline <FiArrowUpRight aria-hidden="true" />
                </Link>
              }
            />
            {overview.recentRequests.length ? (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Request</th>
                      <th>Event</th>
                      <th>Date</th>
                      <th>Crew</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.recentRequests.map((request) => (
                      <tr key={request.id}>
                        <td>
                          <Link
                            href={`/admin/bookings/${request.id}`}
                            className="admin-row-title"
                            style={{ textDecoration: "none" }}
                          >
                            {request.clientCompanyName}
                          </Link>
                          <span className="admin-row-sub">
                            <code>{request.id}</code> ·{" "}
                            {formatRelative(request.createdAt)}
                          </span>
                        </td>
                        <td>
                          <span className="admin-row-title">
                            {request.eventName}
                          </span>
                          <span className="admin-row-sub">
                            {request.eventType} · {request.eventCity}
                          </span>
                        </td>
                        <td className="is-nowrap">
                          {formatIsoDate(request.eventStartDate)}
                        </td>
                        <td className="is-nowrap">
                          {formatNumber(request.totalStaff)} requested
                        </td>
                        <td className="is-nowrap">
                          <StatusPill
                            status={request.status}
                            label={
                              BOOKING_STATUS_LABELS[request.status] ||
                              request.status
                            }
                          />
                          {request.urgent ? (
                            <span className="admin-pill is-danger" style={{ marginLeft: 5 }}>
                              urgent
                            </span>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="No client requests yet">
                Booking requests from the public site will land here.
              </EmptyState>
            )}
          </section>
        </div>

        <div className="admin-stack">
          <section className="admin-card">
            <CardHead
              title="Booking pipeline"
              subtitle="Every request by current stage."
            />
            <div className="admin-card-body admin-stack-sm">
              {bookingPipeline.map((row) => (
                <div key={row.status}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      marginBottom: 5,
                      fontSize: 11,
                    }}
                  >
                    <span className="admin-muted">
                      {BOOKING_STATUS_LABELS[row.status] || row.status}
                    </span>
                    <strong style={{ color: "var(--adm-text)" }}>
                      {formatNumber(row.count)}
                    </strong>
                  </div>
                  <div className="admin-progress">
                    <span
                      style={{
                        width: `${
                          totalBookingRequests
                            ? Math.round((row.count / totalBookingRequests) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="admin-card">
            <CardHead
              title="Candidate pipeline"
              subtitle="Where the staff pool stands right now."
            />
            <div className="admin-card-body admin-stack-sm">
              {staffPipeline.map((row) => (
                <div key={row.status}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      marginBottom: 5,
                      fontSize: 11,
                    }}
                  >
                    <span className="admin-muted">
                      {STAFF_REVIEW_LABELS[row.status] || row.status}
                    </span>
                    <strong style={{ color: "var(--adm-text)" }}>
                      {formatNumber(row.count)}
                    </strong>
                  </div>
                  <div className="admin-progress">
                    <span
                      className={
                        row.status === "approved"
                          ? "is-success"
                          : row.status === "pending_review"
                            ? "is-warning"
                            : ""
                      }
                      style={{
                        width: `${
                          totalStaffRows
                            ? Math.round((row.count / totalStaffRows) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="admin-card">
            <CardHead
              title="Recent applications"
              subtitle="Latest crew applying to published jobs."
              action={
                <Link href="/admin/jobs" className="admin-link">
                  Job board <FiArrowUpRight aria-hidden="true" />
                </Link>
              }
            />
            {overview.recentApplications.length ? (
              <div className="admin-list">
                {overview.recentApplications.map((application) => (
                  <Link
                    key={application.id}
                    href={`/admin/staff/${application.registrationId}`}
                    className="admin-list-row"
                    style={{ textDecoration: "none" }}
                  >
                    <span className="admin-avatar">
                      {initials(application.staffName)}
                    </span>
                    <div className="admin-list-main">
                      <strong>{application.staffName}</strong>
                      <p>
                        {application.jobRole} ·{" "}
                        {application.city || "city not set"}
                      </p>
                    </div>
                    <div className="admin-list-side">
                      <StatusPill status={application.status} />
                      <small>{formatRelative(application.createdAt)}</small>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState title="No applications yet">
                Applications on published job listings will appear here.
              </EmptyState>
            )}
          </section>

          <section className="admin-card">
            <CardHead
              title="Audit trail"
              subtitle="Newest actions written by the desk."
            />
            {overview.audit.length ? (
              <div className="admin-card-body">
                <ul className="admin-timeline">
                  {overview.audit.slice(0, 8).map((entry, index) => (
                    <li key={entry.id} className={index === 0 ? "is-current" : ""}>
                      <strong>{entry.action.replace(/_/g, " ")}</strong>
                      <small>
                        {entry.adminName} · {formatRelative(entry.createdAt)}
                      </small>
                      {entry.detail ? <p>{entry.detail}</p> : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <EmptyState title="No audit entries yet">
                Sign-ins and dashboard changes are recorded here.
              </EmptyState>
            )}
          </section>

          {metrics.pendingStaff > 0 ? (
            <section className="admin-card">
              <div className="admin-card-body">
                <div className="admin-alert is-warning">
                  <FiAlertCircle aria-hidden="true" /> {metrics.pendingStaff}{" "}
                  candidate profile(s) are waiting for review.
                </div>
                <Link
                  href="/admin/staff?status=pending_review"
                  className="admin-btn"
                  style={{ width: "100%", marginTop: 10 }}
                >
                  Review pending staff <FiArrowUpRight aria-hidden="true" />
                </Link>
              </div>
            </section>
          ) : null}
        </div>
      </div>

      <p className="admin-subtle admin-small" style={{ marginTop: 18 }}>
        Snapshot generated {formatTimestamp(new Date())} ·{" "}
        {can(session!, "team.manage") ? "super admin session" : "scoped session"} ·
        all times local to the server.
      </p>
    </>
  );
}
