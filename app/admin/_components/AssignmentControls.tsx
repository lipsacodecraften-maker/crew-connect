"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FiCheck } from "react-icons/fi";

const STATUS_OPTIONS = [
  "proposed",
  "confirmed",
  "checked_in",
  "completed",
  "cancelled",
  "no_show",
] as const;

const ATTENDANCE_OPTIONS = [
  "pending",
  "checked_in",
  "checked_out",
  "absent",
] as const;

function label(value: string) {
  return value.replace(/_/g, " ");
}

export default function AssignmentControls({
  assignmentId,
  status,
  attendanceStatus,
  canManage = false,
  canManageAttendance = false,
  showAttendance = true,
}: {
  assignmentId: string;
  status: string;
  attendanceStatus: string;
  canManage?: boolean;
  canManageAttendance?: boolean;
  showAttendance?: boolean;
}) {
  const router = useRouter();
  const [nextStatus, setNextStatus] = useState(status);
  const [nextAttendance, setNextAttendance] = useState(attendanceStatus);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  if (!canManage && !canManageAttendance) {
    return (
      <span className="admin-subtle admin-small">
        {label(status)}
        {showAttendance ? ` · ${label(attendanceStatus)}` : ""}
      </span>
    );
  }

  const save = async () => {
    setError("");
    const body: Record<string, string> = {};
    if (canManage && nextStatus !== status) body.status = nextStatus;
    if (canManageAttendance && nextAttendance !== attendanceStatus) {
      body.attendanceStatus = nextAttendance;
    }
    if (!Object.keys(body).length) return;

    const response = await fetch(`/api/admin/assignments/${assignmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      setError(payload?.message || "Could not update assignment.");
      return;
    }

    startTransition(() => router.refresh());
  };

  return (
    <div className="admin-inline-form" style={{ flexDirection: "column", alignItems: "stretch" }}>
      <div className="admin-inline-form">
        {canManage ? (
          <select
            className="admin-select"
            aria-label="Assignment status"
            value={nextStatus}
            onChange={(event) => setNextStatus(event.target.value)}
            disabled={pending}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {label(option)}
              </option>
            ))}
          </select>
        ) : (
          <span className="admin-pill is-muted">{label(status)}</span>
        )}

        {showAttendance && canManageAttendance ? (
          <select
            className="admin-select"
            aria-label="Attendance status"
            value={nextAttendance}
            onChange={(event) => setNextAttendance(event.target.value)}
            disabled={pending}
          >
            {ATTENDANCE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {label(option)}
              </option>
            ))}
          </select>
        ) : showAttendance ? (
          <span className="admin-pill is-muted">
            {label(attendanceStatus)}
          </span>
        ) : null}

        <button
          type="button"
          className="admin-btn is-small"
          onClick={save}
          disabled={
            pending ||
            (nextStatus === status && nextAttendance === attendanceStatus)
          }
        >
          <FiCheck aria-hidden="true" />
          {pending ? "Saving" : "Save"}
        </button>
      </div>
      {error ? (
        <span className="admin-form-error" style={{ padding: "5px 7px", fontSize: 9.5 }}>
          {error}
        </span>
      ) : null}
    </div>
  );
}
