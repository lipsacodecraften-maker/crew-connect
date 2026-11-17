"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FiCheckCircle, FiUserX } from "react-icons/fi";

import { STAFF_REVIEW_LABELS, STAFF_REVIEW_STATUSES } from "@/lib/admin/constants";

export default function StaffReviewForm({
  registrationId,
  currentStatus,
}: {
  registrationId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const needsNote = status === "rejected" || status === "on_hold";

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (needsNote && note.trim().length < 5) {
      setError(
        "Add a short note explaining the decision or the details still needed.",
      );
      return;
    }

    const response = await fetch(
      `/api/admin/staff/${registrationId}/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note }),
      },
    );
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      setError(payload?.message || "Could not update the staff status.");
      return;
    }

    setNote("");
    setMessage(
      `Profile updated to ${payload?.registration?.statusLabel || status}.`,
    );
    startTransition(() => router.refresh());
  };

  return (
    <form onSubmit={submit} className="admin-stack-sm">
      <div className="admin-field">
        <label className="admin-label" htmlFor="staff-status">
          Review decision
        </label>
        <select
          id="staff-status"
          className="admin-select"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          disabled={pending}
        >
          {STAFF_REVIEW_STATUSES.map((value) => (
            <option key={value} value={value}>
              {STAFF_REVIEW_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-field">
        <label className="admin-label" htmlFor="staff-note">
          Review note {needsNote ? "(required)" : "(optional)"}
        </label>
        <textarea
          id="staff-note"
          className="admin-textarea"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder={
            needsNote
              ? "Explain what is missing or why the profile was not approved."
              : "Optional internal note for the candidate desk."
          }
          maxLength={500}
          disabled={pending}
        />
      </div>

      {error ? <div className="admin-form-error">{error}</div> : null}
      {message ? <div className="admin-alert is-success">{message}</div> : null}

      <div className="admin-btn-row">
        <button
          type="submit"
          className={`admin-btn ${status === "rejected" ? "is-danger" : "is-primary"}`}
          disabled={pending || status === currentStatus}
        >
          {status === "rejected" ? (
            <FiUserX aria-hidden="true" />
          ) : (
            <FiCheckCircle aria-hidden="true" />
          )}
          {pending ? "Saving…" : "Save decision"}
        </button>
        {currentStatus !== "approved" ? (
          <button
            type="button"
            className="admin-btn"
            disabled={pending}
            onClick={() => {
              setStatus("approved");
              setNote("");
            }}
          >
            Approve profile
          </button>
        ) : null}
      </div>
    </form>
  );
}
