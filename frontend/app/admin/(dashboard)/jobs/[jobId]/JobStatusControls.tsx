"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FiArchive, FiCheckCircle, FiPlay, FiRotateCcw } from "react-icons/fi";

import { JOB_STATUS_META } from "@/lib/jobs/config";

export default function JobStatusControls({
  jobId,
  currentStatus,
}: {
  jobId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");
  const [pending, startTransition] = useTransition();

  const update = async (status: string) => {
    setBusy(status);
    setError("");
    setMessage("");

    const response = await fetch(`/api/admin/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const payload = await response.json().catch(() => null);
    setBusy("");

    if (!response.ok) {
      const firstError = payload?.errors
        ? Object.values(payload.errors)[0]
        : null;
      setError(
        (firstError as string) || payload?.message || "Could not update the listing.",
      );
      return;
    }

    setMessage(
      `Listing marked ${JOB_STATUS_META[status as keyof typeof JOB_STATUS_META]?.label || status}.`,
    );
    startTransition(() => router.refresh());
  };

  return (
    <div className="admin-stack-sm">
      <div className="admin-btn-row">
        {currentStatus !== "open" ? (
          <button
            type="button"
            className="admin-btn is-primary is-small"
            onClick={() => update("open")}
            disabled={Boolean(busy) || pending}
          >
            <FiPlay aria-hidden="true" />
            {busy === "open" ? "Publishing…" : "Publish listing"}
          </button>
        ) : null}

        {currentStatus === "open" ? (
          <button
            type="button"
            className="admin-btn is-small"
            onClick={() => update("closed")}
            disabled={Boolean(busy) || pending}
          >
            <FiArchive aria-hidden="true" />
            {busy === "closed" ? "Closing…" : "Close listing"}
          </button>
        ) : null}

        {currentStatus !== "filled" ? (
          <button
            type="button"
            className="admin-btn is-small"
            onClick={() => update("filled")}
            disabled={Boolean(busy) || pending}
          >
            <FiCheckCircle aria-hidden="true" />
            {busy === "filled" ? "Saving…" : "Mark filled"}
          </button>
        ) : null}

        {currentStatus !== "draft" ? (
          <button
            type="button"
            className="admin-btn is-small is-ghost"
            onClick={() => update("draft")}
            disabled={Boolean(busy) || pending}
          >
            <FiRotateCcw aria-hidden="true" />
            {busy === "draft" ? "Saving…" : "Move to draft"}
          </button>
        ) : null}
      </div>

      <div className="admin-form-note">
        {JOB_STATUS_META[currentStatus as keyof typeof JOB_STATUS_META]?.description ||
          "Choose a status for this listing."}
      </div>

      {error ? <div className="admin-form-error">{error}</div> : null}
      {message ? <div className="admin-alert is-success">{message}</div> : null}
    </div>
  );
}
