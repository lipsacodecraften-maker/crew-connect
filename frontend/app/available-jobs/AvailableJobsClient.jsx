"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  APPLICATION_STATUS_META,
  formatDate,
  formatDutyWindow,
  formatOpenings,
  formatPaymentRange,
} from "@/lib/jobs/config";

const EXPERIENCE_LABELS = {
  Any: "Any experience",
  Fresher: "Fresher friendly",
  Experienced: "Experienced required",
};

const EMPTY_FILTERS = {
  city: "all",
  role: "all",
  date: "any",
  payment: "any",
  experience: "any",
};

const IDENTITY_ERROR =
  "We could not match that Staff Registration ID and WhatsApp number. Check both and try again.";

function decorateJob(job) {
  if (!job) return null;

  const start = formatDate(job.eventDate);
  const end = job.endDate ? formatDate(job.endDate) : "";
  const dateLabel =
    end && job.endDate !== job.eventDate ? `${start} – ${end}` : start;

  const dutyLabel =
    job.dutyStartTime && job.dutyEndTime
      ? formatDutyWindow(job.dutyStartTime, job.dutyEndTime)
      : Number(job.dutyHours) > 0
        ? `${job.dutyHours} hrs`
        : "Shared before the shift";

  const hasPayment =
    Number(job.paymentMin) > 0 || Number(job.paymentMax) > 0;

  return {
    ...job,
    dateLabel,
    dutyLabel,
    hasPayment,
    paymentLabel: formatPaymentRange(job.paymentMin, job.paymentMax),
    openingsLabel: formatOpenings(job.openings),
    experienceLabel:
      EXPERIENCE_LABELS[job.experienceRequired] || job.experienceRequired,
  };
}

function formatTimestamp(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildQuery(filters) {
  const params = new URLSearchParams();

  if (filters.city !== "all") params.set("city", filters.city);
  if (filters.role !== "all") params.set("role", filters.role);
  if (filters.date !== "any") params.set("date", filters.date);
  if (filters.payment !== "any") params.set("payment", filters.payment);
  if (filters.experience !== "any") {
    params.set("experience", filters.experience);
  }

  return params.toString();
}

function isTenDigitMobile(value) {
  const digits = String(value || "").replace(/\D/g, "");
  const local =
    digits.length === 12 && digits.startsWith("91")
      ? digits.slice(2)
      : digits.length === 11 && digits.startsWith("0")
        ? digits.slice(1)
        : digits;
  return /^[6-9]\d{9}$/.test(local);
}

function StatusPill({ status, label }) {
  const tone = APPLICATION_STATUS_META[status]?.tone || "muted";
  return (
    <span className={`mp-status is-${tone}`}>
      {label || APPLICATION_STATUS_META[status]?.label || status}
    </span>
  );
}

function Field({ label, error, hint, children, className = "" }) {
  return (
    <label className={`mp-field ${className}`.trim()}>
      <span className="mp-label">
        {label}
        <em>*</em>
      </span>
      {children}
      {hint && !error ? <small className="mp-hint">{hint}</small> : null}
      {error ? (
        <small className="mp-error" role="alert">
          {error}
        </small>
      ) : null}
    </label>
  );
}

export default function AvailableJobsClient({ initialJobs, initialFilters }) {
  const [jobs, setJobs] = useState(() =>
    initialJobs.map((job) => decorateJob(job)),
  );
  const [options, setOptions] = useState(initialFilters);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState("");
  const [appliedJobs, setAppliedJobs] = useState({});

  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return undefined;
    }

    const controller = new AbortController();
    const query = buildQuery(filters);

    setLoading(true);
    setListError("");

    fetch(`/api/jobs${query ? `?${query}` : ""}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      cache: "no-store",
    })
      .then(async (response) => {
        const data = await response.json().catch(() => null);
        if (!response.ok || !data?.ok) {
          throw new Error(
            data?.message || "We could not load the job board right now.",
          );
        }
        setJobs((data.jobs || []).map((job) => decorateJob(job)));
        setOptions((current) => ({ ...current, ...(data.filters || {}) }));
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        setListError(
          error.message || "We could not load the job board right now.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [filters]);

  /* ------------------------------ apply dialog ----------------------------- */

  const [applyJob, setApplyJob] = useState(null);
  const [applyForm, setApplyForm] = useState({
    registrationId: "",
    mobileNumber: "",
  });
  const [applyState, setApplyState] = useState({
    status: "idle",
    message: "",
    errors: {},
    application: null,
  });
  const applyFirstField = useRef(null);

  const openApply = (job) => {
    setApplyJob(job);
    setApplyState({
      status: "idle",
      message: "",
      errors: {},
      application: null,
    });
    setApplyForm((current) => ({ ...current }));
  };

  const closeApply = () => {
    if (applyState.status === "submitting") return;
    setApplyJob(null);
  };

  const submitApply = async (event) => {
    event.preventDefault();
    if (!applyJob) return;

    const registrationId = applyForm.registrationId.trim().toUpperCase();
    const mobileNumber = applyForm.mobileNumber.trim();
    const errors = {};

    if (!registrationId) {
      errors.registrationId = "Add your Staff Registration ID.";
    }
    if (!mobileNumber) {
      errors.mobileNumber = "Add the WhatsApp number you registered with.";
    } else if (!isTenDigitMobile(mobileNumber)) {
      errors.mobileNumber = "Enter a valid 10-digit mobile number.";
    }

    if (Object.keys(errors).length > 0) {
      setApplyState({ status: "idle", message: "", errors, application: null });
      return;
    }

    setApplyState({
      status: "submitting",
      message: "",
      errors: {},
      application: null,
    });

    try {
      const response = await fetch("/api/jobs/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: applyJob.id,
          registrationId,
          mobileNumber,
        }),
      });
      const data = await response.json().catch(() => null);

      if (response.status === 201 && data?.ok) {
        setAppliedJobs((current) => ({
          ...current,
          [applyJob.id]: data.application,
        }));
        setApplyState({
          status: "success",
          message: data.message || "Application submitted.",
          errors: {},
          application: data.application,
        });
        return;
      }

      if (response.status === 409 && data?.reason === "duplicate") {
        setAppliedJobs((current) => ({
          ...current,
          [applyJob.id]: data.application,
        }));
        setApplyState({
          status: "duplicate",
          message: data.message || "You have already applied for this job.",
          errors: {},
          application: data.application,
        });
        return;
      }

      if (response.status === 400 && data?.errors) {
        setApplyState({
          status: "idle",
          message: data.message || "",
          errors: data.errors,
          application: null,
        });
        return;
      }

      setApplyState({
        status: "error",
        message:
          data?.message ||
          (response.status === 401
            ? IDENTITY_ERROR
            : "We could not submit that application. Please try again."),
        errors: {},
        application: null,
      });
    } catch {
      setApplyState({
        status: "error",
        message:
          "The application desk could not be reached. Check your connection and try again.",
        errors: {},
        application: null,
      });
    }
  };

  /* ------------------------------ track dialog ----------------------------- */

  const [trackOpen, setTrackOpen] = useState(false);
  const [trackForm, setTrackForm] = useState({
    registrationId: "",
    mobileNumber: "",
  });
  const [trackState, setTrackState] = useState({
    status: "idle",
    message: "",
    errors: {},
    applications: [],
    staff: null,
  });

  const openTrack = (identity) => {
    if (identity) {
      setTrackForm({
        registrationId: identity.registrationId || "",
        mobileNumber: identity.mobileNumber || "",
      });
    }
    setTrackState({
      status: "idle",
      message: "",
      errors: {},
      applications: [],
      staff: null,
    });
    setApplyJob(null);
    setTrackOpen(true);
  };

  const closeTrack = () => {
    if (trackState.status === "submitting") return;
    setTrackOpen(false);
  };

  const submitTrack = async (event) => {
    event.preventDefault();

    const registrationId = trackForm.registrationId.trim().toUpperCase();
    const mobileNumber = trackForm.mobileNumber.trim();
    const errors = {};

    if (!registrationId) {
      errors.registrationId = "Add your Staff Registration ID.";
    }
    if (!mobileNumber) {
      errors.mobileNumber = "Add the WhatsApp number you registered with.";
    } else if (!isTenDigitMobile(mobileNumber)) {
      errors.mobileNumber = "Enter a valid 10-digit mobile number.";
    }

    if (Object.keys(errors).length > 0) {
      setTrackState({
        status: "idle",
        message: "",
        errors,
        applications: [],
        staff: null,
      });
      return;
    }

    setTrackState({
      status: "submitting",
      message: "",
      errors: {},
      applications: [],
      staff: null,
    });

    try {
      const response = await fetch("/api/jobs/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId, mobileNumber }),
      });
      const data = await response.json().catch(() => null);

      if (response.ok && data?.ok) {
        setTrackState({
          status: "success",
          message: data.applications?.length
            ? ""
            : "No applications found yet. Apply for an open shift to see it here.",
          errors: {},
          applications: data.applications || [],
          staff: data.staff || null,
        });
        return;
      }

      setTrackState({
        status: "error",
        message:
          data?.message ||
          (response.status === 401
            ? IDENTITY_ERROR
            : "We could not look up those applications. Please try again."),
        errors: data?.errors || {},
        applications: [],
        staff: null,
      });
    } catch {
      setTrackState({
        status: "error",
        message:
          "The application desk could not be reached. Check your connection and try again.",
        errors: {},
        applications: [],
        staff: null,
      });
    }
  };

  /* ------------------------------- modal a11y ------------------------------ */

  const anyModalOpen = Boolean(applyJob) || trackOpen;

  useEffect(() => {
    if (!anyModalOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      if (trackOpen && trackState.status !== "submitting") {
        setTrackOpen(false);
      } else if (applyJob && applyState.status !== "submitting") {
        setApplyJob(null);
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [anyModalOpen, trackOpen, applyJob, trackState.status, applyState.status]);

  useEffect(() => {
    if (applyJob && applyState.status === "idle") {
      applyFirstField.current?.focus();
    }
  }, [applyJob, applyState.status]);

  /* --------------------------------- helpers ------------------------------- */

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const resetFilters = () => setFilters(EMPTY_FILTERS);

  const activeFilterCount = Object.entries(filters).filter(
    ([, value]) => value !== "all" && value !== "any",
  ).length;

  const lastIdentity =
    applyForm.registrationId && isTenDigitMobile(applyForm.mobileNumber)
      ? {
          registrationId: applyForm.registrationId,
          mobileNumber: applyForm.mobileNumber,
        }
      : null;

  const experienceLabelFor = (id) =>
    options.experience?.find((item) => item.id === id)?.label || id;

  return (
    <main className="mp-page aj-page">
      <div className="mp-topline">
        <div className="mp-container mp-topline-inner">
          <span>
            <i aria-hidden="true" /> Open shift board · approved listings only
          </span>
          <span>Client names, venues and booking details stay private</span>
        </div>
      </div>

      <section className="mp-hero">
        <div className="mp-container mp-hero-inner">
          <div className="mp-hero-main">
            <span className="mp-eyebrow">
              CrewConnect / Verified crew opportunities
            </span>
            <h1>
              Find your next shift,
              <br />
              <span>on confirmed events.</span>
            </h1>
            <p>
              Every listing on this board is an approved staffing requirement
              with a confirmed event date. Compare the role, city, duty hours
              and payment range, then apply with your staff registration. Private
              client details and internal booking information are never shown.
            </p>
            <div className="mp-trust">
              <span>Verified listings</span>
              <span>Gujarat-wide shifts</span>
              <span>Apply in under a minute</span>
              <span>Track status anytime</span>
            </div>
            <div className="aj-hero-actions">
              <button
                type="button"
                className="mp-btn mp-btn-primary"
                onClick={() => openTrack(lastIdentity)}
              >
                Track my applications <span aria-hidden="true">↗</span>
              </button>
              <Link href="/join-as-staff" className="mp-btn mp-btn-ghost">
                Not registered? Join as staff
              </Link>
            </div>
          </div>

          <aside className="mp-desk-card">
            <div className="mp-desk-head">
              <span>Crew desk</span>
              <span className="mp-live">
                <i aria-hidden="true" /> Live board
              </span>
            </div>
            <p>
              Apply using your CrewConnect Staff Registration ID and the
              WhatsApp number on that registration. The desk reviews every
              application before confirming crew.
            </p>
            <div className="mp-desk-list">
              <div>
                <b>01</b>
                <span>Browse confirmed, open shifts</span>
              </div>
              <div>
                <b>02</b>
                <span>Apply with your registration ID</span>
              </div>
              <div>
                <b>03</b>
                <span>Track shortlist &amp; selection</span>
              </div>
            </div>
            <button
              type="button"
              className="aj-desk-link"
              onClick={() => openTrack(lastIdentity)}
            >
              <small>Already applied?</small>
              <strong>Check application status ↗</strong>
            </button>
          </aside>
        </div>
      </section>

      <section className="mp-container aj-shell">
        <div className="aj-filterbar" role="search" aria-label="Filter open jobs">
          <div className="aj-filter-grid">
            <label className="mp-field">
              <span className="mp-label">City</span>
              <select
                value={filters.city}
                onChange={(event) =>
                  updateFilter("city", event.target.value)
                }
              >
                <option value="all">All cities</option>
                {(options.cities || []).map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </label>

            <label className="mp-field">
              <span className="mp-label">Job role</span>
              <select
                value={filters.role}
                onChange={(event) =>
                  updateFilter("role", event.target.value)
                }
              >
                <option value="all">All roles</option>
                {(options.roles || []).map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>

            <label className="mp-field">
              <span className="mp-label">Event date</span>
              <select
                value={filters.date}
                onChange={(event) =>
                  updateFilter("date", event.target.value)
                }
              >
                {(options.dateWindows || []).map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="mp-field">
              <span className="mp-label">Payment range</span>
              <select
                value={filters.payment}
                onChange={(event) =>
                  updateFilter("payment", event.target.value)
                }
              >
                {(options.paymentRanges || []).map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="mp-field">
              <span className="mp-label">Experience</span>
              <select
                value={filters.experience}
                onChange={(event) =>
                  updateFilter("experience", event.target.value)
                }
              >
                {(options.experience || []).map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="aj-filter-foot">
            <p aria-live="polite">
              {loading ? (
                "Checking open shifts…"
              ) : (
                <>
                  <strong>{jobs.length}</strong> open{" "}
                  {jobs.length === 1 ? "shift" : "shifts"}
                  {activeFilterCount > 0
                    ? ` · ${activeFilterCount} filter${
                        activeFilterCount === 1 ? "" : "s"
                      } applied`
                    : ""}
                </>
              )}
            </p>
            <button
              type="button"
              className="mp-btn mp-btn-ghost aj-reset"
              onClick={resetFilters}
              disabled={activeFilterCount === 0}
            >
              Clear filters
            </button>
          </div>
        </div>

        {listError ? (
          <p className="aj-alert" role="alert">
            {listError}
          </p>
        ) : null}

        {loading ? (
          <div className="aj-grid" aria-hidden="true">
            {[0, 1, 2].map((index) => (
              <div className="aj-card aj-skeleton" key={index} />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="aj-empty">
            <span className="mp-eyebrow">No matches</span>
            <h2>No open shifts match these filters.</h2>
            <p>
              Try a wider date window, another city or a different payment
              range. New approved listings appear here as soon as they go live.
            </p>
            <div className="aj-empty-actions">
              <button
                type="button"
                className="mp-btn mp-btn-primary"
                onClick={resetFilters}
              >
                Clear filters <span aria-hidden="true">↗</span>
              </button>
              <Link href="/join-as-staff" className="mp-btn mp-btn-ghost">
                Join as staff
              </Link>
            </div>
          </div>
        ) : (
          <div className="aj-grid">
            {jobs.map((job) => {
              const applied = appliedJobs[job.id];
              return (
                <article className="aj-card" key={job.id}>
                  <div className="aj-card-top">
                    <span className="aj-tag">{job.eventType}</span>
                    <span className="aj-openings">{job.openingsLabel}</span>
                  </div>

                  <h2>{job.jobRole}</h2>
                  <p className="aj-card-city">{job.city}</p>

                  <dl className="aj-specs">
                    <div>
                      <dt>Event date</dt>
                      <dd>{job.dateLabel}</dd>
                    </div>
                    <div>
                      <dt>Duty hours</dt>
                      <dd>{job.dutyLabel}</dd>
                    </div>
                    <div>
                      <dt>
                        {job.hasPayment
                          ? "Confirmed payment"
                          : "Payment"}
                      </dt>
                      <dd>{job.paymentLabel}</dd>
                    </div>
                    <div>
                      <dt>Experience</dt>
                      <dd>{job.experienceLabel}</dd>
                    </div>
                  </dl>

                  {job.summary ? (
                    <p className="aj-summary">{job.summary}</p>
                  ) : null}

                  <div className="aj-card-foot">
                    <span className="aj-id">Ref {job.id}</span>
                    {applied ? (
                      <button
                        type="button"
                        className="mp-btn mp-btn-ghost aj-applied"
                        onClick={() =>
                          openTrack({
                            registrationId: applyForm.registrationId,
                            mobileNumber: applyForm.mobileNumber,
                          })
                        }
                      >
                        Applied · {applied.statusLabel || "Track"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="mp-btn mp-btn-primary"
                        onClick={() => openApply(job)}
                      >
                        Apply Now <span aria-hidden="true">↗</span>
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <p className="aj-privacy">
          Listings show only the role, city, event date, duty window, payment
          range and experience requirement. Client identity, venue addresses and
          internal booking references are never published.
        </p>
      </section>

      {/* ------------------------------ apply modal ----------------------------- */}

      {applyJob ? (
        <div
          className="aj-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeApply();
          }}
        >
          <div
            className="aj-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="aj-apply-title"
          >
            <div className="aj-modal-head">
              <div>
                <span className="mp-eyebrow">Apply for this shift</span>
                <h2 id="aj-apply-title">{applyJob.jobRole}</h2>
                <p>
                  {applyJob.city} · {applyJob.dateLabel} · {applyJob.dutyLabel}
                </p>
              </div>
              <button
                type="button"
                className="aj-modal-close"
                onClick={closeApply}
                aria-label="Close apply dialog"
                disabled={applyState.status === "submitting"}
              >
                ✕
              </button>
            </div>

            <div className="aj-modal-body">
              {applyState.status === "success" ||
              applyState.status === "duplicate" ? (
                <div className="aj-apply-success">
                  <span
                    className={`mp-status ${
                      applyState.status === "duplicate"
                        ? "is-progress"
                        : "is-success"
                    }`}
                  >
                    {applyState.status === "duplicate"
                      ? "Already applied"
                      : "Application submitted"}
                  </span>
                  <h3>
                    {applyState.status === "duplicate"
                      ? "You have already applied for this shift."
                      : "Your application is with the crew desk."}
                  </h3>
                  <p>
                    {applyState.status === "duplicate"
                      ? applyState.message
                      : "Keep your application ID safe. You can track the status here at any time using your registration ID and WhatsApp number."}
                  </p>
                  <dl className="aj-apply-meta">
                    <div>
                      <dt>Application ID</dt>
                      <dd>{applyState.application?.id}</dd>
                    </div>
                    <div>
                      <dt>Status</dt>
                      <dd>
                        {applyState.application?.statusLabel ||
                          APPLICATION_STATUS_META[
                            applyState.application?.status
                          ]?.label ||
                          "Application received"}
                      </dd>
                    </div>
                  </dl>
                  <div className="aj-modal-actions">
                    <button
                      type="button"
                      className="mp-btn mp-btn-primary"
                      onClick={() =>
                        openTrack({
                          registrationId: applyForm.registrationId,
                          mobileNumber: applyForm.mobileNumber,
                        })
                      }
                    >
                      Track my applications <span aria-hidden="true">↗</span>
                    </button>
                    <button
                      type="button"
                      className="mp-btn mp-btn-ghost"
                      onClick={closeApply}
                    >
                      Browse other shifts
                    </button>
                  </div>
                </div>
              ) : (
                <form className="aj-form" onSubmit={submitApply} noValidate>
                  <div className="aj-form-note">
                    <strong>Registered staff only.</strong> Use the Staff
                    Registration ID from your approval email and the WhatsApp
                    number you registered with. New here?{" "}
                    <Link href="/join-as-staff" onClick={closeApply}>
                      Join as staff
                    </Link>
                    .
                  </div>

                  <Field
                    label="Staff Registration ID"
                    error={applyState.errors.registrationId}
                    hint="Example: CC-STF-202611-A1B2C3"
                  >
                    <input
                      ref={applyFirstField}
                      type="text"
                      autoComplete="off"
                      spellCheck="false"
                      aria-label="Staff Registration ID"
                      placeholder="CC-STF-…"
                      value={applyForm.registrationId}
                      onChange={(event) =>
                        setApplyForm((current) => ({
                          ...current,
                          registrationId: event.target.value.toUpperCase(),
                        }))
                      }
                    />
                  </Field>

                  <Field
                    label="WhatsApp number"
                    error={applyState.errors.mobileNumber}
                    hint="The 10-digit number on your registration."
                  >
                    <input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      aria-label="WhatsApp number"
                      placeholder="98250 00000"
                      value={applyForm.mobileNumber}
                      onChange={(event) =>
                        setApplyForm((current) => ({
                          ...current,
                          mobileNumber: event.target.value,
                        }))
                      }
                    />
                  </Field>

                  {applyState.status === "error" && applyState.message ? (
                    <p className="aj-alert" role="alert">
                      {applyState.message}
                    </p>
                  ) : null}

                  <div className="aj-modal-actions">
                    <button
                      type="submit"
                      className="mp-btn mp-btn-primary"
                      disabled={applyState.status === "submitting"}
                    >
                      {applyState.status === "submitting"
                        ? "Submitting…"
                        : "Submit application"}{" "}
                      {applyState.status !== "submitting" ? (
                        <span aria-hidden="true">↗</span>
                      ) : null}
                    </button>
                    <button
                      type="button"
                      className="mp-btn mp-btn-ghost"
                      onClick={closeApply}
                      disabled={applyState.status === "submitting"}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* ------------------------------ track modal ----------------------------- */}

      {trackOpen ? (
        <div
          className="aj-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeTrack();
          }}
        >
          <div
            className="aj-modal is-wide"
            role="dialog"
            aria-modal="true"
            aria-labelledby="aj-track-title"
          >
            <div className="aj-modal-head">
              <div>
                <span className="mp-eyebrow">Application tracker</span>
                <h2 id="aj-track-title">Track your applications</h2>
                <p>
                  Enter your Staff Registration ID and registered WhatsApp
                  number to see every shift you have applied for.
                </p>
              </div>
              <button
                type="button"
                className="aj-modal-close"
                onClick={closeTrack}
                aria-label="Close tracker dialog"
                disabled={trackState.status === "submitting"}
              >
                ✕
              </button>
            </div>

            <div className="aj-modal-body">
              <form className="aj-form aj-track-form" onSubmit={submitTrack} noValidate>
                <Field
                  label="Staff Registration ID"
                  error={trackState.errors.registrationId}
                >
                  <input
                    type="text"
                    autoComplete="off"
                    spellCheck="false"
                    aria-label="Staff Registration ID"
                    placeholder="CC-STF-…"
                    value={trackForm.registrationId}
                    onChange={(event) =>
                      setTrackForm((current) => ({
                        ...current,
                        registrationId: event.target.value.toUpperCase(),
                      }))
                    }
                  />
                </Field>

                <Field
                  label="WhatsApp number"
                  error={trackState.errors.mobileNumber}
                >
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    aria-label="WhatsApp number"
                    placeholder="98250 00000"
                    value={trackForm.mobileNumber}
                    onChange={(event) =>
                      setTrackForm((current) => ({
                        ...current,
                        mobileNumber: event.target.value,
                      }))
                    }
                  />
                </Field>

                <div className="aj-track-submit">
                  <button
                    type="submit"
                    className="mp-btn mp-btn-primary"
                    disabled={trackState.status === "submitting"}
                  >
                    {trackState.status === "submitting"
                      ? "Checking…"
                      : "Check status"}{" "}
                    {trackState.status !== "submitting" ? (
                      <span aria-hidden="true">↗</span>
                    ) : null}
                  </button>
                </div>
              </form>

              {trackState.status === "error" && trackState.message ? (
                <p className="aj-alert" role="alert">
                  {trackState.message}
                </p>
              ) : null}

              {trackState.status === "success" ? (
                <div className="aj-track-results" aria-live="polite">
                  <div className="aj-track-summary">
                    <span className="mp-eyebrow">Applications for</span>
                    <strong>{trackState.staff?.fullName}</strong>
                    <span>
                      {trackState.staff?.registrationId}
                      {trackState.staff?.currentCity
                        ? ` · ${trackState.staff.currentCity}`
                        : ""}
                    </span>
                  </div>

                  {trackState.applications.length === 0 ? (
                    <div className="aj-empty is-compact">
                      <h3>No applications yet</h3>
                      <p>{trackState.message}</p>
                    </div>
                  ) : (
                    <div className="aj-track-list">
                      {trackState.applications.map((application) => {
                        const job = decorateJob(application.job);
                        return (
                          <article
                            className="aj-track-card"
                            key={application.id}
                          >
                            <header>
                              <div>
                                <h3>{job?.jobRole || "Job listing"}</h3>
                                <p>
                                  {job
                                    ? `${job.city} · ${job.dateLabel}`
                                    : "Listing details unavailable"}
                                </p>
                              </div>
                              <StatusPill
                                status={application.status}
                                label={application.statusLabel}
                              />
                            </header>

                            <p className="aj-track-desc">
                              {application.statusDescription}
                            </p>

                            {job ? (
                              <dl className="aj-specs is-compact">
                                <div>
                                  <dt>Duty hours</dt>
                                  <dd>{job.dutyLabel}</dd>
                                </div>
                                <div>
                                  <dt>Payment</dt>
                                  <dd>{job.paymentLabel}</dd>
                                </div>
                                <div>
                                  <dt>Openings</dt>
                                  <dd>{job.openingsLabel}</dd>
                                </div>
                                <div>
                                  <dt>Experience</dt>
                                  <dd>{job.experienceLabel}</dd>
                                </div>
                              </dl>
                            ) : null}

                            <div className="aj-track-id">
                              <span>Application ID</span>
                              <code>{application.id}</code>
                            </div>

                            {application.events?.length ? (
                              <ol className="aj-timeline">
                                {application.events.map((entry, index) => (
                                  <li
                                    key={`${application.id}-${index}`}
                                    className={
                                      index === application.events.length - 1
                                        ? "is-current"
                                        : ""
                                    }
                                  >
                                    <span className="aj-timeline-dot" />
                                    <div>
                                      <strong>
                                        {APPLICATION_STATUS_META[entry.status]
                                          ?.label || entry.status}
                                      </strong>
                                      <small>
                                        {formatTimestamp(entry.createdAt)}
                                      </small>
                                      {entry.note ? (
                                        <p>{entry.note}</p>
                                      ) : null}
                                    </div>
                                  </li>
                                ))}
                              </ol>
                            ) : null}
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
