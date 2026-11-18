"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { UserRound } from "lucide-react";
import {
  DOCUMENT_TYPES,
  EXPERIENCE_LEVELS,
  MAX_SUPPORTING_DOCUMENTS,
  MINIMUM_AGE,
  SHIFT_TYPES,
  STAFF_CITIES,
  STAFF_LANGUAGES,
  STAFF_SKILLS,
  STAFF_STEPS,
  calculateAge,
  createInitialRegistration,
  formatDate,
  formatFileSize,
  formatPhoneNumber,
  getInitials,
  normalizePhoneNumber,
} from "@/lib/staff/config";
import {
  validateProfilePhoto,
  validateRegistration,
  validateSupportingDocument,
} from "@/lib/staff/validation";

const STEP_ERROR_KEYS = {
  personal: [
    "fullName",
    "mobileNumber",
    "emailAddress",
    "dateOfBirth",
    "currentCity",
    "areaPincode",
    "languages",
    "profilePhoto",
  ],
  skills: ["skills", "otherSkill"],
  experience: [
    "experienceLevel",
    "yearsOfExperience",
    "expectedPayment",
    "resume",
  ],
  availability: [
    "preferredCities",
    "availableFrom",
    "availableUntil",
    "shiftTypes",
    "willingToTravel",
    "transportAvailable",
  ],
  verification: [
    "supportingDocuments",
    "documentsConsent",
    "ageConfirmed",
    "privacyConsent",
    "termsConsent",
  ],
};

const NAME_PATTERN = /^\p{L}+(?:\s+\p{L}+)*$/u;
const PHONE_PATTERN = /^[6-9]\d{9}$/;
const EMAIL_PATTERN =
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const PINCODE_PATTERN = /^\d{6}$/;

function validatePersonalFormats(form) {
  const errors = {};

  const name = form.fullName.trim();
  const phone = form.mobileNumber.trim();
  const email = form.emailAddress.trim();
  const pincode = form.areaPincode.trim();

  if (name && !NAME_PATTERN.test(name)) {
    errors.fullName = "Enter a valid name using letters and spaces only.";
  }

  if (phone && !PHONE_PATTERN.test(phone)) {
    errors.mobileNumber =
      "Enter a valid 10-digit Indian mobile number starting with 6–9.";
  }

  if (email && !EMAIL_PATTERN.test(email)) {
    errors.emailAddress = "Enter a valid email address.";
  }

  if (pincode && !PINCODE_PATTERN.test(pincode)) {
    errors.areaPincode = "Enter a valid 6-digit pincode.";
  }

  return errors;
}

function FieldError({ error }) {
  if (!error) return null;
  return (
    <small className="mp-error" role="alert">
      {error}
    </small>
  );
}

function Field({ label, required, hint, error, className = "", children }) {
  return (
    <label className={`mp-field ${className}`.trim()}>
      <span className="mp-label">
        {label}
        {required ? <em>*</em> : null}
      </span>
      {children}
      {hint && !error ? <small className="mp-hint">{hint}</small> : null}
      <FieldError error={error} />
    </label>
  );
}

function ChoiceChips({
  label,
  options,
  selected,
  onToggle,
  error,
  hint,
  className = "mp-span-2",
}) {
  return (
    <fieldset className={`mp-field mp-fieldset ${className}`.trim()}>
      <legend className="mp-label">
        {label}
        <em>*</em>
      </legend>
      <div className="mp-chips">
        {options.map((option) => (
          <button
            type="button"
            key={option}
            className={selected.includes(option) ? "is-active" : ""}
            aria-pressed={selected.includes(option)}
            onClick={() => onToggle(option)}
          >
            {option}
          </button>
        ))}
      </div>
      {hint && !error ? <small className="mp-hint">{hint}</small> : null}
      <FieldError error={error} />
    </fieldset>
  );
}

function YesNo({ label, value, onChange, error }) {
  return (
    <fieldset className="mp-field mp-fieldset" aria-invalid={Boolean(error)}>
      <legend className="mp-label">
        {label}
        <em>*</em>
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
      <FieldError error={error} />
    </fieldset>
  );
}

function PhotoPreview({ previewUrl, name }) {
  return (
    <div className="join-photo-thumb">
      {previewUrl ? (
        <img src={previewUrl} alt="Profile photo preview" />
      ) : (
        <UserRound size={42} strokeWidth={1.5} aria-hidden="true" />
      )}
    </div>
  );
}

function UploadBox({
  id,
  label,
  hint,
  accept,
  file,
  onChange,
  error,
  required,
}) {
  return (
    <div className="mp-field mp-span-2">
      <span className="mp-label">
        {label}
        {required ? <em>*</em> : null}
      </span>
      <label className={`mp-file ${file ? "has-file" : ""}`.trim()}>
        <input
          id={id}
          type="file"
          accept={accept}
          onChange={onChange}
          aria-invalid={Boolean(error)}
        />
        <span className="mp-file-icon" aria-hidden="true">
          {file ? "✓" : "↑"}
        </span>
        <span className="mp-file-copy">
          <b>{file ? file.name : hint}</b>
          <small>
            {file
              ? `${formatFileSize(file.size)} · choose another file to replace`
              : "PDF, DOC or DOCX · max 5 MB"}
          </small>
        </span>
      </label>
      <FieldError error={error} />
    </div>
  );
}

function Consent({ checked, onChange, title, error, children }) {
  return (
    <label
      className={`join-consent mp-span-2 ${checked ? "is-active" : ""}`.trim()}
    >
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="mp-check" aria-hidden="true">
        ✓
      </span>
      <span className="join-consent-copy">
        <b>{title}</b>
        <small>{children}</small>
        <FieldError error={error} />
      </span>
    </label>
  );
}

function ReviewItem({ label, value, wide }) {
  return (
    <div className={`mp-review-item ${wide ? "mp-span-2" : ""}`.trim()}>
      <span>{label}</span>
      <b>{value || "—"}</b>
    </div>
  );
}

function ReviewBlock({ title, stepId, onEdit, children }) {
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
      <div className="mp-review-grid">{children}</div>
    </section>
  );
}

function SuccessScreen({ result, onReset }) {
  const [copied, setCopied] = useState(false);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(result.registration.id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="mp-container mp-success-shell" id="registration">
      <div className="mp-success">
        <div className="mp-success-mark" aria-hidden="true">
          ✓
        </div>
        <span className="mp-eyebrow">Registration received</span>
        <h1>Your crew profile is in review.</h1>
        <p className="mp-success-lede">
          Thanks, <strong>{result.registration.fullName}</strong>. Our candidate
          desk will verify your details and contact you on WhatsApp or email if
          your profile is shortlisted.
        </p>

        <div className="mp-ticket">
          <div>
            <span>Staff Registration ID</span>
            <strong>{result.registration.id}</strong>
          </div>
          <button type="button" onClick={copyId}>
            {copied ? "Copied" : "Copy ID"}
          </button>
        </div>

        <dl className="mp-success-facts">
          <div>
            <dt>Status</dt>
            <dd>
              <span className="mp-status is-new">
                {result.registration.statusLabel || "Pending review"}
              </span>
            </dd>
          </div>
          <div>
            <dt>Submitted</dt>
            <dd>{formatDate(result.registration.createdAt?.slice(0, 10))}</dd>
          </div>
          <div>
            <dt>WhatsApp</dt>
            <dd>{formatPhoneNumber(result.registration.mobileNumber)}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{result.registration.emailAddress}</dd>
          </div>
        </dl>

        <div className="join-next-steps">
          <h3>What happens next</h3>
          <ol>
            <li>
              <b>01</b>
              <span>
                <strong>Document check</strong> — the verification desk reviews
                your profile and any documents you chose to share.
              </span>
            </li>
            <li>
              <b>02</b>
              <span>
                <strong>Shortlisting call</strong> — if your skills and
                availability match current briefs, the desk will contact you on
                WhatsApp.
              </span>
            </li>
            <li>
              <b>03</b>
              <span>
                <strong>Shift briefing</strong> — approved crew receive role
                details, reporting time and payment terms before every shift.
              </span>
            </li>
          </ol>
        </div>

        <p className="mp-delivery-note">
          Keep <strong>{result.registration.id}</strong> safe. You will need it
          when speaking to the candidate desk. Registration does not guarantee
          immediate shift allocation.
        </p>

        <div className="mp-success-actions">
          <button
            type="button"
            className="mp-btn mp-btn-primary"
            onClick={onReset}
          >
            Register another profile <span aria-hidden="true">→</span>
          </button>
          <a
            className="mp-btn mp-btn-ghost"
            href="https://wa.me/919510572460"
            target="_blank"
            rel="noreferrer"
          >
            Message candidate desk
          </a>
        </div>
      </div>
    </section>
  );
}

export default function StaffRegistrationWizard() {
  const [form, setForm] = useState(createInitialRegistration);
  const [stepIndex, setStepIndex] = useState(0);
  const [maxVisited, setMaxVisited] = useState(0);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [documentType, setDocumentType] = useState(DOCUMENT_TYPES[0]);
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [otp, setOtp] = useState({
    code: "",
    status: "idle",
    message: "",
    devCode: "",
    sending: false,
    verifying: false,
  });
  const fileInputRef = useRef(null);

  const currentStep = STAFF_STEPS[stepIndex];
  const age = useMemo(() => calculateAge(form.dateOfBirth), [form.dateOfBirth]);

  useEffect(() => {
    if (!form.profilePhoto) {
      setPreviewUrl("");
      return undefined;
    }

    const url = URL.createObjectURL(form.profilePhoto);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [form.profilePhoto]);

  const update = (key, value) => {
    setForm((previous) => {
      const next = { ...previous, [key]: value };

      if (key === "mobileNumber") {
        const nextPhone = normalizePhoneNumber(value);
        if (!nextPhone || nextPhone !== verifiedPhone) {
          next.whatsappVerified = false;
          next.whatsappVerificationToken = "";
        }
      }

      if (key === "skills" && !value.includes("Other")) {
        next.otherSkill = "";
      }

      return next;
    });

    setErrors((previous) => {
      if (!previous[key]) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });

    if (key === "mobileNumber") {
      const nextPhone = normalizePhoneNumber(value);
      if (!nextPhone || nextPhone !== verifiedPhone) {
        setOtp({
          code: "",
          status: "idle",
          message: "",
          devCode: "",
          sending: false,
          verifying: false,
        });
      }
    }
  };

  const toggle = (key, value) => {
    setForm((previous) => {
      const list = previous[key];
      const nextList = list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value];
      const next = { ...previous, [key]: nextList };
      if (key === "skills" && !nextList.includes("Other")) {
        next.otherSkill = "";
      }
      return next;
    });

    setErrors((previous) => {
      if (!previous[key] && !(key === "skills" && previous.otherSkill)) {
        return previous;
      }
      const next = { ...previous };
      delete next[key];
      if (key === "skills") delete next.otherSkill;
      return next;
    });
  };

  const goToStep = (target) => {
    const index =
      typeof target === "number"
        ? target
        : STAFF_STEPS.findIndex((step) => step.id === target);
    if (index < 0) return;
    setStepIndex(index);
    setErrors({});
    setServerError("");
    if (typeof window !== "undefined") {
      document
        .getElementById("registration")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const stepErrorsFor = (stepId) => {
    const all = {
      ...validateRegistration(form),
      ...validatePersonalFormats(form),
    };

    const next = {};

    for (const key of STEP_ERROR_KEYS[stepId] || []) {
      if (all[key]) next[key] = all[key];
    }

    return next;
  };

  const nextStep = () => {
    const stepErrors = stepErrorsFor(currentStep.id);

    if (Object.keys(stepErrors).length > 0) {
      setErrors((previous) => {
        const next = { ...previous };
        for (const key of STEP_ERROR_KEYS[currentStep.id] || []) {
          delete next[key];
        }
        return { ...next, ...stepErrors };
      });
      setServerError("Please complete the highlighted fields to continue.");
      return;
    }

    const nextIndex = Math.min(stepIndex + 1, STAFF_STEPS.length - 1);
    setStepIndex(nextIndex);
    setMaxVisited((previous) => Math.max(previous, nextIndex));
    setErrors({});
    setServerError("");
  };

  const previousStep = () => {
    setStepIndex((index) => Math.max(0, index - 1));
    setErrors({});
    setServerError("");
  };

  const sendOtp = async () => {
    const phone = normalizePhoneNumber(form.mobileNumber);
    if (!phone) {
      setErrors((previous) => ({
        ...previous,
        mobileNumber:
          "Enter a valid 10-digit Indian mobile number starting with 6–9.",
      }));
      return;
    }

    setOtp((previous) => ({
      ...previous,
      sending: true,
      status: "sending",
      message: "",
      devCode: "",
    }));

    try {
      const response = await fetch("/api/staff/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber: phone }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok) {
        setOtp({
          code: "",
          status: "error",
          message:
            data?.message ||
            "We could not send the WhatsApp code. Please try again.",
          devCode: "",
          sending: false,
          verifying: false,
        });
        return;
      }

      setOtp({
        code: "",
        status: "sent",
        message:
          data.channel === "whatsapp"
            ? `Code sent to ${formatPhoneNumber(phone)} on WhatsApp. It expires in 10 minutes.`
            : "WhatsApp is not configured on this environment, so a local test code is shown below.",
        devCode: data.devCode || "",
        sending: false,
        verifying: false,
      });
      setErrors((previous) => {
        const next = { ...previous };
        delete next.mobileNumber;
        return next;
      });
    } catch {
      setOtp({
        code: "",
        status: "error",
        message: "We could not reach the verification service.",
        devCode: "",
        sending: false,
        verifying: false,
      });
    }
  };

  const verifyOtp = async () => {
    const phone = normalizePhoneNumber(form.mobileNumber);
    if (!phone) {
      setErrors((previous) => ({
        ...previous,
        mobileNumber: "Enter a valid mobile number first.",
      }));
      return;
    }

    if (!/^\d{6}$/.test(otp.code)) {
      setOtp((previous) => ({
        ...previous,
        status: "error",
        message: "Enter the 6-digit code from WhatsApp.",
      }));
      return;
    }

    setOtp((previous) => ({
      ...previous,
      verifying: true,
      status: "verifying",
      message: "",
    }));

    try {
      const response = await fetch("/api/staff/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber: phone, code: otp.code }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok) {
        setOtp((previous) => ({
          ...previous,
          verifying: false,
          status: "error",
          message: data?.message || "That code could not be verified.",
        }));
        return;
      }

      setForm((previous) => ({
        ...previous,
        whatsappVerified: true,
        whatsappVerificationToken: data.verificationToken,
      }));
      setVerifiedPhone(phone);
      setOtp((previous) => ({
        ...previous,
        verifying: false,
        status: "verified",
        message: "WhatsApp number verified. You are good to continue.",
        devCode: "",
      }));
      setErrors((previous) => {
        const next = { ...previous };
        delete next.mobileNumber;
        return next;
      });
    } catch {
      setOtp((previous) => ({
        ...previous,
        verifying: false,
        status: "error",
        message: "We could not reach the verification service.",
      }));
    }
  };

  const onPhotoChange = (event) => {
    const file = event.target.files?.[0] || null;
    const photoError = file ? validateProfilePhoto(file) : "";
    if (photoError) {
      setErrors((previous) => ({ ...previous, profilePhoto: photoError }));
      event.target.value = "";
      return;
    }
    update("profilePhoto", file);
    event.target.value = "";
  };

  const onResumeChange = (event) => {
    update("resume", event.target.files?.[0] || null);
    event.target.value = "";
  };

  const addSupportingDocument = (event) => {
    const file = event.target.files?.[0] || null;
    event.target.value = "";
    if (!file) return;

    if (form.supportingDocuments.length >= MAX_SUPPORTING_DOCUMENTS) {
      setErrors((previous) => ({
        ...previous,
        supportingDocuments: `Attach up to ${MAX_SUPPORTING_DOCUMENTS} documents.`,
      }));
      return;
    }

    const documentError = validateSupportingDocument(file);
    if (documentError) {
      setErrors((previous) => ({
        ...previous,
        supportingDocuments: documentError,
      }));
      return;
    }

    setForm((previous) => ({
      ...previous,
      supportingDocuments: [...previous.supportingDocuments, file],
      supportingDocumentTypes: [
        ...(previous.supportingDocumentTypes || []),
        documentType,
      ],
    }));
    setErrors((previous) => {
      const next = { ...previous };
      delete next.supportingDocuments;
      return next;
    });
  };

  const removeSupportingDocument = (index) => {
    setForm((previous) => ({
      ...previous,
      supportingDocuments: previous.supportingDocuments.filter(
        (_file, fileIndex) => fileIndex !== index,
      ),
      supportingDocumentTypes: (
        previous.supportingDocumentTypes || []
      ).filter((_type, typeIndex) => typeIndex !== index),
    }));
  };

  const submitRegistration = async (event) => {
    event.preventDefault();
    setServerError("");

    if (stepIndex < STAFF_STEPS.length - 1) {
      nextStep();
      return;
    }

    const allErrors = {
      ...validateRegistration(form),
      ...validatePersonalFormats(form),
    };

    if (!form.profilePhoto) {
      setErrors({ profilePhoto: "Add a clear profile photo." });
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...form,
        profilePhoto: form.profilePhoto
          ? {
            name: form.profilePhoto.name,
            type: form.profilePhoto.type,
            size: form.profilePhoto.size,
          }
          : null,
        resume: form.resume
          ? {
            name: form.resume.name,
            type: form.resume.type,
            size: form.resume.size,
          }
          : null,
        supportingDocuments: form.supportingDocuments.map((file) => ({
          name: file.name,
          type: file.type,
          size: file.size,
        })),
        supportingDocumentTypes: form.supportingDocuments.map(
          (_file, index) => form.supportingDocumentTypes?.[index] || documentType,
        ),
      };

      const formData = new FormData();
      formData.append("payload", JSON.stringify(payload));

      if (form.profilePhoto) {
        formData.append("profilePhoto", form.profilePhoto);
      }
      if (form.resume) {
        formData.append("resume", form.resume);
      }
      form.supportingDocuments.forEach((file) => {
        formData.append("supportingDocuments", file);
      });

      const response = await fetch("/api/staff-registrations", {
        method: "POST",
        body: formData,
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok) {
        if (data?.errors) {
          setErrors(data.errors);
          const firstStep = STAFF_STEPS.findIndex((step) =>
            (STEP_ERROR_KEYS[step.id] || []).some((key) => data.errors[key]),
          );
          if (firstStep >= 0) setStepIndex(firstStep);
        }
        setServerError(
          data?.message ||
          "We could not submit your registration. Please try again.",
        );
        return;
      }

      setResult(data);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch {
      setServerError(
        "We could not reach the candidate desk. Check your connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <SuccessScreen
        result={result}
        onReset={() => {
          setForm(createInitialRegistration());
          setStepIndex(0);
          setMaxVisited(0);
          setErrors({});
          setServerError("");
          setResult(null);
          setVerifiedPhone("");
          setOtp({
            code: "",
            status: "idle",
            message: "",
            devCode: "",
            sending: false,
            verifying: false,
          });
        }}
      />
    );
  }

  const progress = Math.round(((stepIndex + 1) / STAFF_STEPS.length) * 100);
  const isLastStep = stepIndex === STAFF_STEPS.length - 1;

  return (
    <section className="mp-container mp-wizard" id="registration">
      <nav className="mp-stepper" aria-label="Registration stages">
        {STAFF_STEPS.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={`mp-step ${index === stepIndex ? "is-active" : ""} ${index <= maxVisited && index !== stepIndex ? "is-complete" : ""
              }`.trim()}
            aria-current={index === stepIndex ? "step" : undefined}
            disabled={index > maxVisited}
            onClick={() => index <= maxVisited && goToStep(index)}
          >
            <span className="mp-step-number">
              {index < stepIndex ? "✓" : `0${index + 1}`}
            </span>
            <span className="mp-step-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mp-progress" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="mp-wizard-grid">
        <form
          className="mp-form-card"
          onSubmit={submitRegistration}
          noValidate
        >
          <header className="mp-step-head">
            <div>
              <span className="mp-eyebrow">
                Stage 0{stepIndex + 1} / 0{STAFF_STEPS.length}
              </span>
              <h2>{currentStep.title}</h2>
              <p>{currentStep.blurb}</p>
            </div>
            <span className="mp-step-percent">{progress}% complete</span>
          </header>

          {serverError ? (
            <div className="mp-alert" role="alert">
              <strong>Please check this profile</strong>
              <span>{serverError}</span>
            </div>
          ) : null}

          {currentStep.id === "personal" ? (
            <div className="mp-grid mp-grid-2">
              <Field
                label="Full name (as per ID)"
                required
                error={errors.fullName}
                className="mp-span-2"
              >
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(event) => {
                    const value = event.target.value.replace(/[^\p{L}\s]/gu, "");
                    update("fullName", value);
                  }}
                  maxLength={80} placeholder="e.g. Aarav Jayeshbhai Patel"
                  autoComplete="name"
                  aria-invalid={Boolean(errors.fullName)}
                />
              </Field>

              <Field
                label="Date of birth"
                required
                hint={
                  age !== null
                    ? `Age ${age}. Applicants must be ${MINIMUM_AGE}+.`
                    : `Applicants must be at least ${MINIMUM_AGE} years old.`
                }
                error={errors.dateOfBirth}
              >
                <input
                  type="date"
                  value={form.dateOfBirth}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(event) =>
                    update("dateOfBirth", event.target.value)
                  }
                  aria-invalid={Boolean(errors.dateOfBirth)}
                />
              </Field>

              <Field
                label="Email address"
                required
                error={errors.emailAddress}
              >
                <input
                  type="email"
                  value={form.emailAddress}
                  onChange={(event) => {
                    update(
                      "emailAddress",
                      event.target.value.replace(/\s/g, "").slice(0, 100)
                    );
                  }}
                  maxLength={100}
                  autoComplete="email"
                  placeholder="you@example.com"
                  aria-invalid={Boolean(errors.emailAddress)}
                />
              </Field>

              <div className="mp-field mp-span-2">
                <span className="mp-label">
                  WhatsApp / mobile number<em>*</em>
                </span>
                <div className="join-otp-row">
                  <div className="join-phone">
                    <b aria-hidden="true">+91</b>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      value={form.mobileNumber}
                      onChange={(event) => {
                        const value = event.target.value.replace(/\D/g, "").slice(0, 10);
                        update("mobileNumber", value);
                      }}
                      placeholder="98765 43210"
                      autoComplete="tel-national"
                      aria-label="WhatsApp mobile number"
                      aria-invalid={Boolean(errors.mobileNumber)}
                    />
                  </div>
                  <button
                    type="button"
                    className="mp-btn mp-btn-ghost"
                    onClick={sendOtp}
                    disabled={otp.sending || form.whatsappVerified}
                  >
                    {otp.sending
                      ? "Sending…"
                      : form.whatsappVerified
                        ? "Verified ✓"
                        : otp.status === "sent"
                          ? "Resend code"
                          : "Send code"}
                  </button>
                </div>
                {otp.status === "sent" || otp.status === "error" ? (
                  <div className="join-otp-row">
                    <div className="join-phone">
                      <b aria-hidden="true">#</b>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otp.code}
                        onChange={(event) =>
                          setOtp((previous) => ({
                            ...previous,
                            code: event.target.value
                              .replace(/\D/g, "")
                              .slice(0, 6),
                          }))
                        }
                        placeholder="6-digit code"
                        aria-label="WhatsApp verification code"
                      />
                    </div>
                    <button
                      type="button"
                      className="mp-btn mp-btn-primary"
                      onClick={verifyOtp}
                      disabled={otp.verifying}
                    >
                      {otp.verifying ? "Checking…" : "Verify"}
                    </button>
                  </div>
                ) : null}
                {otp.status === "sent" && otp.devCode ? (
                  <div className="join-dev-code">
                    <span>Local test mode · WhatsApp not configured</span>
                    <b>{otp.devCode}</b>
                    <button
                      type="button"
                      onClick={() =>
                        setOtp((previous) => ({
                          ...previous,
                          code: previous.devCode,
                        }))
                      }
                    >
                      Use code
                    </button>
                  </div>
                ) : null}
                {otp.message ? (
                  <small
                    className={`join-otp-message ${otp.status === "error"
                      ? "is-error"
                      : otp.status === "verified"
                        ? "is-success"
                        : ""
                      }`}
                  >
                    {otp.message}
                  </small>
                ) : (
                  <small className="mp-hint">
                    We send a one-time code on WhatsApp to confirm this number.
                  </small>
                )}
                <FieldError error={errors.mobileNumber} />
              </div>

              <Field label="Current city" required error={errors.currentCity}>
                <input
                  type="text"
                  list="staff-city-options"
                  value={form.currentCity}
                  onChange={(event) =>
                    update("currentCity", event.target.value)
                  }
                  placeholder="e.g. Ahmedabad"
                  aria-invalid={Boolean(errors.currentCity)}
                />
                <datalist id="staff-city-options">
                  {STAFF_CITIES.map((city) => (
                    <option value={city} key={city} />
                  ))}
                </datalist>
              </Field>

              <Field
                label="Area / pincode"
                required
                error={errors.areaPincode}
              >
                <input
                  type="text"
                  value={form.areaPincode}
                  onChange={(event) => {
                    const value = event.target.value.replace(/\D/g, "").slice(0, 6);
                    update("areaPincode", value);
                  }}
                  placeholder="e.g. 380015"
                  inputMode="numeric"
                  maxLength={6}
                  aria-invalid={Boolean(errors.areaPincode)}
                />
              </Field>

              <ChoiceChips
                label="Languages spoken"
                options={STAFF_LANGUAGES}
                selected={form.languages}
                onToggle={(value) => toggle("languages", value)}
                error={errors.languages}
                hint="Select every language you can comfortably work in."
              />

              <div className="mp-field mp-span-2">
                <span className="mp-label">
                  Profile photo<em>*</em>
                </span>
                <div className="join-photo-row">
                  <PhotoPreview previewUrl={previewUrl} name={form.fullName} />
                  <div className="join-photo-copy">
                    <label className="mp-btn mp-btn-ghost join-photo-button">
                      {form.profilePhoto ? "Replace photo" : "Choose photo"}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                        onChange={onPhotoChange}
                        aria-label="Upload profile photo"
                      />
                    </label>
                    <small>
                      A clear, recent headshot. JPG, PNG or WEBP, max 5 MB. It is
                      stored privately for verification only.
                    </small>
                  </div>
                </div>
                <FieldError error={errors.profilePhoto} />
              </div>
            </div>
          ) : null}

          {currentStep.id === "skills" ? (
            <div className="mp-grid mp-grid-2">
              <ChoiceChips
                label="Work categories"
                options={STAFF_SKILLS}
                selected={form.skills}
                onToggle={(value) => toggle("skills", value)}
                error={errors.skills}
                hint="Select all roles you can credibly handle. You can be considered for more than one."
              />
              {form.skills.includes("Other") ? (
                <Field
                  label="Describe the other category"
                  required
                  error={errors.otherSkill}
                  className="mp-span-2"
                >
                  <input
                    type="text"
                    value={form.otherSkill}
                    onChange={(event) =>
                      update("otherSkill", event.target.value)
                    }
                    placeholder="e.g. Laptop operator, backstage coordination, ushering lead"
                    aria-invalid={Boolean(errors.otherSkill)}
                  />
                </Field>
              ) : null}
              <p className="join-note mp-span-2">
                Skills are reviewed by the candidate desk before any shift is
                offered. Select only work you can perform safely and
                professionally.
              </p>
            </div>
          ) : null}

          {currentStep.id === "experience" ? (
            <div className="mp-grid mp-grid-2">
              <fieldset className="mp-field mp-fieldset mp-span-2">
                <legend className="mp-label">
                  Experience level<em>*</em>
                </legend>
                <div className="mp-segmented">
                  {EXPERIENCE_LEVELS.map((level) => (
                    <button
                      key={level}
                      type="button"
                      className={
                        form.experienceLevel === level ? "is-active" : ""
                      }
                      aria-pressed={form.experienceLevel === level}
                      onClick={() => update("experienceLevel", level)}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <FieldError error={errors.experienceLevel} />
              </fieldset>

              {form.experienceLevel === "Experienced" ? (
                <Field
                  label="Years of experience"
                  required
                  error={errors.yearsOfExperience}
                  hint="Event, hospitality, security or production work all count."
                >
                  <input
                    type="number"
                    min="0.5"
                    max="50"
                    step="0.5"
                    value={form.yearsOfExperience}
                    onChange={(event) =>
                      update("yearsOfExperience", event.target.value)
                    }
                    placeholder="e.g. 2"
                    aria-invalid={Boolean(errors.yearsOfExperience)}
                  />
                </Field>
              ) : null}

              <Field
                label="Expected payment per shift"
                required
                error={errors.expectedPayment}
                hint="Indicative gross amount. Final rates depend on role, hours and client budget."
              >
                <div className="mp-money">
                  <span aria-hidden="true">₹</span>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={form.expectedPayment}
                    onChange={(event) =>
                      update("expectedPayment", event.target.value)
                    }
                    placeholder="1500"
                    inputMode="numeric"
                    aria-invalid={Boolean(errors.expectedPayment)}
                  />
                </div>
              </Field>

              <Field
                label="Previous events worked"
                error={errors.previousEvents}
                className="mp-span-2"
                hint="Share venues, client names, roles or event types you have worked."
              >
                <textarea
                  rows={5}
                  value={form.previousEvents}
                  onChange={(event) =>
                    update("previousEvents", event.target.value)
                  }
                  placeholder="e.g. 2024 — Registration crew at a corporate conference, Ahmedabad. 2025 — Wedding hospitality, Surat."
                />
              </Field>

              <UploadBox
                id="staff-resume"
                label="Resume / experience summary (optional)"
                hint="Upload your resume or a short experience summary"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                file={form.resume}
                onChange={onResumeChange}
                error={errors.resume}
              />
            </div>
          ) : null}

          {currentStep.id === "availability" ? (
            <div className="mp-grid mp-grid-2">
              <ChoiceChips
                label="Preferred work cities"
                options={STAFF_CITIES}
                selected={form.preferredCities}
                onToggle={(value) => toggle("preferredCities", value)}
                error={errors.preferredCities}
                hint="Choose every city you can realistically reach for a shift."
              />

              <Field
                label="Available from"
                required
                error={errors.availableFrom}
              >
                <input
                  type="date"
                  value={form.availableFrom}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(event) =>
                    update("availableFrom", event.target.value)
                  }
                  aria-invalid={Boolean(errors.availableFrom)}
                />
              </Field>

              <Field
                label="Available until"
                required
                error={errors.availableUntil}
              >
                <input
                  type="date"
                  value={form.availableUntil}
                  min={
                    form.availableFrom ||
                    new Date().toISOString().slice(0, 10)
                  }
                  onChange={(event) =>
                    update("availableUntil", event.target.value)
                  }
                  aria-invalid={Boolean(errors.availableUntil)}
                />
              </Field>

              <ChoiceChips
                label="Shift types"
                options={SHIFT_TYPES}
                selected={form.shiftTypes}
                onToggle={(value) => toggle("shiftTypes", value)}
                error={errors.shiftTypes}
                hint="Select every shift pattern you can work."
              />

              <YesNo
                label="Willing to travel"
                value={form.willingToTravel}
                onChange={(value) => update("willingToTravel", value)}
                error={errors.willingToTravel}
              />

              <YesNo
                label="Transport available"
                value={form.transportAvailable}
                onChange={(value) => update("transportAvailable", value)}
                error={errors.transportAvailable}
              />
            </div>
          ) : null}

          {currentStep.id === "verification" ? (
            <div className="join-verification">
              <div className="join-summary">
                <PhotoPreview previewUrl={previewUrl} name={form.fullName} />
                <div>
                  <p>
                    <b>{form.fullName || "Name not provided"}</b>
                    <br />
                    {form.emailAddress || "Email not provided"} ·{" "}
                    {formatPhoneNumber(form.mobileNumber)}
                    <br />
                    {form.currentCity || "City not provided"} ·{" "}
                    {form.areaPincode || "Pincode not provided"}
                    <br />
                    {age !== null
                      ? `Age ${age} · minimum age ${MINIMUM_AGE}`
                      : "Date of birth not provided"}
                  </p>
                  <small>
                    {form.skills.length} work categor
                    {form.skills.length === 1 ? "y" : "ies"} ·{" "}
                    {form.shiftTypes.length} shift type
                    {form.shiftTypes.length === 1 ? "" : "s"}
                  </small>
                </div>
              </div>

              <div className="join-review-blocks">
                <ReviewBlock
                  title="Personal information"
                  stepId="personal"
                  onEdit={goToStep}
                >
                  <ReviewItem label="Full name" value={form.fullName} />
                  <ReviewItem
                    label="WhatsApp"
                    value={`${formatPhoneNumber(form.mobileNumber)}${form.whatsappVerified ? " · Verified" : ""}`}
                  />
                  <ReviewItem label="Email" value={form.emailAddress} />
                  <ReviewItem
                    label="Date of birth"
                    value={formatDate(form.dateOfBirth)}
                  />
                  <ReviewItem label="Current city" value={form.currentCity} />
                  <ReviewItem label="Area / pincode" value={form.areaPincode} />
                  <ReviewItem
                    label="Languages"
                    value={form.languages.join(", ")}
                    wide
                  />
                </ReviewBlock>

                <ReviewBlock
                  title="Skills & work categories"
                  stepId="skills"
                  onEdit={goToStep}
                >
                  <ReviewItem
                    label="Categories"
                    value={form.skills.join(", ")}
                    wide
                  />
                  {form.otherSkill ? (
                    <ReviewItem
                      label="Other category"
                      value={form.otherSkill}
                      wide
                    />
                  ) : null}
                </ReviewBlock>

                <ReviewBlock
                  title="Experience"
                  stepId="experience"
                  onEdit={goToStep}
                >
                  <ReviewItem
                    label="Level"
                    value={form.experienceLevel || "Not selected"}
                  />
                  <ReviewItem
                    label="Years"
                    value={
                      form.experienceLevel === "Experienced"
                        ? `${form.yearsOfExperience} year${Number(form.yearsOfExperience) === 1 ? "" : "s"}`
                        : "Fresher"
                    }
                  />
                  <ReviewItem
                    label="Expected payment"
                    value={
                      form.expectedPayment
                        ? `₹${Number(form.expectedPayment).toLocaleString("en-IN")} / shift`
                        : ""
                    }
                  />
                  <ReviewItem
                    label="Resume"
                    value={form.resume?.name || "Not attached"}
                  />
                  <ReviewItem
                    label="Previous events"
                    value={form.previousEvents || "Not provided"}
                    wide
                  />
                </ReviewBlock>

                <ReviewBlock
                  title="Availability"
                  stepId="availability"
                  onEdit={goToStep}
                >
                  <ReviewItem
                    label="Preferred cities"
                    value={form.preferredCities.join(", ")}
                    wide
                  />
                  <ReviewItem
                    label="Available dates"
                    value={`${formatDate(form.availableFrom)} – ${formatDate(form.availableUntil)}`}
                  />
                  <ReviewItem
                    label="Shift types"
                    value={form.shiftTypes.join(", ")}
                  />
                  <ReviewItem
                    label="Willing to travel"
                    value={form.willingToTravel === "yes" ? "Yes" : "No"}
                  />
                  <ReviewItem
                    label="Transport available"
                    value={form.transportAvailable === "yes" ? "Yes" : "No"}
                  />
                </ReviewBlock>
              </div>

              <div className="mp-grid mp-grid-2 join-verify-fields">
                <div className="mp-field mp-span-2">
                  <span className="mp-label">
                    Profile photo<em>*</em>
                  </span>
                  <div className="join-photo-row">
                    <PhotoPreview previewUrl={previewUrl} name={form.fullName} />
                    <div className="join-photo-copy">
                      <label className="mp-btn mp-btn-ghost join-photo-button">
                        {form.profilePhoto ? "Replace photo" : "Choose photo"}
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                          onChange={onPhotoChange}
                          aria-label="Upload profile photo"
                        />
                      </label>
                      <small>
                        This photo is stored privately for verification and is
                        not shown on any public page.
                      </small>
                    </div>
                  </div>
                  <FieldError error={errors.profilePhoto} />
                </div>

                <section className="mp-field mp-span-2 join-documents">
                  <span className="mp-label">
                    Supporting documents (optional)
                  </span>
                  <p className="join-doc-note">
                    Only attach identity or supporting documents if the
                    verification desk has requested them. Documents are
                    encrypted at rest and accessible only to authorised
                    verification staff. Do not upload Aadhaar or ID numbers
                    unless specifically asked.
                  </p>

                  <div className="join-doc-add">
                    <select
                      value={documentType}
                      onChange={(event) => setDocumentType(event.target.value)}
                      aria-label="Document type"
                    >
                      {DOCUMENT_TYPES.map((type) => (
                        <option value={type} key={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <label className="mp-btn mp-btn-ghost join-doc-button">
                      Attach document
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                        onChange={addSupportingDocument}
                        disabled={
                          form.supportingDocuments.length >=
                          MAX_SUPPORTING_DOCUMENTS
                        }
                      />
                    </label>
                  </div>

                  {form.supportingDocuments.length > 0 ? (
                    <ul className="join-doc-list">
                      {form.supportingDocuments.map((file, index) => (
                        <li key={`${file.name}-${index}`}>
                          <div>
                            <b>{file.name}</b>
                            <small>
                              {form.supportingDocumentTypes?.[index] ||
                                documentType}{" "}
                              · {formatFileSize(file.size)}
                            </small>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSupportingDocument(index)}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <small className="mp-hint">
                      Up to {MAX_SUPPORTING_DOCUMENTS} files · PDF, JPG, PNG or
                      WEBP · max 5 MB each
                    </small>
                  )}

                  <FieldError error={errors.supportingDocuments} />
                </section>

                <Consent
                  checked={form.documentsConsent}
                  onChange={(event) =>
                    update("documentsConsent", event.target.checked)
                  }
                  title="Document storage consent"
                  error={errors.documentsConsent}
                >
                  I consent to CrewConnect securely storing any documents I
                  attach for verification. I understand they are encrypted,
                  access-restricted, and reviewed only by authorised staff.
                </Consent>

                <Consent
                  checked={form.ageConfirmed}
                  onChange={(event) =>
                    update("ageConfirmed", event.target.checked)
                  }
                  title="Age eligibility declaration *"
                  error={errors.ageConfirmed}
                >
                  I confirm that I am at least {MINIMUM_AGE} years of age and
                  legally permitted to work professional event shifts.
                </Consent>

                <Consent
                  checked={form.privacyConsent}
                  onChange={(event) =>
                    update("privacyConsent", event.target.checked)
                  }
                  title="Privacy policy consent *"
                  error={errors.privacyConsent}
                >
                  I have read and accept the privacy policy, including how my
                  profile, photo and documents are stored and used for
                  verification and shift allocation.
                </Consent>

                <Consent
                  checked={form.termsConsent}
                  onChange={(event) =>
                    update("termsConsent", event.target.checked)
                  }
                  title="Terms & conditions *"
                  error={errors.termsConsent}
                >
                  I accept the candidate terms, code of conduct and attendance
                  rules. I understand registration does not guarantee immediate
                  shift allocation.
                </Consent>

                <p className="join-note mp-span-2">
                  Your profile is submitted with status <strong>Pending Review</strong>.
                  You will receive a unique Staff Registration ID on the next
                  screen. Identity documents are optional and only requested
                  when verification requires them.
                </p>
              </div>
            </div>
          ) : null}

          <footer className="mp-actions">
            <button
              type="button"
              className="mp-btn mp-btn-back"
              onClick={previousStep}
              disabled={stepIndex === 0 || submitting}
            >
              ← Back
            </button>

            {isLastStep ? (
              <button
                type="submit"
                className="mp-btn mp-btn-primary mp-submit"
                disabled={submitting}
              >
                {submitting ? "Submitting profile…" : "Submit registration"}
                <span aria-hidden="true">→</span>
              </button>
            ) : (
              <button
                type="button"
                className="mp-btn mp-btn-primary"
                onClick={nextStep}
              >
                Continue to {STAFF_STEPS[stepIndex + 1].label}
                <span aria-hidden="true">→</span>
              </button>
            )}
          </footer>
        </form>

        <aside className="mp-side">
          <div className="mp-side-card mp-live-card">
            <div className="mp-side-head">
              <span>Application snapshot</span>
              <span>{progress}%</span>
            </div>
            <h3>{form.fullName || "Your crew profile"}</h3>
            <p>
              {form.currentCity
                ? `${form.currentCity}${form.areaPincode ? ` · ${form.areaPincode}` : ""}`
                : "Current city not set yet"}
            </p>
            <div className="mp-live-dates">
              <span>{formatDate(form.availableFrom)}</span>
              <i aria-hidden="true">→</i>
              <span>{formatDate(form.availableUntil)}</span>
            </div>
            <div className="mp-side-totals">
              <div>
                <span>Work categories</span>
                <strong>{form.skills.length}</strong>
              </div>
              <div>
                <span>Shift types</span>
                <strong>{form.shiftTypes.length}</strong>
              </div>
            </div>
            <div className="mp-side-flags">
              <span className={form.whatsappVerified ? "is-on" : ""}>
                {form.whatsappVerified ? "WhatsApp verified" : "Verification pending"}
              </span>
              <span>{form.experienceLevel || "Experience pending"}</span>
            </div>
          </div>

          <div className="mp-side-card mp-side-note">
            <span className="mp-eyebrow">What happens next</span>
            <ol>
              <li>
                <b>01</b> Profile saved with a unique Staff Registration ID.
              </li>
              <li>
                <b>02</b> Desk reviews skills, availability and documents.
              </li>
              <li>
                <b>03</b> Shortlisted crew receive shift briefs on WhatsApp.
              </li>
            </ol>
            <a href="https://wa.me/919510572460" target="_blank" rel="noreferrer">
              Talk to the candidate desk <strong>+91 9510572460 ↗</strong>
            </a>
          </div>

          {/* <div className="mp-side-card mp-side-status">
            <span className="mp-eyebrow">No fee, ever</span>
            <p>
              Registration is free. CrewConnect never charges candidates for
              placements or shift allocation.
            </p>
            <a href="#crew-faq">
              Read the candidate FAQ <span aria-hidden="true">→</span>
            </a>
          </div> */}
        </aside>
      </div>
    </section>
  );
}
