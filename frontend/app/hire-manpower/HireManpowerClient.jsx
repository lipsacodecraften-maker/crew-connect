"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BOOKING_STEPS,
  COMPANY_TYPES,
  EVENT_TYPES,
  EXPERIENCE_OPTIONS,
  GENDER_PREFERENCES,
  GUJARAT_CITIES,
  INDIAN_STATES,
  LANGUAGE_OPTIONS,
  QUICK_ROLES,
  STAFF_ROLE_SUGGESTIONS,
  UNIFORM_OPTIONS,
  createInitialBooking,
  createStaffRole,
  formatCurrency,
  formatDate,
  formatFileSize,
  formatTime,
} from "@/lib/booking/config";
import {
  countStepErrors,
  firstErrorStep,
  getTotalStaff,
  validateBooking,
  validateReferenceFile,
  validateStep,
} from "@/lib/booking/validation";

const DESK_PHONE = "+91 9510572460";
const DESK_PHONE_HREF = "tel:+919510572460";

const NAME_PATTERN = /^[A-Za-z ]+$/;
const PHONE_PATTERN = /^[0-9]{10}$/;
const EMAIL_PATTERN =
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

function validateContactFormats(form) {
  const errors = {};

  if (
    form.contactPerson.trim() &&
    !NAME_PATTERN.test(form.contactPerson.trim())
  ) {
    errors.contactPerson = "Name can contain only letters and spaces.";
  }

  if (
    form.mobileNumber &&
    !PHONE_PATTERN.test(form.mobileNumber)
  ) {
    errors.mobileNumber = "Enter exactly 10 digits.";
  }

  if (
    form.whatsappNumber &&
    !PHONE_PATTERN.test(form.whatsappNumber)
  ) {
    errors.whatsappNumber = "Enter exactly 10 digits.";
  }

  const email = form.emailAddress.trim();

  if (email && !EMAIL_PATTERN.test(email)) {
    errors.emailAddress = "Enter a valid email address.";
  }

  return errors;
}


function Field({
  label,
  error,
  hint,
  required = true,
  className = "",
  children,
}) {
  return (
    <label className={`mp-field ${className}`.trim()}>
      <span className="mp-label">
        {label}
        {required ? (
          <em>*</em>
        ) : (
          <small className="mp-optional"> (Optional)</small>
        )}
      </span>

      {children}

      {hint && !error ? (
        <small className="mp-hint">{hint}</small>
      ) : null}

      {error ? (
        <small className="mp-error" role="alert">
          {error}
        </small>
      ) : null}
    </label>
  );
}


function YesNo({ label, value, onChange, error, required = true }) {
  return (
    <fieldset
      className="mp-field mp-fieldset"
    >
      <legend className="mp-label">
        {label}
        {required ? (
          <em>*</em>
        ) : (
        <small className="mp-optional"> (Optional)</small>
      )}
      </legend>
      <div className="mp-segmented">
        {["yes", "no"].map((option) => (
          <button
            key={option}
            type="button"
            className={value === option ? "is-active" : ""}
            aria-pressed={value === option}
            onClick={() => onChange(option)}
          >
            {option === "yes" ? "Yes" : "No"}
          </button>
        ))}
      </div>
      {error ? (
        <small className="mp-error" role="alert">
          {error}
        </small>
      ) : null}
    </fieldset>
  );
}

function LanguagePicker({ value, onChange, error, required = true }) {
    return (
    <fieldset className="mp-field mp-fieldset mp-span-2">
      <legend className="mp-label">
        Language requirements
        {required ? (
          <em>*</em>
        ) : (
          <small className="mp-optional"> (Optional)</small>
        )}
      </legend>
      <div className="mp-chips">
        {LANGUAGE_OPTIONS.map((language) => (
          <button
            key={language}
            type="button"
            className={value.includes(language) ? "is-active" : ""}
            aria-pressed={value.includes(language)}
            onClick={() => toggle(language)}
          >
            {language}
          </button>
        ))}
      </div>
      {error ? (
        <small className="mp-error" role="alert">
          {error}
        </small>
      ) : (
        <small className="mp-hint">
          Select every language the crew must speak on the event floor.
        </small>
      )}
    </fieldset>
  );
}

function FileField({ file, onChange, error }) {
  const inputRef = useRef(null);

  return (
    <div className="mp-field mp-span-2">
      <span className="mp-label">Reference file (optional)</span>
      <label className={`mp-file ${file ? "has-file" : ""}`.trim()}>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
          onChange={(event) => onChange(event.target.files?.[0] || null)}
        />
        <span className="mp-file-icon" aria-hidden="true">
          {file ? "✓" : "↑"}
        </span>
        <span className="mp-file-copy">
          <b>{file ? file.name : "Upload a brief, floor plan or reference deck"}</b>
          <small>
            {file
              ? `${formatFileSize(file.size)} · click to replace`
              : "PDF, DOC, DOCX, JPG, PNG or WEBP · max 5 MB"}
          </small>
        </span>
      </label>
      {error ? (
        <small className="mp-error" role="alert">
          {error}
        </small>
      ) : null}
      {file ? (
        <button
          type="button"
          className="mp-file-remove"
          onClick={() => {
            onChange(null);
            if (inputRef.current) inputRef.current.value = "";
          }}
        >
          Remove file
        </button>
      ) : null}
    </div>
  );
}

function ReviewSection({ title, stepId, onEdit, children }) {
  return (
    <section className="mp-review-section">
      <header>
        <div>
          <span className="mp-review-index">SECTION</span>
          <h3>{title}</h3>
        </div>
        <button type="button" className="mp-edit" onClick={() => onEdit(stepId)}>
          Edit <span aria-hidden="true">↗</span>
        </button>
      </header>
      {children}
    </section>
  );
}

function ReviewItem({ label, value, wide = false }) {
  return (
    <div className={`mp-review-item ${wide ? "mp-span-2" : ""}`.trim()}>
      <span>{label}</span>
      <b>{value || "—"}</b>
    </div>
  );
}

function SuccessPanel({ result, onReset }) {
  const [copied, setCopied] = useState(false);

  const emailSent = result.notifications?.email?.sent || 0;
  const whatsappSent = result.notifications?.whatsapp?.sent || 0;
  const configured =
    result.notifications?.configured?.email ||
    result.notifications?.configured?.whatsapp;
  const delivered = emailSent + whatsappSent > 0;

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(result.booking.id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mp-success">
      <div className="mp-success-mark" aria-hidden="true">
        ✓
      </div>
      <span className="mp-eyebrow">Request received</span>
      <h1>Your crew request is in.</h1>
      <p className="mp-success-lede">
        Thanks, {result.booking.contactPerson || "there"}. Our staffing desk has
        your brief for <strong>{result.booking.eventName}</strong> and will review
        availability, commercials and crew options.
      </p>

      <div className="mp-ticket">
        <div>
          <span>Booking request ID</span>
          <strong>{result.booking.id}</strong>
        </div>
        <button type="button" onClick={copyId}>
          {copied ? "Copied" : "Copy ID"}
        </button>
      </div>

      <dl className="mp-success-facts">
        <div>
          <dt>Status</dt>
          <dd>
            <span className="mp-status is-new">Request received</span>
          </dd>
        </div>
        <div>
          <dt>Event dates</dt>
          <dd>
            {formatDate(result.booking.eventStartDate)} –{" "}
            {formatDate(result.booking.eventEndDate)}
          </dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>
            {result.booking.eventCity}, {result.booking.state}
          </dd>
        </div>
        <div>
          <dt>Total staff requested</dt>
          <dd>{result.booking.totalStaff}</dd>
        </div>
      </dl>

      <div className="mp-success-actions">
        <Link className="mp-btn mp-btn-primary" href={result.trackingPath}>
          Track this request <span aria-hidden="true">→</span>
        </Link>
        <button type="button" className="mp-btn mp-btn-ghost" onClick={onReset}>
          Start another request
        </button>
      </div>

      <p className="mp-delivery-note">
        {delivered
          ? "A confirmation has been sent to your email and/or WhatsApp, and the admin desk has been alerted."
          : configured
            ? "Your request is saved. A confirmation was attempted — our desk can still see the full brief if delivery is delayed."
            : "Your request is saved in the booking desk. Email and WhatsApp delivery is currently in log-only mode until provider credentials are configured."}
      </p>

      <p className="mp-success-keep">
        Keep <strong>{result.booking.id}</strong> handy. You can track progress
        with this ID and your email address, or use the secure link above.
      </p>
    </div>
  );
}

export default function HireManpowerClient() {
  const [form, setForm] = useState(createInitialBooking);
  const [stepIndex, setStepIndex] = useState(0);
  const [maxVisited, setMaxVisited] = useState(0);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const wizardRef = useRef(null);
  const formRef = useRef(null);

  const currentStep = BOOKING_STEPS[stepIndex];
  const totalStaff = useMemo(
    () => getTotalStaff(form.staffingRoles),
    [form.staffingRoles],
  );
  const roleCount = form.staffingRoles.length;
  const progress = Math.round(((stepIndex + 1) / BOOKING_STEPS.length) * 100);
  const errorCount = Object.keys(errors).length;

  useEffect(() => {
    if (!errorCount) return;
    const frame = window.requestAnimationFrame(() => {
      const target = formRef.current?.querySelector('[aria-invalid="true"]');
      if (target && typeof target.focus === "function") {
        target.focus({ preventScroll: true });
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [errors, errorCount]);

  const scrollToWizard = () => {
    window.requestAnimationFrame(() => {
      const node = wizardRef.current;
      if (!node) return;
      const top = node.getBoundingClientRect().top + window.scrollY - 104;
      window.scrollTo({ top, behavior: "smooth" });
    });
  };

  const update = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => {
      if (!previous[key]) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
    setServerError("");
  };

  const updateRole = (index, key, value) => {
    setForm((previous) => ({
      ...previous,
      staffingRoles: previous.staffingRoles.map((role, roleIndex) =>
        roleIndex === index ? { ...role, [key]: value } : role,
      ),
    }));

    setErrors((previous) => {
      const errorKey = `staffingRoles.${index}.${key}`;
      if (!previous[errorKey] && !previous.staffingRoles) return previous;
      const next = { ...previous };
      delete next[errorKey];
      delete next.staffingRoles;
      return next;
    });
    setServerError("");
  };

  const clearRoleErrors = (previous) => {
    const next = { ...previous };
    Object.keys(next).forEach((key) => {
      if (key.startsWith("staffingRoles")) delete next[key];
    });
    return next;
  };

  const addRole = (overrides = {}) => {
    setForm((previous) => ({
      ...previous,
      staffingRoles: [
        ...previous.staffingRoles,
        createStaffRole({
          workDate: previous.eventStartDate,
          reportingTime: previous.reportingTime,
          ...overrides,
        }),
      ],
    }));
    setErrors(clearRoleErrors);
    setServerError("");
  };

  const removeRole = (index) => {
    setForm((previous) => ({
      ...previous,
      staffingRoles: previous.staffingRoles.filter(
        (_, roleIndex) => roleIndex !== index,
      ),
    }));
    setErrors(clearRoleErrors);
    setServerError("");
  };

  const goToStep = (target) => {
    const index =
      typeof target === "number"
        ? target
        : BOOKING_STEPS.findIndex((step) => step.id === target);

    if (index < 0 || index >= BOOKING_STEPS.length) return;

    setStepIndex(index);
    setErrors({});
    setServerError("");
    scrollToWizard();
  };

  const goNext = () => {
    if (stepIndex >= BOOKING_STEPS.length - 1) return;

    const stepErrors = {
      ...validateStep(currentStep.id, form),
      ...(currentStep.id === "contact"
        ? validateContactFormats(form)
        : {}),
    };
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;

    const nextIndex = stepIndex + 1;
    setMaxVisited((value) => Math.max(value, nextIndex));
    setStepIndex(nextIndex);
    setServerError("");
    scrollToWizard();
  };

  const goBack = () => {
    if (stepIndex === 0) return;
    setStepIndex(stepIndex - 1);
    setErrors({});
    setServerError("");
    scrollToWizard();
  };

  const submitBooking = async () => {
    const bookingErrors = {
      ...validateBooking(form),
      ...validateContactFormats(form),
    };

    if (Object.keys(bookingErrors).length > 0) {
      const stepId = firstErrorStep(bookingErrors);
      const index = BOOKING_STEPS.findIndex((step) => step.id === stepId);
      if (index >= 0) {
        setStepIndex(index);
        setMaxVisited((value) => Math.max(value, index));
      }
      setServerError(
        `Please correct ${Object.keys(bookingErrors).length} highlighted ${Object.keys(bookingErrors).length === 1 ? "field" : "fields"
        } before submitting.`,
      );
      scrollToWizard();
      return;
    }

    setSubmitting(true);
    setServerError("");

    try {
      const payload = { ...form };
      delete payload.referenceFile;

      const body = new FormData();
      body.append("payload", JSON.stringify(payload));
      if (form.referenceFile) body.append("referenceFile", form.referenceFile);

      const response = await fetch("/api/bookings", {
        method: "POST",
        body,
      });

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok || !data?.ok) {
        if (data?.errors) {
          setErrors(data.errors);
          const stepId = firstErrorStep(data.errors);
          const index = BOOKING_STEPS.findIndex((step) => step.id === stepId);
          if (index >= 0) {
            setStepIndex(index);
            setMaxVisited((value) => Math.max(value, index));
          }
        }
        setServerError(
          data?.message ||
          "We could not submit the request. Check your connection and try again.",
        );
        scrollToWizard();
        return;
      }

      setResult(data);
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setServerError(
        "We could not reach the booking desk. Check your connection and try again.",
      );
      scrollToWizard();
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (submitting) return;

    if (currentStep.id === "review") {
      submitBooking();
    } else {
      goNext();
    }
  };

  const reset = () => {
    setForm(createInitialBooking());
    setStepIndex(0);
    setMaxVisited(0);
    setErrors({});
    setServerError("");
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="mp-page">
      <div className="mp-topline">
        <div className="mp-container mp-topline-inner">
          <span>
            <i aria-hidden="true" /> Hire manpower · booking request desk
          </span>
          <span>Average first response: 3–4 business hours</span>
        </div>
      </div>

      <section className="mp-hero">
        <div className="mp-container mp-hero-inner">
          <div className="mp-hero-main">
            <span className="mp-eyebrow">CrewConnect / Organizer procurement</span>
            <h1>
              Build your event team,
              <br />
              <span>one brief at a time.</span>
            </h1>
            <p>
              Tell us who you are, what you are planning and exactly which roles
              you need. Add different roles, headcounts and schedules for every
              event date. Our staffing desk reviews every request before
              confirming crew.
            </p>
            <div className="mp-trust">
              <span>Verified crew</span>
              <span>On-site supervisors</span>
              <span>Gujarat-wide roster</span>
              <span>Transparent commercials</span>
            </div>
          </div>

          <aside className="mp-desk-card">
            <div className="mp-desk-head">
              <span>Booking desk</span>
              <span className="mp-live">
                <i aria-hidden="true" /> Open
              </span>
            </div>
            <p>
              Need a large crew at short notice? Mark the request urgent and our
              dispatch team will prioritise the brief.
            </p>
            <div className="mp-desk-list">
              <div>
                <b>01</b>
                <span>Submit the brief</span>
              </div>
              <div>
                <b>02</b>
                <span>Desk reviews availability</span>
              </div>
              <div>
                <b>03</b>
                <span>Roster confirmed with you</span>
              </div>
            </div>
            <a href={DESK_PHONE_HREF}>
              <small>Urgent line</small>
              <strong>{DESK_PHONE} ↗</strong>
            </a>
          </aside>
        </div>
      </section>

      {result ? (
        <section className="mp-container mp-success-shell">
          <SuccessPanel result={result} onReset={reset} />
        </section>
      ) : (
        <section className="mp-container mp-wizard" ref={wizardRef}>
          <nav className="mp-stepper" aria-label="Booking request steps">
            {BOOKING_STEPS.map((step, index) => {
              const stepErrors = countStepErrors(errors, step.id);
              return (
                <button
                  key={step.id}
                  type="button"
                  className={`mp-step ${index === stepIndex ? "is-active" : ""} ${index <= maxVisited && index !== stepIndex ? "is-complete" : ""
                    }`.trim()}
                  aria-current={index === stepIndex ? "step" : undefined}
                  disabled={index > maxVisited}
                  onClick={() => goToStep(index)}
                >
                  <span className="mp-step-number">
                    {index < stepIndex ? "✓" : `0${index + 1}`}
                  </span>
                  <span className="mp-step-label">{step.label}</span>
                  {stepErrors > 0 ? (
                    <span className="mp-step-error">{stepErrors}</span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          <div className="mp-progress" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>

          <div className="mp-wizard-grid">
            <form
              className="mp-form-card"
              ref={formRef}
              onSubmit={handleSubmit}
              noValidate
            >
              <header className="mp-step-head">
                <div>
                  <span className="mp-eyebrow">
                    Step 0{stepIndex + 1} / 0{BOOKING_STEPS.length}
                  </span>
                  <h2>{currentStep.title}</h2>
                  <p>{currentStep.blurb}</p>
                </div>
                <span className="mp-step-percent">{progress}% complete</span>
              </header>

              {serverError ? (
                <div className="mp-alert" role="alert">
                  <strong>Please check this request</strong>
                  <span>{serverError}</span>
                </div>
              ) : null}

              {currentStep.id === "contact" ? (
                <div className="mp-grid mp-grid-2">
                  <Field
                    label="Client / company name"
                    error={errors.clientCompanyName}
                  >
                    <input
                      type="text"
                      value={form.clientCompanyName}
                      onChange={(event) =>
                        update("clientCompanyName", event.target.value)
                      }
                      placeholder="e.g. Aarav Events LLP"
                      autoComplete="organization"
                      aria-invalid={Boolean(errors.clientCompanyName)}
                    />
                  </Field>

                  <Field label="Contact person" error={errors.contactPerson}>
                    <input
                      type="text"
                      value={form.contactPerson}
                      maxLength={60}
                      onChange={(event) => {
                        const value = event.target.value;

                        if (/^[A-Za-z ]*$/.test(value)) {
                          update("contactPerson", value);
                        }
                      }}
                      placeholder="Full name"
                      autoComplete="name"
                      aria-invalid={Boolean(errors.contactPerson)}
                    />
                  </Field>

                  <Field label="Mobile number" error={errors.mobileNumber}>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      value={form.mobileNumber}
                      onChange={(event) => {
                        const value = event.target.value;

                        if (/^[0-9]*$/.test(value) && value.length <= 10) {
                          update("mobileNumber", value);
                        }
                      }}
                      placeholder="9876543210"
                      autoComplete="tel-national"
                      aria-invalid={Boolean(errors.mobileNumber)}
                    />
                  </Field>

                  <Field label="WhatsApp number" error={errors.whatsappNumber} required={false}>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      value={form.whatsappNumber}
                      onChange={(event) => {
                        const value = event.target.value;

                        if (/^[0-9]*$/.test(value) && value.length <= 10) {
                          update("whatsappNumber", value);
                        }
                      }}
                      placeholder="9876543210"
                      aria-invalid={Boolean(errors.whatsappNumber)}
                    />
                  </Field>

                  <Field
                    label="Email address"
                    error={errors.emailAddress}
                    required={false}
                    className="mp-span-2"
                  >
                    <input
                      type="email"
                      value={form.emailAddress}
                      maxLength={100}
                      onChange={(event) => {
                        const value = event.target.value;

                        if (!/\s/.test(value)) {
                          update("emailAddress", value);
                        }
                      }}
                      placeholder="you@company.com"
                      autoComplete="email"
                      aria-invalid={Boolean(errors.emailAddress)}
                    />
                  </Field>

                  <Field
                    label="Company type"
                    error={errors.companyType}
                    required={false}
                    className="mp-span-2"
                  >
                    <select
                      value={form.companyType}
                      onChange={(event) =>
                        update("companyType", event.target.value)
                      }
                      aria-invalid={Boolean(errors.companyType)}
                    >
                      <option value="">Select company type…</option>
                      {COMPANY_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              ) : null}

              {currentStep.id === "event" ? (
                <div className="mp-grid mp-grid-2">
                  <Field
                    label="Event name"
                    error={errors.eventName}
                    className="mp-span-2"
                  >
                    <input
                      type="text"
                      value={form.eventName}
                      onChange={(event) =>
                        update("eventName", event.target.value)
                      }
                      placeholder="e.g. Mehta–Shah wedding reception"
                      aria-invalid={Boolean(errors.eventName)}
                    />
                  </Field>

                  <Field label="Event type" error={errors.eventType}>
                    <select
                      value={form.eventType}
                      onChange={(event) =>
                        update("eventType", event.target.value)
                      }
                      aria-invalid={Boolean(errors.eventType)}
                    >
                      <option value="">Select event type…</option>
                      {EVENT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Event city" error={errors.eventCity}>
                    <input
                      type="text"
                      list="mp-city-list"
                      value={form.eventCity}
                      onChange={(event) =>
                        update("eventCity", event.target.value)
                      }
                      placeholder="e.g. Ahmedabad"
                      aria-invalid={Boolean(errors.eventCity)}
                    />
                    <datalist id="mp-city-list">
                      {GUJARAT_CITIES.map((city) => (
                        <option key={city} value={city} />
                      ))}
                    </datalist>
                  </Field>

                  <Field label="State" error={errors.state}>
                    <select
                      value={form.state}
                      onChange={(event) => update("state", event.target.value)}
                      aria-invalid={Boolean(errors.state)}
                    >
                      {INDIAN_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Expected guest count" error={errors.guestCount} required={false}>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={form.guestCount}
                      onChange={(event) =>
                        update("guestCount", event.target.value)
                      }
                      placeholder="e.g. 450"
                      inputMode="numeric"
                      aria-invalid={Boolean(errors.guestCount)}
                    />
                  </Field>

                  <Field
                    label="Event start date"
                    error={errors.eventStartDate}
                  >
                    <input
                      type="date"
                      value={form.eventStartDate}
                      onChange={(event) => {
                        const value = event.target.value;
                        setForm((previous) => ({
                          ...previous,
                          eventStartDate: value,
                          eventEndDate:
                            previous.eventEndDate &&
                              previous.eventEndDate < value
                              ? value
                              : previous.eventEndDate,
                        }));
                        setErrors((previous) => {
                          const next = { ...previous };
                          delete next.eventStartDate;
                          delete next.eventEndDate;
                          return next;
                        });
                      }}
                      aria-invalid={Boolean(errors.eventStartDate)}
                    />
                  </Field>

                  <Field label="Event end date" error={errors.eventEndDate}>
                    <input
                      type="date"
                      value={form.eventEndDate}
                      min={form.eventStartDate || undefined}
                      onChange={(event) =>
                        update("eventEndDate", event.target.value)
                      }
                      aria-invalid={Boolean(errors.eventEndDate)}
                    />
                  </Field>

                  <Field
                    label="Budget per person / per shift"
                    error={errors.budgetPerPerson}
                    required={false}
                    hint="Enter the indicative crew budget for one person on one shift. Final commercials are confirmed by the desk."
                    className="mp-span-2"
                  >
                    <div className="mp-money">
                      <span aria-hidden="true">₹</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={form.budgetPerPerson}
                        onChange={(event) =>
                          update("budgetPerPerson", event.target.value)
                        }
                        placeholder="e.g. 1200"
                        inputMode="decimal"
                        aria-invalid={Boolean(errors.budgetPerPerson)}
                      />
                    </div>
                  </Field>
                </div>
              ) : null}

              {currentStep.id === "logistics" ? (
                <div className="mp-grid mp-grid-2">
                  <Field
                    label="Full venue address"
                    error={errors.venueAddress}
                    className="mp-span-2"
                  >
                    <textarea
                      rows={3}
                      value={form.venueAddress}
                      onChange={(event) =>
                        update("venueAddress", event.target.value)
                      }
                      placeholder="Venue name, hall / lawn, street, area, landmark, city"
                      aria-invalid={Boolean(errors.venueAddress)}
                    />
                  </Field>

                  <Field
                    label="Google Maps location"
                    error={errors.mapsLocation}
                    required={false}
                    hint="Paste a share link from Google Maps so the crew can find the exact gate."
                    className="mp-span-2"
                  >
                    <input
                      type="url"
                      value={form.mapsLocation}
                      onChange={(event) =>
                        update("mapsLocation", event.target.value)
                      }
                      placeholder="https://maps.app.goo.gl/…"
                      aria-invalid={Boolean(errors.mapsLocation)}
                    />
                  </Field>

                  <Field
                    label="Staff reporting time"
                    error={errors.reportingTime}
                  >
                    <input
                      type="time"
                      value={form.reportingTime}
                      onChange={(event) =>
                        update("reportingTime", event.target.value)
                      }
                      aria-invalid={Boolean(errors.reportingTime)}
                    />
                  </Field>

                  <Field label="Duty start time" error={errors.dutyStartTime}>
                    <input
                      type="time"
                      value={form.dutyStartTime}
                      onChange={(event) =>
                        update("dutyStartTime", event.target.value)
                      }
                      aria-invalid={Boolean(errors.dutyStartTime)}
                    />
                  </Field>

                  <Field label="Duty end time" error={errors.dutyEndTime}>
                    <input
                      type="time"
                      value={form.dutyEndTime}
                      onChange={(event) =>
                        update("dutyEndTime", event.target.value)
                      }
                      aria-invalid={Boolean(errors.dutyEndTime)}
                    />
                  </Field>

                  <div className="mp-span-2 mp-provisions">
                    <YesNo
                      label="Food provided"
                      value={form.foodProvided}
                      onChange={(value) => update("foodProvided", value)}
                      error={errors.foodProvided}
                      required={false}
                    />

                    <YesNo
                      label="Transport provided"
                      value={form.transportProvided}
                      onChange={(value) => update("transportProvided", value)}
                      error={errors.transportProvided}
                      required={false}
                    />

                    <YesNo
                      label="Accommodation provided"
                      value={form.accommodationProvided}
                      onChange={(value) => update("accommodationProvided", value)}
                      error={errors.accommodationProvided}
                      required={false}
                    />
                  </div>



                  <Field
                    label="Dress code"
                    error={errors.dressCode}
                    required={false}
                    className="mp-span-2"
                  >
                    <input
                      type="text"
                      value={form.dressCode}
                      onChange={(event) =>
                        update("dressCode", event.target.value)
                      }
                      placeholder="e.g. Black formal trousers, black shoes, event polo provided"
                      aria-invalid={Boolean(errors.dressCode)}
                    />
                  </Field>
                  <LanguagePicker
                    value={form.languageRequirements}
                    onChange={(value) => update("languageRequirements", value)}
                    error={errors.languageRequirements}
                    required={false}
                  />

                  <FileField
                    file={form.referenceFile}
                    error={errors.referenceFile}
                    onChange={(file) => {
                      update("referenceFile", file);
                      const fileError = validateReferenceFile(file);
                      if (fileError) {
                        setErrors((previous) => ({
                          ...previous,
                          referenceFile: fileError,
                        }));
                      }
                    }}
                  />

                  <Field
                    label="Additional notes"
                    error={errors.additionalNotes}
                    required={false}
                    className="mp-span-2"
                  >
                    <textarea
                      rows={4}
                      value={form.additionalNotes}
                      onChange={(event) =>
                        update("additionalNotes", event.target.value)
                      }
                      placeholder="Anything else the staffing desk should know: gates, parking, briefing style, special guests…"
                      aria-invalid={Boolean(errors.additionalNotes)}
                    />
                  </Field>

                  <label
                    className={`mp-urgent ${form.urgent ? "is-active" : ""}`.trim()}
                  >
                    <input
                      type="checkbox"
                      checked={form.urgent}
                      onChange={(event) =>
                        update("urgent", event.target.checked)
                      }
                    />
                    <span className="mp-check" aria-hidden="true">
                      ✓
                    </span>
                    <span>
                      <b>Urgent requirement</b>
                      <small>
                        The event is within 72 hours or the roster must be
                        prioritised. Our dispatch team will be alerted.
                      </small>
                    </span>
                  </label>
                </div>
              ) : null}

              {currentStep.id === "staffing" ? (
                <div className="mp-staffing">
                  <div className="mp-staffing-top">
                    <div>
                      <span className="mp-label">Current request</span>
                      <strong>
                        {roleCount} {roleCount === 1 ? "role" : "roles"} ·{" "}
                        {totalStaff} total staff
                      </strong>
                    </div>
                    <span className="mp-auto-total">
                      Auto-calculated from quantities
                    </span>
                  </div>

                  <div className="mp-quick-roles">
                    <span>Quick add</span>
                    {QUICK_ROLES.map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => addRole({ staffRole: role })}
                      >
                        + {role}
                      </button>
                    ))}
                  </div>

                  {errors.staffingRoles ? (
                    <p className="mp-error" role="alert">
                      {errors.staffingRoles}
                    </p>
                  ) : null}

                  {form.staffingRoles.length === 0 ? (
                    <div className="mp-empty-roles">
                      <span aria-hidden="true">＋</span>
                      <h3>No staff roles added yet</h3>
                      <p>
                        Add a role for each team you need. You can add different
                        roles, quantities and work dates for every event day.
                      </p>
                      <button
                        type="button"
                        className="mp-btn mp-btn-primary"
                        onClick={() => addRole()}
                      >
                        Add staff role
                      </button>
                    </div>
                  ) : null}

                  <div className="mp-role-list">
                    {form.staffingRoles.map((role, index) => {
                      const prefix = `staffingRoles.${index}`;
                      return (
                        <article className="mp-role-card" key={role.id}>
                          <header>
                            <div>
                              <span className="mp-role-number">
                                Role {String(index + 1).padStart(2, "0")}
                              </span>
                              <b>{role.staffRole || "Untitled role"}</b>
                            </div>
                            <div className="mp-role-card-actions">
                              <span className="mp-role-qty">
                                {role.quantity || 0} staff
                              </span>
                              <button
                                type="button"
                                onClick={() => removeRole(index)}
                                aria-label={`Remove role ${index + 1}`}
                              >
                                Remove
                              </button>
                            </div>
                          </header>

                          <div className="mp-grid mp-grid-2">
                            <Field
                              label="Staff role"
                              error={errors[`${prefix}.staffRole`]}
                            >
                              <input
                                type="text"
                                list="mp-role-list"
                                value={role.staffRole}
                                onChange={(event) =>
                                  updateRole(
                                    index,
                                    "staffRole",
                                    event.target.value,
                                  )
                                }
                                placeholder="e.g. Groom Side Assistant"
                                aria-invalid={Boolean(
                                  errors[`${prefix}.staffRole`],
                                )}
                              />
                            </Field>

                            <Field
                              label="Gender preference"
                              error={errors[`${prefix}.genderPreference`]}
                              required={false}
                              hint="Use only where the role genuinely requires it and it is lawful to do so."
                            >
                              <select
                                value={role.genderPreference}
                                onChange={(event) =>
                                  updateRole(
                                    index,
                                    "genderPreference",
                                    event.target.value,
                                  )
                                }
                                aria-invalid={Boolean(
                                  errors[`${prefix}.genderPreference`],
                                )}
                              >
                                {GENDER_PREFERENCES.map((preference) => (
                                  <option key={preference} value={preference}>
                                    {preference}
                                  </option>
                                ))}
                              </select>
                            </Field>

                            <Field
                              label="Quantity required"
                              error={errors[`${prefix}.quantity`]}
                            >
                              <input
                                type="number"
                                min="1"
                                max="500"
                                step="1"
                                value={role.quantity}
                                onChange={(event) =>
                                  updateRole(
                                    index,
                                    "quantity",
                                    event.target.value,
                                  )
                                }
                                placeholder="e.g. 10"
                                inputMode="numeric"
                                aria-invalid={Boolean(
                                  errors[`${prefix}.quantity`],
                                )}
                              />
                            </Field>

                            <Field
                              label="Work date"
                              error={errors[`${prefix}.workDate`]}
                            >
                              <input
                                type="date"
                                value={role.workDate}
                                min={form.eventStartDate || undefined}
                                max={form.eventEndDate || undefined}
                                onChange={(event) =>
                                  updateRole(
                                    index,
                                    "workDate",
                                    event.target.value,
                                  )
                                }
                                aria-invalid={Boolean(
                                  errors[`${prefix}.workDate`],
                                )}
                              />
                            </Field>

                            <Field
                              label="Reporting time"
                              error={errors[`${prefix}.reportingTime`]}
                            >
                              <input
                                type="time"
                                value={role.reportingTime}
                                onChange={(event) =>
                                  updateRole(
                                    index,
                                    "reportingTime",
                                    event.target.value,
                                  )
                                }
                                aria-invalid={Boolean(
                                  errors[`${prefix}.reportingTime`],
                                )}
                              />
                            </Field>

                            <Field
                              label="Shift duration (hours)"
                              error={errors[`${prefix}.shiftDuration`]}
                            >
                              <input
                                type="number"
                                min="0.5"
                                max="24"
                                step="0.5"
                                value={role.shiftDuration}
                                onChange={(event) =>
                                  updateRole(
                                    index,
                                    "shiftDuration",
                                    event.target.value,
                                  )
                                }
                                placeholder="e.g. 8"
                                inputMode="decimal"
                                aria-invalid={Boolean(
                                  errors[`${prefix}.shiftDuration`],
                                )}
                              />
                            </Field>

                            <Field
                              label="Experience requirement"
                              error={
                                errors[`${prefix}.experienceRequirement`]
                              }
                              required={false}
                            >
                              <select
                                value={role.experienceRequirement}
                                onChange={(event) =>
                                  updateRole(
                                    index,
                                    "experienceRequirement",
                                    event.target.value,
                                  )
                                }
                                aria-invalid={Boolean(
                                  errors[`${prefix}.experienceRequirement`],
                                )}
                              >
                                {EXPERIENCE_OPTIONS.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </Field>

                            <Field
                              label="Uniform requirement"
                              error={errors[`${prefix}.uniformRequirement`]}
                              required={false}
                            >
                              <select
                                value={role.uniformRequirement}
                                onChange={(event) =>
                                  updateRole(
                                    index,
                                    "uniformRequirement",
                                    event.target.value,
                                  )
                                }
                                aria-invalid={Boolean(
                                  errors[`${prefix}.uniformRequirement`],
                                )}
                              >
                                {UNIFORM_OPTIONS.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </Field>

                            <Field
                              label="Special instructions (optional)"
                              error={
                                errors[`${prefix}.specialInstructions`]
                              }
                              required={false}
                              className="mp-span-2"
                            >
                              <textarea
                                rows={2}
                                value={role.specialInstructions}
                                onChange={(event) =>
                                  updateRole(
                                    index,
                                    "specialInstructions",
                                    event.target.value,
                                  )
                                }
                                placeholder="e.g. Groom side only, must coordinate with family coordinator, no crowd handling."
                                aria-invalid={Boolean(
                                  errors[`${prefix}.specialInstructions`],
                                )}
                              />
                            </Field>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  <datalist id="mp-role-list">
                    {STAFF_ROLE_SUGGESTIONS.map((role) => (
                      <option key={role} value={role} />
                    ))}
                  </datalist>

                  <button
                    type="button"
                    className="mp-add-role"
                    onClick={() => addRole()}
                  >
                    <span aria-hidden="true">＋</span>
                    <span>
                      <b>Add staff role</b>
                      <small>
                        Add another role, headcount or schedule for this event
                      </small>
                    </span>
                  </button>
                </div>
              ) : null}

              {currentStep.id === "review" ? (
                <div className="mp-review">
                  {errorCount > 0 ? (
                    <div className="mp-alert" role="alert">
                      <strong>
                        {errorCount} {errorCount === 1 ? "field needs" : "fields need"}{" "}
                        attention
                      </strong>
                      <span>
                        Use the edit links below or the step tabs above to fix
                        the highlighted details.
                      </span>
                    </div>
                  ) : null}

                  <ReviewSection
                    title="Client & contact"
                    stepId="contact"
                    onEdit={goToStep}
                  >
                    <div className="mp-review-grid">
                      <ReviewItem
                        label="Client / company"
                        value={form.clientCompanyName}
                      />
                      <ReviewItem
                        label="Contact person"
                        value={form.contactPerson}
                      />
                      <ReviewItem label="Mobile" value={form.mobileNumber} />
                      <ReviewItem
                        label="WhatsApp"
                        value={form.whatsappNumber}
                      />
                      <ReviewItem
                        label="Email"
                        value={form.emailAddress}
                      />
                      <ReviewItem
                        label="Company type"
                        value={form.companyType}
                      />
                    </div>
                  </ReviewSection>

                  <ReviewSection
                    title="Event & schedule"
                    stepId="event"
                    onEdit={goToStep}
                  >
                    <div className="mp-review-grid">
                      <ReviewItem
                        label="Event"
                        value={form.eventName}
                        wide
                      />
                      <ReviewItem label="Event type" value={form.eventType} />
                      <ReviewItem
                        label="City / state"
                        value={`${form.eventCity}, ${form.state}`}
                      />
                      <ReviewItem
                        label="Event dates"
                        value={`${formatDate(form.eventStartDate)} – ${formatDate(
                          form.eventEndDate,
                        )}`}
                      />
                      <ReviewItem
                        label="Guest count"
                        value={form.guestCount}
                      />
                      <ReviewItem
                        label="Budget / person / shift"
                        value={formatCurrency(form.budgetPerPerson)}
                      />
                    </div>
                  </ReviewSection>

                  <ReviewSection
                    title="Venue & provisions"
                    stepId="logistics"
                    onEdit={goToStep}
                  >
                    <div className="mp-review-grid">
                      <ReviewItem
                        label="Venue address"
                        value={form.venueAddress}
                        wide
                      />
                      <ReviewItem
                        label="Maps link"
                        value={
                          form.mapsLocation ? (
                            <a
                              href={form.mapsLocation}
                              target="_blank"
                              rel="noreferrer noopener"
                            >
                              Open location ↗
                            </a>
                          ) : (
                            "Not provided"
                          )
                        }
                        wide
                      />
                      <ReviewItem
                        label="Reporting time"
                        value={formatTime(form.reportingTime)}
                      />
                      <ReviewItem
                        label="Duty hours"
                        value={`${formatTime(form.dutyStartTime)} – ${formatTime(
                          form.dutyEndTime,
                        )}`}
                      />
                      <ReviewItem
                        label="Food"
                        value={
                          form.foodProvided === "yes" ? "Provided" : "Not provided"
                        }
                      />
                      <ReviewItem
                        label="Transport"
                        value={
                          form.transportProvided === "yes"
                            ? "Provided"
                            : "Not provided"
                        }
                      />
                      <ReviewItem
                        label="Accommodation"
                        value={
                          form.accommodationProvided === "yes"
                            ? "Provided"
                            : "Not provided"
                        }
                      />
                      <ReviewItem label="Dress code" value={form.dressCode} />
                      <ReviewItem
                        label="Languages"
                        value={form.languageRequirements.join(", ")}
                      />
                      <ReviewItem
                        label="Reference file"
                        value={
                          form.referenceFile
                            ? `${form.referenceFile.name} · ${formatFileSize(
                              form.referenceFile.size,
                            )}`
                            : "Not attached"
                        }
                      />
                      <ReviewItem
                        label="Additional notes"
                        value={form.additionalNotes || "None"}
                        wide
                      />
                      <ReviewItem
                        label="Priority"
                        value={
                          form.urgent ? "Urgent requirement" : "Standard"
                        }
                      />
                    </div>
                  </ReviewSection>

                  <ReviewSection
                    title={`Staffing plan · ${totalStaff} total staff`}
                    stepId="staffing"
                    onEdit={goToStep}
                  >
                    <div className="mp-table-wrap">
                      <table className="mp-review-table">
                        <thead>
                          <tr>
                            <th>Role</th>
                            <th>Pref.</th>
                            <th>Qty</th>
                            <th>Work date</th>
                            <th>Report / shift</th>
                            <th>Experience</th>
                            <th>Uniform</th>
                          </tr>
                        </thead>
                        <tbody>
                          {form.staffingRoles.map((role) => (
                            <tr key={role.id}>
                              <td>
                                <b>{role.staffRole || "Untitled role"}</b>
                                {role.specialInstructions ? (
                                  <small>{role.specialInstructions}</small>
                                ) : null}
                              </td>
                              <td>{role.genderPreference}</td>
                              <td>{role.quantity}</td>
                              <td>{formatDate(role.workDate)}</td>
                              <td>
                                {formatTime(role.reportingTime)}
                                <small>{role.shiftDuration}h shift</small>
                              </td>
                              <td>{role.experienceRequirement}</td>
                              <td>{role.uniformRequirement}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan={2}>Total requested staff</td>
                            <td colSpan={5}>{totalStaff}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </ReviewSection>

                  {form.urgent ? (
                    <div className="mp-urgent-banner">
                      <span aria-hidden="true">!</span>
                      <div>
                        <b>Urgent requirement</b>
                        <small>
                          This request will be flagged to the dispatch team for
                          priority review.
                        </small>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <footer className="mp-actions">
                <button
                  type="button"
                  className="mp-btn mp-btn-back"
                  onClick={goBack}
                  disabled={stepIndex === 0 || submitting}
                >
                  ← Back
                </button>

                {currentStep.id === "review" ? (
                  <button
                    type="submit"
                    className="mp-btn mp-btn-primary mp-submit"
                    disabled={submitting}
                  >
                    {submitting ? "Submitting request…" : "Submit booking request"}
                    <span aria-hidden="true">→</span>
                  </button>
                ) : (
                  <button type="submit" className="mp-btn mp-btn-primary">
                    Continue
                    <span aria-hidden="true">→</span>
                  </button>
                )}
              </footer>
            </form>

            <aside className="mp-side">
              <div className="mp-side-card mp-live-card">
                <div className="mp-side-head">
                  <span>Live brief</span>
                  <span>{progress}%</span>
                </div>
                <h3>{form.eventName || "Your upcoming event"}</h3>
                <p>
                  {form.eventCity
                    ? `${form.eventCity}${form.state ? `, ${form.state}` : ""}`
                    : "Event city not set yet"}
                </p>
                <div className="mp-live-dates">
                  <span>{formatDate(form.eventStartDate)}</span>
                  <i aria-hidden="true">→</i>
                  <span>{formatDate(form.eventEndDate)}</span>
                </div>
                <div className="mp-side-totals">
                  <div>
                    <span>Total staff</span>
                    <strong>{totalStaff}</strong>
                  </div>
                  <div>
                    <span>Roles</span>
                    <strong>{roleCount}</strong>
                  </div>
                </div>
                <div className="mp-side-flags">
                  <span className={form.urgent ? "is-on" : ""}>
                    {form.urgent ? "Urgent" : "Standard"}
                  </span>
                  <span>{form.eventType || "Event type pending"}</span>
                </div>
              </div>

              <div className="mp-side-card mp-side-note">
                <span className="mp-eyebrow">What happens next</span>
                <ol>
                  <li>
                    <b>01</b> Request saved with a unique booking ID.
                  </li>
                  <li>
                    <b>02</b> Desk reviews crew availability and commercials.
                  </li>
                  <li>
                    <b>03</b> You receive confirmation and a final roster plan.
                  </li>
                </ol>
                <a href={DESK_PHONE_HREF}>
                  Need help now? <strong>{DESK_PHONE} ↗</strong>
                </a>
              </div>

              <div className="mp-side-card mp-side-status">
                <span className="mp-eyebrow">Already booked?</span>
                <p>Track an existing request with your booking ID.</p>
                <Link href="/hire-manpower/track">
                  Open request tracking <span aria-hidden="true">→</span>
                </Link>
              </div>
            </aside>
          </div>
        </section>
      )}
    </main>
  );
}
