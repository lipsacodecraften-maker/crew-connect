"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiUserPlus } from "react-icons/fi";

type Requirement = {
  id: number;
  staffRole: string;
  quantity: number;
  workDate: string;
  reportingTime: string;
  shiftDuration: number;
  filled: number;
  remaining: number;
};

type StaffOption = {
  id: string;
  fullName: string;
  currentCity: string;
  experienceLevel: string;
  skills: string[];
  status: string;
};

export default function AssignmentForm({
  bookingId,
  requirements,
  staff,
}: {
  bookingId: string;
  requirements: Requirement[];
  staff: StaffOption[];
}) {
  const router = useRouter();
  const openRequirements = requirements.filter(
    (requirement) => requirement.remaining > 0,
  );
  const [requirementRef, setRequirementRef] = useState(
    openRequirements[0] ? String(openRequirements[0].id) : "",
  );
  const [registrationId, setRegistrationId] = useState("");
  const [shiftStart, setShiftStart] = useState("");
  const [shiftEnd, setShiftEnd] = useState("");
  const [payRate, setPayRate] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("confirmed");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const selectedRequirement = useMemo(
    () =>
      openRequirements.find(
        (requirement) => String(requirement.id) === requirementRef,
      ) || null,
    [openRequirements, requirementRef],
  );

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!selectedRequirement) {
      setError("Choose an open staffing requirement.");
      return;
    }
    if (!registrationId) {
      setError("Choose an approved staff member.");
      return;
    }

    const response = await fetch(
      `/api/admin/bookings/${bookingId}/assignments`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId,
          requirementRef: selectedRequirement.id,
          shiftStart: shiftStart || undefined,
          shiftEnd: shiftEnd || undefined,
          payRate: payRate ? Number(payRate) : null,
          notes: notes || undefined,
          status,
        }),
      },
    );
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      setError(payload?.message || "Could not create the assignment.");
      return;
    }

    setMessage(
      `${payload?.assignment?.registration?.fullName || "Crew member"} assigned.`,
    );
    setRegistrationId("");
    setPayRate("");
    setNotes("");
    startTransition(() => router.refresh());
  };

  if (!openRequirements.length) {
    return (
      <div className="admin-form-note">
        Every staffing requirement on this request is already filled. Increase a
        requirement or release an assignment before adding more crew.
      </div>
    );
  }

  if (!staff.length) {
    return (
      <div className="admin-form-note">
        There are no approved staff profiles yet.{" "}
        <Link href="/admin/staff?status=pending_review" className="admin-link">
          Review candidates
        </Link>{" "}
        to build the pool.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="admin-stack-sm">
      <div className="admin-field">
        <label className="admin-label" htmlFor="assign-requirement">
          Staffing requirement
        </label>
        <select
          id="assign-requirement"
          className="admin-select"
          value={requirementRef}
          onChange={(event) => setRequirementRef(event.target.value)}
          disabled={pending}
        >
          {openRequirements.map((requirement) => (
            <option key={requirement.id} value={requirement.id}>
              {requirement.staffRole} · {requirement.workDate} ·{" "}
              {requirement.remaining} of {requirement.quantity} open
            </option>
          ))}
        </select>
      </div>

      <div className="admin-field">
        <label className="admin-label" htmlFor="assign-staff">
          Approved crew member
        </label>
        <select
          id="assign-staff"
          className="admin-select"
          value={registrationId}
          onChange={(event) => setRegistrationId(event.target.value)}
          disabled={pending}
        >
          <option value="">Choose staff…</option>
          {staff.map((member) => (
            <option key={member.id} value={member.id}>
              {member.fullName} · {member.currentCity} · {member.experienceLevel}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-form-grid">
        <div className="admin-field">
          <label className="admin-label" htmlFor="assign-start">
            Shift start (optional)
          </label>
          <input
            id="assign-start"
            type="time"
            className="admin-input"
            value={shiftStart}
            onChange={(event) => setShiftStart(event.target.value)}
            disabled={pending}
          />
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="assign-end">
            Shift end (optional)
          </label>
          <input
            id="assign-end"
            type="time"
            className="admin-input"
            value={shiftEnd}
            onChange={(event) => setShiftEnd(event.target.value)}
            disabled={pending}
          />
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="assign-rate">
            Pay rate (₹)
          </label>
          <input
            id="assign-rate"
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
          <label className="admin-label" htmlFor="assign-status">
            Assignment status
          </label>
          <select
            id="assign-status"
            className="admin-select"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            disabled={pending}
          >
            <option value="confirmed">Confirmed</option>
            <option value="proposed">Proposed</option>
          </select>
        </div>
      </div>

      <div className="admin-field">
        <label className="admin-label" htmlFor="assign-notes">
          Dispatch notes (optional)
        </label>
        <input
          id="assign-notes"
          className="admin-input"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Reporting point, uniform or contact instructions"
          maxLength={500}
          disabled={pending}
        />
      </div>

      {selectedRequirement ? (
        <p className="admin-subtle admin-small" style={{ margin: 0 }}>
          Derived shift: {selectedRequirement.reportingTime} report ·{" "}
          {selectedRequirement.shiftDuration} hour shift. Leave shift fields
          blank to use these defaults. Conflicts and duplicate assignments are
          blocked by the server.
        </p>
      ) : null}

      {error ? <div className="admin-form-error">{error}</div> : null}
      {message ? <div className="admin-alert is-success">{message}</div> : null}

      <button type="submit" className="admin-btn is-primary" disabled={pending}>
        <FiUserPlus aria-hidden="true" />
        {pending ? "Assigning…" : "Assign crew member"}
      </button>
    </form>
  );
}
