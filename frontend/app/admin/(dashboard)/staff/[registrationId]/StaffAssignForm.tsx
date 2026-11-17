"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FiUserPlus } from "react-icons/fi";

type BookingOption = {
  id: string;
  eventName: string;
  eventCity: string;
  eventStartDate: string;
  status: string;
  requirements: Array<{
    id: number;
    staffRole: string;
    quantity: number;
    filled: number;
    remaining: number;
  }>;
};

export default function StaffAssignForm({
  registrationId,
  bookings,
}: {
  registrationId: string;
  bookings: BookingOption[];
}) {
  const router = useRouter();
  const [bookingId, setBookingId] = useState("");
  const [requirementRef, setRequirementRef] = useState("");
  const [shiftStart, setShiftStart] = useState("");
  const [shiftEnd, setShiftEnd] = useState("");
  const [payRate, setPayRate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const selectedBooking = useMemo(
    () => bookings.find((booking) => booking.id === bookingId) || null,
    [bookings, bookingId],
  );
  const openRequirements =
    selectedBooking?.requirements.filter((requirement) => requirement.remaining > 0) ||
    [];

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!bookingId || !requirementRef) {
      setError("Choose an event and an open requirement.");
      return;
    }

    const response = await fetch(
      `/api/admin/bookings/${bookingId}/assignments`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId,
          requirementRef: Number(requirementRef),
          shiftStart: shiftStart || undefined,
          shiftEnd: shiftEnd || undefined,
          payRate: payRate ? Number(payRate) : null,
          notes: notes || undefined,
          status: "confirmed",
        }),
      },
    );
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      setError(payload?.message || "Could not assign this staff member.");
      return;
    }

    setMessage(
      `Assigned to ${selectedBooking?.eventName || "event"} as ${
        payload?.assignment?.role || "crew"
      }.`,
    );
    setRequirementRef("");
    setPayRate("");
    setNotes("");
    startTransition(() => router.refresh());
  };

  if (!bookings.length) {
    return (
      <div className="admin-form-note">
        No live bookings with staffing requirements are open right now.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="admin-stack-sm">
      <div className="admin-field">
        <label className="admin-label" htmlFor="staff-booking">
          Event request
        </label>
        <select
          id="staff-booking"
          className="admin-select"
          value={bookingId}
          onChange={(event) => {
            setBookingId(event.target.value);
            setRequirementRef("");
          }}
          disabled={pending}
        >
          <option value="">Choose an event…</option>
          {bookings.map((booking) => (
            <option key={booking.id} value={booking.id}>
              {booking.eventName} · {booking.eventCity} · {booking.eventStartDate}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-field">
        <label className="admin-label" htmlFor="staff-requirement">
          Open requirement
        </label>
        <select
          id="staff-requirement"
          className="admin-select"
          value={requirementRef}
          onChange={(event) => setRequirementRef(event.target.value)}
          disabled={!selectedBooking || pending}
        >
          <option value="">
            {selectedBooking
              ? openRequirements.length
                ? "Choose a requirement…"
                : "Every requirement is filled"
              : "Choose an event first"}
          </option>
          {openRequirements.map((requirement) => (
            <option key={requirement.id} value={requirement.id}>
              {requirement.staffRole} · {requirement.remaining} of{" "}
              {requirement.quantity} open
            </option>
          ))}
        </select>
      </div>

      <div className="admin-form-grid">
        <div className="admin-field">
          <label className="admin-label" htmlFor="staff-shift-start">
            Shift start
          </label>
          <input
            id="staff-shift-start"
            type="time"
            className="admin-input"
            value={shiftStart}
            onChange={(event) => setShiftStart(event.target.value)}
            disabled={pending}
          />
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="staff-shift-end">
            Shift end
          </label>
          <input
            id="staff-shift-end"
            type="time"
            className="admin-input"
            value={shiftEnd}
            onChange={(event) => setShiftEnd(event.target.value)}
            disabled={pending}
          />
        </div>
      </div>

      <div className="admin-form-grid">
        <div className="admin-field">
          <label className="admin-label" htmlFor="staff-pay-rate">
            Pay rate (₹)
          </label>
          <input
            id="staff-pay-rate"
            type="number"
            min={0}
            step="50"
            className="admin-input"
            value={payRate}
            onChange={(event) => setPayRate(event.target.value)}
            placeholder="Optional"
            disabled={pending}
          />
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="staff-notes">
            Dispatch notes
          </label>
          <input
            id="staff-notes"
            className="admin-input"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Optional"
            maxLength={500}
            disabled={pending}
          />
        </div>
      </div>

      {error ? <div className="admin-form-error">{error}</div> : null}
      {message ? <div className="admin-alert is-success">{message}</div> : null}

      <button
        type="submit"
        className="admin-btn is-primary"
        disabled={pending || !bookingId || !requirementRef}
      >
        <FiUserPlus aria-hidden="true" />
        {pending ? "Assigning…" : "Assign to event"}
      </button>
    </form>
  );
}
