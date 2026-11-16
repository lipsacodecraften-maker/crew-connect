"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FiPlus, FiTrash2 } from "react-icons/fi";

type Entry = {
  id: string;
  eventName: string;
  role: string;
  city: string;
  workDate: string;
  shiftHours: number | null;
  payRate: number | null;
  rating: number | null;
  notes: string;
  source: string;
  createdAt: Date | string;
};

function dateLabel(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value || "—";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

export default function WorkHistoryManager({
  registrationId,
  entries,
  canManage,
}: {
  registrationId: string;
  entries: Entry[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [eventName, setEventName] = useState("");
  const [role, setRole] = useState("");
  const [city, setCity] = useState("");
  const [workDate, setWorkDate] = useState("");
  const [shiftHours, setShiftHours] = useState("");
  const [payRate, setPayRate] = useState("");
  const [rating, setRating] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const addEntry = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const response = await fetch(
      `/api/admin/staff/${registrationId}/work-history`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName,
          role,
          city,
          workDate,
          shiftHours: shiftHours ? Number(shiftHours) : null,
          payRate: payRate ? Number(payRate) : null,
          rating: rating ? Number(rating) : null,
          notes,
        }),
      },
    );
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      setError(payload?.message || "Could not add the work history entry.");
      return;
    }

    setEventName("");
    setRole("");
    setCity("");
    setWorkDate("");
    setShiftHours("");
    setPayRate("");
    setRating("");
    setNotes("");
    setOpen(false);
    setMessage("Work history entry added.");
    startTransition(() => router.refresh());
  };

  const removeEntry = async (entryId: string) => {
    if (!window.confirm("Remove this work-history entry? The assignment itself is not affected.")) {
      return;
    }
    setError("");
    setMessage("");

    const response = await fetch(
      `/api/admin/staff/${registrationId}/work-history/${entryId}`,
      { method: "DELETE" },
    );
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      setError(payload?.message || "Could not remove the entry.");
      return;
    }

    setMessage("Work history entry removed.");
    startTransition(() => router.refresh());
  };

  return (
    <div className="admin-card-body admin-stack-sm">
      {entries.length ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Role</th>
                <th>Date</th>
                <th>Hours</th>
                <th>Pay</th>
                <th>Rating</th>
                <th>Source</th>
                {canManage ? <th className="is-right">Remove</th> : null}
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <span className="admin-row-title">{entry.eventName}</span>
                    <span className="admin-row-sub">{entry.city}</span>
                    {entry.notes ? (
                      <span className="admin-row-sub">{entry.notes}</span>
                    ) : null}
                  </td>
                  <td>{entry.role}</td>
                  <td className="is-nowrap">{dateLabel(entry.workDate)}</td>
                  <td>{entry.shiftHours ?? "—"}</td>
                  <td>{entry.payRate === null ? "—" : `₹${entry.payRate}`}</td>
                  <td>{entry.rating ? `${entry.rating}/5` : "—"}</td>
                  <td>
                    <span className="admin-pill is-muted">
                      {entry.source === "assignment" ? "assignment" : "manual"}
                    </span>
                  </td>
                  {canManage ? (
                    <td className="is-right">
                      <button
                        type="button"
                        className="admin-btn is-small is-ghost"
                        onClick={() => removeEntry(entry.id)}
                        disabled={pending}
                      >
                        <FiTrash2 aria-hidden="true" />
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-form-note">
          No work history yet. Completing an assignment adds an entry
          automatically, or add an offline event manually.
        </div>
      )}

      {message ? <div className="admin-alert is-success">{message}</div> : null}
      {error ? <div className="admin-form-error">{error}</div> : null}

      {canManage ? (
        <>
          <div className="admin-btn-row">
            <button
              type="button"
              className="admin-btn is-small"
              onClick={() => setOpen((value) => !value)}
            >
              <FiPlus aria-hidden="true" />
              {open ? "Close form" : "Add offline work"}
            </button>
          </div>

          {open ? (
            <form onSubmit={addEntry} className="admin-stack-sm">
              <div className="admin-form-grid">
                <div className="admin-field">
                  <label className="admin-label" htmlFor="wh-event">
                    Event name
                  </label>
                  <input
                    id="wh-event"
                    className="admin-input"
                    value={eventName}
                    onChange={(event) => setEventName(event.target.value)}
                    required
                    maxLength={160}
                    disabled={pending}
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label" htmlFor="wh-role">
                    Role
                  </label>
                  <input
                    id="wh-role"
                    className="admin-input"
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                    required
                    maxLength={120}
                    disabled={pending}
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label" htmlFor="wh-city">
                    City
                  </label>
                  <input
                    id="wh-city"
                    className="admin-input"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    required
                    maxLength={80}
                    disabled={pending}
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label" htmlFor="wh-date">
                    Work date
                  </label>
                  <input
                    id="wh-date"
                    type="date"
                    className="admin-input"
                    value={workDate}
                    onChange={(event) => setWorkDate(event.target.value)}
                    required
                    disabled={pending}
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label" htmlFor="wh-hours">
                    Shift hours
                  </label>
                  <input
                    id="wh-hours"
                    type="number"
                    min={0}
                    step="0.5"
                    className="admin-input"
                    value={shiftHours}
                    onChange={(event) => setShiftHours(event.target.value)}
                    disabled={pending}
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label" htmlFor="wh-pay">
                    Pay rate (₹)
                  </label>
                  <input
                    id="wh-pay"
                    type="number"
                    min={0}
                    step="50"
                    className="admin-input"
                    value={payRate}
                    onChange={(event) => setPayRate(event.target.value)}
                    disabled={pending}
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label" htmlFor="wh-rating">
                    Rating (1–5)
                  </label>
                  <input
                    id="wh-rating"
                    type="number"
                    min={1}
                    max={5}
                    className="admin-input"
                    value={rating}
                    onChange={(event) => setRating(event.target.value)}
                    disabled={pending}
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label" htmlFor="wh-notes">
                    Notes
                  </label>
                  <input
                    id="wh-notes"
                    className="admin-input"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    maxLength={400}
                    disabled={pending}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="admin-btn is-primary"
                disabled={pending}
              >
                <FiPlus aria-hidden="true" />
                {pending ? "Adding…" : "Add work history"}
              </button>
            </form>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
