import Link from "next/link";
import {
  FiArrowLeft,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiExternalLink,
  FiMapPin,
  FiUsers,
} from "react-icons/fi";

import { can, getAdminSession } from "@/lib/admin/auth";
import { getAdminJobDetail } from "@/lib/admin/jobs";
import { APPLICATION_STATUS_META } from "@/lib/jobs/config";
import {
  formatCurrency,
  formatIsoDate,
  formatNumber,
  formatTimestamp,
  parseStringArray,
} from "@/lib/admin/format";
import {
  CardHead,
  EmptyState,
  MetricCard,
  PageHeader,
  StatusPill,
} from "../../../_components/ui";
import { initials } from "../../../_components/status";
import AssignmentControls from "../../../_components/AssignmentControls";
import JobStatusControls from "./JobStatusControls";
import ApplicationActions from "./ApplicationActions";

export const dynamic = "force-dynamic";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const [session, job] = await Promise.all([
    getAdminSession(),
    getAdminJobDetail(jobId),
  ]);

  if (!job) {
    return (
      <>
        <PageHeader
          eyebrow="Job board"
          title="Listing not found"
          subtitle="The job may have been removed or the link is incorrect."
          actions={
            <Link href="/admin/jobs" className="admin-btn">
              <FiArrowLeft aria-hidden="true" /> Back to jobs
            </Link>
          }
        />
        <section className="admin-card">
          <EmptyState title="No listing with that ID">
            Open job management and choose a listing.
          </EmptyState>
        </section>
      </>
    );
  }

  if (!can(session!, "jobs.view")) {
    return (
      <section className="admin-card">
        <EmptyState title="You do not have access to job management">
          Ask a super admin to review your role permissions.
        </EmptyState>
      </section>
    );
  }

  const canManageJobs = can(session!, "jobs.manage");
  const canManageApplications = can(session!, "applications.manage");
  const canAttend = can(session!, "attendance.manage");

  return (
    <>
      <PageHeader
        eyebrow={`Job listing · ${job.id}`}
        title={`${job.jobRole} · ${job.city}`}
        subtitle={
          <>
            {job.eventType} · {formatIsoDate(job.eventDate)}
            {job.endDate ? ` → ${formatIsoDate(job.endDate)}` : ""} ·{" "}
            {job.dutyStartTime
              ? `${job.dutyStartTime}–${job.dutyEndTime}`
              : "Shift timing TBC"}{" "}
            · {job.experienceRequired} experience
          </>
        }
        actions={
          <>
            <Link href="/admin/jobs" className="admin-btn is-ghost">
              <FiArrowLeft aria-hidden="true" /> Jobs
            </Link>
            {job.status === "open" ? (
              <a
                href="/available-jobs"
                target="_blank"
                rel="noreferrer"
                className="admin-btn"
              >
                <FiExternalLink aria-hidden="true" /> Public board
              </a>
            ) : null}
            <StatusPill status={job.status} />
          </>
        }
      />

      <section className="admin-grid admin-grid-4" style={{ marginBottom: 16 }}>
        <MetricCard
          icon={<FiUsers aria-hidden="true" />}
          label="Applications"
          value={formatNumber(job.applicationCount)}
          suffix="received"
          tone="accent"
          foot={`${job.submittedCount} new · ${job.shortlistedCount} shortlisted`}
        />
        <MetricCard
          icon={<FiCheckCircle aria-hidden="true" />}
          label="Selected"
          value={`${job.selectedCount}/${job.openings}`}
          suffix="filled"
          tone="green"
          foot={`${job.remaining} position${job.remaining === 1 ? "" : "s"} remaining`}
        />
        <MetricCard
          icon={<FiClock aria-hidden="true" />}
          label="Duty window"
          value={
            job.dutyStartTime
              ? `${job.dutyStartTime}–${job.dutyEndTime}`
              : "TBC"
          }
          tone="yellow"
          foot={job.dutyHours ? `${job.dutyHours} hours` : "Confirmed at briefing"}
        />
        <MetricCard
          icon={<FiBriefcase aria-hidden="true" />}
          label="Pay range"
          value={
            job.paymentMin || job.paymentMax
              ? `${job.paymentMin ? formatCurrency(job.paymentMin) : "—"} – ${
                  job.paymentMax ? formatCurrency(job.paymentMax) : "—"
                }`
              : "At briefing"
          }
          tone="blue"
          foot={job.publishedAt ? `Published ${formatTimestamp(job.publishedAt)}` : "Not published"}
        />
      </section>

      <div className="admin-split">
        <div className="admin-stack">
          <section className="admin-card">
            <CardHead
              title="Listing brief"
              subtitle="Public-facing role details and internal links."
              action={<StatusPill status={job.status} />}
            />
            <div className="admin-card-body">
              <div className="admin-info-grid">
                <div className="admin-info">
                  <dt>Event type</dt>
                  <dd>{job.eventType}</dd>
                </div>
                <div className="admin-info">
                  <dt>Job role</dt>
                  <dd>{job.jobRole}</dd>
                </div>
                <div className="admin-info">
                  <dt>City</dt>
                  <dd>
                    <FiMapPin aria-hidden="true" /> {job.city}
                  </dd>
                </div>
                <div className="admin-info">
                  <dt>Event date</dt>
                  <dd>
                    <FiCalendar aria-hidden="true" /> {formatIsoDate(job.eventDate)}
                    {job.endDate ? ` → ${formatIsoDate(job.endDate)}` : ""}
                  </dd>
                </div>
                <div className="admin-info">
                  <dt>Openings</dt>
                  <dd>{formatNumber(job.openings)}</dd>
                </div>
                <div className="admin-info">
                  <dt>Experience required</dt>
                  <dd>{job.experienceRequired}</dd>
                </div>
                <div className="admin-info">
                  <dt>Payment range</dt>
                  <dd>
                    {job.paymentMin || job.paymentMax
                      ? `${job.paymentMin ? formatCurrency(job.paymentMin) : "—"} – ${
                          job.paymentMax ? formatCurrency(job.paymentMax) : "—"
                        }`
                      : "Confirmed at briefing"}
                  </dd>
                </div>
                <div className="admin-info">
                  <dt>Linked booking</dt>
                  <dd>
                    {job.booking ? (
                      <Link
                        href={`/admin/bookings/${job.booking.id}`}
                        className="admin-link"
                      >
                        {job.booking.eventName} · {job.booking.id}
                      </Link>
                    ) : (
                      "Standalone listing"
                    )}
                  </dd>
                </div>
                <div className="admin-info">
                  <dt>Created</dt>
                  <dd>{formatTimestamp(job.createdAt)}</dd>
                </div>
                <div className="admin-info">
                  <dt>Last updated</dt>
                  <dd>{formatTimestamp(job.updatedAt)}</dd>
                </div>
              </div>

              {job.summary ? (
                <div className="admin-form-note" style={{ marginTop: 12 }}>
                  <strong>Role summary:</strong> {job.summary}
                </div>
              ) : null}
            </div>
          </section>

          <section className="admin-card">
            <CardHead
              title="Applications"
              subtitle="Review candidates, shortlist, reject or select and allocate. Allocation re-checks conflicts before creating an assignment."
              action={
                <span className="admin-count-chip">
                  {job.applicationCount} application
                  {job.applicationCount === 1 ? "" : "s"}
                </span>
              }
            />
            {job.applications.length ? (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Profile</th>
                      <th>Skills</th>
                      <th>Application</th>
                      <th>Assignment</th>
                      <th className="is-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {job.applications.map((application) => (
                      <tr key={application.id}>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              gap: 9,
                              alignItems: "center",
                            }}
                          >
                            <span className="admin-avatar">
                              {initials(application.applicant.fullName)}
                            </span>
                            <span>
                              <Link
                                href={`/admin/staff/${application.registrationId}`}
                                className="admin-row-title"
                                style={{ textDecoration: "none" }}
                              >
                                {application.applicant.fullName}
                              </Link>
                              <span className="admin-row-sub">
                                {application.applicant.currentCity} ·{" "}
                                {application.applicant.mobileNumber}
                              </span>
                              <span className="admin-row-sub">
                                Applied {formatTimestamp(application.createdAt)}
                              </span>
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="admin-row-title">
                            {application.applicant.experienceLevel || "—"}
                          </span>
                          <span className="admin-row-sub">
                            {application.applicant.yearsExperience} year
                            {application.applicant.yearsExperience === 1 ? "" : "s"} ·{" "}
                            {application.applicant.expectedPayment
                              ? formatCurrency(application.applicant.expectedPayment)
                              : "Rate TBC"}
                          </span>
                          <span className="admin-row-sub">
                            Staff status: {application.applicant.status || "unknown"}
                          </span>
                        </td>
                        <td>
                          <div className="admin-inline-list">
                            {parseStringArray(application.applicant.skills)
                              .slice(0, 4)
                              .map((skill) => (
                                <span className="admin-tag" key={skill}>
                                  {skill}
                                </span>
                              ))}
                          </div>
                        </td>
                        <td>
                          <StatusPill status={application.status} />
                          {application.note ? (
                            <span className="admin-row-sub">{application.note}</span>
                          ) : null}
                          <span className="admin-row-sub">
                            {APPLICATION_STATUS_META[
                              application.status as keyof typeof APPLICATION_STATUS_META
                            ]?.label || application.status}
                          </span>
                        </td>
                        <td>
                          {application.assignment ? (
                            <>
                              <StatusPill status={application.assignment.status} />
                              <span className="admin-row-sub">
                                {formatIsoDate(application.assignment.workDate)} ·{" "}
                                {application.assignment.attendanceStatus}
                              </span>
                              {canAttend || canManageApplications ? (
                                <div style={{ marginTop: 6 }}>
                                  <AssignmentControls
                                    assignmentId={application.assignment.id}
                                    status={application.assignment.status}
                                    attendanceStatus={
                                      application.assignment.attendanceStatus
                                    }
                                    canManage={canManageApplications}
                                    canManageAttendance={canAttend}
                                  />
                                </div>
                              ) : null}
                            </>
                          ) : (
                            <span className="admin-subtle admin-small">
                              No assignment created
                            </span>
                          )}
                        </td>
                        <td className="is-right">
                          {canManageApplications ? (
                            <ApplicationActions
                              applicationId={application.id}
                              status={application.status}
                              hasBooking={Boolean(job.bookingRef)}
                            />
                          ) : (
                            <span className="admin-subtle admin-small">
                              Read-only
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="No applications yet">
                Publish the listing so crew can apply from the public job board.
              </EmptyState>
            )}
          </section>
        </div>

        <div className="admin-stack">
          <section className="admin-card">
            <CardHead
              title="Listing status"
              subtitle="Publish approved jobs, close filled positions or return to draft."
            />
            <div className="admin-card-body">
              {canManageJobs ? (
                <JobStatusControls jobId={job.id} currentStatus={job.status} />
              ) : (
                <div className="admin-form-note">
                  Your role can view listings but not change their status.
                  Current status: <strong>{job.status}</strong>.
                </div>
              )}
            </div>
          </section>

          <section className="admin-card">
            <CardHead
              title="Allocation summary"
              action={
                <span className="admin-count-chip">
                  {job.selectedCount}/{job.openings}
                </span>
              }
            />
            <div className="admin-card-body">
              <div className="admin-progress">
                <span
                  className={
                    job.selectedCount >= job.openings ? "is-success" : ""
                  }
                  style={{
                    width: `${
                      job.openings
                        ? Math.min(
                            100,
                            Math.round((job.selectedCount / job.openings) * 100),
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
              <div className="admin-progress-meta">
                <span>{job.remaining} remaining</span>
                <span>{job.selectedCount} selected</span>
              </div>
              <div className="admin-divider" />
              <div className="admin-form-note">
                Selecting a candidate on a booking-linked listing creates a
                confirmed event assignment. If the booking is not linked, the
                candidate is selected on the listing only.
              </div>
              {job.booking ? (
                <div className="admin-btn-row" style={{ marginTop: 10 }}>
                  <Link
                    href={`/admin/bookings/${job.booking.id}`}
                    className="admin-btn is-small"
                  >
                    <FiBriefcase aria-hidden="true" /> Open booking
                  </Link>
                </div>
              ) : null}
            </div>
          </section>

          <section className="admin-card">
            <CardHead title="Application pipeline" />
            <div className="admin-card-body">
              <dl className="admin-info-grid">
                <div className="admin-info">
                  <dt>New</dt>
                  <dd>{formatNumber(job.submittedCount)}</dd>
                </div>
                <div className="admin-info">
                  <dt>Shortlisted</dt>
                  <dd>{formatNumber(job.shortlistedCount)}</dd>
                </div>
                <div className="admin-info">
                  <dt>Selected</dt>
                  <dd>{formatNumber(job.selectedCount)}</dd>
                </div>
                <div className="admin-info">
                  <dt>Not selected</dt>
                  <dd>
                    {formatNumber(
                      job.applicationCount -
                        job.submittedCount -
                        job.shortlistedCount -
                        job.selectedCount,
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
