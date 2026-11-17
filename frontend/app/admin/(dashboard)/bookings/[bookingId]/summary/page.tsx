import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

import { getAdminSession } from "@/lib/admin/auth";
import { getBookingDetail } from "@/lib/admin/bookings";
import {
  ASSIGNMENT_STATUS_LABELS,
  ATTENDANCE_STATUS_LABELS,
  BOOKING_STATUS_LABELS,
  QUOTATION_STATUS_LABELS,
} from "@/lib/admin/constants";
import {
  formatCurrency,
  formatDateRange,
  formatIsoDate,
  formatNumber,
  formatTimestamp,
} from "@/lib/admin/format";
import PrintButton from "../../../../_components/PrintButton";
import { EmptyState, PageHeader, StatusPill } from "../../../../_components/ui";

export const dynamic = "force-dynamic";

export default async function BookingSummaryPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const [session, booking] = await Promise.all([
    getAdminSession(),
    getBookingDetail(bookingId),
  ]);

  const activeAssignments = booking
    ? booking.assignments.filter((assignment) =>
        ["proposed", "confirmed", "checked_in", "completed"].includes(
          assignment.status,
        ),
      )
    : [];

  return (
    <>
      <PageHeader
        eyebrow="Staffing summary"
        title={booking ? `Event roster · ${booking.eventName}` : "Summary unavailable"}
        subtitle={
          booking
            ? `${booking.clientCompanyName} · ${formatDateRange(
                booking.eventStartDate,
                booking.eventEndDate,
              )}`
            : "The booking could not be found."
        }
        actions={
          <>
            {booking ? (
              <Link
                href={`/admin/bookings/${booking.id}`}
                className="admin-btn is-ghost admin-no-print"
              >
                <FiArrowLeft aria-hidden="true" /> Back to request
              </Link>
            ) : null}
            <PrintButton label="Print roster" />
          </>
        }
      />

      {!booking ? (
        <section className="admin-card">
          <EmptyState title="Booking not found" />
        </section>
      ) : (
        <div className="admin-stack">
          <section className="admin-card">
            <div className="admin-card-body">
              <div className="admin-print-head">
                <div>
                  <span className="admin-eyebrow">CrewConnect operations</span>
                  <h1>{booking.eventName}</h1>
                  <p className="admin-muted" style={{ margin: "7px 0 0", fontSize: 12 }}>
                    {booking.clientCompanyName} · {booking.eventType} ·{" "}
                    {booking.eventCity}, {booking.state}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <StatusPill status={booking.status} label={booking.statusLabel} />
                  <p className="admin-subtle admin-small" style={{ margin: "7px 0 0" }}>
                    Generated {formatTimestamp(new Date())}
                  </p>
                  <p className="admin-subtle admin-small" style={{ margin: "2px 0 0" }}>
                    Request <code className="admin-code">{booking.id}</code>
                  </p>
                </div>
              </div>

              <div className="admin-info-grid" style={{ marginTop: 16 }}>
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
                  <dt>Venue</dt>
                  <dd>
                    {booking.venueAddress}, {booking.eventCity}
                  </dd>
                </div>
                <div className="admin-info">
                  <dt>Client contact</dt>
                  <dd>
                    {booking.contactPerson} · {booking.mobileNumber} ·{" "}
                    {booking.emailAddress}
                  </dd>
                </div>
                <div className="admin-info">
                  <dt>Dress code</dt>
                  <dd>{booking.dressCode || "Confirmed at briefing"}</dd>
                </div>
                <div className="admin-info">
                  <dt>Facilities</dt>
                  <dd>
                    {booking.foodProvided ? "Food" : "No food"} ·{" "}
                    {booking.transportProvided ? "Transport" : "No transport"} ·{" "}
                    {booking.accommodationProvided ? "Stay" : "No stay"}
                  </dd>
                </div>
              </div>

              <h2 className="admin-section-title" style={{ marginTop: 20 }}>
                Requirement sheet
              </h2>
              <div className="admin-mobile-scroll">
                <table className="admin-print-table">
                  <thead>
                    <tr>
                      <th>Role</th>
                      <th>Work date</th>
                      <th>Report</th>
                      <th>Hours</th>
                      <th>Qty</th>
                      <th>Filled</th>
                      <th>Open</th>
                      <th>Experience / gender</th>
                      <th>Uniform</th>
                    </tr>
                  </thead>
                  <tbody>
                    {booking.requirements.map((requirement) => (
                      <tr key={requirement.id}>
                        <td>{requirement.staffRole}</td>
                        <td>{formatIsoDate(requirement.workDate)}</td>
                        <td>{requirement.reportingTime || "TBC"}</td>
                        <td>{requirement.shiftDuration || "TBC"}</td>
                        <td>{requirement.quantity}</td>
                        <td>{requirement.filled}</td>
                        <td>{requirement.remaining}</td>
                        <td>
                          {requirement.experienceRequirement} ·{" "}
                          {requirement.genderPreference}
                        </td>
                        <td>{requirement.uniformRequirement}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th colSpan={4}>Totals</th>
                      <th>{booking.requested}</th>
                      <th>{booking.assigned}</th>
                      <th>{booking.remaining}</th>
                      <th colSpan={2} />
                    </tr>
                  </tfoot>
                </table>
              </div>

              <h2 className="admin-section-title" style={{ marginTop: 20 }}>
                Assigned crew roster
              </h2>
              {activeAssignments.length ? (
                <div className="admin-mobile-scroll">
                  <table className="admin-print-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Crew member</th>
                        <th>Mobile</th>
                        <th>Role</th>
                        <th>Date</th>
                        <th>Shift</th>
                        <th>Status</th>
                        <th>Attendance</th>
                        <th>Pay</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeAssignments.map((assignment, index) => (
                        <tr key={assignment.id}>
                          <td>{index + 1}</td>
                          <td>{assignment.staffName}</td>
                          <td>{assignment.staffMobile || "—"}</td>
                          <td>{assignment.role}</td>
                          <td>{formatIsoDate(assignment.workDate)}</td>
                          <td>
                            {assignment.shiftStart || "—"}–
                            {assignment.shiftEnd || "—"}
                          </td>
                          <td>
                            {ASSIGNMENT_STATUS_LABELS[assignment.status] ||
                              assignment.status}
                          </td>
                          <td>
                            {ATTENDANCE_STATUS_LABELS[
                              assignment.attendanceStatus
                            ] || assignment.attendanceStatus}
                          </td>
                          <td>
                            {assignment.payRate === null
                              ? "—"
                              : formatCurrency(assignment.payRate)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="admin-muted admin-small">
                  No active crew assignments yet.
                </p>
              )}

              <h2 className="admin-section-title" style={{ marginTop: 20 }}>
                Commercial summary
              </h2>
              {booking.quotation ? (
                <>
                  <div className="admin-info-grid">
                    <div className="admin-info">
                      <dt>Quotation status</dt>
                      <dd>
                        {QUOTATION_STATUS_LABELS[booking.quotation.status] ||
                          booking.quotation.status}
                      </dd>
                    </div>
                    <div className="admin-info">
                      <dt>Valid until</dt>
                      <dd>
                        {booking.quotation.validUntil
                          ? formatIsoDate(booking.quotation.validUntil)
                          : "Not specified"}
                      </dd>
                    </div>
                    <div className="admin-info">
                      <dt>Subtotal</dt>
                      <dd>{formatCurrency(booking.quotation.subtotal)}</dd>
                    </div>
                    <div className="admin-info">
                      <dt>Tax ({booking.quotation.taxPercent}%)</dt>
                      <dd>{formatCurrency(booking.quotation.taxAmount)}</dd>
                    </div>
                    <div className="admin-info">
                      <dt>Total</dt>
                      <dd>
                        <strong>{formatCurrency(booking.quotation.total)}</strong>
                      </dd>
                    </div>
                    <div className="admin-info">
                      <dt>Line items</dt>
                      <dd>{formatNumber(booking.quotation.lineItems.length)}</dd>
                    </div>
                  </div>
                  {booking.quotation.lineItems.length ? (
                    <div className="admin-mobile-scroll">
                      <table className="admin-print-table">
                        <thead>
                          <tr>
                            <th>Description</th>
                            <th>Qty</th>
                            <th>Days</th>
                            <th>Rate</th>
                            <th>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {booking.quotation.lineItems.map((item) => (
                            <tr key={item.id}>
                              <td>{item.label}</td>
                              <td>{item.quantity}</td>
                              <td>{item.days}</td>
                              <td>{formatCurrency(item.unitRate)}</td>
                              <td>{formatCurrency(item.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                  {booking.quotation.notes ? (
                    <p className="admin-muted admin-small">
                      Notes: {booking.quotation.notes}
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="admin-muted admin-small">
                  No quotation has been prepared for this request yet.
                </p>
              )}

              <p className="admin-subtle admin-small" style={{ marginTop: 20 }}>
                Status:{" "}
                {BOOKING_STATUS_LABELS[booking.status] || booking.status} · Prepared
                by {session?.name || "CrewConnect operations"} · This roster is
                confidential and intended for the client and dispatch team only.
              </p>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
