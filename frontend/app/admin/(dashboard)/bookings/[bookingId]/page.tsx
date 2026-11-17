import Link from "next/link";
import {
  FiArrowLeft,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiMapPin,
  FiPrinter,
  FiTarget,
  FiUsers,
} from "react-icons/fi";

import { can, getAdminSession } from "@/lib/admin/auth";
import { getBookingDetail } from "@/lib/admin/bookings";
import { getApprovedStaffForMatching } from "@/lib/admin/staff";
import { parseStringArray } from "@/lib/admin/format";
import {
  formatCurrency,
  formatDateRange,
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
import { fillTone, initials } from "../../../_components/status";
import AssignmentControls from "../../../_components/AssignmentControls";
import AssignmentForm from "./AssignmentForm";
import BookingStatusForm from "./BookingStatusForm";
import QuotationBuilder from "./QuotationBuilder";

export const dynamic = "force-dynamic";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const [session, booking] = await Promise.all([
    getAdminSession(),
    getBookingDetail(bookingId),
  ]);

  if (!booking) {
    return (
      <>
        <PageHeader
          eyebrow="Client requests"
          title="Request not found"
          subtitle="The booking may have been removed or the link is incorrect."
          actions={
            <Link href="/admin/bookings" className="admin-btn">
              <FiArrowLeft aria-hidden="true" /> Back to requests
            </Link>
          }
        />
        <section className="admin-card">
          <EmptyState title="No booking with that ID">
            Open the request pipeline and choose a live booking.
          </EmptyState>
        </section>
      </>
    );
  }

  if (!can(session!, "bookings.view")) {
    return (
      <section className="admin-card">
        <EmptyState title="You do not have access to client requests">
          Ask a super admin to review your role permissions.
        </EmptyState>
      </section>
    );
  }

  const canManageBooking = can(session!, "bookings.manage");
  const canQuote = can(session!, "quotations.manage");
  const canAssign = can(session!, "assignments.manage");
  const canAttend = can(session!, "attendance.manage");

  const approvedStaff = await getApprovedStaffForMatching();
  const staffOptions = approvedStaff.map((member) => ({
    id: member.id,
    fullName: member.fullName,
    currentCity: member.currentCity,
    experienceLevel: member.experienceLevel,
    skills: parseStringArray(member.skills),
    status: "approved",
  }));

  const quotation = booking.quotation
    ? {
        status: booking.quotation.status,
        taxPercent: booking.quotation.taxPercent,
        subtotal: booking.quotation.subtotal,
        taxAmount: booking.quotation.taxAmount,
        total: booking.quotation.total,
        notes: booking.quotation.notes,
        validUntil: booking.quotation.validUntil,
        lineItems: booking.quotation.lineItems.map((item) => ({
          id: item.id,
          requirementRef: item.requirementRef,
          label: item.label,
          quantity: item.quantity,
          days: item.days,
          unitRate: item.unitRate,
          note: item.note,
        })),
      }
    : null;

  const activeAssignments = booking.assignments.filter((assignment) =>
    ["proposed", "confirmed", "checked_in", "completed"].includes(
      assignment.status,
    ),
  );

  return (
    <>
      <PageHeader
        eyebrow={`Client request · ${booking.id}`}
        title={booking.eventName}
        subtitle={
          <>
            {booking.clientCompanyName} · {booking.eventType} ·{" "}
            {formatDateRange(booking.eventStartDate, booking.eventEndDate)} ·{" "}
            {booking.eventCity}, {booking.state}
          </>
        }
        actions={
          <>
            <Link href="/admin/bookings" className="admin-btn is-ghost">
              <FiArrowLeft aria-hidden="true" /> Requests
            </Link>
            <Link
              href={`/admin/matching?bookingId=${booking.id}`}
              className="admin-btn"
            >
              <FiTarget aria-hidden="true" /> Match staff
            </Link>
            <Link
              href={`/admin/bookings/${booking.id}/summary`}
              className="admin-btn is-primary"
            >
              <FiPrinter aria-hidden="true" /> Staffing summary
            </Link>
          </>
        }
      />

      <section className="admin-grid admin-grid-4" style={{ marginBottom: 16 }}>
        <MetricCard
          icon={<FiUsers aria-hidden="true" />}
          label="Crew requested"
          value={formatNumber(booking.requested)}
          suffix="positions"
          tone="accent"
          foot={`${booking.requirements.length} role requirement${
            booking.requirements.length === 1 ? "" : "s"
          }`}
        />
        <MetricCard
          icon={<FiCheckCircle aria-hidden="true" />}
          label="Crew assigned"
          value={formatNumber(booking.assigned)}
          suffix="filled"
          tone="green"
          foot={
            booking.requested
              ? `${Math.round((booking.assigned / booking.requested) * 100)}% cover`
              : "No requirement"
          }
        />
        <MetricCard
          icon={<FiClock aria-hidden="true" />}
          label="Still needed"
          value={formatNumber(booking.remaining)}
          suffix="open"
          tone={booking.remaining ? "yellow" : "green"}
          foot={
            booking.remaining
              ? "Open positions to dispatch"
              : "All requirements covered"
          }
        />
        <MetricCard
          icon={<FiFileText aria-hidden="true" />}
          label="Quotation"
          value={
            booking.quotation
              ? formatCurrency(booking.quotation.total)
              : "—"
          }
          suffix={booking.quotation ? booking.quotation.status : "not prepared"}
          tone="blue"
          foot={`Budget guide ${formatCurrency(booking.budgetPerPerson)} per person`}
        />
      </section>

      <div className="admin-split">
        <div className="admin-stack">
          <section className="admin-card">
            <CardHead
              title="Event & client brief"
              subtitle="Complete requirement captured from the public booking form."
              action={<StatusPill status={booking.status} label={booking.statusLabel} />}
            />
            <div className="admin-card-body">
              <div className="admin-info-grid">
                <div className="admin-info">
                  <dt>Client company</dt>
                  <dd>{booking.clientCompanyName}</dd>
                </div>
                <div className="admin-info">
                  <dt>Contact person</dt>
                  <dd>{booking.contactPerson}</dd>
                </div>
                <div className="admin-info">
                  <dt>Mobile / WhatsApp</dt>
                  <dd>
                    {booking.mobileNumber}
                    {booking.whatsappNumber
                      ? ` · ${booking.whatsappNumber}`
                      : ""}
                  </dd>
                </div>
                <div className="admin-info">
                  <dt>Email</dt>
                  <dd>{booking.emailAddress}</dd>
                </div>
                <div className="admin-info">
                  <dt>Company type</dt>
                  <dd>{booking.companyType}</dd>
                </div>
                <div className="admin-info">
                  <dt>Venue</dt>
                  <dd>
                    {booking.venueAddress}
                    {booking.mapsLocation ? (
                      <>
                        {" "}
                        ·{" "}
                        <a
                          href={booking.mapsLocation}
                          target="_blank"
                          rel="noreferrer"
                          className="admin-link"
                        >
                          Map
                        </a>
                      </>
                    ) : null}
                  </dd>
                </div>
                <div className="admin-info">
                  <dt>Event dates</dt>
                  <dd>
                    {formatDateRange(
                      booking.eventStartDate,
                      booking.eventEndDate,
                    )}
                  </dd>
                </div>
                <div className="admin-info">
                  <dt>Reporting / duty</dt>
                  <dd>
                    Report {booking.reportingTime || "—"} · Duty{" "}
                    {booking.dutyStartTime || "—"}–{booking.dutyEndTime || "—"}
                  </dd>
                </div>
                <div className="admin-info">
                  <dt>Guest count</dt>
                  <dd>{formatNumber(booking.guestCount)}</dd>
                </div>
                <div className="admin-info">
                  <dt>Budget per person</dt>
                  <dd>{formatCurrency(booking.budgetPerPerson)}</dd>
                </div>
                <div className="admin-info">
                  <dt>Food / transport / stay</dt>
                  <dd>
                    {booking.foodProvided ? "Food" : "No food"} ·{" "}
                    {booking.transportProvided ? "Transport" : "No transport"} ·{" "}
                    {booking.accommodationProvided ? "Stay" : "No stay"}
                  </dd>
                </div>
                <div className="admin-info">
                  <dt>Dress code</dt>
                  <dd>{booking.dressCode || "—"}</dd>
                </div>
                <div className="admin-info">
                  <dt>Languages</dt>
                  <dd>{booking.languageRequirements.join(", ") || "Any"}</dd>
                </div>
                <div className="admin-info">
                  <dt>Reference file</dt>
                  <dd>
                    {booking.referenceFileName
                      ? `${booking.referenceFileName} (${formatNumber(
                          Math.round(booking.referenceFileSize / 1024),
                        )} KB)`
                      : "None uploaded"}
                  </dd>
                </div>
              </div>

              {booking.additionalNotes ? (
                <div className="admin-form-note" style={{ marginTop: 12 }}>
                  <strong>Client notes:</strong> {booking.additionalNotes}
                </div>
              ) : null}
            </div>
          </section>

          <section className="admin-card">
            <CardHead
              title="Staffing requirements"
              subtitle="Requested quantities by role, date and shift. Assigned counts exclude cancelled or no-show crew."
              action={
                <span className="admin-count-chip">
                  {formatNumber(booking.remaining)} open
                </span>
              }
            />
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Role & date</th>
                    <th>Shift</th>
                    <th>Requirements</th>
                    <th>Quantity</th>
                    <th>Filled</th>
                    <th>Assigned crew</th>
                  </tr>
                </thead>
                <tbody>
                  {booking.requirements.map((requirement) => (
                    <tr key={requirement.id}>
                      <td>
                        <span className="admin-row-title">
                          {requirement.staffRole}
                        </span>
                        <span className="admin-row-sub">
                          <FiCalendar aria-hidden="true" />{" "}
                          {formatIsoDate(requirement.workDate)}
                        </span>
                      </td>
                      <td className="is-nowrap">
                        {requirement.reportingTime || "—"}
                        <span className="admin-row-sub">
                          {requirement.shiftDuration
                            ? `${requirement.shiftDuration} hours`
                            : "Duration TBC"}
                        </span>
                      </td>
                      <td>
                        <span className="admin-row-sub" style={{ marginTop: 0 }}>
                          {requirement.experienceRequirement} experience ·{" "}
                          {requirement.genderPreference}
                        </span>
                        <span className="admin-row-sub">
                          Uniform: {requirement.uniformRequirement}
                        </span>
                        {requirement.specialInstructions ? (
                          <span className="admin-row-sub">
                            {requirement.specialInstructions}
                          </span>
                        ) : null}
                      </td>
                      <td className="is-nowrap">
                        <span className="admin-row-title">
                          {requirement.filled}/{requirement.quantity}
                        </span>
                        <span className="admin-row-sub">
                          {requirement.remaining} open
                        </span>
                      </td>
                      <td style={{ minWidth: 110 }}>
                        <div className="admin-progress">
                          <span
                            className={fillTone(
                              requirement.filled,
                              requirement.quantity,
                            )}
                            style={{
                              width: `${
                                requirement.quantity
                                  ? Math.round(
                                      (requirement.filled /
                                        requirement.quantity) *
                                        100,
                                    )
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                        <div className="admin-progress-meta">
                          <span>{requirement.remaining} left</span>
                        </div>
                      </td>
                      <td>
                        {requirement.assignedStaff.length ? (
                          <div className="admin-inline-list">
                            {requirement.assignedStaff.map((member) => (
                              <Link
                                key={member.assignmentId}
                                href={`/admin/staff/${member.registrationId}`}
                                className="admin-tag"
                                style={{ textDecoration: "none" }}
                                title={`${member.fullName} · ${member.status}`}
                              >
                                {member.fullName}
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <span className="admin-subtle admin-small">
                            Nobody assigned yet
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="admin-card">
            <CardHead
              title="Crew assignments"
              subtitle="Every assignment on this booking, including attendance state."
              action={
                <span className="admin-count-chip">
                  {activeAssignments.length} active
                </span>
              }
            />
            {booking.assignments.length ? (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Staff</th>
                      <th>Role / date</th>
                      <th>Shift</th>
                      <th>Status & attendance</th>
                      <th>Pay</th>
                      <th className="is-right">Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {booking.assignments.map((assignment) => (
                      <tr key={assignment.id}>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              gap: 9,
                              alignItems: "center",
                            }}
                          >
                            <span className="admin-avatar">
                              {initials(assignment.staffName)}
                            </span>
                            <span>
                              <Link
                                href={`/admin/staff/${assignment.registrationId}`}
                                className="admin-row-title"
                                style={{ textDecoration: "none" }}
                              >
                                {assignment.staffName}
                              </Link>
                              <span className="admin-row-sub">
                                {assignment.staffCity} ·{" "}
                                {assignment.staffMobile}
                              </span>
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="admin-row-title">
                            {assignment.role}
                          </span>
                          <span className="admin-row-sub">
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
              <EmptyState title="No crew assigned yet">
                Use the dispatch panel on the right or the staff matching screen
                to assign approved crew.
              </EmptyState>
            )}
          </section>

          <section className="admin-card">
            <CardHead
              title="Quotation"
              subtitle="Build client pricing from the requested roles. Totals recalculate instantly; tax defaults to 18%."
              action={
                booking.quotation ? (
                  <StatusPill
                    status={booking.quotation.status}
                    label={booking.quotation.status}
                  />
                ) : null
              }
            />
            <QuotationBuilder
              bookingId={booking.id}
              quotation={quotation}
              requirements={booking.requirements.map((requirement) => ({
                id: requirement.id,
                staffRole: requirement.staffRole,
                workDate: requirement.workDate,
                quantity: requirement.quantity,
                shiftDuration: requirement.shiftDuration,
              }))}
              defaultRate={booking.budgetPerPerson}
              canManage={canQuote}
            />
          </section>

          <section className="admin-card">
            <CardHead
              title="Status history"
              subtitle="Client-visible and internal status changes, newest last."
            />
            {booking.history.length ? (
              <div className="admin-card-body">
                <ul className="admin-timeline">
                  {booking.history.map((event, index) => (
                    <li
                      key={`${event.status}-${index}`}
                      className={index === booking.history.length - 1 ? "is-current" : ""}
                    >
                      <strong>{event.statusLabel}</strong>
                      <small>{formatTimestamp(event.createdAt)}</small>
                      {event.note ? <p>{event.note}</p> : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <EmptyState title="No status events recorded" />
            )}
          </section>
        </div>

        <div className="admin-stack">
          <section className="admin-card">
            <CardHead title="Booking status" subtitle="Move the request through the pipeline." />
            <div className="admin-card-body">
              {canManageBooking ? (
                <BookingStatusForm
                  bookingId={booking.id}
                  currentStatus={booking.status}
                />
              ) : (
                <div className="admin-form-note">
                  Your role can view this request but not change its booking
                  status. Current status:{" "}
                  <strong>{booking.statusLabel}</strong>.
                </div>
              )}
            </div>
          </section>

          <section className="admin-card">
            <CardHead
              title="Dispatch crew"
              subtitle="Assign approved staff to a specific requirement. The server blocks duplicates and shift clashes."
            />
            <div className="admin-card-body">
              {canAssign ? (
                <AssignmentForm
                  bookingId={booking.id}
                  requirements={booking.requirements}
                  staff={staffOptions}
                />
              ) : (
                <div className="admin-form-note">
                  Your role cannot create assignments. Ask a coordinator or
                  operations manager.
                </div>
              )}
            </div>
          </section>

          <section className="admin-card">
            <CardHead title="Request facts" />
            <div className="admin-card-body">
              <dl className="admin-info-grid">
                <div className="admin-info">
                  <dt>Tracking token</dt>
                  <dd className="admin-mono">{booking.trackingToken}</dd>
                </div>
                <div className="admin-info">
                  <dt>Received</dt>
                  <dd>{formatTimestamp(booking.createdAt)}</dd>
                </div>
                <div className="admin-info">
                  <dt>Last updated</dt>
                  <dd>{formatTimestamp(booking.updatedAt)}</dd>
                </div>
                <div className="admin-info">
                  <dt>Urgent</dt>
                  <dd>{booking.urgent ? "Yes" : "No"}</dd>
                </div>
              </dl>
              <div className="admin-divider" />
              <div className="admin-btn-row">
                <Link
                  href={`/admin/bookings/${booking.id}/summary`}
                  className="admin-btn is-small"
                >
                  <FiPrinter aria-hidden="true" /> Print staffing summary
                </Link>
                <Link
                  href={`/admin/matching?bookingId=${booking.id}`}
                  className="admin-btn is-small"
                >
                  <FiTarget aria-hidden="true" /> Open matching
                </Link>
              </div>
            </div>
          </section>

          <section className="admin-card">
            <CardHead
              title="Notification log"
              subtitle="Latest email / WhatsApp delivery attempts for this request."
            />
            {booking.notifications.length ? (
              <div className="admin-list">
                {booking.notifications.map((notification) => (
                  <div className="admin-list-row" key={notification.id}>
                    <div className="admin-list-main">
                      <strong>
                        {notification.channel} → {notification.recipientType}
                      </strong>
                      <p>
                        {notification.subject || "No subject"}
                        {notification.error ? ` · ${notification.error}` : ""}
                      </p>
                    </div>
                    <div className="admin-list-side">
                      <StatusPill
                        status={
                          notification.status === "sent" ? "approved" : "on_hold"
                        }
                        label={notification.status}
                      />
                      <small>{formatTimestamp(notification.createdAt)}</small>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No notifications recorded">
                Delivery attempts will show here after the booking desk sends an
                update.
              </EmptyState>
            )}
          </section>

          <section className="admin-card">
            <div className="admin-card-body">
              <div className="admin-form-note">
                <FiMapPin aria-hidden="true" /> {booking.eventCity},{" "}
                {booking.state}
                <br />
                <span className="admin-small">{booking.venueAddress}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
