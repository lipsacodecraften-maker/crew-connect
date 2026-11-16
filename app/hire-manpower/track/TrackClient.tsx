"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { STATUS_META, formatDate, formatDateTime, formatTime } from "@/lib/booking/config";

function StatusPill({ status }: { status: string }) {
  const meta = (STATUS_META as any)[status] || {
    label: status,
    tone: "muted",
    description: "",
  };
  return <span className={`mp-status is-${meta.tone}`}>{meta.label}</span>;
}

export default function TrackClient() {
  const searchParams = useSearchParams();
  const secureToken = searchParams.get("token") || "";
  const queryReference = searchParams.get("ref") || searchParams.get("id") || "";
  const queryEmail = searchParams.get("email") || "";

  const [bookingId, setBookingId] = useState(queryReference);
  const [email, setEmail] = useState(queryEmail);
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(Boolean(secureToken));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!secureToken) return undefined;

    let cancelled = false;
    setLoading(true);

    fetch(`/api/bookings/track?token=${encodeURIComponent(secureToken)}`)
      .then(async (response) => {
        const data = await response.json().catch(() => null);
        if (cancelled) return;
        if (!response.ok || !data?.ok) {
          setError(data?.message || "This tracking link is not valid.");
          return;
        }
        setBooking(data.booking);
      })
      .catch(() => {
        if (!cancelled) {
          setError("We could not load this request. Check your connection.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [secureToken]);

  const lookup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!bookingId.trim() || !email.trim()) {
      setError("Enter both the booking ID and the email used for the request.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/bookings/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, email }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok) {
        setBooking(null);
        setError(
          data?.message ||
            "No request matched those details. Check the booking ID and email.",
        );
        return;
      }

      setBooking(data.booking);
    } catch {
      setError("We could not reach the booking desk. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const meta = booking ? (STATUS_META as any)[booking.status] : null;
  const history = booking?.history?.length
    ? booking.history
    : booking
      ? [
          {
            status: booking.status,
            note: "Current request status.",
            createdAt: booking.updatedAt || booking.createdAt,
          },
        ]
      : [];

  return (
    <main className="mp-page">
      <div className="mp-topline">
        <div className="mp-container mp-topline-inner">
          <span>
            <i aria-hidden="true" /> Request tracking · booking desk
          </span>
          <span>Secure status lookup</span>
        </div>
      </div>

      <section className="mp-hero mp-track-hero">
        <div className="mp-container">
          <span className="mp-eyebrow">CrewConnect / Track a request</span>
          <h1>
            Follow your
            <br />
            <span>crew request.</span>
          </h1>
          <p>
            Enter your booking request ID and the email used at submission, or
            open the secure link from your confirmation to see live status and
            the complete staffing plan.
          </p>
        </div>
      </section>

      <section className="mp-container mp-track-shell">
        <div className="mp-track-layout">
          <div className="mp-track-main">
            {!secureToken ? (
              <form className="mp-track-form" onSubmit={lookup} noValidate>
                <div className="mp-track-form-head">
                  <span className="mp-eyebrow">Status lookup</span>
                  <h2>Find your request</h2>
                  <p>
                    Use the booking ID shown on your confirmation. It looks like{" "}
                    <strong>CC-MP-202611-A1B2C3</strong>.
                  </p>
                </div>

                <div className="mp-grid mp-grid-2">
                  <label className="mp-field">
                    <span className="mp-label">
                      Booking request ID<em>*</em>
                    </span>
                    <input
                      type="text"
                      value={bookingId}
                      onChange={(event) => setBookingId(event.target.value)}
                      placeholder="CC-MP-202611-A1B2C3"
                      autoComplete="off"
                      spellCheck="false"
                    />
                  </label>

                  <label className="mp-field">
                    <span className="mp-label">
                      Email address<em>*</em>
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@company.com"
                      autoComplete="email"
                    />
                  </label>
                </div>

                {error ? (
                  <p className="mp-error mp-track-error" role="alert">
                    {error}
                  </p>
                ) : null}

                <div className="mp-track-form-actions">
                  <button type="submit" className="mp-btn mp-btn-primary" disabled={loading}>
                    {loading ? "Checking…" : "Check status"}
                    <span aria-hidden="true">→</span>
                  </button>
                  <Link className="mp-btn mp-btn-ghost" href="/hire-manpower">
                    New booking request
                  </Link>
                </div>
              </form>
            ) : null}

            {secureToken && loading ? (
              <div className="mp-track-loading" role="status">
                <span aria-hidden="true" />
                Loading your request…
              </div>
            ) : null}

            {secureToken && !loading && !booking ? (
              <div className="mp-track-form">
                <span className="mp-eyebrow">Secure link</span>
                <h2>Request not found</h2>
                <p className="mp-error" role="alert">
                  {error || "This tracking link is not valid any more."}
                </p>
                <Link className="mp-btn mp-btn-primary" href="/hire-manpower/track">
                  Look up with booking ID
                </Link>
              </div>
            ) : null}

            {booking ? (
              <article className="mp-track-result">
                <header className="mp-track-result-head">
                  <div>
                    <span className="mp-eyebrow">Booking request</span>
                    <h2>{booking.id}</h2>
                    <p>
                      {booking.eventName} · {booking.eventCity}, {booking.state}
                    </p>
                  </div>
                  <div className="mp-track-status-box">
                    <span>Current status</span>
                    <StatusPill status={booking.status} />
                  </div>
                </header>

                {meta ? <p className="mp-track-description">{meta.description}</p> : null}

                <dl className="mp-success-facts mp-track-facts">
                  <div>
                    <dt>Event dates</dt>
                    <dd>
                      {formatDate(booking.eventStartDate)} – {formatDate(booking.eventEndDate)}
                    </dd>
                  </div>
                  <div>
                    <dt>Total staff requested</dt>
                    <dd>{booking.totalStaff}</dd>
                  </div>
                  <div>
                    <dt>Submitted</dt>
                    <dd>{formatDateTime(booking.createdAt)}</dd>
                  </div>
                  <div>
                    <dt>Last update</dt>
                    <dd>{formatDateTime(booking.updatedAt)}</dd>
                  </div>
                  <div className="mp-span-2">
                    <dt>Venue</dt>
                    <dd>{booking.venueAddress}</dd>
                  </div>
                </dl>

                {booking.urgent ? (
                  <div className="mp-urgent-banner">
                    <span aria-hidden="true">!</span>
                    <div>
                      <b>Urgent requirement</b>
                      <small>This request is flagged for priority review by the dispatch team.</small>
                    </div>
                  </div>
                ) : null}

                <section className="mp-track-section">
                  <div className="mp-track-section-head">
                    <h3>Status timeline</h3>
                    <span>
                      {history.length} update{history.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <ol className="mp-timeline">
                    {history
                      .slice()
                      .reverse()
                      .map((event: any, index: number) => (
                        <li key={`${event.status}-${event.createdAt}-${index}`} className={index === 0 ? "is-current" : ""}>
                          <span className="mp-timeline-dot" aria-hidden="true" />
                          <div>
                            <b>{(STATUS_META as any)[event.status]?.label || event.status}</b>
                            <small>{formatDateTime(event.createdAt)}</small>
                            {event.note ? <p>{event.note}</p> : null}
                          </div>
                        </li>
                      ))}
                  </ol>
                </section>

                <section className="mp-track-section">
                  <div className="mp-track-section-head">
                    <h3>Staffing plan</h3>
                    <span>
                      {booking.roles.length} role{booking.roles.length === 1 ? "" : "s"} · {booking.totalStaff} staff
                    </span>
                  </div>

                  <div className="mp-track-roles">
                    {booking.roles.map((role: any, index: number) => (
                      <div className="mp-track-role" key={`${role.staffRole}-${index}`}>
                        <div className="mp-track-role-main">
                          <span>Role {String(index + 1).padStart(2, "0")}</span>
                          <b>{role.staffRole}</b>
                          <small>
                            {role.genderPreference} · {role.experienceRequirement}
                          </small>
                        </div>
                        <div className="mp-track-role-qty">
                          <span>Qty</span>
                          <strong>{role.quantity}</strong>
                        </div>
                        <div className="mp-track-role-meta">
                          <span>
                            {formatDate(role.workDate)} · {formatTime(role.reportingTime)}
                          </span>
                          <span>
                            {role.shiftDuration}h shift · {role.uniformRequirement}
                          </span>
                          {role.specialInstructions ? (
                            <span className="mp-track-role-note">{role.specialInstructions}</span>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <footer className="mp-track-result-actions">
                  <Link className="mp-btn mp-btn-ghost" href="/hire-manpower">
                    ← Back to hire manpower
                  </Link>
                  <button type="button" className="mp-btn mp-btn-primary" onClick={() => window.print()}>
                    Print summary
                  </button>
                </footer>
              </article>
            ) : null}
          </div>

          <aside className="mp-track-side">
            <div className="mp-side-card">
              <span className="mp-eyebrow">Need help?</span>
              <h3>Talk to the booking desk</h3>
              <p>
                Share your booking ID and our team will pull up the brief, availability notes and commercial status.
              </p>
              <a href="tel:+917940018820">
                +91 79 4001 8820 <span aria-hidden="true">↗</span>
              </a>
            </div>

            <div className="mp-side-card">
              <span className="mp-eyebrow">Status meaning</span>
              <ul className="mp-track-legend">
                {Object.entries(STATUS_META).map(([key, value]: any) => (
                  <li key={key}>
                    <StatusPill status={key} />
                    <span>{value.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
