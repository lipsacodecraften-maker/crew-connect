"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FiCheck, FiUserCheck, FiUserX } from "react-icons/fi";

export default function ApplicationActions({
  applicationId,
  status,
  hasBooking,
}: {
  applicationId: string;
  status: string;
  hasBooking: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");
  const [pending, startTransition] = useTransition();

  const setStatus = async (nextStatus: string) => {
    setBusy(nextStatus);
    setError("");
    setMessage("");

    const response = await fetch(`/api/admin/applications/${applicationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    const payload = await response.json().catch(() => null);
    setBusy("");

    if (!response.ok) {
      setError(payload?.message || "Could not update the application.");
      return;
    }

    setMessage(`Application marked ${nextStatus.replace(/_/g, " ")}.`);
    startTransition(() => router.refresh());
  };

  const allocate = async () => {
    setBusy("allocate");
    setError("");
    setMessage("");

    const response = await fetch(
      `/api/admin/applications/${applicationId}/allocate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      },
    );
    const payload = await response.json().catch(() => null);
    setBusy("");

    if (!response.ok) {
      setError(payload?.message || "Could not allocate this candidate.");
      return;
    }

    setMessage(
      payload?.warning ||
        "Candidate selected and an event assignment was created.",
    );
    startTransition(() => router.refresh());
  };

  const disabled = Boolean(busy) || pending;

  return (
    <div className="admin-stack-sm">
      <div className="admin-btn-row">
        {status === "submitted" ? (
          <button
            type="button"
            className="admin-btn is-small"
            onClick={() => setStatus("shortlisted")}
            disabled={disabled}
          >
            <FiCheck aria-hidden="true" />
            {busy === "shortlisted" ? "Saving…" : "Shortlist"}
          </button>
        ) : null}

        {status !== "selected" && status !== "withdrawn" ? (
          <button
            type="button"
            className="admin-btn is-small is-primary"
            onClick={allocate}
            disabled={disabled}
            title={
              hasBooking
                ? "Select and create the event assignment"
                : "Select this candidate on the listing"
            }
          >
            <FiUserCheck aria-hidden="true" />
            {busy === "allocate" ? "Allocating…" : "Select & allocate"}
          </button>
        ) : null}

        {status !== "not_selected" &&
        status !== "selected" &&
        status !== "withdrawn" ? (
          <button
            type="button"
            className="admin-btn is-small is-ghost"
            onClick={() => setStatus("not_selected")}
            disabled={disabled}
          >
            <FiUserX aria-hidden="true" />
            {busy === "not_selected" ? "Saving…" : "Not selected"}
          </button>
        ) : null}
      </div>

      {error ? <div className="admin-form-error">{error}</div> : null}
      {message ? <div className="admin-alert is-success">{message}</div> : null}
    </div>
  );
}
