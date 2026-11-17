import Link from "next/link";
import {
  FiArrowLeft,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiMapPin,
  FiTarget,
  FiUser,
  FiUsers,
} from "react-icons/fi";

import { can, getAdminSession } from "@/lib/admin/auth";
import { getStaffDetail } from "@/lib/admin/staff";
import { listMatchingBookings } from "@/lib/admin/matching";
import {
  formatCurrency,
  formatIsoDate,
  formatNumber,
  formatTimestamp,
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
import StaffReviewForm from "./StaffReviewForm";
import StaffAssignForm from "./StaffAssignForm";
import WorkHistoryManager from "./WorkHistoryManager";

export const dynamic = "force-dynamic";

export default async function StaffDetailPage({
  params,
}: {
  params: Promise<{ registrationId: string }>;
}) {
  const { registrationId } = await params;
  const [session, staff] = await Promise.all([
    getAdminSession(),
    getStaffDetail(registrationId),
  ]);

  if (!staff) {
    return (
      <>
        <PageHeader
          eyebrow="People & work"
          title="Candidate not found"
          subtitle="The profile may have been removed or the link is incorrect."
          actions={
            <Link href="/admin/staff" className="admin-btn">
              <FiArrowLeft aria-hidden="true" /> Back to staff
            </Link>
          }
        />
        <section className="admin-card">
          <EmptyState title="No staff profile with that ID">
            Open the staff directory and choose a candidate.
          </EmptyState>
        </section>
      </>
    );
  }

  if (!can(session!, "staff.view")) {
    return (
      <section className="admin-card">
        <EmptyState title="You do not have access to staff profiles">
          Ask a super admin to review your role permissions.
        </EmptyState>
      </section>
    );
  }

  const canReview = can(session!, "staff.review");
  const canAssign = can(session!, "assignments.manage");
  const canAttend = can(session!, "attendance.manage");

  const bookings = canAssign ? await listMatchingBookings() : [];

  return (
    <>
      <PageHeader
        eyebrow={`Candidate · ${staff.id}`}
        title={staff.fullName}
        subtitle={
          <>
            {staff.currentCity} · {staff.experienceLevel} ·{" "}
            {staff.yearsExperience} year
            {staff.yearsExperience === 1 ? "" : "s"} experience ·{" "}
            {staff.availabilityLabel}
          </>
        }
        actions={
          <>
            <Link href="/admin/staff" className="admin-btn is-ghost">
              <FiArrowLeft aria-hidden="true" /> Staff
            </Link>
            {staff.status === "approved" ? (
              <Link
                href={`/admin/matching?registrationId=${staff.id}`}
                className="admin-btn"
              >
                <FiTarget aria-hidden="true" /> Find work
              </Link>
            ) : null}
            <StatusPill status={staff.status} label={staff.statusLabel} />
          </>
        }
      />

      <section className="admin-grid admin-grid-4" style={{ marginBottom: 16 }}>
        <MetricCard
          icon={<FiBriefcase aria-hidden="true" />}
          label="Assignments"
          value={formatNumber(staff.stats.activeAssignments)}
          suffix="active"
          tone="accent"
          foot={`${formatNumber(staff.stats.completedAssignments)} completed`}
        />
        <MetricCard
          icon={<FiFileText aria-hidden="true" />}
          label="Job applications"
          value={formatNumber(staff.stats.applications)}
          suffix="submitted"
          tone="blue"
          foot="Public job board activity"
        />
        <MetricCard
          icon={<FiClock aria-hidden="true" />}
          label="Shift preferences"
          value={staff.shiftTypes.length ? staff.shiftTypes.join(", ") : "—"}
          tone="yellow"
          foot={staff.availabilityLabel}
        />
        <MetricCard
          icon={<FiUsers aria-hidden="true" />}
          label="Expected pay"
          value={formatCurrency(staff.expectedPayment)}
          suffix="/ shift"
          tone="green"
          foot={
            staff.willingToTravel
              ? "Willing to travel"
              : "Prefers home city"
          }
        />
      </section>

      <div className="admin-split">
        <div className="admin-stack">
          <section className="admin-card">
            <CardHead
              title="Candidate dossier"
              subtitle="Details captured during public registration."
              action={<StatusPill status={staff.status} label={staff.statusLabel} />}
            />
            <div className="admin-card-body">
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <span
                  className="admin-avatar"
                  style={{ width: 64, height: 64, fontSize: 20 }}
                >
                  {initials(staff.fullName)}
                </span>
                <div>
                  <strong className="admin-row-title">{staff.fullName}</strong>
                  <span className="admin-row-sub">
                    {staff.mobileNumber}
                    {staff.whatsappVerified ? " · WhatsApp verified" : ""}
                  </span>
                  <span className="admin-row-sub">
                    {staff.emailAddress || "No email supplied"}
                  </span>
                </div>
              </div>

              <div className="admin-info-grid">
                <div className="admin-info">
                  <dt>Current city</dt>
                  <dd>
                    {staff.currentCity} {staff.areaPincode ? `(${staff.areaPincode})` : ""}
                  </dd>
                </div>
                <div className="admin-info">
                  <dt>Age / date of birth</dt>
                  <dd>
                    {staff.age || "—"}
                    {staff.dateOfBirth ? ` · ${staff.dateOfBirth}` : ""}
                  </dd>
                </div>
                <div className="admin-info">
                  <dt>Languages</dt>
                  <dd>{staff.languages.join(", ") || "—"}</dd>
                </div>
                <div className="admin-info">
                  <dt>Skills</dt>
                  <dd>
                    {staff.skills.join(", ") || "—"}
                    {staff.otherSkill ? ` · ${staff.otherSkill}` : ""}
                  </dd>
                </div>
                <div className="admin-info">
                  <dt>Preferred cities</dt>
                  <dd>{staff.preferredCities.join(", ") || "—"}</dd>
                </div>
                <div className="admin-info">
                  <dt>Shift types</dt>
                  <dd>{staff.shiftTypes.join(", ") || "—"}</dd>
                </div>
                <div className="admin-info">
                  <dt>Availability window</dt>
                  <dd>
                    {staff.availableFrom || "Anytime"} →{" "}
                    {staff.availableUntil || "Open"}
                  </dd>
                </div>
                <div className="admin-info">
                  <dt>Travel / transport</dt>
                  <dd>
                    {staff.willingToTravel ? "Willing to travel" : "No travel"} ·{" "}
                    {staff.transportAvailable ? "Transport available" : "Own transport not confirmed"}
                  </dd>
                </div>
                <div className="admin-info">
                  <dt>Previous events</dt>
                  <dd>{staff.previousEvents || "—"}</dd>
                </div>
                <div className="admin-info">
                  <dt>Consents</dt>
                  <dd>
                    Docs {staff.documentsConsent ? "✓" : "✗"} · Privacy{" "}
                    {staff.privacyConsent ? "✓" : "✗"} · Terms{" "}
                    {staff.termsConsent ? "✓" : "✗"} · 18+{" "}
                    {staff.ageConfirmed ? "✓" : "✗"}
                  </dd>
                </div>
                <div className="admin-info">
                  <dt>Registered</dt>
                  <dd>{formatTimestamp(staff.createdAt)}</dd>
                </div>
                <div className="admin-info">
                  <dt>Last updated</dt>
                  <dd>{formatTimestamp(staff.updatedAt)}</dd>
                </div>
              </div>

              {staff.profilePhoto.name ? (
                <div className="admin-divider" />
              ) : null}
              {staff.profilePhoto.name ? (
                <a
                  href={`/api/staff-registrations/${staff.id}/photo`}
                  target="_blank"
                  rel="noreferrer"
                  className="admin-link"
                >
                  <FiUser aria-hidden="true" /> Open profile photo (
                  {staff.profilePhoto.name})
                </a>
              ) : null}
            </div>
          </section>

          <section className="admin-card">
            <CardHead
              title="Documents"
              subtitle="Secure ID and verification uploads. Files are served only to signed-in admins."
              action={
                <span className="admin-count-chip">
                  {staff.documents.length} file
                  {staff.documents.length === 1 ? "" : "s"}
                </span>
              }
            />
            {staff.documents.length ? (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Kind</th>
                      <th>File</th>
                      <th>Type</th>
                      <th>Uploaded</th>
                      <th className="is-right">Open</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.documents.map((document) => (
                      <tr key={document.id}>
                        <td className="is-nowrap">{document.kind}</td>
                        <td>
                          <span className="admin-row-title">{document.name}</span>
                          <span className="admin-row-sub">
                            {formatNumber(Math.round(document.size / 1024))} KB
                          </span>
                        </td>
                        <td className="is-nowrap">{document.fileType || "—"}</td>
                        <td className="is-nowrap">
                          {formatTimestamp(document.createdAt)}
                        </td>
                        <td className="is-right">
                          <a
                            className="admin-btn is-small is-ghost"
                            href={`/api/staff-registrations/${staff.id}/documents/${document.id}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <FiFileText aria-hidden="true" /> View
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="No documents uploaded" />
            )}
          </section>

          <section className="admin-card">
            <CardHead
              title="Assignments & attendance"
              subtitle="Every event this crew member has been dispatched to. Mark attendance as the event progresses."
              action={
                <span className="admin-count-chip">
                  {staff.stats.activeAssignments} active ·{" "}
                  {staff.stats.completedAssignments} completed
                </span>
              }
            />
            {staff.assignments.length ? (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Role / date</th>
                      <th>Shift</th>
                      <th>Status & attendance</th>
                      <th>Pay</th>
                      <th className="is-right">Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.assignments.map((assignment) => (
                      <tr key={assignment.id}>
                        <td>
                          <Link
                            href={`/admin/bookings/${assignment.bookingId}`}
                            className="admin-row-title"
                            style={{ textDecoration: "none" }}
                          >
                            {assignment.eventName}
                          </Link>
                          <span className="admin-row-sub">
                            {assignment.city || "—"} · {assignment.eventType || "Event"}
                          </span>
                        </td>
                        <td>
                          <span className="admin-row-title">{assignment.role}</span>
                          <span className="admin-row-sub">
                            <FiCalendar aria-hidden="true" />{" "}
                            {formatIsoDate(assignment.workDate)}
                          </span>
                        </td>
                        <td className="is-nowrap">
                          {assignment.shiftStart || "—"}–
                          {assignment.shiftEnd || "—"}
                        </td>
                        <td className="is-nowrap">
                          <StatusPill status={assignment.status} />
                          <span className="admin-row-sub">
                            Attendance: {assignment.attendanceStatus}
                          </span>
                          {assignment.checkInAt ? (
                            <span className="admin-row-sub">
                              In {formatTimestamp(assignment.checkInAt)}
                            </span>
                          ) : null}
                          {assignment.checkOutAt ? (
                            <span className="admin-row-sub">
                              Out {formatTimestamp(assignment.checkOutAt)}
                            </span>
                          ) : null}
                        </td>
                        <td className="is-nowrap">
                          {assignment.payRate === null
                            ? "—"
                            : formatCurrency(assignment.payRate)}
                        </td>
                        <td className="is-right">
                          <AssignmentControls
                            assignmentId={assignment.id}
                            status={assignment.status}
                            attendanceStatus={assignment.attendanceStatus}
                            canManage={canAssign}
                            canManageAttendance={canAttend}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="No assignments yet">
                Use the dispatch panel or the matching screen to assign this crew
                member to a live event.
              </EmptyState>
            )}
          </section>

          <section className="admin-card">
            <CardHead
              title="Work history"
              subtitle="Completed events and manually logged offline work. Used as evidence of experience."
            />
            <WorkHistoryManager
              registrationId={staff.id}
              entries={staff.workHistory}
              canManage={canReview}
            />
          </section>

          <section className="admin-card">
            <CardHead
              title="Job applications"
              subtitle="Applications to public job listings, newest first."
              action={
                <span className="admin-count-chip">
                  {staff.applications.length} total
                </span>
              }
            />
            {staff.applications.length ? (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Listing</th>
                      <th>Event date</th>
                      <th>City</th>
                      <th>Listing status</th>
                      <th>Application</th>
                      <th className="is-right">Open</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.applications.map((application) => (
                      <tr key={application.id}>
                        <td>
                          <span className="admin-row-title">
                            {application.jobRole}
                          </span>
                          <span className="admin-row-sub">
                            Applied {formatTimestamp(application.createdAt)}
                          </span>
                        </td>
                        <td className="is-nowrap">
                          {formatIsoDate(application.eventDate)}
                        </td>
                        <td className="is-nowrap">
                          <FiMapPin aria-hidden="true" /> {application.city || "—"}
                        </td>
                        <td className="is-nowrap">
                          <StatusPill status={application.listingStatus} />
                        </td>
                        <td className="is-nowrap">
                          <StatusPill status={application.status} />
                        </td>
                        <td className="is-right">
                          {application.listingId ? (
                            <Link
                              href={`/admin/jobs/${application.listingId}`}
                              className="admin-btn is-small is-ghost"
                            >
                              <FiBriefcase aria-hidden="true" /> Listing
                            </Link>
                          ) : (
                            <span className="admin-subtle admin-small">Removed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="No job applications yet" />
            )}
          </section>

          <section className="admin-card">
            <CardHead
              title="Review history"
              subtitle="Internal status decisions and notes."
            />
            {staff.history.length ? (
              <div className="admin-card-body">
                <ul className="admin-timeline">
                  {staff.history.map((event, index) => (
                    <li
                      key={`${event.status}-${index}`}
                      className={index === staff.history.length - 1 ? "is-current" : ""}
                    >
                      <strong>{event.statusLabel}</strong>
                      <small>{formatTimestamp(event.createdAt)}</small>
                      {event.note ? <p>{event.note}</p> : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <EmptyState title="No review events recorded" />
            )}
          </section>
        </div>

        <div className="admin-stack">
          <section className="admin-card">
            <CardHead
              title="Review decision"
              subtitle="Approve, reject, hold or request more details. A note is required for reject and hold."
            />
            <div className="admin-card-body">
              {canReview ? (
                <StaffReviewForm
                  registrationId={staff.id}
                  currentStatus={staff.status}
                />
              ) : (
                <div className="admin-form-note">
                  Your role can view this profile but not change its review
                  status. Current status: <strong>{staff.statusLabel}</strong>.
                </div>
              )}
            </div>
          </section>

          <section className="admin-card">
            <CardHead
              title="Assign to event"
              subtitle="Only approved crew can be assigned. Duplicate and shift-overlap checks run on the server."
            />
            <div className="admin-card-body">
              {canAssign ? (
                staff.status === "approved" ? (
                  <StaffAssignForm
                    registrationId={staff.id}
                    bookings={bookings.map((booking) => ({
                      id: booking.id,
                      eventName: booking.eventName,
                      eventCity: booking.eventCity,
                      eventStartDate: booking.eventStartDate,
                      status: booking.status,
                      requirements: booking.requirements,
                    }))}
                  />
                ) : (
                  <div className="admin-form-note">
                    Approve this candidate before assigning them to an event.
                  </div>
                )
              ) : (
                <div className="admin-form-note">
                  Your role cannot create assignments. Ask a coordinator or
                  operations manager.
                </div>
              )}
            </div>
          </section>

          <section className="admin-card">
            <CardHead title="Profile facts" />
            <div className="admin-card-body">
              <dl className="admin-info-grid">
                <div className="admin-info">
                  <dt>Registration ID</dt>
                  <dd className="admin-mono">{staff.id}</dd>
                </div>
                <div className="admin-info">
                  <dt>Review status</dt>
                  <dd>
                    <StatusPill status={staff.status} label={staff.statusLabel} />
                  </dd>
                </div>
                <div className="admin-info">
                  <dt>Total assignments</dt>
                  <dd>{formatNumber(staff.stats.totalAssignments)}</dd>
                </div>
                <div className="admin-info">
                  <dt>Work-history entries</dt>
                  <dd>{formatNumber(staff.workHistory.length)}</dd>
                </div>
              </dl>
              <div className="admin-divider" />
              <div className="admin-btn-row">
                {staff.status === "approved" ? (
                  <Link
                    href={`/admin/matching?registrationId=${staff.id}`}
                    className="admin-btn is-small"
                  >
                    <FiTarget aria-hidden="true" /> Match to a request
                  </Link>
                ) : null}
                <Link href="/admin/staff" className="admin-btn is-small is-ghost">
                  <FiUsers aria-hidden="true" /> All staff
                </Link>
              </div>
            </div>
          </section>

          <section className="admin-card">
            <CardHead title="Availability" />
            <div className="admin-card-body">
              <div className="admin-form-note">
                <FiCheckCircle aria-hidden="true" /> {staff.availabilityLabel}
                <br />
                <span className="admin-small">
                  {staff.availableFrom
                    ? `Available from ${formatIsoDate(staff.availableFrom)}`
                    : "No start restriction"}{" "}
                  ·{" "}
                  {staff.availableUntil
                    ? `until ${formatIsoDate(staff.availableUntil)}`
                    : "no end restriction"}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
