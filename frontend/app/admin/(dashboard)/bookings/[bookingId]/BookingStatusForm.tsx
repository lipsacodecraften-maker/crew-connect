"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FiSave } from "react-icons/fi";

import { BOOKING_STATUSES, BOOKING_STATUS_LABELS } from "@/lib/admin/constants";

export default function BookingStatusForm({
  bookingId,
  currentStatus,
}: {
  bookingId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");

    const response = await fetch(`/api/admin/bookings/${bookingId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note }),
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      setError(payload?.message || "Could not update the booking status.");
      return;
    }

    setNote("");
    setMessage(`Status updated to ${payload?.booking?.statusLabel || status}.`);
    startTransition(() => router.refresh());
  };

  return (
    <form onSubmit={submit} className="admin-stack-sm">
      <div className="admin-field">
        <label className="admin-label" htmlFor="booking-status">
          Booking status
        </label>
        <select
          id="booking-status"
          className="admin-select"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          disabled={pending}
        >
          {BOOKING_STATUSES.map((value) => (
            <option key={value} value={value}>
              {BOOKING_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-field">
        <label className="admin-label" htmlFor="booking-note">
          Internal note (optional)
        </label>
        <textarea
          id="booking-note"
          className="admin-textarea"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Example: client confirmed the revised headcount."
          maxLength={500}
          disabled={pending}
        />
      </div>

      {error ? <div className="admin-form-error">{error}</div> : null}
      {message ? <div className="admin-alert is-success">{message}</div> : null}

      <button
        type="submit"
        className="admin-btn is-primary"
        disabled={pending || status === currentStatus}
      >
        <FiSave aria-hidden="true" />
        {pending ? "Saving…" : "Update status"}
      </button>
    </form>
  );
}
