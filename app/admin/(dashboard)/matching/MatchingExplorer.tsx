"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiMapPin,
  FiRefreshCw,
  FiStar,
  FiTarget,
  FiUserPlus,
} from "react-icons/fi";

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

type Candidate = {
  id: string;
  fullName: string;
  mobileNumber: string;
  currentCity: string;
  preferredCities: string[];
  skills: string[];
  otherSkill: string;
  experienceLevel: string;
  yearsExperience: number;
  expectedPayment: number;
  shiftTypes: string[];
  languages: string[];
  willingToTravel: boolean;
  transportAvailable: boolean;
  score: number;
  assignable: boolean;
  conflicts: string[];
  reasons: string[];
  breakdown: {
    role: number;
    city: number;
    availability: number;
    experience: number;
    shift: number;
    reliability: number;
  };
};

type MatchResult = {
  ok: true;
  selected: {
    id: number;
    staffRole: string;
    quantity: number;
    filled: number;
    remaining: number;
    workDate: string;
    reportingTime: string;
    shiftDuration: number;
    experienceRequirement: string;
  } | null;
  query: {
    role: string;
    eventCity: string;
    workDate: string;
    shiftStart: string;
    shiftEnd: string;
    experience: string;
  };
  candidates: Candidate[];
  summary: { totalApproved: number; assignable: number; blocked: number };
};

function dateLabel(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value || "—";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function initials(name: string) {
  return String(name || "CC")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function MatchingExplorer({
  bookings,
  initialBookingId,
  initialRequirementRef,
  initialResult,
  canAssign,
}: {
  bookings: BookingOption[];
  initialBookingId: string;
  initialRequirementRef: string;
  initialResult: MatchResult | null;
  canAssign: boolean;
}) {
  const router = useRouter();
  const [bookingId, setBookingId] = useState(initialBookingId);
  const [requirementRef, setRequirementRef] = useState(initialRequirementRef);
  const [result, setResult] = useState<MatchResult | null>(initialResult);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [assigningId, setAssigningId] = useState("");
  const [pending, startTransition] = useTransition();

  const selectedBooking = useMemo(
    () => bookings.find((booking) => booking.id === bookingId) || null,
    [bookings, bookingId],
  );

  const selectBooking = (nextBookingId: string) => {
    setBookingId(nextBookingId);
    setRequirementRef("");
    setResult(null);
    setError("");
    setMessage("");
  };

  const load = async (nextBookingId: string, nextRequirementRef: string) => {
    if (!nextBookingId) return;
    setLoading(true);
    setError("");
    setMessage("");

    const query = new URLSearchParams({ bookingId: nextBookingId });
    const ref = Number(nextRequirementRef);
    if (Number.isFinite(ref) && ref > 0) query.set("requirementRef", String(ref));

    const response = await fetch(`/api/admin/matching?${query.toString()}`);
    const payload = await response.json().catch(() => null);
    setLoading(false);

    if (!response.ok || !payload?.ok) {
      setError(payload?.message || "Could not load staff recommendations.");
      setResult(null);
      return;
    }

    setResult(payload as MatchResult);
  };

  const assign = async (candidate: Candidate) => {
    if (!result?.selected || !bookingId) return;
    setAssigningId(candidate.id);
    setError("");
    setMessage("");

    const response = await fetch(
      `/api/admin/bookings/${bookingId}/assignments`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: candidate.id,
          requirementRef: result.selected.id,
          status: "confirmed",
        }),
      },
    );
    const payload = await response.json().catch(() => null);
    setAssigningId("");

    if (!response.ok) {
      setError(payload?.message || "Could not assign this candidate.");
      return;
    }

    setMessage(
      `${candidate.fullName} assigned as ${
        payload?.assignment?.role || result.selected.staffRole
      }. Recommendations refreshed.`,
    );
    await load(bookingId, String(result.selected.id));
    startTransition(() => router.refresh());
  };

  return (
    <div className="admin-stack">
      <section className="admin-card">
        <div className="admin-card-body">
          <div className="admin-form-grid">
            <div className="admin-field">
              <label className="admin-label" htmlFor="match-booking">
                Event request
              </label>
              <select
                id="match-booking"
                className="admin-select"
                value={bookingId}
                onChange={(event) => selectBooking(event.target.value)}
                disabled={loading}
              >
                <option value="">Choose a live event…</option>
                {bookings.map((booking) => (
                  <option key={booking.id} value={booking.id}>
                    {booking.eventName} · {booking.eventCity} ·{" "}
                    {booking.eventStartDate}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-field">
              <label className="admin-label" htmlFor="match-requirement">
                Staffing requirement
              </label>
              <select
                id="match-requirement"
                className="admin-select"
                value={requirementRef}
                onChange={(event) => {
                  setRequirementRef(event.target.value);
                  load(bookingId, event.target.value);
                }}
                disabled={!selectedBooking || loading}
              >
                <option value="">
                  {selectedBooking
                    ? "Best open requirement"
                    : "Choose an event first"}
                </option>
                {selectedBooking?.requirements.map((requirement) => (
                  <option key={requirement.id} value={requirement.id}>
                    {requirement.staffRole} · {requirement.remaining}/
                    {requirement.quantity} open
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-btn-row" style={{ marginTop: 12 }}>
            <button
              type="button"
              className="admin-btn is-primary"
              onClick={() => load(bookingId, requirementRef)}
              disabled={!bookingId || loading}
            >
              <FiRefreshCw aria-hidden="true" />
              {loading ? "Matching…" : "Find best crew"}
            </button>
            {result?.selected ? (
              <span className="admin-count-chip">
                <FiTarget aria-hidden="true" /> {result.query.role} ·{" "}
                {result.query.eventCity} · {dateLabel(result.query.workDate)}
              </span>
            ) : null}
            {result ? (
              <span className="admin-count-chip">
                {result.summary.assignable} assignable ·{" "}
                {result.summary.blocked} blocked
              </span>
            ) : null}
          </div>

          {error ? <div className="admin-form-error">{error}</div> : null}
          {message ? <div className="admin-alert is-success">{message}</div> : null}
        </div>
      </section>

      {!bookingId ? (
        <section className="admin-card">
          <div className="admin-empty">
            <strong>Choose an event to start matching</strong>
            <p>
              Recommendations are scored on role fit, city, availability, shift
              compatibility, experience, and reliability. Scheduling conflicts
              are detected before assignment.
            </p>
          </div>
        </section>
      ) : null}

      {bookingId && !result && !loading ? (
        <section className="admin-card">
          <div className="admin-empty">
            <strong>No recommendations loaded</strong>
            <p>Choose a requirement and run the matcher.</p>
          </div>
        </section>
      ) : null}

      {loading && !result ? (
        <section className="admin-card">
          <div className="admin-empty">
            <strong>Scoring approved crew…</strong>
            <p>Checking availability, skills, travel and same-day clashes.</p>
          </div>
        </section>
      ) : null}

      {result?.selected ? (
        <section className="admin-card">
          <div className="admin-card-head">
            <div>
              <h2 className="admin-card-title">Open requirement</h2>
              <p className="admin-card-sub">
                {result.selected.staffRole} ·{" "}
                {dateLabel(result.selected.workDate)} ·{" "}
                {result.selected.reportingTime ? `${result.selected.reportingTime} report` : "time TBC"}{" "}
                {result.selected.shiftDuration
                  ? `· ${result.selected.shiftDuration}h shift`
                  : ""}
                {` · ${result.selected.experienceRequirement} experience`}
              </p>
            </div>
            <span className="admin-count-chip">
              {result.selected.filled}/{result.selected.quantity} filled
            </span>
          </div>
        </section>
      ) : null}

      {result ? (
        result.candidates.length ? (
          <div className="admin-grid admin-grid-3">
            {result.candidates.map((candidate) => (
              <article
                key={candidate.id}
                className="admin-card"
                style={{
                  opacity: candidate.assignable ? 1 : 0.72,
                  borderColor: candidate.assignable
                    ? "var(--adm-border-soft)"
                    : "rgba(239, 100, 97, 0.35)",
                }}
              >
                <div className="admin-card-body admin-stack-sm">
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span className="admin-avatar">
                        {initials(candidate.fullName)}
                      </span>
                      <div>
                        <Link
                          href={`/admin/staff/${candidate.id}`}
                          className="admin-row-title"
                          style={{ textDecoration: "none" }}
                        >
                          {candidate.fullName}
                        </Link>
                        <span className="admin-row-sub">
                          {candidate.experienceLevel} ·{" "}
                          {candidate.yearsExperience} yr
                          {candidate.yearsExperience === 1 ? "" : "s"}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`admin-pill ${
                        candidate.score >= 75
                          ? "is-success"
                          : candidate.score >= 50
                            ? "is-warning"
                            : "is-muted"
                      }`}
                    >
                      <FiStar aria-hidden="true" /> {candidate.score}
                    </span>
                  </div>

                  <div className="admin-row-sub">
                    <FiMapPin aria-hidden="true" /> {candidate.currentCity} ·{" "}
                    {candidate.mobileNumber}
                  </div>

                  <div className="admin-inline-list">
                    {candidate.skills.slice(0, 5).map((skill) => (
                      <span className="admin-tag" key={skill}>
                        {skill}
                      </span>
                    ))}
                    {candidate.willingToTravel ? (
                      <span className="admin-tag">Travel</span>
                    ) : null}
                    {candidate.transportAvailable ? (
                      <span className="admin-tag">Transport</span>
                    ) : null}
                  </div>

                  <div
                    className="admin-info-grid"
                    style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}
                  >
                    <div className="admin-info">
                      <dt>Role</dt>
                      <dd>{candidate.breakdown.role}/40</dd>
                    </div>
                    <div className="admin-info">
                      <dt>City</dt>
                      <dd>{candidate.breakdown.city}/20</dd>
                    </div>
                    <div className="admin-info">
                      <dt>Date</dt>
                      <dd>{candidate.breakdown.availability}/15</dd>
                    </div>
                    <div className="admin-info">
                      <dt>Experience</dt>
                      <dd>{candidate.breakdown.experience}/15</dd>
                    </div>
                    <div className="admin-info">
                      <dt>Shift</dt>
                      <dd>{candidate.breakdown.shift}/10</dd>
                    </div>
                    <div className="admin-info">
                      <dt>Reliability</dt>
                      <dd>{candidate.breakdown.reliability}/5</dd>
                    </div>
                  </div>

                  <ul className="admin-list">
                    {candidate.reasons.slice(0, 3).map((reason) => (
                      <li key={reason} className="admin-small">
                        <FiCheckCircle aria-hidden="true" /> {reason}
                      </li>
                    ))}
                  </ul>

                  {candidate.conflicts.length ? (
                    <div className="admin-alert is-warning">
                      <strong>
                        <FiAlertTriangle aria-hidden="true" /> Blocked
                      </strong>
                      <ul>
                        {candidate.conflicts.map((conflict) => (
                          <li key={conflict}>{conflict}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {canAssign ? (
                    <button
                      type="button"
                      className="admin-btn is-primary is-small"
                      onClick={() => assign(candidate)}
                      disabled={
                        !candidate.assignable ||
                        !result.selected ||
                        assigningId === candidate.id ||
                        pending
                      }
                    >
                      <FiUserPlus aria-hidden="true" />
                      {assigningId === candidate.id
                        ? "Assigning…"
                        : candidate.assignable
                          ? "Assign to requirement"
                          : "Resolve conflicts first"}
                    </button>
                  ) : (
                    <div className="admin-form-note">
                      Read-only matching view. Ask a coordinator to assign crew.
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <section className="admin-card">
            <div className="admin-empty">
              <strong>No approved crew found</strong>
              <p>
                Approve more staff or adjust the event requirement to widen the
                search.
              </p>
            </div>
          </section>
        )
      ) : null}
    </div>
  );
}
